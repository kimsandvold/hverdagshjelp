import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { PLATFORM_FEE_PERCENT } from '../lib/config'

const useBookingStore = create((set) => ({
  bookings: [],
  loading: false,
  updatedCount: 0,

  fetchUpdatedCount: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { count } = await supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('client_id', user.id)
      .in('status', ['accepted', 'declined'])
      .eq('seen_by_client', false)

    set({ updatedCount: count || 0 })
  },

  createBooking: async (helperId, categorySlug, description, preferredDate) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Ikke innlogget' }

    const { data, error } = await supabase
      .from('bookings')
      .insert({
        helper_id: helperId,
        client_id: user.id,
        category_slug: categorySlug,
        description,
        preferred_date: preferredDate,
      })
      .select()
      .single()

    if (error) return { error: error.message }

    set((state) => ({ bookings: [data, ...state.bookings] }))
    return { success: true }
  },

  fetchMyBookings: async () => {
    set({ loading: true })
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { set({ loading: false }); return }

    const { data } = await supabase
      .from('bookings')
      .select('*')
      .eq('client_id', user.id)
      .order('created_at', { ascending: false })

    // Look up helper profiles and category names
    const bookings = data || []
    const helperIds = [...new Set(bookings.map(b => b.helper_id))]
    const categorySlugs = [...new Set(bookings.map(b => b.category_slug))]

    const [{ data: helpers }, { data: categories }] = await Promise.all([
      helperIds.length > 0
        ? supabase.from('profiles').select('id, name, avatar_url').in('id', helperIds)
        : { data: [] },
      categorySlugs.length > 0
        ? supabase.from('categories').select('slug, name').in('slug', categorySlugs)
        : { data: [] },
    ])

    const helperMap = Object.fromEntries((helpers || []).map(h => [h.id, h]))
    const categoryMap = Object.fromEntries((categories || []).map(c => [c.slug, c.name]))

    set({
      bookings: bookings.map(b => ({
        ...b,
        helperName: helperMap[b.helper_id]?.name,
        helperAvatar: helperMap[b.helper_id]?.avatar_url,
        categoryName: categoryMap[b.category_slug] || b.category_slug,
      })),
      loading: false,
    })
  },

  fetchIncomingBookings: async () => {
    set({ loading: true })
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { set({ loading: false }); return }

    const { data } = await supabase
      .from('bookings')
      .select('*')
      .eq('helper_id', user.id)
      .order('created_at', { ascending: false })

    const bookings = data || []
    const clientIds = [...new Set(bookings.map(b => b.client_id))]
    const categorySlugs = [...new Set(bookings.map(b => b.category_slug))]

    const [{ data: clients }, { data: categories }] = await Promise.all([
      clientIds.length > 0
        ? supabase.from('profiles').select('id, name, avatar_url').in('id', clientIds)
        : { data: [] },
      categorySlugs.length > 0
        ? supabase.from('categories').select('slug, name').in('slug', categorySlugs)
        : { data: [] },
    ])

    const clientMap = Object.fromEntries((clients || []).map(c => [c.id, c]))
    const categoryMap = Object.fromEntries((categories || []).map(c => [c.slug, c.name]))

    set({
      bookings: bookings.map(b => ({
        ...b,
        clientName: clientMap[b.client_id]?.name,
        clientAvatar: clientMap[b.client_id]?.avatar_url,
        categoryName: categoryMap[b.category_slug] || b.category_slug,
      })),
      loading: false,
    })
  },

  markBookingsSeen: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from('bookings')
      .update({ seen_by_client: true })
      .eq('client_id', user.id)
      .in('status', ['accepted', 'declined'])
      .eq('seen_by_client', false)

    set({ updatedCount: 0 })
  },

  updateBookingStatus: async (id, status, agreedPrice) => {
    const updates = { status }
    if (agreedPrice !== undefined) updates.agreed_price_nok = agreedPrice

    const { error } = await supabase
      .from('bookings')
      .update(updates)
      .eq('id', id)

    if (error) return { error: error.message }

    set((state) => ({
      bookings: state.bookings.map(b =>
        b.id === id ? { ...b, ...updates } : b
      ),
    }))
    return { success: true }
  },

  completeBooking: async (id) => {
    const state = useBookingStore.getState()
    const booking = state.bookings.find(b => b.id === id)
    if (!booking) return { error: 'Fant ikke forespørselen' }

    const platformFee = booking.agreed_price_nok
      ? Math.round(booking.agreed_price_nok * PLATFORM_FEE_PERCENT / 100)
      : null

    const { error } = await supabase
      .from('bookings')
      .update({
        status: 'completed',
        platform_fee_nok: platformFee,
      })
      .eq('id', id)

    if (error) return { error: error.message }

    set((state) => ({
      bookings: state.bookings.map(b =>
        b.id === id ? { ...b, status: 'completed', platform_fee_nok: platformFee } : b
      ),
    }))
    return { success: true }
  },
}))

export default useBookingStore
