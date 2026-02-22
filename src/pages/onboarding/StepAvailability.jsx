import { useState } from 'react'
import Button from '../../components/ui/Button'
import useAuthStore from '../../stores/useAuthStore'
import useHelperStore from '../../stores/useHelperStore'

export default function StepAvailability({ helperData, onBack, onFinish }) {
  const user = useAuthStore((s) => s.user)
  const updateHelper = useHelperStore((s) => s.updateHelper)
  const [availability, setAvailability] = useState(
    helperData?.availability || { timeOfDay: [], daysOfWeek: [] }
  )
  const [saving, setSaving] = useState(false)

  const handleToggle = (field, value) => {
    setAvailability((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value],
    }))
  }

  const handleFinish = async () => {
    setSaving(true)
    await updateHelper(user.id, { availability })
    setSaving(false)
    onFinish()
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">Tilgjengelighet</label>
        <div className="space-y-3">
          <div>
            <span className="mb-1 block text-xs font-medium text-gray-600">Tid på døgnet</span>
            <div className="flex flex-wrap gap-2">
              {[['dag', 'Dag'], ['kveld', 'Kveld'], ['natt', 'Natt']].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleToggle('timeOfDay', value)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                    availability.timeOfDay.includes(value)
                      ? 'bg-primary-500 text-white'
                      : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="mb-1 block text-xs font-medium text-gray-600">Dager</span>
            <div className="flex flex-wrap gap-2">
              {[['hverdager', 'Hverdager'], ['helg', 'Helg']].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleToggle('daysOfWeek', value)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                    availability.daysOfWeek.includes(value)
                      ? 'bg-primary-500 text-white'
                      : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="secondary" size="lg" className="flex-1" onClick={onBack}>
          Tilbake
        </Button>
        <Button variant="primary" size="lg" className="flex-1" onClick={handleFinish} disabled={saving}>
          {saving ? 'Fullfører...' : 'Fullfør oppsett'}
        </Button>
      </div>
    </div>
  )
}
