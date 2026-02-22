import { create } from 'zustand'
import { supabase } from '../lib/supabase'

const useAdminStore = create((set, get) => ({
  helpers: [],
  stats: null,
  categories: [],
  users: [],
  ads: [],
  loading: false,

  fetchHelpers: async () => {
    set({ loading: true })
    const { data } = await supabase
      .from('helpers')
      .select('*, profiles(name, email, phone)')
      .order('created_at', { ascending: false })

    const { data: services } = await supabase
      .from('helper_services')
      .select('*, categories(slug, name)')

    const { data: subs } = await supabase
      .from('subscriptions')
      .select('helper_id, status')

    const { data: payments } = await supabase
      .from('payments')
      .select('helper_id, created_at, status')
      .eq('status', 'charged')
      .order('created_at', { ascending: false })

    const subByHelper = {}
    for (const s of (subs || [])) {
      subByHelper[s.helper_id] = s.status
    }

    const lastPaymentByHelper = {}
    for (const p of (payments || [])) {
      if (!lastPaymentByHelper[p.helper_id]) {
        lastPaymentByHelper[p.helper_id] = p.created_at
      }
    }

    const servicesByHelper = {}
    for (const s of (services || [])) {
      if (!servicesByHelper[s.helper_id]) servicesByHelper[s.helper_id] = []
      servicesByHelper[s.helper_id].push({
        category: s.categories.slug,
        categoryName: s.categories.name,
        hourlyRate: s.hourly_rate,
        pricingType: s.pricing_type,
        tags: s.tags || [],
      })
    }

    const helpers = (data || []).map(h => ({
      id: h.id,
      name: h.profiles.name,
      email: h.profiles.email,
      phone: h.profiles.phone,
      description: h.description,
      location: h.location_label,
      availability: h.availability,
      reviewCount: h.review_count,
      tier: h.tier,
      verified: h.verified,
      active: h.active,
      locked: h.locked,
      createdAt: h.created_at,
      services: servicesByHelper[h.id] || [],
      paymentStatus: subByHelper[h.id] || null,
      lastPayment: lastPaymentByHelper[h.id] || null,
    }))

    set({ helpers, loading: false })
  },

  fetchStats: async () => {
    const { data, error } = await supabase.rpc('get_admin_stats')
    if (!error && data) {
      set({ stats: data })
    }
  },

  fetchCategories: async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order')
    set({ categories: data || [] })
  },

  toggleActive: async (id) => {
    const helper = get().helpers.find(h => h.id === id)
    if (!helper) return
    const newActive = !helper.active
    await supabase.from('helpers').update({ active: newActive }).eq('id', id)
    set((state) => ({
      helpers: state.helpers.map(h => h.id === id ? { ...h, active: newActive } : h),
    }))
  },

  toggleVerified: async (id) => {
    const helper = get().helpers.find(h => h.id === id)
    if (!helper) return
    const newVerified = !helper.verified
    await supabase.from('helpers').update({ verified: newVerified }).eq('id', id)
    set((state) => ({
      helpers: state.helpers.map(h => h.id === id ? { ...h, verified: newVerified } : h),
    }))
  },

  addCategory: async (category) => {
    const { data, error } = await supabase
      .from('categories')
      .insert(category)
      .select()
      .single()
    if (!error && data) {
      set((state) => ({ categories: [...state.categories, data] }))
    }
    return { data, error }
  },

  updateCategory: async (id, updates) => {
    const { error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
    if (!error) {
      set((state) => ({
        categories: state.categories.map(c => c.id === id ? { ...c, ...updates } : c),
      }))
    }
    return { error }
  },

  deleteCategory: async (id) => {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
    if (!error) {
      set((state) => ({
        categories: state.categories.filter(c => c.id !== id),
      }))
    }
    return { error }
  },

  fetchUsers: async () => {
    set({ loading: true })
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    set({ users: data || [], loading: false })
  },

  fetchAds: async () => {
    const { data } = await supabase
      .from('ads')
      .select('*')
      .order('created_at', { ascending: false })
    set({ ads: data || [] })
  },

  addAd: async (ad) => {
    console.log('addAd called with:', ad)
    const { data, error } = await supabase
      .from('ads')
      .insert([ad])
      .select()
    console.log('addAd result:', { data, error })
    if (!error && data?.[0]) {
      set((state) => ({ ads: [data[0], ...state.ads] }))
    }
    return { data: data?.[0], error }
  },

  updateAd: async (id, updates) => {
    const { error } = await supabase
      .from('ads')
      .update(updates)
      .eq('id', id)
    if (!error) {
      set((state) => ({
        ads: state.ads.map(a => a.id === id ? { ...a, ...updates } : a),
      }))
    }
    return { error }
  },

  deleteAd: async (id) => {
    const { error } = await supabase
      .from('ads')
      .delete()
      .eq('id', id)
    if (!error) {
      set((state) => ({
        ads: state.ads.filter(a => a.id !== id),
      }))
    }
    return { error }
  },

  updateUserRole: async (id, newRole) => {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', id)
    if (!error) {
      set((state) => ({
        users: state.users.map(u => u.id === id ? { ...u, role: newRole } : u),
      }))
    }
    return { error }
  },
}))

export default useAdminStore
