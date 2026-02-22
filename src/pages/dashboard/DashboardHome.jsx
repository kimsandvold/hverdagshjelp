import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../stores/useAuthStore';
import useHelperStore from '../../stores/useHelperStore';
import { supabase } from '../../lib/supabase';

export default function DashboardHome() {
  const profile = useAuthStore((state) => state.profile);
  const getHelperById = useHelperStore((state) => state.getHelperById);
  const [helper, setHelper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [viewCount, setViewCount] = useState(0);

  useEffect(() => {
    if (profile?.id) {
      getHelperById(profile.id).then((data) => {
        setHelper(data);
        setLoading(false);
      });

      // Fetch profile view count
      supabase
        .from('profile_views')
        .select('id', { count: 'exact', head: true })
        .eq('helper_id', profile.id)
        .then(({ count }) => setViewCount(count || 0));
    }
  }, [profile?.id, getHelperById]);

  const referralUrl = helper ? `${window.location.origin}/registrer/${helper.id}` : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
      <div className="mx-auto max-w-4xl px-4 py-12 text-center">
        <p className="text-gray-500">
          {'Kunne ikke laste profildataene dine. Prøv å logge inn på nytt.'}
        </p>
      </div>
    );
  }

  return (
    <div className="py-8">
      {/* Welcome message */}
      <h1 className="text-2xl font-bold text-gray-900">
        {'Velkommen tilbake, '}{helper.name}{'!'}
      </h1>

      {/* Status cards */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Active status */}
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Status</p>
          <div className="mt-2">
            {helper.active ? (
              <span className="inline-flex items-center gap-1.5 text-lg font-semibold text-green-600">
                <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                Aktiv
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-lg font-semibold text-gray-400">
                <span className="h-2.5 w-2.5 rounded-full bg-gray-300" />
                Inaktiv
              </span>
            )}
          </div>
        </div>

        {/* Subscription tier */}
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Abonnement</p>
          <div className="mt-2">
            <span className="text-sm font-medium text-gray-700 capitalize">{helper.tier === 'free' ? 'Gratis' : helper.tier === 'basic' ? 'Basis' : 'Premium'}</span>
          </div>
        </div>

        {/* Review count */}
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Anmeldelser</p>
          <p className="mt-2 text-lg font-semibold text-gray-900">
            {helper.reviewCount}
          </p>
        </div>

        {/* Profile views */}
        {helper.tier !== 'free' ? (
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Profilvisninger</p>
            <p className="mt-2 text-lg font-semibold text-gray-900">{viewCount}</p>
          </div>
        ) : (
          <div className="rounded-xl bg-gray-50 p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-400">Profilvisninger</p>
            <p className="mt-2 text-sm text-gray-400">
              Oppgrader til Basis for å se hvem som har sett profilen din.
            </p>
            <Link
              to="/dashboard/subscription"
              className="mt-2 inline-block text-xs font-medium text-primary-500 hover:underline"
            >
              Oppgrader plan
            </Link>
          </div>
        )}
      </div>

      {/* Referral — premium only */}
      {helper.tier === 'premium' ? (
        <div className="mt-8 rounded-xl border border-primary-100 bg-primary-50 p-5">
          <h2 className="text-base font-semibold text-primary-800">Verv en venn</h2>
          <p className="mt-1 text-sm text-primary-600">
            Del lenken under med en venn. For hver hjelper du verver får du 5&nbsp;% rabatt på abonnementet. Du kan spare opptil 40&nbsp;%.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={referralUrl}
              className="flex-1 rounded-lg border border-primary-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="flex-shrink-0 rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600 cursor-pointer"
            >
              {copied ? 'Kopiert!' : 'Kopier'}
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-base font-semibold text-gray-400">Verv en venn</h2>
          <p className="mt-1 text-sm text-gray-400">
            Oppgrader til Premium for å få tilgang til verveprogrammet og spar opptil 40&nbsp;% på abonnementet.
          </p>
          <Link
            to="/dashboard/subscription"
            className="mt-3 inline-block rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600"
          >
            Oppgrader til Premium
          </Link>
        </div>
      )}

      {/* Quick links */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold text-gray-900">Hurtiglenker</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            to="/dashboard/edit"
            className="group flex items-center gap-4 rounded-xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900 group-hover:text-primary-500">
                Profil
              </p>
              <p className="text-sm text-gray-500">
                {'Oppdater informasjonen din'}
              </p>
            </div>
          </Link>

          <Link
            to="/dashboard/services"
            className="group flex items-center gap-4 rounded-xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900 group-hover:text-primary-500">
                Mine tjenester
              </p>
              <p className="text-sm text-gray-500">
                {'Rediger tjenester og priser'}
              </p>
            </div>
          </Link>

          <Link
            to="/dashboard/subscription"
            className="group flex items-center gap-4 rounded-xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-100 text-accent-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900 group-hover:text-primary-500">
                Abonnement
              </p>
              <p className="text-sm text-gray-500">
                {'Administrer ditt abonnement'}
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
