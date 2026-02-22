import { create } from 'zustand'
import { supabase } from '../lib/supabase'

const useReferencesStore = create((set) => ({
  references: [],
  loading: false,
  canOffer: false,
  hasOffered: false,

  fetchReferences: async (helperId) => {
    set({ loading: true })
    const { data } = await supabase
      .from('helper_references')
      .select('*, profiles(name, avatar_url)')
      .eq('helper_id', helperId)
      .order('created_at', { ascending: false })

    set({
      references: (data || []).map(r => ({
        id: r.id,
        userId: r.user_id,
        helperId: r.helper_id,
        message: r.message,
        createdAt: r.created_at,
        userName: r.profiles?.name || 'Anonym',
        userAvatar: r.profiles?.avatar_url,
      })),
      loading: false,
    })
  },

  checkEligibility: async (helperId) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      set({ canOffer: false, hasOffered: false })
      return
    }

    const [{ count: bookingCount }, { count: refCount }] = await Promise.all([
      supabase
        .from('bookings')
        .select('id', { count: 'exact', head: true })
        .eq('client_id', user.id)
        .eq('helper_id', helperId)
        .eq('status', 'completed'),
      supabase
        .from('helper_references')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('helper_id', helperId),
    ])

    set({
      canOffer: (bookingCount || 0) > 0 && (refCount || 0) === 0,
      hasOffered: (refCount || 0) > 0,
    })
  },

  addReference: async (helperId, message) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Ikke innlogget' }

    const { data, error } = await supabase
      .from('helper_references')
      .insert({
        user_id: user.id,
        helper_id: helperId,
        message,
      })
      .select('*, profiles(name, avatar_url)')
      .single()

    if (error) {
      if (error.code === '23505') {
        return { error: 'Du har allerede tilbudt deg som referanse for denne hjelperen' }
      }
      return { error: error.message }
    }

    set((state) => ({
      references: [{
        id: data.id,
        userId: data.user_id,
        helperId: data.helper_id,
        message: data.message,
        createdAt: data.created_at,
        userName: data.profiles?.name || 'Anonym',
        userAvatar: data.profiles?.avatar_url,
      }, ...state.references],
      canOffer: false,
      hasOffered: true,
    }))

    return { success: true }
  },

  deleteReference: async (referenceId) => {
    await supabase.from('helper_references').delete().eq('id', referenceId)
    set((state) => ({
      references: state.references.filter(r => r.id !== referenceId),
      canOffer: true,
      hasOffered: false,
    }))
  },
}))

export default useReferencesStore
