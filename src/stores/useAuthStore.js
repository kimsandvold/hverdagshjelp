import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import useFavoritesStore from './useFavoritesStore'

const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  role: null,
  isAuthenticated: false,
  loading: true,

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
        set({ user: null, profile: null, role: null, isAuthenticated: false })
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
      set({
        user: authUser,
        profile,
        role: profile.role,
        isAuthenticated: true,
        loading: false,
      })
      useFavoritesStore.getState().fetchFavorites()
    } else {
      set({ user: authUser, loading: false })
    }
  },

  googleLogin: async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) return { success: false, error: error.message }
    return { success: true }
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
    }

    return { success: true }
  },

  register: async ({ name, email, password, phone, description, location, lat, lng, services, availability, referredBy }) => {
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
      user_phone: phone || null,
    })
    if (profileError) return { success: false, error: profileError.message }

    // 3. Create helper record
    const helperData = {
      id: userId,
      description: description || '',
      location_label: location || '',
      availability: availability || { timeOfDay: [], daysOfWeek: [] },
      tier: 'free',
      verified: false,
      active: true,
      locked: false,
    }

    if (lat != null && lng != null) {
      helperData.location = `POINT(${lng} ${lat})`
    }

    if (referredBy) {
      helperData.referred_by = referredBy
    }

    const { error: helperError } = await supabase.from('helpers').insert(helperData)
    if (helperError) return { success: false, error: helperError.message }

    // 4. Create helper_services
    if (services?.length > 0) {
      const { data: categories } = await supabase
        .from('categories')
        .select('id, slug')

      const catMap = Object.fromEntries((categories || []).map(c => [c.slug, c.id]))

      const serviceRows = services
        .filter(s => catMap[s.category])
        .map(s => ({
          helper_id: userId,
          category_id: catMap[s.category],
          hourly_rate: s.pricingType === 'hourly' ? s.hourlyRate : null,
          pricing_type: s.pricingType || 'hourly',
          competence: s.competence || '',
          tags: s.tags || [],
        }))

      if (serviceRows.length > 0) {
        await supabase.from('helper_services').insert(serviceRows)
      }
    }

    return { success: true }
  },

  logout: async () => {
    await supabase.auth.signOut()
    set({ user: null, profile: null, role: null, isAuthenticated: false })
  },
}))

export default useAuthStore
