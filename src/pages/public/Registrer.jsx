import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useAuthStore from '../../stores/useAuthStore';
import Button from '../../components/ui/Button';
import LocationPickerModal from '../../components/ui/LocationPickerModal';
import { supabase } from '../../lib/supabase';
import SEO from '../../components/SEO';

export default function Registrer() {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    description: '',
    location: '',
    lat: null,
    lng: null,
  });
  const [services, setServices] = useState([]);
  const [availability, setAvailability] = useState({ timeOfDay: [], daysOfWeek: [] });
  const [tagInputs, setTagInputs] = useState({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const { ref: referralCode } = useParams();
  const [referrer, setReferrer] = useState(null);
  const register = useAuthStore((state) => state.register);
  const navigate = useNavigate();

  // Load categories from Supabase
  useEffect(() => {
    supabase
      .from('categories')
      .select('*')
      .order('sort_order')
      .then(({ data }) => setCategories(data || []));
  }, []);

  // Load referrer info
  useEffect(() => {
    if (referralCode) {
      supabase
        .from('helpers')
        .select('id, profiles(name)')
        .eq('id', referralCode)
        .single()
        .then(({ data }) => {
          if (data) setReferrer({ id: data.id, name: data.profiles.name });
        });
    }
  }, [referralCode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleToggleService = (categorySlug) => {
    setServices((prev) => {
      const exists = prev.find((s) => s.category === categorySlug);
      if (exists) return prev.filter((s) => s.category !== categorySlug);
      return [...prev, { category: categorySlug, hourlyRate: 300, pricingType: 'hourly', competence: '', tags: [] }];
    });
  };

  const handleServiceField = (categorySlug, field, value) => {
    setServices((prev) =>
      prev.map((s) => (s.category === categorySlug ? { ...s, [field]: value } : s))
    );
  };

  const handleAddTag = (categorySlug) => {
    const raw = (tagInputs[categorySlug] || '').replace(/^#/, '').trim().toLowerCase();
    if (!raw) return;
    setServices((prev) =>
      prev.map((s) => {
        if (s.category !== categorySlug) return s;
        if (s.tags.includes(raw)) return s;
        return { ...s, tags: [...s.tags, raw] };
      })
    );
    setTagInputs((prev) => ({ ...prev, [categorySlug]: '' }));
  };

  const handleRemoveTag = (categorySlug, tag) => {
    setServices((prev) =>
      prev.map((s) =>
        s.category === categorySlug ? { ...s, tags: s.tags.filter((t) => t !== tag) } : s
      )
    );
  };

  const handleTagKeyDown = (e, categorySlug) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag(categorySlug);
    }
  };

  const handleToggleAvailability = (field, value) => {
    setAvailability((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    if (!formData.name.trim()) {
      setError('Navn er påkrevd');
      setSubmitting(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Passordet må være minst 6 tegn');
      setSubmitting(false);
      return;
    }

    const result = await register({
      name: formData.name.trim(),
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      description: formData.description,
      location: formData.location,
      lat: formData.lat,
      lng: formData.lng,
      services,
      availability,
      referredBy: referrer ? referralCode : undefined,
    });

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    setSubmitting(false);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <SEO
        title="Registrer deg som hjelper"
        description="Opprett en hjelperprofil og kom i gang."
        url="https://hverdagshjelp.no/registrer"
      />
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Opprett hjelper-konto</h1>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-xl bg-white p-6 shadow-sm sm:p-8">
        {/* Name */}
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
            Fullt navn <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder="Ola Nordmann"
            required
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-colors focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
            E-post <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="din@epost.no"
            required
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-colors focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          />
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
            Passord <span className="text-red-500">*</span>
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Minst 6 tegn"
            required
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-colors focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          />
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="mb-1 block text-sm font-medium text-gray-700">
            Telefon <span className="text-gray-400">(valgfritt)</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="912 34 567"
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-colors focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          />
        </div>

        {/* Location */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Sted
          </label>
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
              {formData.lat != null ? 'Posisjon valgt' : 'Velg posisjon på kart'}
            </span>
          </button>
          <LocationPickerModal
            isOpen={mapOpen}
            onClose={() => setMapOpen(false)}
            onConfirm={(result) => {
              setMapOpen(false);
              if (result) {
                setFormData((prev) => ({ ...prev, lat: result.lat, lng: result.lng }));
              } else {
                setFormData((prev) => ({ ...prev, lat: null, lng: null }));
              }
            }}
            initialLat={formData.lat}
            initialLng={formData.lng}
          />
        </div>

        {/* Services */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Tjenester
          </label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {categories.map((cat) => {
              const service = services.find((s) => s.category === cat.slug);
              const isActive = !!service;
              return (
                <div key={cat.id}>
                  <button
                    type="button"
                    onClick={() => handleToggleService(cat.slug)}
                    className={`flex w-full items-center gap-3 rounded-lg border-2 px-3 py-2.5 text-left transition-colors cursor-pointer ${
                      isActive
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div
                      className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition-colors ${
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
                    <span className="text-sm text-gray-700">{cat.name}</span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Expanded details for selected services */}
          {services.length > 0 && (
            <div className="mt-4 space-y-4">
              {services.map((service) => {
                const cat = categories.find((c) => c.slug === service.category);
                if (!cat) return null;
                return (
                  <div key={service.category} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <h4 className="mb-3 text-sm font-semibold text-gray-900">{cat.name}</h4>

                    {/* Pricing toggle */}
                    <div className="mb-3">
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
                    <div className="mt-3">
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
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={tagInputs[service.category] || ''}
                          onChange={(e) =>
                            setTagInputs((prev) => ({ ...prev, [service.category]: e.target.value }))
                          }
                          onKeyDown={(e) => handleTagKeyDown(e, service.category)}
                          placeholder="f.eks. vinduspuss, dyprens..."
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
                );
              })}
            </div>
          )}
        </div>

        {/* Availability */}
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
                    onClick={() => handleToggleAvailability('timeOfDay', value)}
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
                    onClick={() => handleToggleAvailability('daysOfWeek', value)}
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

        {/* Description */}
        <div>
          <label htmlFor="description" className="mb-1 block text-sm font-medium text-gray-700">
            Beskrivelse
          </label>
          <textarea
            id="description"
            name="description"
            rows={5}
            value={formData.description}
            onChange={handleChange}
            placeholder="Fortell litt om deg selv og hva du kan hjelpe med..."
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-colors focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          />
        </div>

        {/* Referral incentive */}
        <div className="rounded-lg border border-primary-100 bg-primary-50 p-4">
          <p className="text-sm font-medium text-primary-800">
            Verv en hjelper &ndash; spar 5&nbsp;% på abonnementet!
          </p>
          <p className="mt-1 text-xs text-primary-600">
            For hver hjelper du verver får du 5&nbsp;% rabatt på abonnementsprisen. Du kan spare opptil 70&nbsp;%.
          </p>
          {referralCode && (
            referrer ? (
              <p className="mt-2 text-xs font-medium text-primary-700">
                Du ble henvist av <span className="font-bold">{referrer.name}</span>
              </p>
            ) : (
              <p className="mt-2 text-xs font-medium text-red-600">
                Ugyldig vervekode
              </p>
            )
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit" variant="primary" size="lg" className="w-full" disabled={submitting}>
          {submitting ? 'Oppretter konto...' : 'Opprett konto'}
        </Button>

        <p className="text-center text-sm text-gray-500">
          Har du allerede en konto?{' '}
          <a href="/login" className="font-medium text-primary-500 hover:text-primary-600">
            Logg inn
          </a>
        </p>
      </form>
    </div>
  );
}
