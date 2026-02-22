import { useState } from 'react'
import Button from '../../components/ui/Button'
import useAuthStore from '../../stores/useAuthStore'
import useHelperStore from '../../stores/useHelperStore'

const LANGUAGE_OPTIONS = [
  'Norsk', 'Engelsk', 'Svensk', 'Dansk', 'Polsk', 'Litauisk', 'Arabisk',
  'Somali', 'Urdu', 'Spansk', 'Tysk', 'Fransk', 'Tyrkisk', 'Persisk',
  'Russisk', 'Portugisisk', 'Thai', 'Vietnamesisk', 'Tigrinja', 'Filippinsk',
]

export default function StepProfile({ helperData, onNext }) {
  const user = useAuthStore((s) => s.user)
  const updateHelper = useHelperStore((s) => s.updateHelper)
  const [description, setDescription] = useState(helperData?.description || '')
  const [phone, setPhone] = useState(helperData?.phone || '')
  const [birthDate, setBirthDate] = useState(helperData?.birth_date || '')
  const [languages, setLanguages] = useState(helperData?.languages || [])
  const [newLang, setNewLang] = useState('')
  const [newLangType, setNewLangType] = useState('morsmål')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const addLanguage = () => {
    const lang = newLang.trim()
    if (!lang) return
    if (languages.some((l) => l.language === lang)) return
    setLanguages([...languages, { language: lang, type: newLangType }])
    setNewLang('')
    setNewLangType('morsmål')
  }

  const removeLanguage = (index) => {
    setLanguages(languages.filter((_, i) => i !== index))
  }

  const handleNext = async () => {
    setError('')

    if (!phone.trim()) {
      setError('Telefonnummer er påkrevd')
      return
    }
    if (!birthDate) {
      setError('Fødselsdato er påkrevd')
      return
    }
    if (languages.length === 0) {
      setError('Legg til minst ett språk')
      return
    }

    setSaving(true)

    await updateHelper(user.id, {
      description,
      phone,
      birth_date: birthDate || null,
      languages,
    })

    setSaving(false)
    onNext()
  }

  // Filter suggestions based on input
  const filteredOptions = newLang.trim().length > 0
    ? LANGUAGE_OPTIONS.filter(
        (opt) =>
          opt.toLowerCase().startsWith(newLang.toLowerCase()) &&
          opt.toLowerCase() !== newLang.toLowerCase() &&
          !languages.some((l) => l.language === opt)
      )
    : []

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

      <div>
        <label htmlFor="birthDate" className="mb-1 block text-sm font-medium text-gray-700">
          Fødselsdato <span className="text-red-500">*</span>
        </label>
        <input
          id="birthDate"
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          max={new Date().toISOString().split('T')[0]}
          required
          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-colors focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Språk <span className="text-red-500">*</span>
        </label>
        <p className="mb-2 text-xs text-gray-400">Legg til språkene du snakker</p>

        {/* Existing languages */}
        {languages.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {languages.map((lang, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary-700"
              >
                {lang.language}
                <span className="rounded-full bg-primary-200/60 px-1.5 py-0.5 text-[10px] text-primary-600">
                  {lang.type}
                </span>
                <button
                  type="button"
                  onClick={() => removeLanguage(index)}
                  className="ml-0.5 text-primary-400 hover:text-primary-700 cursor-pointer"
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Add language */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={newLang}
              onChange={(e) => setNewLang(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addLanguage()
                }
              }}
              placeholder="Skriv språk..."
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            />
            {filteredOptions.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-40 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                {filteredOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setLanguages((prev) => [...prev, { language: opt, type: newLangType }])
                      setNewLang('')
                      setNewLangType('morsmål')
                    }}
                    className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
          <select
            value={newLangType}
            onChange={(e) => setNewLangType(e.target.value)}
            className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          >
            <option value="morsmål">Morsmål</option>
            <option value="sidemål">Sidemål</option>
          </select>
          <button
            type="button"
            onClick={addLanguage}
            disabled={!newLang.trim()}
            className="rounded-lg bg-primary-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-600 disabled:opacity-50 cursor-pointer"
          >
            Legg til
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button variant="primary" size="lg" className="w-full" onClick={handleNext} disabled={saving}>
        {saving ? 'Lagrer...' : 'Neste'}
      </Button>
    </div>
  )
}
