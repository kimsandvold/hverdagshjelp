import { createBrowserRouter } from 'react-router-dom'
import PublicLayout from './components/layout/PublicLayout'
import DashboardLayout from './components/layout/DashboardLayout'
import AdminLayout from './components/layout/AdminLayout'
import AuthGuard from './components/guards/AuthGuard'
import LoginWall from './components/guards/LoginWall'
import AdminGuard from './components/guards/AdminGuard'
import Forside from './pages/public/Forside'
import Resultatside from './pages/public/Resultatside'
import HelperProfilePage from './pages/public/HelperProfilePage'
import LoginPage from './pages/public/LoginPage'
import AuthCallback from './pages/public/AuthCallback'
import DashboardHome from './pages/dashboard/DashboardHome'
import EditProfile from './pages/dashboard/EditProfile'
import Subscription from './pages/dashboard/Subscription'
import MyServices from './pages/dashboard/MyServices'
import AdminLoginPage from './pages/admin/AdminLoginPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminHelpers from './pages/admin/AdminHelpers'
import AdminCategories from './pages/admin/AdminCategories'
import AdminUsers from './pages/admin/AdminUsers'
import AdminAds from './pages/admin/AdminAds'
import BliHjelper from './pages/public/BliHjelper'
import Registrer from './pages/public/Registrer'
import FavoritesPage from './pages/public/FavoritesPage'
import MessagesPage from './pages/public/MessagesPage'
import MyBookingsPage from './pages/public/MyBookingsPage'
import IncomingBookings from './pages/dashboard/IncomingBookings'
import NotFound from './pages/public/NotFound'

const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <Forside /> },
      { path: '/search', element: <LoginWall><Resultatside /></LoginWall> },
      { path: '/helper/:id', element: <LoginWall><HelperProfilePage /></LoginWall> },
      { path: '/bli-hjelper', element: <BliHjelper /> },
      { path: '/registrer', element: <Registrer /> },
      { path: '/registrer/:ref', element: <Registrer /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/favoritter', element: <LoginWall><FavoritesPage /></LoginWall> },
      { path: '/meldinger', element: <LoginWall><MessagesPage /></LoginWall> },
      { path: '/mine-foresporsler', element: <LoginWall><MyBookingsPage /></LoginWall> },
      { path: '/auth/callback', element: <AuthCallback /> },
      { path: '*', element: <NotFound /> },
    ],
  },
  {
    element: (
      <AuthGuard>
        <DashboardLayout />
      </AuthGuard>
    ),
    children: [
      { path: '/dashboard', element: <DashboardHome /> },
      { path: '/dashboard/edit', element: <EditProfile /> },
      { path: '/dashboard/services', element: <MyServices /> },
      { path: '/dashboard/subscription', element: <Subscription /> },
      { path: '/dashboard/bookings', element: <IncomingBookings /> },
    ],
  },
  {
    path: '/admin',
    element: <AdminLoginPage />,
  },
  {
    element: <PublicLayout />,
    children: [
      {
        element: (
          <AdminGuard>
            <AdminLayout />
          </AdminGuard>
        ),
        children: [
          { path: '/admin/dashboard', element: <AdminDashboard /> },
          { path: '/admin/helpers', element: <AdminHelpers /> },
          { path: '/admin/categories', element: <AdminCategories /> },
          { path: '/admin/users', element: <AdminUsers /> },
          { path: '/admin/ads', element: <AdminAds /> },
        ],
      },
    ],
  },
])

export default router
