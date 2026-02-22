import { useState, useEffect, useRef } from 'react';
import useMessagesStore from '../../stores/useMessagesStore';
import useAuthStore from '../../stores/useAuthStore';
import Button from '../../components/ui/Button';

export default function MessagesPage() {
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const {
    conversations, activeMessages, loading,
    fetchConversations, fetchMessages, sendMessage, markAsRead, deleteConversation,
  } = useMessagesStore();

  const [activeConversationId, setActiveConversationId] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (activeConversationId) {
      fetchMessages(activeConversationId);
      markAsRead(activeConversationId);
    }
  }, [activeConversationId, fetchMessages, markAsRead]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversationId) return;
    setSending(true);
    await sendMessage(activeConversationId, newMessage.trim());
    setNewMessage('');
    setSending(false);
  };

  const handleDelete = async () => {
    if (!activeConversationId) return;
    await deleteConversation(activeConversationId);
    setActiveConversationId(null);
    setShowDeleteConfirm(false);
  };

  const handleSharePhone = async (phone) => {
    if (!phone?.trim()) return;
    setSending(true);
    await sendMessage(activeConversationId, `Mitt telefonnummer: ${phone.trim()}`);
    setShowPhoneInput(false);
    setPhoneInput('');
    setSending(false);
  };

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  if (loading && conversations.length === 0) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Meldinger</h1>

      <div className="flex h-[calc(100vh-16rem)] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {/* Conversation list */}
        <div className={`w-full border-r border-gray-200 md:w-80 md:flex-shrink-0 ${activeConversationId ? 'hidden md:block' : ''}`}>
          <div className="h-full overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-500">
                Ingen samtaler ennå. Start en samtale fra en hjelperprofil.
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setActiveConversationId(conv.id)}
                  className={`flex w-full items-center gap-3 border-b border-gray-100 px-4 py-3 text-left transition-colors hover:bg-gray-50 cursor-pointer ${
                    conv.id === activeConversationId ? 'bg-primary-50' : ''
                  }`}
                >
                  {conv.otherUserAvatar ? (
                    <img src={conv.otherUserAvatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-200 text-sm font-bold text-primary-700">
                      {conv.otherUserName?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900 truncate">{conv.otherUserName}</span>
                      {conv.unreadCount > 0 && (
                        <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-xs text-white">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    {conv.lastMessage && (
                      <p className="mt-0.5 text-xs text-gray-500 truncate">{conv.lastMessage}</p>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Message thread */}
        <div className={`flex flex-1 flex-col ${!activeConversationId ? 'hidden md:flex' : ''}`}>
          {activeConversationId ? (
            <>
              {/* Thread header */}
              <div className="flex items-center gap-3 border-b border-gray-200 px-4 py-3">
                <button
                  onClick={() => setActiveConversationId(null)}
                  className="md:hidden p-1 text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="flex-1 text-sm font-semibold text-gray-900">
                  {activeConversation?.otherUserName}
                </span>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-1.5 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                  title="Slett samtale"
                >
                  <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                </button>
              </div>

              {/* Delete confirmation */}
              {showDeleteConfirm && (
                <div className="flex items-center justify-between gap-3 border-b border-red-200 bg-red-50 px-4 py-2.5">
                  <span className="text-sm text-red-700">Slette denne samtalen?</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="rounded-md px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 cursor-pointer"
                    >
                      Avbryt
                    </button>
                    <button
                      onClick={handleDelete}
                      className="rounded-md bg-red-500 px-3 py-1 text-xs font-medium text-white hover:bg-red-600 cursor-pointer"
                    >
                      Slett
                    </button>
                  </div>
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {activeMessages.map((msg) => {
                  const isOwn = msg.senderId === user?.id;
                  return (
                    <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] rounded-xl px-4 py-2 ${
                        isOwn
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        <p className={`mt-1 text-xs ${isOwn ? 'text-primary-200' : 'text-gray-400'}`}>
                          {new Date(msg.createdAt).toLocaleString('nb-NO', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Compose */}
              <div className="border-t border-gray-200 p-3">
                <div className="mb-2">
                  {showPhoneInput ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="tel"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        placeholder="Skriv telefonnummer..."
                        className="w-44 rounded-full border border-gray-200 px-3 py-1 text-xs outline-none focus:border-primary-500"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => handleSharePhone(phoneInput)}
                        disabled={sending || !phoneInput.trim()}
                        className="rounded-full bg-primary-500 px-3 py-1 text-xs font-medium text-white hover:bg-primary-600 cursor-pointer disabled:opacity-50"
                      >
                        Send
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowPhoneInput(false); setPhoneInput(''); }}
                        className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        Avbryt
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        if (profile?.phone) {
                          handleSharePhone(profile.phone);
                        } else {
                          setShowPhoneInput(true);
                        }
                      }}
                      disabled={sending}
                      className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 cursor-pointer disabled:opacity-50"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                      </svg>
                      Del telefonnummer
                    </button>
                  )}
                </div>
                <form onSubmit={handleSend} className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Skriv en melding..."
                    className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  />
                  <Button type="submit" variant="primary" size="sm" disabled={sending || !newMessage.trim()}>
                    {sending ? 'Sender...' : 'Send'}
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-sm text-gray-400">
              Velg en samtale for å se meldinger
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
