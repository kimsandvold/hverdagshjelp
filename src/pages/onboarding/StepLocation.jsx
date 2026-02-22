import { useState } from 'react'
import Button from '../../components/ui/Button'
import LocationPickerModal from '../../components/ui/LocationPickerModal'
import useAuthStore from '../../stores/useAuthStore'
import useHelperStore from '../../stores/useHelperStore'

export default function StepLocation({ helperData, onNext, onBack }) {
  const user = useAuthStore((s) => s.user)
  const updateHelper = useHelperStore((s) => s.updateHelper)
  const [lat, setLat] = useState(helperData?.lat || null)
  const [lng, setLng] = useState(helperData?.lng || null)
  const [mapOpen, setMapOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleNext = async () => {
    setSaving(true)

    const updates = {}
    if (lat != null && lng != null) {
      updates.lat = lat
      updates.lng = lng
    }

    await updateHelper(user.id, updates)
    setSaving(false)
    onNext()
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Sted
        </label>
        <p className="mb-3 text-sm text-gray-500">
          Velg din posisjon på kartet slik at kunder i nærheten kan finne deg.
        </p>
        <button
          type="button"
          onClick={() => setMapOpen(true)}
          className="inline-flex w-full items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-left transition-colors hover:bg-gray-100 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="truncate">
            {lat != null ? 'Posisjon valgt' : 'Velg posisjon på kart'}
          </span>
        </button>
        <LocationPickerModal
          isOpen={mapOpen}
          onClose={() => setMapOpen(false)}
          onConfirm={(result) => {
            setMapOpen(false)
            if (result) {
              setLat(result.lat)
              setLng(result.lng)
            } else {
              setLat(null)
              setLng(null)
            }
          }}
          initialLat={lat}
          initialLng={lng}
        />
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
