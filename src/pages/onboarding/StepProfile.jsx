import { useState } from 'react'
import Button from '../../components/ui/Button'
import useAuthStore from '../../stores/useAuthStore'
import useHelperStore from '../../stores/useHelperStore'

export default function StepProfile({ helperData, onNext }) {
  const user = useAuthStore((s) => s.user)
  const updateHelper = useHelperStore((s) => s.updateHelper)
  const [description, setDescription] = useState(helperData?.description || '')
  const [phone, setPhone] = useState(helperData?.phone || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleNext = async () => {
    setError('')

    if (!phone.trim()) {
      setError('Telefonnummer er påkrevd')
      return
    }

    setSaving(true)

    await updateHelper(user.id, {
      description,
      phone,
    })

    setSaving(false)
    onNext()
  }

  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium text-gray-700">
          Om deg
        </label>
        <textarea
          id="description"
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Fortell litt om deg selv og hva du kan hjelpe med..."
          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-colors focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
        />
      </div>

      <div>
        <label htmlFor="phone" className="mb-1 block text-sm font-medium text-gray-700">
          Telefon <span className="text-red-500">*</span>
        </label>
        <input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="912 34 567"
          required
          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-colors focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button variant="primary" size="lg" className="w-full" onClick={handleNext} disabled={saving}>
        {saving ? 'Lagrer...' : 'Neste'}
      </Button>
    </div>
  )
}
