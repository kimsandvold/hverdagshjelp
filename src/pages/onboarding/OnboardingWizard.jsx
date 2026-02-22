import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../stores/useAuthStore'
import { supabase } from '../../lib/supabase'
import StepProfile from './StepProfile'
import StepLocation from './StepLocation'
import StepServices from './StepServices'
import StepAvailability from './StepAvailability'
import SEO from '../../components/SEO'

const STEPS = [
  { label: 'Profil', number: 1 },
  { label: 'Sted', number: 2 },
  { label: 'Tjenester', number: 3 },
  { label: 'Tilgjengelighet', number: 4 },
]

export default function OnboardingWizard() {
  const navigate = useNavigate()
  const { user, onboardingCompleted, loading } = useAuthStore()
  const completeOnboarding = useAuthStore((s) => s.completeOnboarding)
  const [currentStep, setCurrentStep] = useState(1)
  const [helperData, setHelperData] = useState(null)
  const [dataLoading, setDataLoading] = useState(true)

  // Redirect if already completed
  useEffect(() => {
    if (!loading && onboardingCompleted === true) {
      navigate('/dashboard', { replace: true })
    }
  }, [loading, onboardingCompleted, navigate])

  // Load existing helper data for pre-filling
  useEffect(() => {
    if (!user) return

    const loadData = async () => {
      const { data: helper } = await supabase
        .from('helpers')
        .select('*')
        .eq('id', user.id)
        .single()

      const { data: profile } = await supabase
        .from('profiles')
        .select('phone')
        .eq('id', user.id)
        .single()

      const { data: services } = await supabase
        .from('helper_services')
        .select('*, categories(slug, name)')
        .eq('helper_id', user.id)

      // Parse lat/lng from PostGIS
      let lat = null
      let lng = null
      if (helper?.location) {
        const match = helper.location.match(/POINT\(([^ ]+) ([^ ]+)\)/)
        if (match) {
          lng = parseFloat(match[1])
          lat = parseFloat(match[2])
        }
      }

      setHelperData({
        description: helper?.description || '',
        phone: profile?.phone || '',
        birth_date: helper?.birth_date || '',
        languages: helper?.languages || [],
        lat,
        lng,
        availability: helper?.availability || { timeOfDay: [], daysOfWeek: [] },
        services: (services || []).map((s) => ({
          category: s.categories?.slug,
          categoryName: s.categories?.name,
          hourlyRate: s.hourly_rate,
          pricingType: s.pricing_type,
          competence: s.competence || '',
          tags: s.tags || [],
        })),
      })
      setDataLoading(false)
    }

    loadData()
  }, [user])

  const handleFinish = async () => {
    await completeOnboarding()
    navigate('/dashboard', { replace: true })
  }

  if (loading || dataLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <SEO title="Fullfør profilen din" description="Sett opp hjelperprofilen din steg for steg." />

      <h1 className="mb-2 text-2xl font-bold text-gray-900">Fullfør profilen din</h1>
      <p className="mb-8 text-sm text-gray-500">Fyll ut informasjonen nedenfor for å bli synlig for kunder.</p>

      {/* Step indicator */}
      <div className="mb-8 flex items-center justify-between">
        {STEPS.map((step) => (
          <div key={step.number} className="flex flex-col items-center">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                step.number === currentStep
                  ? 'bg-primary-500 text-white'
                  : step.number < currentStep
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-400'
              }`}
            >
              {step.number < currentStep ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                step.number
              )}
            </div>
            <span
              className={`mt-1.5 text-xs font-medium ${
                step.number === currentStep ? 'text-primary-600' : 'text-gray-400'
              }`}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="rounded-xl bg-white p-6 shadow-sm sm:p-8">
        {currentStep === 1 && (
          <StepProfile helperData={helperData} onNext={() => setCurrentStep(2)} />
        )}
        {currentStep === 2 && (
          <StepLocation
            helperData={helperData}
            onNext={() => setCurrentStep(3)}
            onBack={() => setCurrentStep(1)}
          />
        )}
        {currentStep === 3 && (
          <StepServices
            helperData={helperData}
            onNext={() => setCurrentStep(4)}
            onBack={() => setCurrentStep(2)}
          />
        )}
        {currentStep === 4 && (
          <StepAvailability
            helperData={helperData}
            onBack={() => setCurrentStep(3)}
            onFinish={handleFinish}
          />
        )}
      </div>
    </div>
  )
}
