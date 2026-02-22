import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import useAuthStore from '../../stores/useAuthStore'

function getRedirectPath() {
  const { profile, onboardingCompleted } = useAuthStore.getState()

  if (profile?.role === 'admin') return '/admin/dashboard'
  if (profile?.role === 'helper') {
    return onboardingCompleted === false ? '/onboarding' : '/dashboard'
  }
  return '/search'
}

export default function AuthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [errorMsg, setErrorMsg] = useState(null)

  useEffect(() => {
    const handleCallback = async () => {
      // Check for errors in query params or hash
      const error = searchParams.get('error')
      const errorDescription = searchParams.get('error_description')

      if (error) {
        console.error('Auth callback error:', error, errorDescription)
        setErrorMsg(`${error}: ${errorDescription || 'Ukjent feil'}`)
        return
      }

      const intent = searchParams.get('intent')
      const referredBy = searchParams.get('ref')
      const code = searchParams.get('code')

      if (code) {
        // PKCE flow: exchange code for session
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
        if (exchangeError) {
          console.error('Code exchange error:', exchangeError)
          setErrorMsg(`Innlogging feilet: ${exchangeError.message}`)
          return
        }
      }

      const finalize = async (user) => {
        // If registering as helper via Google, ensure helper record exists
        if (intent === 'helper') {
          await useAuthStore.getState()._ensureHelperRecord(user.id, referredBy || null)
        }

        await useAuthStore.getState().initialize()
        navigate(getRedirectPath(), { replace: true })
      }

      // For both PKCE and implicit flow, wait for the session to be ready
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        await finalize(session.user)
        return
      }

      // Session not ready yet — wait for auth state change
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, newSession) => {
          if (event === 'SIGNED_IN' && newSession?.user) {
            subscription.unsubscribe()
            await finalize(newSession.user)
          }
        }
      )

      // Timeout fallback
      setTimeout(() => {
        subscription.unsubscribe()
        setErrorMsg('Innlogging tok for lang tid. Prøv igjen.')
      }, 10000)
    }

    handleCallback()
  }, [navigate, searchParams])

  if (errorMsg) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="text-red-600 font-medium mb-2">Innlogging feilet</p>
          <p className="text-sm text-gray-600 mb-4">{errorMsg}</p>
          <button
            onClick={() => navigate('/login', { replace: true })}
            className="text-sm text-primary-500 hover:text-primary-600 underline"
          >
            Tilbake til innlogging
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
        <p className="mt-4 text-sm text-gray-500">Logger inn...</p>
      </div>
    </div>
  )
}
