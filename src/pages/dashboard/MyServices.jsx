import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../stores/useAuthStore';
import useHelperStore from '../../stores/useHelperStore';
import Modal from '../../components/ui/Modal';
import { supabase } from '../../lib/supabase';

export default function MyServices() {
  const profile = useAuthStore((state) => state.profile);
  const getHelperById = useHelperStore((state) => state.getHelperById);
  const updateHelper = useHelperStore((state) => state.updateHelper);

  const [categories, setCategories] = useState([]);
  const [helper, setHelper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);
  const [availability, setAvailability] = useState({ timeOfDay: [], daysOfWeek: [] });
  const [tagInputs, setTagInputs] = useState({});
  const [saving, setSaving] = useState(false);
  const [editingSlug, setEditingSlug] = useState(null);

  useEffect(() => {
    supabase
      .from('categories')
      .select('*')
      .order('sort_order')
      .then(({ data }) => setCategories(data || []));
  }, []);

  useEffect(() => {
    if (profile?.id) {
      getHelperById(profile.id).then((data) => {
        if (data) {
          setHelper(data);
          setServices(
            data.services?.map((s) => ({
              ...s,
              tags: s.tags || [],
              competence: s.competence || '',
              pricingType: s.pricingType || 'hourly',
            })) || []
          );
          setAvailability(data.availability || { timeOfDay: [], daysOfWeek: [] });
        }
        setLoading(false);
      });
    }
  }, [profile?.id, getHelperById]);

  // Save current services + availability to Supabase
  const saveAll = async (nextServices, nextAvailability) => {
    setSaving(true);
    await updateHelper(profile.id, {
      services: nextServices ?? services,
      availability: nextAvailability ?? availability,
    });
    setSaving(false);
  };

  const paidPlansAvailable = new Date() >= new Date('2026-06-01');
  const categoryLimits = { free: 2, basic: 5, premium: Infinity };
  const maxCategories = !paidPlansAvailable ? Infinity : (categoryLimits[helper?.tier] ?? 2);

  const handleToggleService = (categorySlug) => {
    setServices((prev) => {
      const exists = prev.find((s) => s.category === categorySlug);
      if (!exists && prev.length >= maxCategories) return prev;
      const next = exists
        ? prev.filter((s) => s.category !== categorySlug)
        : [...prev, { category: categorySlug, hourlyRate: 300, pricingType: 'hourly', competence: '', tags: [] }];
      saveAll(next, null);
      return next;
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
        if ((s.tags || []).includes(raw)) return s;
        return { ...s, tags: [...(s.tags || []), raw] };
      })
    );
    setTagInputs((prev) => ({ ...prev, [categorySlug]: '' }));
  };

  const handleRemoveTag = (categorySlug, tag) => {
    setServices((prev) =>
      prev.map((s) =>
        s.category === categorySlug ? { ...s, tags: (s.tags || []).filter((t) => t !== tag) } : s
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
    setAvailability((prev) => {
      const next = {
        ...prev,
        [field]: prev[field].includes(value)
          ? prev[field].filter((v) => v !== value)
          : [...prev[field], value],
      };
      saveAll(null, next);
      return next;
    });
  };

  const handleModalSave = async () => {
    await saveAll(services, null);
    setEditingSlug(null);
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (!helper) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <p className="text-gray-500">Kunne ikke laste profildataene dine.</p>
      </div>
    );
  }

  const editingService = editingSlug ? services.find((s) => s.category === editingSlug) : null;
  const editingCat = editingSlug ? categories.find((c) => c.slug === editingSlug) : null;

  return (
    <div className="w-full py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Mine tjenester</h1>

      <div className="space-y-6">
        {/* Category list */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">
              Tjenester
            </label>
            {maxCategories !== Infinity && (
              <span className="text-xs text-gray-400">
                {services.length} / {maxCategories} kategorier
              </span>
            )}
          </div>
          <div className="space-y-2">
            {categories.map((cat) => {
              const service = services.find((s) => s.category === cat.slug);
              const isActive = !!service;

              const summary = isActive
                ? [
                    service.pricingType === 'hourly' ? `${service.hourlyRate} kr/t` : 'Avtales',
                    service.competence ? 'Beskrivelse' : null,
                    (service.tags || []).length > 0 ? `${service.tags.length} stikkord` : null,
                  ].filter(Boolean).join(' · ')
                : null;

              return (
                <div
                  key={cat.id}
                  className={`rounded-lg border-2 transition-colors ${
                    isActive ? 'border-primary-500 bg-primary-50/30' : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3 px-4 py-3">
                    {/* Enable/disable toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleService(cat.slug)}
                      className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors cursor-pointer ${
                        isActive ? 'bg-primary-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                          isActive ? 'translate-x-4.5' : 'translate-x-0.5'
                        }`}
                      />
                    </button>

                    {/* Category name + summary, clickable to edit */}
                    <button
                      type="button"
                      onClick={() => {
                        if (!isActive) handleToggleService(cat.slug);
                        setEditingSlug(cat.slug);
                      }}
                      className="flex min-w-0 flex-1 items-center justify-between text-left cursor-pointer"
                    >
                      <div className="min-w-0">
                        <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                        {cat.description && (
                          <p className="truncate text-xs text-gray-500 mt-0.5">{cat.description}</p>
                        )}
                        {summary && (
                          <p className="truncate text-xs text-gray-400 mt-0.5">{summary}</p>
                        )}
                      </div>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          {maxCategories !== Infinity && services.length >= maxCategories && (
            <Link
              to="/dashboard/subscription"
              className="mt-3 block rounded-lg bg-primary-50 px-4 py-3 text-sm text-primary-700 transition-colors hover:bg-primary-100"
            >
              Du har brukt alle {maxCategories} kategoriene dine.{' '}
              <span className="font-medium underline">Oppgrader for flere</span>
            </Link>
          )}
        </div>

        {/* Edit service modal */}
        <Modal
          isOpen={!!editingSlug && !!editingService}
          onClose={() => setEditingSlug(null)}
          title={editingCat?.name || ''}
        >
          {editingService && editingCat && (
            <div className="space-y-4">
              {/* Pricing toggle */}
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Pris</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleServiceField(editingSlug, 'pricingType', 'hourly')}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                      editingService.pricingType === 'hourly'
                        ? 'bg-primary-500 text-white'
                        : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Timepris
                  </button>
                  <button
                    type="button"
                    onClick={() => handleServiceField(editingSlug, 'pricingType', 'agreement')}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                      editingService.pricingType === 'agreement'
                        ? 'bg-primary-500 text-white'
                        : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Avtales
                  </button>
                  {editingService.pricingType === 'hourly' && (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        value={editingService.hourlyRate}
                        onChange={(e) =>
                          handleServiceField(editingSlug, 'hourlyRate', Number(e.target.value))
                        }
                        className="w-20 rounded-md border border-gray-200 bg-white px-2 py-1.5 text-xs outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                      />
                      <span className="text-xs text-gray-500">kr/t</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Competence */}
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  Hva jeg kan hjelpe med
                </label>
                <textarea
                  rows={3}
                  value={editingService.competence}
                  onChange={(e) =>
                    handleServiceField(editingSlug, 'competence', e.target.value)
                  }
                  placeholder={`Beskriv din erfaring med ${editingCat.name.toLowerCase()}...`}
                  className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Stikkord</label>
                {(editingService.tags || []).length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {editingService.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-700"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(editingSlug, tag)}
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
                    value={tagInputs[editingSlug] || ''}
                    onChange={(e) =>
                      setTagInputs((prev) => ({ ...prev, [editingSlug]: e.target.value }))
                    }
                    onKeyDown={(e) => handleTagKeyDown(e, editingSlug)}
                    placeholder="f.eks. vinduspuss, dyprens..."
                    className="flex-1 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs outline-none transition-colors focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddTag(editingSlug)}
                    className="rounded-md bg-primary-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-600 cursor-pointer"
                  >
                    Legg til
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-400">Trykk Enter eller komma for å legge til</p>
              </div>

              {/* Save button */}
              <button
                type="button"
                onClick={handleModalSave}
                disabled={saving}
                className="w-full rounded-lg bg-primary-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-600 disabled:opacity-50 cursor-pointer"
              >
                {saving ? 'Lagrer...' : 'Lagre'}
              </button>
            </div>
          )}
        </Modal>

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

      </div>
    </div>
  );
}
