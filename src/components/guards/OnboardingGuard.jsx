import { Navigate } from 'react-router-dom'
import useAuthStore from '../../stores/useAuthStore'

export default function OnboardingGuard({ children }) {
  const { role, onboardingCompleted, loading } = useAuthStore()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    )
  }

  if (role === 'helper' && onboardingCompleted === false) {
    return <Navigate to="/onboarding" replace />
  }

  return children
}
