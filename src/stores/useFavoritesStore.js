import { create } from 'zustand'
import { supabase } from '../lib/supabase'

const useFavoritesStore = create((set, get) => ({
  favorites: [],
  loading: false,

  fetchFavorites: async () => {
    set({ loading: true })
    const { data } = await supabase
      .from('favorites')
      .select('helper_id, created_at')
      .order('created_at', { ascending: false })

    set({ favorites: (data || []).map(f => f.helper_id), loading: false })
  },

  isFavorite: (helperId) => get().favorites.includes(helperId),

  toggleFavorite: async (helperId) => {
    const current = get().favorites
    if (current.includes(helperId)) {
      // Remove
      await supabase.from('favorites').delete().eq('helper_id', helperId)
      set({ favorites: current.filter(id => id !== helperId) })
    } else {
      // Add
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      await supabase.from('favorites').insert({ user_id: user.id, helper_id: helperId })
      set({ favorites: [helperId, ...current] })
    }
  },

  getFavoriteHelpers: async () => {
    const { data } = await supabase
      .from('favorites')
      .select(`
        helper_id,
        helpers (
          id, description, location_label, availability, review_count, tier, verified, active, created_at,
          profiles (name, email, phone, avatar_url)
        )
      `)
      .order('created_at', { ascending: false })

    if (!data) return []

    // Also fetch services for each favorite helper
    const helperIds = data.map(f => f.helper_id)
    const { data: services } = await supabase
      .from('helper_services')
      .select('*, categories(slug, name, icon)')
      .in('helper_id', helperIds)

    const servicesByHelper = {}
    for (const s of (services || [])) {
      if (!servicesByHelper[s.helper_id]) servicesByHelper[s.helper_id] = []
      servicesByHelper[s.helper_id].push({
        category: s.categories.slug,
        categoryName: s.categories.name,
        categoryIcon: s.categories.icon,
        hourlyRate: s.hourly_rate,
        pricingType: s.pricing_type,
        tags: s.tags || [],
      })
    }

    return data
      .filter(f => f.helpers)
      .map(f => ({
        id: f.helpers.id,
        name: f.helpers.profiles.name,
        email: f.helpers.profiles.email,
        phone: f.helpers.profiles.phone,
        avatar_url: f.helpers.profiles.avatar_url,
        description: f.helpers.description,
        location: f.helpers.location_label,
        availability: f.helpers.availability,
        reviewCount: f.helpers.review_count,
        tier: f.helpers.tier,
        verified: f.helpers.verified,
        active: f.helpers.active,
        services: servicesByHelper[f.helpers.id] || [],
      }))
  },
}))

export default useFavoritesStore
