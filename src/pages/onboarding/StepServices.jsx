import { useState, useEffect } from 'react'
import Button from '../../components/ui/Button'
import { supabase } from '../../lib/supabase'
import useAuthStore from '../../stores/useAuthStore'
import useHelperStore from '../../stores/useHelperStore'

export default function StepServices({ helperData, onNext, onBack }) {
  const user = useAuthStore((s) => s.user)
  const updateHelper = useHelperStore((s) => s.updateHelper)
  const [categories, setCategories] = useState([])
  const [services, setServices] = useState([])
  const [tagInputs, setTagInputs] = useState({})
  const [saving, setSaving] = useState(false)

  // Load categories
  useEffect(() => {
    supabase
      .from('categories')
      .select('*')
      .order('sort_order')
      .then(({ data }) => setCategories(data || []))
  }, [])

  // Pre-fill existing services
  useEffect(() => {
    if (helperData?.services?.length > 0) {
      setServices(
        helperData.services.map((s) => ({
          category: s.category,
          hourlyRate: s.hourlyRate ?? s.hourly_rate ?? 300,
          pricingType: s.pricingType ?? s.pricing_type ?? 'hourly',
          competence: s.competence || '',
          tags: s.tags || [],
        }))
      )
    }
  }, [helperData?.services])

  const isFreePeriod = new Date() < new Date('2026-06-01')
  const isAmbassador = helperData?.ambassador || false
  const tierLimits = { free: 2, basic: 5, premium: Infinity }
  const effectiveTier = isAmbassador
    ? 'premium'
    : isFreePeriod && (helperData?.tier === 'free' || !helperData?.tier)
      ? 'basic'
      : (helperData?.tier || 'free')
  const FREE_LIMIT = tierLimits[effectiveTier] ?? 2

  const handleToggleService = (categorySlug) => {
    setServices((prev) => {
      const exists = prev.find((s) => s.category === categorySlug)
      if (exists) return prev.filter((s) => s.category !== categorySlug)
      if (prev.length >= FREE_LIMIT) return prev
      return [...prev, { category: categorySlug, hourlyRate: 300, pricingType: 'hourly', competence: '', tags: [] }]
    })
  }

  const handleServiceField = (categorySlug, field, value) => {
    setServices((prev) =>
      prev.map((s) => (s.category === categorySlug ? { ...s, [field]: value } : s))
    )
  }

  const handleAddTag = (categorySlug) => {
    const raw = (tagInputs[categorySlug] || '').replace(/^#/, '').trim().toLowerCase()
    if (!raw) return
    setServices((prev) =>
      prev.map((s) => {
        if (s.category !== categorySlug) return s
        if (s.tags.includes(raw)) return s
        return { ...s, tags: [...s.tags, raw] }
      })
    )
    setTagInputs((prev) => ({ ...prev, [categorySlug]: '' }))
  }

  const handleRemoveTag = (categorySlug, tag) => {
    setServices((prev) =>
      prev.map((s) =>
        s.category === categorySlug ? { ...s, tags: s.tags.filter((t) => t !== tag) } : s
      )
    )
  }

  const handleTagKeyDown = (e, categorySlug) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      handleAddTag(categorySlug)
    }
  }

  const handleNext = async () => {
    setSaving(true)
    await updateHelper(user.id, { services })
    setSaving(false)
    onNext()
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Velg tjenester du tilbyr
        </label>
        <p className="mb-3 text-sm text-gray-500">
          {isAmbassador
            ? 'Som ambassadør kan du velge ubegrenset antall tjenester.'
            : isFreePeriod
              ? `Du kan velge opptil ${FREE_LIMIT} tjenester i lanseringsperioden.`
              : `Du kan velge opptil ${FREE_LIMIT} tjenester på gratisplanen.`}
          {!isAmbassador && services.length >= FREE_LIMIT && (
            <span className="font-medium text-primary-600"> Oppgrader for flere.</span>
          )}
        </p>
        <div className="grid grid-cols-1 gap-2.5">
          {categories.map((cat) => {
            const service = services.find((s) => s.category === cat.slug)
            const isActive = !!service
            const isDisabled = !isActive && services.length >= FREE_LIMIT
            return (
              <div
                key={cat.id}
                className={`rounded-lg border-2 transition-colors ${
                  isActive
                    ? 'border-primary-500 bg-primary-50'
                    : isDisabled
                      ? 'border-gray-100 bg-gray-50 opacity-50'
                      : 'border-gray-200 bg-white'
                }`}
              >
                {/* Toggle header */}
                <button
                  type="button"
                  onClick={() => handleToggleService(cat.slug)}
                  disabled={isDisabled}
                  className={`flex w-full items-start gap-3 px-4 py-3 text-left ${
                    isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  <div
                    className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition-colors ${
                      isActive
                        ? 'border-primary-500 bg-primary-500 text-white'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    {isActive && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm font-medium text-gray-800">{cat.name}</span>
                    {cat.description && (
                      <p className="mt-0.5 text-xs text-gray-500 leading-snug">{cat.description}</p>
                    )}
                  </div>
                </button>

                {/* Inline service details when active */}
                {isActive && service && (
                  <div className="border-t border-primary-200 px-4 pb-4 pt-3 space-y-3">
                    {/* Pricing toggle */}
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-600">Pris</label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleServiceField(service.category, 'pricingType', 'hourly')}
                          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                            service.pricingType === 'hourly'
                              ? 'bg-primary-500 text-white'
                              : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          Timepris
                        </button>
                        <button
                          type="button"
                          onClick={() => handleServiceField(service.category, 'pricingType', 'agreement')}
                          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                            service.pricingType === 'agreement'
                              ? 'bg-primary-500 text-white'
                              : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          Avtales
                        </button>
                        {service.pricingType === 'hourly' && (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min="0"
                              value={service.hourlyRate}
                              onChange={(e) =>
                                handleServiceField(service.category, 'hourlyRate', Number(e.target.value))
                              }
                              className="w-20 rounded-md border border-gray-200 bg-white px-2 py-1.5 text-xs outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                            />
                            <span className="text-xs text-gray-500">kr/t</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Competence description */}
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-600">
                        Hva jeg kan hjelpe med <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows={3}
                        value={service.competence}
                        onChange={(e) =>
                          handleServiceField(service.category, 'competence', e.target.value)
                        }
                        placeholder={`Beskriv din erfaring med ${cat.name.toLowerCase()}...`}
                        className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                      />
                    </div>

                    {/* Tags */}
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-600">
                        Stikkord
                      </label>
                      {service.tags.length > 0 && (
                        <div className="mb-2 flex flex-wrap gap-1.5">
                          {service.tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-700"
                            >
                              #{tag}
                              <button
                                type="button"
                                onClick={() => handleRemoveTag(service.category, tag)}
                                className="ml-0.5 text-primary-400 hover:text-primary-700 cursor-pointer"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                      {/* Suggested tags */}
                      {cat.suggested_tags?.length > 0 && (
                        <div className="mb-2">
                          <span className="mb-1 block text-xs text-gray-400">Forslag:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {cat.suggested_tags
                              .filter((st) => !service.tags.includes(st))
                              .map((st) => (
                                <button
                                  key={st}
                                  type="button"
                                  onClick={() =>
                                    handleServiceField(service.category, 'tags', [...service.tags, st])
                                  }
                                  className="rounded-full border border-dashed border-gray-300 bg-white px-2.5 py-1 text-xs text-gray-500 transition-colors hover:border-primary-400 hover:bg-primary-50 hover:text-primary-600 cursor-pointer"
                                >
                                  + {st}
                                </button>
                              ))}
                          </div>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={tagInputs[service.category] || ''}
                          onChange={(e) =>
                            setTagInputs((prev) => ({ ...prev, [service.category]: e.target.value }))
                          }
                          onKeyDown={(e) => handleTagKeyDown(e, service.category)}
                          placeholder="Eller skriv dine egne..."
                          className="flex-1 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs outline-none transition-colors focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddTag(service.category)}
                          className="rounded-md bg-primary-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-600 cursor-pointer"
                        >
                          Legg til
                        </button>
                      </div>
                      <p className="mt-1 text-xs text-gray-400">Trykk Enter eller komma for å legge til</p>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="secondary" size="lg" className="flex-1" onClick={onBack}>
          Tilbake
        </Button>
        <Button variant="primary" size="lg" className="flex-1" onClick={handleNext} disabled={saving}>
          {saving ? 'Lagrer...' : 'Neste'}
        </Button>
      </div>
    </div>
  )
}
