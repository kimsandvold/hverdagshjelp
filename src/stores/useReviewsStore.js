import { create } from 'zustand'
import { supabase } from '../lib/supabase'

const useReviewsStore = create((set) => ({
  reviews: [],
  loading: false,

  fetchReviews: async (helperId) => {
    set({ loading: true })
    const { data } = await supabase
      .from('reviews')
      .select('*, profiles(name, avatar_url)')
      .eq('helper_id', helperId)
      .order('created_at', { ascending: false })

    set({
      reviews: (data || []).map(r => ({
        id: r.id,
        userId: r.user_id,
        helperId: r.helper_id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.created_at,
        userName: r.profiles?.name || 'Anonym',
        userAvatar: r.profiles?.avatar_url,
      })),
      loading: false,
    })
  },

  addReview: async (helperId, rating, comment) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Ikke innlogget' }

    const { data, error } = await supabase
      .from('reviews')
      .insert({
        user_id: user.id,
        helper_id: helperId,
        rating,
        comment: comment || null,
      })
      .select('*, profiles(name, avatar_url)')
      .single()

    if (error) {
      if (error.code === '23505') {
        return { error: 'Du har allerede gitt en tilbakemelding for denne hjelperen' }
      }
      return { error: error.message }
    }

    set((state) => ({
      reviews: [{
        id: data.id,
        userId: data.user_id,
        helperId: data.helper_id,
        rating: data.rating,
        comment: data.comment,
        createdAt: data.created_at,
        userName: data.profiles?.name || 'Anonym',
        userAvatar: data.profiles?.avatar_url,
      }, ...state.reviews],
    }))

    return { success: true }
  },

  deleteReview: async (reviewId) => {
    await supabase.from('reviews').delete().eq('id', reviewId)
    set((state) => ({
      reviews: state.reviews.filter(r => r.id !== reviewId),
    }))
  },
}))

export default useReviewsStore
