import { useState, useEffect } from 'react';
import useAuthStore from '../../stores/useAuthStore';
import useHelperStore from '../../stores/useHelperStore';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import subscriptions from '../../data/subscriptions.json';
import { supabase } from '../../lib/supabase';

export default function Subscription() {
  const profile = useAuthStore((state) => state.profile);
  const getHelperById = useHelperStore((state) => state.getHelperById);
  const updateHelper = useHelperStore((state) => state.updateHelper);
  const [helper, setHelper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmTier, setConfirmTier] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [referralCount, setReferralCount] = useState(0);
  const [currentSubscription, setCurrentSubscription] = useState(null);

  useEffect(() => {
    if (profile?.id) {
      getHelperById(profile.id).then((data) => {
        setHelper(data);
        setLoading(false);
      });

      // Count referrals for this helper
      supabase
        .from('helpers')
        .select('id', { count: 'exact', head: true })
        .eq('referred_by', profile.id)
        .then(({ count }) => setReferralCount(count || 0));

      // Get current subscription
      supabase
        .from('subscriptions')
        .select('*')
        .eq('helper_id', profile.id)
        .single()
        .then(({ data }) => setCurrentSubscription(data));
    }
  }, [profile?.id, getHelperById]);

  // 5% discount per referral, max 40%
  const discountPercent = Math.min(referralCount * 5, 40);

  const getDiscountedPrice = (price) => {
    if (price === 0) return 0;
    return Math.round(price * (1 - discountPercent / 100));
  };

  const handleSelect = (tierId) => {
    setConfirmTier(tierId);
    setSuccessMessage('');
  };

  const handleConfirm = async () => {
    if (confirmTier && profile?.id) {
      setSubmitting(true);

      if (confirmTier === 'free') {
        // Downgrade to free — cancel subscription
        await updateHelper(profile.id, { tier: confirmTier });
        if (currentSubscription) {
          await supabase
            .from('subscriptions')
            .update({ status: 'stopped', updated_at: new Date().toISOString() })
            .eq('helper_id', profile.id);
        }
      } else {
        // Paid tier — create/update subscription record (Vipps integration placeholder)
        const sub = subscriptions.find(s => s.id === confirmTier);
        const amount = getDiscountedPrice(sub.price);

        // Upsert subscription
        await supabase.from('subscriptions').upsert({
          helper_id: profile.id,
          tier: confirmTier,
          status: 'pending', // Will be 'active' after Vipps confirms
          updated_at: new Date().toISOString(),
        }, { onConflict: 'helper_id' });

        // Create payment record
        await supabase.from('payments').insert({
          helper_id: profile.id,
          amount_nok: amount,
          status: 'pending', // Will be 'charged' after Vipps confirms
        });

        // For now, immediately update tier (will be gated by Vipps webhook later)
        // Auto-grant verified badge for basis+ tiers
        await updateHelper(profile.id, { tier: confirmTier, verified: true });
      }

      setHelper((prev) => prev ? { ...prev, tier: confirmTier } : prev);
      setSuccessMessage('Abonnementet ditt ble oppdatert!');
      setConfirmTier(null);
      setSubmitting(false);
    }
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
      <div className="mx-auto max-w-5xl px-4 py-12 text-center">
        <p className="text-gray-500">
          {'Kunne ikke laste abonnementsinformasjon.'}
        </p>
      </div>
    );
  }

  const selectedSub = subscriptions.find((s) => s.id === confirmTier);
  const paidPlansAvailable = new Date() >= new Date('2026-06-01');

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold text-gray-900">Abonnement</h1>
      <p className="mb-8 text-gray-500">
        {'Velg planen som passer best for deg.'}
      </p>

      {/* Free premium period notice */}
      {!paidPlansAvailable && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="text-sm font-medium text-green-800">
            Du har <strong>Premium gratis</strong> frem til <strong>1. juni 2026</strong>.
            Etter dette blir du automatisk satt over på gratisplanen, med mulighet til å oppgradere.
          </p>
        </div>
      )}

      {/* Discount banner */}
      {discountPercent > 0 && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="text-sm font-medium text-green-800">
            Du har {discountPercent}% rabatt ({referralCount} {referralCount === 1 ? 'vervning' : 'vervninger'})
          </p>
          <p className="mt-1 text-xs text-green-600">
            5% rabatt per vervning, opptil 40% maks.
          </p>
        </div>
      )}

      {/* Success message */}
      {successMessage && (
        <div className="mb-6 rounded-lg bg-green-50 p-4 text-sm font-medium text-green-700">
          {successMessage}
        </div>
      )}

      {/* Pricing cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {subscriptions.map((sub) => {
          const isCurrent = !paidPlansAvailable ? sub.id === 'premium' : helper.tier === sub.id;
          const discountedPrice = getDiscountedPrice(sub.price);
          const hasDiscount = discountPercent > 0 && sub.price > 0;
          return (
            <div
              key={sub.id}
              className={`relative rounded-xl bg-white p-6 shadow-sm ${
                sub.highlighted
                  ? 'border-2 border-accent-500'
                  : 'border border-gray-200'
              }`}
            >
              {/* Current plan badge */}
              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-block rounded-full bg-primary-500 px-4 py-1 text-xs font-medium text-white">
                    {'Nåværende plan'}
                  </span>
                </div>
              )}

              {/* Tier name */}
              <h3 className="text-xl font-bold text-gray-900">{sub.name}</h3>

              {/* Price */}
              <div className="mt-4">
                {sub.price === 0 ? (
                  <span className="text-3xl font-bold text-gray-900">Gratis</span>
                ) : (
                  <div>
                    {hasDiscount && (
                      <span className="text-lg text-gray-400 line-through mr-2">
                        {sub.price} kr
                      </span>
                    )}
                    <span className="text-3xl font-bold text-gray-900">
                      {discountedPrice} kr
                    </span>
                    <span className="text-sm text-gray-500">/{sub.period}</span>
                    {hasDiscount && (
                      <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                        -{discountPercent}%
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Features list */}
              <ul className="mt-6 space-y-3">
                {sub.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-gray-600">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              {/* Payment method note */}
              {sub.price > 0 && (
                <div className="mt-4 space-y-1">
                  <p className="text-xs text-gray-400">
                    Betaling via Vipps
                  </p>
                  <p className="text-xs text-gray-400">
                    Ingen bindingstid — avbryt når som helst
                  </p>
                </div>
              )}

              {/* Select button */}
              <div className="mt-6">
                {!paidPlansAvailable ? (
                  <Button
                    variant={sub.id === 'premium' ? 'secondary' : 'outline'}
                    size="md"
                    className="w-full"
                    disabled
                  >
                    {sub.id === 'premium' ? 'Aktiv til 1. juni' : 'Tilgjengelig fra 1. juni'}
                  </Button>
                ) : (
                  <Button
                    variant={isCurrent ? 'secondary' : sub.highlighted ? 'primary' : 'outline'}
                    size="md"
                    className="w-full"
                    disabled={isCurrent}
                    onClick={() => handleSelect(sub.id)}
                  >
                    {isCurrent ? 'Nåværende plan' : 'Velg plan'}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirmation modal */}
      <Modal
        isOpen={!!confirmTier}
        onClose={() => setConfirmTier(null)}
        title="Bekreft endring"
      >
        {selectedSub && (
          <div>
            <p className="text-gray-600">
              {'Er du sikker på at du vil bytte til '}
              <span className="font-semibold">{selectedSub.name}</span>
              {selectedSub.price > 0
                ? ` (${getDiscountedPrice(selectedSub.price)} kr/${selectedSub.period})`
                : ' (Gratis)'}
              ?
            </p>
            {selectedSub.price > 0 && discountPercent > 0 && (
              <p className="mt-2 text-sm text-green-600">
                Inkluderer {discountPercent}% ververabatt
              </p>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => setConfirmTier(null)}
              >
                Avbryt
              </Button>
              <Button variant="primary" onClick={handleConfirm} disabled={submitting}>
                {submitting ? 'Oppdaterer...' : 'Bekreft'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
