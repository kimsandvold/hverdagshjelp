import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../stores/useAuthStore'
import useHelperStore from '../../stores/useHelperStore'

export default function SettingsPage() {
  const { profile, role, updateProfile, deleteAccount } = useAuthStore()
  const getHelperById = useHelperStore((s) => s.getHelperById)
  const updateHelper = useHelperStore((s) => s.updateHelper)
  const navigate = useNavigate()

  const [showPhone, setShowPhone] = useState(true)
  const [showEmail, setShowEmail] = useState(true)
  const [active, setActive] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  useEffect(() => {
    if (profile) {
      setShowPhone(profile.show_phone !== false)
      setShowEmail(profile.show_email !== false)
    }
  }, [profile])

  useEffect(() => {
    if (role === 'helper' && profile?.id) {
      getHelperById(profile.id).then((data) => {
        if (data) setActive(data.active !== false)
      })
    }
  }, [role, profile?.id, getHelperById])

  const handleToggle = async (field, value) => {
    if (field === 'show_phone') setShowPhone(value)
    if (field === 'show_email') setShowEmail(value)

    setSaving(true)
    await updateProfile({ [field]: value })
    setSaving(false)
  }

  const handleActiveToggle = async (value) => {
    setActive(value)
    setSaving(true)
    await updateHelper(profile.id, { active: value })
    setSaving(false)
  }

  const handleDelete = async () => {
    if (deleteConfirm !== 'SLETT') return
    setDeleting(true)
    setDeleteError(null)

    const result = await deleteAccount()
    if (result.success) {
      navigate('/')
    } else {
      setDeleteError(result.error || 'Noe gikk galt. Prøv igjen.')
      setDeleting(false)
    }
  }

  return (
    <div className="py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Innstillinger</h1>

      {/* Privacy section */}
      <div className="rounded-xl bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Personvern</h2>
        <p className="text-sm text-gray-500 mb-5">Velg hva som vises på profilen din</p>

        <div className="space-y-4">
          {/* Show phone toggle */}
          <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-gray-700">Vis telefonnummer</p>
              <p className="text-xs text-gray-400">Andre brukere kan se telefonnummeret ditt</p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('show_phone', !showPhone)}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer ${
                showPhone ? 'bg-primary-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  showPhone ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Show email toggle */}
          <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-gray-700">Vis e-postadresse</p>
              <p className="text-xs text-gray-400">Andre brukere kan se e-postadressen din</p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('show_email', !showEmail)}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer ${
                showEmail ? 'bg-primary-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  showEmail ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Synlig profil — helpers only */}
          {role === 'helper' && (
            <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-700">Synlig profil</p>
                <p className="text-xs text-gray-400">Når av er profilen din skjult fra søk</p>
              </div>
              <button
                type="button"
                onClick={() => handleActiveToggle(!active)}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer ${
                  active ? 'bg-primary-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    active ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          )}

          {saving && (
            <p className="text-xs text-gray-400">Lagrer...</p>
          )}
        </div>
      </div>

      {/* Account section */}
      <div className="mt-6 rounded-xl bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Konto</h2>
        <p className="text-sm text-gray-500 mb-5">Slett kontoen din permanent</p>

        <button
          onClick={() => setDeleteModalOpen(true)}
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 cursor-pointer"
        >
          Slett konto
        </button>
      </div>

      {/* Delete confirmation modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Slett konto</h3>
            <p className="text-sm text-gray-600 mb-4">
              Dette vil permanent slette kontoen din og alle data knyttet til den. Denne handlingen kan ikke angres.
            </p>
            <p className="text-sm text-gray-600 mb-3">
              Skriv <span className="font-semibold text-red-600">SLETT</span> for å bekrefte:
            </p>
            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="SLETT"
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-colors focus:border-red-500 focus:ring-1 focus:ring-red-500"
            />
            {deleteError && (
              <p className="mt-2 text-sm text-red-600">{deleteError}</p>
            )}
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => {
                  setDeleteModalOpen(false)
                  setDeleteConfirm('')
                  setDeleteError(null)
                }}
                className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 cursor-pointer"
              >
                Avbryt
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteConfirm !== 'SLETT' || deleting}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {deleting ? 'Sletter...' : 'Slett kontoen min'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
