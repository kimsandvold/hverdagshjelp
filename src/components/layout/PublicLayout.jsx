import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import Logo from '../ui/Logo'
import useAuthStore from '../../stores/useAuthStore'
import useMessagesStore from '../../stores/useMessagesStore'
import useBookingStore from '../../stores/useBookingStore'

const navLinkClass = ({ isActive }) =>
  `relative text-sm font-medium transition-colors ${
    isActive
      ? 'text-primary-500'
      : 'text-gray-600 hover:text-gray-900'
  }`

export default function PublicLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef(null)
  const { isAuthenticated, role, profile, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const unreadCount = useMessagesStore((state) => state.unreadCount)
  const fetchUnreadCount = useMessagesStore((state) => state.fetchUnreadCount)
  const bookingUpdatedCount = useBookingStore((state) => state.updatedCount)
  const fetchUpdatedCount = useBookingStore((state) => state.fetchUpdatedCount)
  const incomingPendingCount = useBookingStore((state) => state.incomingPendingCount)
  const fetchIncomingPendingCount = useBookingStore((state) => state.fetchIncomingPendingCount)

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount()
      fetchUpdatedCount()
      fetchIncomingPendingCount()
    }
  }, [isAuthenticated, fetchUnreadCount, fetchUpdatedCount, fetchIncomingPendingCount])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
    setUserMenuOpen(false)
  }, [location.pathname])

  // Scroll-aware navbar
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close user menu on outside click
  useEffect(() => {
    const onClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const handleLogout = async () => {
    setUserMenuOpen(false)
    await logout()
    navigate('/')
  }

  const initials = profile?.name
    ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-200 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm'
            : 'bg-white'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center h-16">
            {/* Left: Logo + main nav links */}
            <div className="flex items-center gap-1">
              <Logo />
              <div className="hidden md:flex items-center gap-1 ml-8">
                <NavLink to="/search" className={navLinkClass}>
                  <span className="px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors inline-block">Finn hjelper</span>
                </NavLink>
                <NavLink to="/bli-hjelper" className={navLinkClass}>
                  <span className="px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors inline-block">Bli hjelper</span>
                </NavLink>
              </div>
            </div>

            {/* Right: icon actions + user menu */}
            <div className="hidden md:flex items-center gap-1 ml-auto">
              {isAuthenticated && (
                <>
                  {/* Saved helpers icon */}
                  <NavLink
                    to="/favoritter"
                    className={({ isActive }) => `relative p-2 rounded-lg transition-colors ${isActive ? 'text-primary-500 bg-primary-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                    title="Lagrede hjelpere"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                    </svg>
                  </NavLink>

                  {/* Messages icon with badge */}
                  <NavLink
                    to="/meldinger"
                    className={({ isActive }) => `relative p-2 rounded-lg transition-colors ${isActive ? 'text-primary-500 bg-primary-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                    title="Meldinger"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </NavLink>

                  {/* Requests icon */}
                  <NavLink
                    to="/mine-foresporsler"
                    className={({ isActive }) => `relative p-2 rounded-lg transition-colors ${isActive ? 'text-primary-500 bg-primary-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                    title="Forespørsler"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15a2.25 2.25 0 0 1 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
                    </svg>
                    {bookingUpdatedCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                        {bookingUpdatedCount > 9 ? '9+' : bookingUpdatedCount}
                      </span>
                    )}
                  </NavLink>

                  <div className="mx-2 h-6 w-px bg-gray-200" />
                </>
              )}

              {isAuthenticated ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 rounded-full p-1 pr-2.5 transition-colors hover:bg-gray-50 cursor-pointer"
                  >
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-500 text-xs font-semibold text-white">
                        {initials}
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate">{profile?.name?.split(' ')[0]}</span>
                    <svg className={`h-4 w-4 text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* User dropdown */}
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-52 rounded-xl border border-gray-100 bg-white py-1 shadow-lg ring-1 ring-black/5">
                      <div className="border-b border-gray-100 px-4 py-3">
                        <p className="text-sm font-medium text-gray-900 truncate">{profile?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{profile?.email}</p>
                      </div>
                      <Link to="/profil" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                        </svg>
                        Profil
                      </Link>
                      {role === 'helper' && (
                        <>
                          <div className="border-t border-gray-100 mt-1 pt-1">
                            <p className="px-4 pt-1 pb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Dashboard</p>
                          </div>
                          <Link to="/dashboard" className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
                            </svg>
                            Oversikt
                          </Link>
                          <Link to="/dashboard/services" className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.049.58.025 1.193-.14 1.743" />
                            </svg>
                            Mine tjenester
                          </Link>
                          <Link to="/dashboard/bookings" className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15a2.25 2.25 0 0 1 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
                            </svg>
                            Forespørsler
                            {incomingPendingCount > 0 && (
                              <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-semibold text-white">
                                {incomingPendingCount > 9 ? '9+' : incomingPendingCount}
                              </span>
                            )}
                          </Link>
                          <Link to="/dashboard/subscription" className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
                            </svg>
                            Abonnement
                          </Link>
                        </>
                      )}
                      {role === 'admin' && (
                        <>
                          <div className="border-t border-gray-100 mt-1 pt-1">
                            <p className="px-4 pt-1 pb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Admin</p>
                          </div>
                          <Link to="/admin/dashboard" className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            Dashboard
                          </Link>
                          <Link to="/admin/helpers" className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            Hjelpere
                          </Link>
                          <Link to="/admin/categories" className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            Kategorier
                          </Link>
                          <Link to="/admin/users" className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            Brukere
                          </Link>
                          <Link to="/admin/ads" className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            Annonser
                          </Link>
                        </>
                      )}
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <Link to="/innstillinger" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                          <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.212-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          </svg>
                          Innstillinger
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                          </svg>
                          Logg ut
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="bg-primary-500 text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-primary-600 active:bg-primary-700 transition-colors"
                >
                  Logg inn
                </Link>
              )}
            </div>

            {/* Mobile: message icon + hamburger */}
            <div className="flex items-center gap-1 ml-auto md:hidden">
              {isAuthenticated && (
                <NavLink
                  to="/meldinger"
                  className={({ isActive }) => `relative p-2 rounded-lg transition-colors ${isActive ? 'text-primary-500' : 'text-gray-500'}`}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white ring-2 ring-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </NavLink>
              )}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="relative h-10 w-10 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center"
                aria-label="Meny"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-200 ease-in-out ${
            mobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="border-t border-gray-100 bg-gray-50/50 px-4 pb-4 pt-3 space-y-1">
            {isAuthenticated && profile && (
              <div className="flex items-center gap-3 px-3 py-3 mb-2">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="h-9 w-9 rounded-full object-cover" />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-500 text-xs font-semibold text-white">
                    {initials}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{profile.name}</p>
                  <p className="text-xs text-gray-500 truncate">{profile.email}</p>
                </div>
              </div>
            )}

            <NavLink to="/search" className={({ isActive }) => `block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? 'bg-primary-50 text-primary-500' : 'text-gray-700 hover:bg-gray-100'}`}>
              Finn hjelper
            </NavLink>
            <NavLink to="/bli-hjelper" className={({ isActive }) => `block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? 'bg-primary-50 text-primary-500' : 'text-gray-700 hover:bg-gray-100'}`}>
              Bli hjelper
            </NavLink>

            {isAuthenticated && (
              <>
                <NavLink to="/profil" className={({ isActive }) => `block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? 'bg-primary-50 text-primary-500' : 'text-gray-700 hover:bg-gray-100'}`}>
                  Profil
                </NavLink>
                <NavLink to="/favoritter" className={({ isActive }) => `block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? 'bg-primary-50 text-primary-500' : 'text-gray-700 hover:bg-gray-100'}`}>
                  Lagrede hjelpere
                </NavLink>
                <NavLink to="/meldinger" className={({ isActive }) => `flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? 'bg-primary-50 text-primary-500' : 'text-gray-700 hover:bg-gray-100'}`}>
                  Meldinger
                  {unreadCount > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-semibold text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </NavLink>
                <NavLink to="/mine-foresporsler" className={({ isActive }) => `flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? 'bg-primary-50 text-primary-500' : 'text-gray-700 hover:bg-gray-100'}`}>
                  Mine forespørsler
                  {bookingUpdatedCount > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-semibold text-white">
                      {bookingUpdatedCount > 9 ? '9+' : bookingUpdatedCount}
                    </span>
                  )}
                </NavLink>
                {role === 'helper' && (
                  <>
                    <div className="pt-2 mt-2 border-t border-gray-200">
                      <p className="px-3 pt-1 pb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Dashboard</p>
                    </div>
                    <NavLink to="/dashboard" end className={({ isActive }) => `block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? 'bg-primary-50 text-primary-500' : 'text-gray-700 hover:bg-gray-100'}`}>
                      Oversikt
                    </NavLink>
                    <NavLink to="/dashboard/services" className={({ isActive }) => `block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? 'bg-primary-50 text-primary-500' : 'text-gray-700 hover:bg-gray-100'}`}>
                      Mine tjenester
                    </NavLink>
                    <NavLink to="/dashboard/bookings" className={({ isActive }) => `flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? 'bg-primary-50 text-primary-500' : 'text-gray-700 hover:bg-gray-100'}`}>
                      Forespørsler
                      {incomingPendingCount > 0 && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-semibold text-white">
                          {incomingPendingCount > 9 ? '9+' : incomingPendingCount}
                        </span>
                      )}
                    </NavLink>
                    <NavLink to="/dashboard/subscription" className={({ isActive }) => `block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? 'bg-primary-50 text-primary-500' : 'text-gray-700 hover:bg-gray-100'}`}>
                      Abonnement
                    </NavLink>
                  </>
                )}
                {role === 'admin' && (
                  <NavLink to="/admin/dashboard" className={({ isActive }) => `block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? 'bg-primary-50 text-primary-500' : 'text-gray-700 hover:bg-gray-100'}`}>
                    Admin
                  </NavLink>
                )}

                <div className="pt-2 mt-2 border-t border-gray-200">
                  <NavLink to="/innstillinger" className={({ isActive }) => `block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? 'bg-primary-50 text-primary-500' : 'text-gray-700 hover:bg-gray-100'}`}>
                    Innstillinger
                  </NavLink>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    Logg ut
                  </button>
                </div>
              </>
            )}

            {!isAuthenticated && (
              <div className="pt-2 mt-2 border-t border-gray-200">
                <Link
                  to="/login"
                  className="block bg-primary-500 text-white text-sm font-medium px-4 py-2.5 rounded-lg text-center hover:bg-primary-600 transition-colors"
                >
                  Logg inn
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1 pt-16">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-primary-700 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo + tagline */}
          <div>
            <Logo light />
            <p className="text-primary-200 text-sm mt-2">
              Finn pålitelig hjelp til hverdagen
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-3">Lenker</h4>
            <ul className="space-y-2 text-sm text-primary-200">
              <li>
                <Link to="/search" className="hover:text-white transition-colors">
                  Finn hjelper
                </Link>
              </li>
              <li>
                <Link to="/bli-hjelper" className="hover:text-white transition-colors">
                  Bli hjelper
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Logg inn
                </Link>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="font-semibold mb-3">Kontakt</h4>
            <ul className="space-y-2 text-sm text-primary-200">
              <li>post@hverdagshjelp.no</li>
              <li>Oslo, Norge</li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-primary-600 text-center text-sm text-primary-300">
          &copy; 2025 Hverdagshjelp.no
        </div>
      </footer>
    </div>
  )
}
