import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import useFavoritesStore from './useFavoritesStore'
import { subscribeToNewsletter } from '../services/newsletterService'

const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  role: null,
  isAuthenticated: false,
  loading: true,
  onboardingCompleted: null,

  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      await get()._loadProfile(session.user)
    } else {
      set({ loading: false })
    }

    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await get()._loadProfile(session.user)
      } else if (event === 'SIGNED_OUT') {
        set({ user: null, profile: null, role: null, isAuthenticated: false, onboardingCompleted: null })
      }
    })
  },

  _loadProfile: async (authUser) => {
    let { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single()

    // Fallback: create profile if trigger didn't (e.g. Google OAuth)
    if (!profile) {
      const meta = authUser.user_metadata || {}
      await supabase.rpc('create_profile', {
        user_id: authUser.id,
        user_role: meta.role || 'user',
        user_name: meta.name || meta.full_name || authUser.email?.split('@')[0] || '',
        user_email: authUser.email,
      })
      const { data: created } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()
      profile = created
    }

    if (profile) {
      // For helpers/admins with helper record, fetch onboarding_completed flag
      let onboardingCompleted = null
      if (profile.role === 'helper' || profile.role === 'admin') {
        const { data: helper } = await supabase
          .from('helpers')
          .select('onboarding_completed')
          .eq('id', authUser.id)
          .single()
        onboardingCompleted = helper?.onboarding_completed ?? false
      }

      set({
        user: authUser,
        profile,
        role: profile.role,
        isAuthenticated: true,
        loading: false,
        onboardingCompleted,
      })
      useFavoritesStore.getState().fetchFavorites()
    } else {
      set({ user: authUser, loading: false })
    }
  },

  googleLogin: async ({ intent, referredBy } = {}) => {
    const params = new URLSearchParams()
    if (intent) params.set('intent', intent)
    if (referredBy) params.set('ref', referredBy)
    const qs = params.toString()

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback${qs ? '?' + qs : ''}`,
      },
    })
    if (error) return { success: false, error: error.message }
    return { success: true }
  },

  _ensureHelperRecord: async (userId, referredBy) => {
    // Check if helper record already exists
    const { data: existing } = await supabase
      .from('helpers')
      .select('id')
      .eq('id', userId)
      .maybeSingle()

    if (existing) return

    // Upgrade profile role to helper (skip if already admin)
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()
    if (currentProfile?.role !== 'admin') {
      await supabase.from('profiles').update({ role: 'helper' }).eq('id', userId)
    }

    // Create empty helper shell
    const helperData = {
      id: userId,
      description: '',
      location_label: '',
      availability: { timeOfDay: [], daysOfWeek: [] },
      tier: 'free',
      verified: false,
      active: true,
      locked: false,
      onboarding_completed: false,
    }
    if (referredBy) helperData.referred_by = referredBy

    await supabase.from('helpers').insert(helperData)
  },

  loginUser: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { success: false, error: 'Feil e-post eller passord' }
    return { success: true }
  },

  registerUser: async ({ name, email, password }) => {
    const { data: authData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role: 'user' },
      },
    })
    if (error) return { success: false, error: error.message }

    // Create profile via RPC (bypasses RLS)
    if (authData.user) {
      await supabase.rpc('create_profile', {
        user_id: authData.user.id,
        user_role: 'user',
        user_name: name,
        user_email: email,
      })
      subscribeToNewsletter(email)
    }

    // If no session, email confirmation is required
    if (!authData.session) {
      return { success: true, confirmEmail: true }
    }

    return { success: true }
  },

  register: async ({ name, email, password, referredBy }) => {
    // 1. Sign up auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role: 'helper' },
      },
    })
    if (authError) return { success: false, error: authError.message }

    const userId = authData.user.id

    // 2. Create profile via RPC (bypasses RLS)
    const { error: profileError } = await supabase.rpc('create_profile', {
      user_id: userId,
      user_role: 'helper',
      user_name: name,
      user_email: email,
    })
    if (profileError) return { success: false, error: profileError.message }

    // 3. Create empty helper shell (onboarding_completed = false)
    const helperData = {
      id: userId,
      description: '',
      location_label: '',
      availability: { timeOfDay: [], daysOfWeek: [] },
      tier: 'free',
      verified: false,
      active: true,
      locked: false,
      onboarding_completed: false,
    }

    if (referredBy) {
      helperData.referred_by = referredBy
    }

    const { error: helperError } = await supabase.from('helpers').insert(helperData)
    if (helperError) return { success: false, error: helperError.message }

    subscribeToNewsletter(email)

    // If no session, email confirmation is required
    if (!authData.session) {
      return { success: true, confirmEmail: true }
    }

    return { success: true }
  },

  becomeHelper: async () => {
    const { user, profile } = get()
    if (!user || !profile) return { success: false, error: 'Ikke innlogget' }

    try {
      await get()._ensureHelperRecord(user.id)
      // Reload profile to pick up new role + onboarding flag
      await get()._loadProfile(user)
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message || 'Noe gikk galt' }
    }
  },

  completeOnboarding: async () => {
    const { user } = get()
    if (!user) return { success: false, error: 'Ikke innlogget' }

    const { error } = await supabase
      .from('helpers')
      .update({ onboarding_completed: true })
      .eq('id', user.id)

    if (error) return { success: false, error: error.message }

    set({ onboardingCompleted: true })
    return { success: true }
  },

  updateProfile: async (updates) => {
    const { profile } = get()
    if (!profile) return { success: false, error: 'Ikke innlogget' }

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', profile.id)

    if (error) return { success: false, error: error.message }

    set({ profile: { ...profile, ...updates } })
    return { success: true }
  },

  deleteAccount: async () => {
    const { error } = await supabase.rpc('delete_own_account')
    if (error) return { success: false, error: error.message }

    await supabase.auth.signOut()
    set({ user: null, profile: null, role: null, isAuthenticated: false, onboardingCompleted: null })
    return { success: true }
  },

  logout: async () => {
    await supabase.auth.signOut()
    set({ user: null, profile: null, role: null, isAuthenticated: false, onboardingCompleted: null })
  },
}))

export default useAuthStore
