import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { isStale, STALE_60S } from '../lib/stale'

const useMessagesStore = create((set, get) => ({
  conversations: [],
  activeMessages: [],
  loading: false,
  unreadCount: 0,
  _lastFetchedConversations: null,
  _lastFetchedUnread: null,

  fetchConversations: async () => {
    set({ loading: true })
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { set({ loading: false }); return }

    const { data } = await supabase.rpc('get_conversations', { p_user_id: user.id })

    const convos = (data || []).map(c => ({
      id: c.id,
      otherUserId: c.other_user_id,
      otherUserName: c.other_user_name,
      otherUserAvatar: c.other_user_avatar,
      lastMessage: c.last_message,
      lastMessageAt: c.last_message_at,
      unreadCount: c.unread_count,
    }))
    const total = convos.reduce((sum, c) => sum + (c.unreadCount || 0), 0)

    set({
      conversations: convos,
      unreadCount: total,
      loading: false,
      _lastFetchedConversations: Date.now(),
      _lastFetchedUnread: Date.now(),
    })
  },

  fetchMessages: async (conversationId) => {
    const { data } = await supabase
      .from('messages')
      .select('*, profiles(name, avatar_url)')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    set({
      activeMessages: (data || []).map(m => ({
        id: m.id,
        conversationId: m.conversation_id,
        senderId: m.sender_id,
        content: m.content,
        readAt: m.read_at,
        createdAt: m.created_at,
        senderName: m.profiles?.name || 'Ukjent',
        senderAvatar: m.profiles?.avatar_url,
      })),
    })
  },

  sendMessage: async (conversationId, content) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Ikke innlogget' }

    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content,
      })
      .select('*, profiles(name, avatar_url)')
      .single()

    if (error) return { error: error.message }

    set((state) => ({
      activeMessages: [...state.activeMessages, {
        id: data.id,
        conversationId: data.conversation_id,
        senderId: data.sender_id,
        content: data.content,
        readAt: data.read_at,
        createdAt: data.created_at,
        senderName: data.profiles?.name || 'Ukjent',
        senderAvatar: data.profiles?.avatar_url,
      }],
    }))

    return { success: true }
  },

  startConversation: async (recipientId) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Ikke innlogget' }

    // Check if conversation already exists
    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .or(`and(participant_1.eq.${user.id},participant_2.eq.${recipientId}),and(participant_1.eq.${recipientId},participant_2.eq.${user.id})`)
      .single()

    if (existing) return { conversationId: existing.id }

    const { data, error } = await supabase
      .from('conversations')
      .insert({
        participant_1: user.id,
        participant_2: recipientId,
      })
      .select('id')
      .single()

    if (error) return { error: error.message }

    return { conversationId: data.id }
  },

  markAsRead: async (conversationId) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .neq('sender_id', user.id)
      .is('read_at', null)

    set((state) => {
      const updatedConversations = state.conversations.map(c =>
        c.id === conversationId ? { ...c, unreadCount: 0 } : c
      )
      return {
        activeMessages: state.activeMessages.map(m =>
          m.conversationId === conversationId && m.senderId !== user.id && !m.readAt
            ? { ...m, readAt: new Date().toISOString() }
            : m
        ),
        conversations: updatedConversations,
        unreadCount: updatedConversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0),
      }
    })
  },

  deleteConversation: async (conversationId) => {
    // Delete messages first, then conversation
    await supabase
      .from('messages')
      .delete()
      .eq('conversation_id', conversationId)

    await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId)

    set((state) => {
      const remaining = state.conversations.filter(c => c.id !== conversationId)
      return {
        conversations: remaining,
        activeMessages: [],
        unreadCount: remaining.reduce((sum, c) => sum + (c.unreadCount || 0), 0),
      }
    })
  },

  searchProfiles: async (query) => {
    if (!query || query.trim().length < 2) return []
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data } = await supabase
      .from('profiles')
      .select('id, name, avatar_url')
      .neq('id', user.id)
      .ilike('name', `%${query.trim()}%`)
      .limit(10)

    return data || []
  },

  fetchUnreadCount: async () => {
    if (!isStale(get()._lastFetchedUnread, STALE_60S)) return

    // Derive from conversations if already loaded
    const { conversations, _lastFetchedConversations } = get()
    if (_lastFetchedConversations && !isStale(_lastFetchedConversations, STALE_60S)) {
      const total = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0)
      set({ unreadCount: total, _lastFetchedUnread: Date.now() })
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase.rpc('get_conversations', { p_user_id: user.id })
    const total = (data || []).reduce((sum, c) => sum + (c.unread_count || 0), 0)
    set({ unreadCount: total, _lastFetchedUnread: Date.now() })
  },
}))

export default useMessagesStore
