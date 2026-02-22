import { create } from 'zustand'
import { supabase } from '../lib/supabase'

const useHelperStore = create((set, get) => ({
  helpers: [],
  availableTags: [],
  filters: {
    categories: [],
    location: '',
    query: '',
    lat: null,
    lng: null,
    radiusKm: null,
    availability: [],
    tags: [],
    verifiedOnly: false,
  },
  page: 0,
  hasMore: true,
  loading: false,

  setFilter: (key, value) =>
    set((state) => ({ filters: { ...state.filters, [key]: value }, page: 0, hasMore: true })),

  toggleCategory: (categoryId) =>
    set((state) => {
      const cats = state.filters.categories
      const next = cats.includes(categoryId)
        ? cats.filter((c) => c !== categoryId)
        : [...cats, categoryId]
      return { filters: { ...state.filters, categories: next }, page: 0, hasMore: true }
    }),

  setGeoFilter: (lat, lng, radiusKm) =>
    set((state) => ({
      filters: { ...state.filters, lat, lng, radiusKm, location: '' },
      page: 0,
      hasMore: true,
    })),

  clearGeoFilter: () =>
    set((state) => ({
      filters: { ...state.filters, lat: null, lng: null, radiusKm: null },
      page: 0,
      hasMore: true,
    })),

  toggleAvailability: (key) =>
    set((state) => {
      const avail = state.filters.availability
      const next = avail.includes(key)
        ? avail.filter((a) => a !== key)
        : [...avail, key]
      return { filters: { ...state.filters, availability: next }, page: 0, hasMore: true }
    }),

  toggleTag: (tag) =>
    set((state) => {
      const tags = state.filters.tags
      const next = tags.includes(tag)
        ? tags.filter((t) => t !== tag)
        : [...tags, tag]
      return { filters: { ...state.filters, tags: next }, page: 0, hasMore: true }
    }),

  resetFilters: () =>
    set({
      filters: {
        categories: [],
        location: '',
        query: '',
        lat: null,
        lng: null,
        radiusKm: null,
        availability: [],
        tags: [],
        verifiedOnly: false,
      },
      page: 0,
      hasMore: true,
      helpers: [],
      availableTags: [],
    }),

  fetchHelpers: async (append = false) => {
    const { filters, page } = get()
    const pageSize = 25
    const offset = append ? (page * pageSize) : 0

    set({ loading: true })

    const params = {
      page_offset: offset,
      page_limit: pageSize,
    }

    if (filters.query) params.search_query = filters.query
    if (filters.categories.length === 1) params.category_slug = filters.categories[0]
    if (filters.lat != null && filters.lng != null && filters.radiusKm != null) {
      params.user_lat = filters.lat
      params.user_lng = filters.lng
      params.radius_km = filters.radiusKm
    }

    const { data, error } = await supabase.rpc('search_helpers', params)

    if (error) {
      set({ loading: false })
      return
    }

    let results = data || []

    // If multiple categories selected, filter client-side
    if (filters.categories.length > 1) {
      results = results.filter(h =>
        h.services?.some(s => filters.categories.includes(s.category))
      )
    }

    // Availability filter (client-side)
    if (filters.availability.length > 0) {
      results = results.filter(h => {
        const all = [...(h.availability?.timeOfDay || []), ...(h.availability?.daysOfWeek || [])]
        return filters.availability.some(a => all.includes(a))
      })
    }

    // Verified filter (client-side)
    if (filters.verifiedOnly) {
      results = results.filter(h => h.verified)
    }

    // Extract available tags from results (before tag filter, scoped to selected categories)
    const tagSet = new Set()
    for (const h of results) {
      for (const s of h.services || []) {
        const matchesCat = filters.categories.length === 0 || filters.categories.includes(s.category)
        if (matchesCat) {
          for (const t of s.tags || []) tagSet.add(t)
        }
      }
    }
    const availableTags = [...tagSet].sort()

    // Tag filter (client-side)
    if (filters.tags.length > 0) {
      results = results.filter(h =>
        (h.services || []).some(s =>
          (s.tags || []).some(t => filters.tags.includes(t))
        )
      )
    }

    if (append) {
      set((state) => ({
        helpers: [...state.helpers, ...results],
        availableTags,
        hasMore: results.length === pageSize,
        loading: false,
      }))
    } else {
      set({
        helpers: results,
        availableTags,
        hasMore: results.length === pageSize,
        page: 0,
        loading: false,
      })
    }
  },

  loadMore: async () => {
    const nextPage = get().page + 1
    set({ page: nextPage })
    await get().fetchHelpers(true)
  },

  getHelperById: async (id) => {
    // Check local cache first
    const cached = get().helpers.find(h => h.id === id)
    if (cached) return cached

    // Fetch from Supabase
    const { data: helper } = await supabase
      .from('helpers')
      .select('*, profiles(*)')
      .eq('id', id)
      .maybeSingle()

    if (!helper) return null

    const { data: services } = await supabase
      .from('helper_services')
      .select('*, categories(slug, name, icon)')
      .eq('helper_id', id)

    // Parse lat/lng from PostGIS WKT point string e.g. "POINT(10.75 59.91)"
    let lat = null
    let lng = null
    if (helper.location) {
      const match = helper.location.match(/POINT\(([^ ]+) ([^ ]+)\)/)
      if (match) {
        lng = parseFloat(match[1])
        lat = parseFloat(match[2])
      }
    }

    return {
      id: helper.id,
      name: helper.profiles.name,
      email: helper.profiles.show_email !== false ? helper.profiles.email : null,
      phone: helper.profiles.show_phone !== false ? helper.profiles.phone : null,
      avatar_url: helper.profiles.avatar_url,
      description: helper.description,
      location: helper.location_label,
      lat,
      lng,
      availability: helper.availability,
      reviewCount: helper.review_count,
      tier: helper.tier,
      verified: helper.verified,
      active: helper.active,
      referredBy: helper.referred_by,
      createdAt: helper.created_at,
      services: (services || []).map(s => ({
        id: s.id,
        category: s.categories.slug,
        categoryName: s.categories.name,
        categoryIcon: s.categories.icon,
        hourlyRate: s.hourly_rate,
        pricingType: s.pricing_type,
        competence: s.competence,
        tags: s.tags || [],
      })),
    }
  },

  updateHelper: async (id, data) => {
    // Update profile fields
    const profileUpdate = {}
    if (data.name !== undefined) profileUpdate.name = data.name
    if (data.phone !== undefined) profileUpdate.phone = data.phone
    if (data.avatar_url !== undefined) profileUpdate.avatar_url = data.avatar_url

    if (Object.keys(profileUpdate).length > 0) {
      await supabase.from('profiles').update(profileUpdate).eq('id', id)
    }

    // Update helper fields
    const helperUpdate = {}
    if (data.description !== undefined) helperUpdate.description = data.description
    if (data.location !== undefined) helperUpdate.location_label = data.location
    if (data.availability !== undefined) helperUpdate.availability = data.availability
    if (data.tier !== undefined) helperUpdate.tier = data.tier
    if (data.active !== undefined) helperUpdate.active = data.active
    if (data.verified !== undefined) helperUpdate.verified = data.verified
    if (data.lat != null && data.lng != null) {
      helperUpdate.location = `POINT(${data.lng} ${data.lat})`
    }

    if (Object.keys(helperUpdate).length > 0) {
      await supabase.from('helpers').update(helperUpdate).eq('id', id)
    }

    // Update services if provided
    if (data.services) {
      const { data: categories } = await supabase.from('categories').select('id, slug')
      const catMap = Object.fromEntries((categories || []).map(c => [c.slug, c.id]))

      // Delete existing services and reinsert
      await supabase.from('helper_services').delete().eq('helper_id', id)

      const serviceRows = data.services
        .filter(s => catMap[s.category])
        .map(s => ({
          helper_id: id,
          category_id: catMap[s.category],
          hourly_rate: s.pricingType === 'hourly' ? (s.hourlyRate || s.hourly_rate) : null,
          pricing_type: s.pricingType || s.pricing_type || 'hourly',
          competence: s.competence || '',
          tags: s.tags || [],
        }))

      if (serviceRows.length > 0) {
        await supabase.from('helper_services').insert(serviceRows)
      }
    }

    // Update local cache
    set((state) => ({
      helpers: state.helpers.map(h => h.id === id ? { ...h, ...data } : h),
    }))
  },
}))

export default useHelperStore
