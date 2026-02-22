import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import useHelperStore from '../../stores/useHelperStore';
import useFavoritesStore from '../../stores/useFavoritesStore';
import useAuthStore from '../../stores/useAuthStore';
import useBookingStore from '../../stores/useBookingStore';
import useReferencesStore from '../../stores/useReferencesStore';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import categoryIcons from '../../data/categoryIcons';
import { AVATAR_COLORS } from '../../components/HelperCard';
import { supabase } from '../../lib/supabase';
import SEO from '../../components/SEO';

const availabilityLabels = { dag: 'Dag', kveld: 'Kveld', natt: 'Natt', hverdager: 'Hverdager', helg: 'Helg' };

function calculateAge(birthDate) {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export default function HelperProfilePage() {
  const { id } = useParams();
  const getHelperById = useHelperStore((state) => state.getHelperById);
  const [helper, setHelper] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const isFavorite = useFavoritesStore((state) => state.isFavorite(id));
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  const createBooking = useBookingStore((state) => state.createBooking);

  const references = useReferencesStore((state) => state.references);
  const referencesLoading = useReferencesStore((state) => state.loading);
  const canOffer = useReferencesStore((state) => state.canOffer);
  const hasOffered = useReferencesStore((state) => state.hasOffered);
  const fetchReferences = useReferencesStore((state) => state.fetchReferences);
  const checkEligibility = useReferencesStore((state) => state.checkEligibility);
  const addReference = useReferencesStore((state) => state.addReference);
  const deleteReference = useReferencesStore((state) => state.deleteReference);

  // Reference modal state
  const [showRefModal, setShowRefModal] = useState(false);
  const [refMessage, setRefMessage] = useState('');
  const [refSubmitting, setRefSubmitting] = useState(false);
  const [refError, setRefError] = useState('');

  // Request form state
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [bookingModal, setBookingModal] = useState(null);
  const [bookingDesc, setBookingDesc] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getHelperById(id).then((data) => {
      if (!cancelled) {
        setHelper(data);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [id, getHelperById]);

  // Fetch references + check eligibility
  useEffect(() => {
    if (id) {
      fetchReferences(id);
      if (isAuthenticated) checkEligibility(id);
    }
  }, [id, isAuthenticated, fetchReferences, checkEligibility]);

  // Log profile view (authenticated users viewing other profiles)
  useEffect(() => {
    if (isAuthenticated && user?.id && user.id !== id) {
      supabase.from('profile_views').insert({ helper_id: id, viewer_id: user.id });
    }
  }, [id, isAuthenticated, user?.id]);

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    if (!bookingDesc.trim()) {
      setBookingError('Beskriv hva du trenger hjelp med');
      return;
    }
    setBookingError('');
    setBookingSubmitting(true);
    const result = await createBooking(id, bookingModal, bookingDesc.trim(), bookingDate.trim() || null);
    if (result.error) {
      setBookingError(result.error);
    } else {
      setBookingModal(null);
      setBookingDesc('');
      setBookingDate('');
      setBookingSuccess(true);
      setTimeout(() => setBookingSuccess(false), 3000);
    }
    setBookingSubmitting(false);
  };

  const handleSubmitReference = async (e) => {
    e.preventDefault();
    if (!refMessage.trim()) {
      setRefError('Skriv en kort melding');
      return;
    }
    setRefError('');
    setRefSubmitting(true);
    const result = await addReference(id, refMessage.trim());
    if (result.error) {
      setRefError(result.error);
    } else {
      setShowRefModal(false);
      setRefMessage('');
    }
    setRefSubmitting(false);
  };

  const helperJsonLd = helper ? {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `${helper.name} — Hjelper`,
    description: helper.description || `Hjelper tilgjengelig på Hverdagshjelp.no`,
    provider: {
      '@type': 'Person',
      name: helper.name,
    },
    ...(helper.location && {
      areaServed: {
        '@type': 'Place',
        name: helper.location,
      },
    }),
  } : null;

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (!helper) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <SEO
          title="Hjelper ikke funnet"
          description="Vi fant ikke hjelperen du leter etter."
        />
        <h1 className="text-2xl font-bold text-gray-900">
          Hjelperen ble ikke funnet
        </h1>
        <p className="mt-2 text-gray-500">
          Vi fant ikke hjelperen du leter etter.
        </p>
        <Link
          to="/search"
          className="mt-6 inline-block rounded-lg bg-primary-500 px-6 py-2 font-medium text-white hover:bg-primary-600"
        >
          Tilbake til søk
        </Link>
      </div>
    );
  }

  const initials = helper.name
    .split(' ')
    .map((n) => n.charAt(0).toUpperCase())
    .join('');
  const avatarStyle = AVATAR_COLORS[helper.avatar_color] || null;

  const descriptionExcerpt = helper.description
    ? helper.description.slice(0, 160).trim() + (helper.description.length > 160 ? '...' : '')
    : `Hjelper tilgjengelig på Hverdagshjelp.no`;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <SEO
        title={`${helper.name} — Hjelper`}
        description={descriptionExcerpt}
        url={`https://hverdagshjelp.no/helper/${id}`}
        jsonLd={helperJsonLd}
      />
      <Link
        to="/search"
        className="mb-6 inline-flex items-center gap-1 text-sm text-primary-500 hover:underline"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Tilbake til søkeresultater
      </Link>

      <div className="rounded-xl bg-white p-6 shadow-sm sm:p-8">
        {/* Header */}
        <div className="flex flex-col items-start gap-6 sm:flex-row">
          {/* Avatar */}
          {helper.avatar_url ? (
            <img
              src={helper.avatar_url}
              alt={helper.name}
              className="h-24 w-24 flex-shrink-0 rounded-full object-cover"
              style={avatarStyle ? { border: `3px solid ${avatarStyle.border}` } : undefined}
            />
          ) : (
            <div
              className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-full text-2xl font-bold bg-primary-200 text-primary-700"
              style={avatarStyle ? { backgroundColor: avatarStyle.bg, color: avatarStyle.text } : undefined}
            >
              {initials}
            </div>
          )}

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <h1 className="text-2xl font-bold text-gray-900">{helper.name}</h1>
              {isAuthenticated && (
                <button
                  type="button"
                  onClick={() => toggleFavorite(id)}
                  className="rounded-full p-2 transition-colors hover:bg-gray-100 cursor-pointer"
                  title={isFavorite ? 'Fjern fra lagrede' : 'Lagre hjelper'}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-6 w-6 ${isFavorite ? 'fill-primary-500 text-primary-500' : 'text-gray-400'}`}
                    viewBox="0 0 24 24"
                    fill={isFavorite ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </button>
              )}
            </div>

            {/* Badges */}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {helper.tier === 'premium' && <Badge type="premium" />}
              {helper.tier === 'basic' && <Badge type="basic" />}
              {helper.verified && <Badge type="verified" />}
            </div>

            {/* Location */}
            {helper.location && (
              <p className="mt-3 text-sm text-gray-600">{helper.location}</p>
            )}

            {/* Age & Languages */}
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
              {helper.birth_date && (
                <span className="text-sm text-gray-500">{calculateAge(helper.birth_date)} år</span>
              )}
              {helper.languages?.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  {helper.languages.map((lang, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600"
                    >
                      {lang.language}
                      <span className="text-[10px] text-gray-400">({lang.type})</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {helper.description && (
          <div className="mt-6">
            <p className="leading-relaxed text-gray-600">{helper.description}</p>
          </div>
        )}

        {/* Primary action: Send request */}
        {isAuthenticated && user?.id !== id && (
          <div className="mt-8 rounded-xl border-2 border-primary-100 bg-primary-50/30 p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900">Send forespørsel</h2>
            <p className="mt-1 text-sm text-gray-500">Velg tjeneste og beskriv hva du trenger hjelp med.</p>

            {bookingSuccess && (
              <div className="mt-3 rounded-lg bg-green-50 p-3 text-sm font-medium text-green-700">
                Forespørsel sendt! Du kan følge med på status under «Mine forespørsler».
              </div>
            )}

            <form onSubmit={handleSubmitBooking} className="mt-4 space-y-4">
              {/* Category selector */}
              <div>
                <label className="text-sm font-medium text-gray-700">Velg tjeneste</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {helper.services.map((s) => {
                    const catName = s.categoryName || s.category;
                    const selected = bookingModal === s.category;
                    return (
                      <button
                        key={s.category}
                        type="button"
                        onClick={() => setBookingModal(s.category)}
                        className={`flex items-center gap-2 rounded-lg border-2 px-3 py-2 text-sm font-medium transition-all cursor-pointer ${
                          selected
                            ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {categoryIcons[s.category] && (
                          <div className="h-4 w-4">{categoryIcons[s.category]}</div>
                        )}
                        {catName}
                        <span className="text-xs opacity-70">
                          {s.pricingType === 'agreement' ? 'Avtales' : `${s.hourlyRate} kr/t`}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {/* Tags for selected category */}
                {bookingModal && (() => {
                  const selectedService = helper.services.find(s => s.category === bookingModal);
                  const tags = selectedService?.tags || [];
                  if (tags.length === 0) return null;
                  return (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-700"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* Message */}
              <div>
                <label className="text-sm font-medium text-gray-700">Din melding</label>
                <textarea
                  rows={3}
                  value={bookingDesc}
                  onChange={(e) => setBookingDesc(e.target.value)}
                  placeholder="Beskriv hva du trenger hjelp med..."
                  className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
                {/* Quick phone share */}
                <div className="mt-2">
                  {showPhoneInput ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="tel"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        placeholder="Skriv telefonnummer..."
                        className="w-44 rounded-full border border-gray-200 px-3 py-1 text-xs outline-none focus:border-primary-500"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (phoneInput.trim()) {
                            setBookingDesc((prev) => prev ? `${prev}\n\nMitt telefonnummer: ${phoneInput.trim()}` : `Mitt telefonnummer: ${phoneInput.trim()}`);
                            setShowPhoneInput(false);
                            setPhoneInput('');
                          }
                        }}
                        disabled={!phoneInput.trim()}
                        className="rounded-full bg-primary-500 px-3 py-1 text-xs font-medium text-white hover:bg-primary-600 cursor-pointer disabled:opacity-50"
                      >
                        Legg til
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowPhoneInput(false); setPhoneInput(''); }}
                        className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        Avbryt
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={async () => {
                        let myPhone = profile?.phone || user?.phone || user?.user_metadata?.phone || '';
                        if (!myPhone && user?.id) {
                          const { data } = await supabase.from('profiles').select('phone').eq('id', user.id).single();
                          myPhone = data?.phone || '';
                        }
                        setPhoneInput(myPhone);
                        setShowPhoneInput(true);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 cursor-pointer"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                      </svg>
                      Del telefonnummer
                    </button>
                  )}
                </div>
              </div>

              {/* Optional: desired time */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Ønsket tidspunkt <span className="font-normal text-gray-400">(valgfritt)</span>
                </label>
                <input
                  type="text"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  placeholder="F.eks. «Neste uke», «Mandag 15. mars»"
                  className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
                {helper.availability && (
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="text-xs text-gray-400">Tilgjengelig:</span>
                    {(helper.availability.daysOfWeek || []).map((key) => (
                      <span key={key} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                        {availabilityLabels[key] || key}
                      </span>
                    ))}
                    {(helper.availability.timeOfDay || []).map((key) => (
                      <span key={key} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                        {availabilityLabels[key] || key}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {bookingError && <p className="text-sm text-red-600">{bookingError}</p>}

              <Button type="submit" variant="primary" disabled={bookingSubmitting || !bookingModal}>
                {bookingSubmitting ? 'Sender...' : 'Send forespørsel'}
              </Button>
            </form>
          </div>
        )}

        {!isAuthenticated && (
          <div className="mt-8 rounded-xl border-2 border-primary-100 bg-primary-50/30 p-5 text-center sm:p-6">
            <p className="text-sm text-gray-600">
              <Link to="/login" className="font-medium text-primary-600 hover:underline">Logg inn</Link> for å sende en forespørsel til denne hjelperen.
            </p>
          </div>
        )}

        {/* References section */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900">
            Referanser{!referencesLoading && ` (${references.length})`}
          </h2>

          {referencesLoading ? (
            <div className="mt-4 flex justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
            </div>
          ) : references.length === 0 ? (
            <p className="mt-3 text-sm text-gray-400">Ingen referanser ennå.</p>
          ) : (
            <div className="mt-4 space-y-4">
              {references.map((ref) => (
                <div key={ref.id} className="flex gap-3">
                  {ref.userAvatar ? (
                    <img src={ref.userAvatar} alt={ref.userName} className="h-10 w-10 flex-shrink-0 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
                      {ref.userName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">{ref.userName}</span>
                      <span className="text-xs text-gray-400">
                        {new Date(ref.createdAt).toLocaleDateString('nb-NO', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-gray-600 italic">&laquo;{ref.message}&raquo;</p>
                    {isAuthenticated && user?.id === ref.userId && (
                      <button
                        type="button"
                        onClick={() => deleteReference(ref.id)}
                        className="mt-1 text-xs text-red-500 hover:underline cursor-pointer"
                      >
                        Fjern referanse
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CTA / status */}
          {isAuthenticated && user?.id !== id && canOffer && (
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => setShowRefModal(true)}
            >
              Tilby deg som referanse
            </Button>
          )}
          {isAuthenticated && user?.id !== id && hasOffered && (
            <p className="mt-4 text-sm text-gray-400">Du har allerede tilbudt deg som referanse.</p>
          )}
        </div>

      </div>

      {/* Reference modal */}
      <Modal isOpen={showRefModal} onClose={() => setShowRefModal(false)} title="Tilby deg som referanse">
        <form onSubmit={handleSubmitReference} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Din melding</label>
            <textarea
              rows={4}
              maxLength={500}
              value={refMessage}
              onChange={(e) => setRefMessage(e.target.value)}
              placeholder="Skriv kort om din erfaring med denne hjelperen..."
              className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            />
            <p className="mt-1 text-right text-xs text-gray-400">{refMessage.length}/500</p>
          </div>
          {refError && <p className="text-sm text-red-600">{refError}</p>}
          <div className="flex justify-end gap-3">
            <Button variant="secondary" size="sm" type="button" onClick={() => setShowRefModal(false)}>
              Avbryt
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={refSubmitting || !refMessage.trim()}>
              {refSubmitting ? 'Sender...' : 'Send referanse'}
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
