import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import useHelperStore from '../../stores/useHelperStore';
import useLocationStore from '../../stores/useLocationStore';
import HelperCard from '../../components/HelperCard';
import HelperFilters from '../../components/HelperFilters';
import SearchBar from '../../components/ui/SearchBar';
import Button from '../../components/ui/Button';
import SEO from '../../components/SEO';
import MinioAd from '../../components/MinioAd';
import ShareButtons from '../../components/ui/ShareButtons';

export default function Resultatside() {
  const [searchParams] = useSearchParams();
  const setFilter = useHelperStore((state) => state.setFilter);
  const setGeoFilter = useHelperStore((state) => state.setGeoFilter);
  const clearGeoFilter = useHelperStore((state) => state.clearGeoFilter);
  const fetchHelpers = useHelperStore((state) => state.fetchHelpers);
  const loadMore = useHelperStore((state) => state.loadMore);
  const helpers = useHelperStore((state) => state.helpers);
  const loading = useHelperStore((state) => state.loading);
  const hasMore = useHelperStore((state) => state.hasMore);
  const locationStore = useLocationStore();
  const [showFilters, setShowFilters] = useState(false);

  // Sync URL params to store filters and fetch on every search change
  useEffect(() => {
    const q = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';

    setFilter('query', q);
    setFilter('categories', category ? [category] : []);

    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radius = searchParams.get('radius');

    if (lat && lng && radius) {
      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lng);
      const radiusNum = parseFloat(radius);
      setGeoFilter(latNum, lngNum, radiusNum);
      // Only update location store if coords actually changed — preserve existing label
      if (locationStore.lat !== latNum || locationStore.lng !== lngNum || locationStore.radiusKm !== radiusNum) {
        locationStore.setLocation({
          lat: latNum,
          lng: lngNum,
          radiusKm: radiusNum,
          locationLabel: locationStore.locationLabel || `${radiusNum} km radius`,
        });
      }
    } else {
      const location = searchParams.get('location') || '';
      if (location) {
        clearGeoFilter();
        setFilter('location', location);
      } else if (locationStore.isSet) {
        setGeoFilter(locationStore.lat, locationStore.lng, locationStore.radiusKm);
      }
    }

    fetchHelpers();
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <SEO
        title="Finn hjelper nær deg"
        description="Søk blant lokale hjelpere for rengjøring, hagearbeid, flytting, barnepass, dyrepass, leksehjelp og mer."
        url="https://dinhelt.no/search"
      />

      {/* Search hero banner */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-500 to-primary-700 py-8 sm:py-10 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-4">
            Finn den rette hjelperen for deg
          </h1>
          <SearchBar variant="small" initialQuery={searchParams.get('q') || ''} />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8 overflow-hidden">
      <div className="flex gap-8">
        {/* Sidebar filters - desktop */}
        <aside className="hidden w-72 flex-shrink-0 lg:block">
          <HelperFilters />
        </aside>

        {/* Mobile filter overlay */}
        {showFilters && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setShowFilters(false)}
            />
            <div className="absolute left-0 top-0 h-full w-[85vw] max-w-80 overflow-y-auto bg-gray-50 p-4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Filtrer</h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="rounded-lg p-2 text-gray-500 hover:bg-gray-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <HelperFilters />
            </div>
          </div>
        )}

        {/* Results area */}
        <div className="flex-1 min-w-0">
          <div className="mb-4 sm:mb-6 flex items-center justify-between gap-3">
            <p className="text-sm sm:text-base font-medium text-gray-500">
              {loading && helpers.length === 0
                ? 'Søker...'
                : `${helpers.length} ${helpers.length === 1 ? 'hjelper funnet' : 'hjelpere funnet'}`}
            </p>
            <button
              onClick={() => setShowFilters(true)}
              className="inline-flex flex-shrink-0 items-center gap-2 rounded-lg border border-gray-300 px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 lg:hidden"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filtrer
            </button>
          </div>

          {loading && helpers.length === 0 ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
            </div>
          ) : helpers.length > 0 ? (
            <div className="space-y-3">
              {helpers.map((helper, index) => (
                <div key={helper.id}>
                  <HelperCard helper={helper} />
                  {(index + 1) % 10 === 0 && <div className="py-3"><MinioAd /></div>}
                </div>
              ))}
              {helpers.length > 0 && helpers.length % 10 !== 0 && (
                <div className="py-3"><MinioAd /></div>
              )}

              {/* Show more button */}
              {hasMore && (
                <div className="pt-4 text-center">
                  <Button
                    variant="outline"
                    size="md"
                    onClick={loadMore}
                    disabled={loading}
                  >
                    {loading ? 'Laster...' : 'Vis flere'}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-xl bg-white p-12 text-center">
              <p className="text-lg text-gray-500">
                {'Ingen hjelpere funnet. Prøv å endre søkekriteriene.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Recruit helpers banner */}
    <div className="mx-auto max-w-7xl px-4 pb-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 px-6 py-10 sm:px-12 sm:py-14">
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/5" />
        <div className="absolute -bottom-8 -left-8 h-36 w-36 rounded-full bg-white/5" />
        <div className="relative mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-wider text-accent-300">
            Vi bygger noe sammen
          </p>
          <h2 className="mt-3 text-2xl font-bold text-white sm:text-3xl">
            Har du noe å tilby?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-white/70">
            Jo flere hjelpere som melder seg, jo bedre blir plattformen for alle — flere kunder, flere oppdrag, mer synlighet.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              to="/bli-hjelper"
              className="inline-flex items-center gap-2 rounded-lg bg-accent-500 px-6 py-3 text-base font-bold text-white shadow-lg transition-all hover:bg-accent-600 hover:shadow-xl"
            >
              Bli en del av nettverket
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              to="/voks-sammen"
              className="text-sm font-medium text-white/60 underline decoration-white/30 underline-offset-4 transition-colors hover:text-white/90"
            >
              Les om hvorfor det betyr noe
            </Link>
          </div>
        </div>
      </div>
    </div>

    {/* Share */}
    <div className="mx-auto max-w-7xl px-4 pb-8">
      <div className="rounded-xl bg-white p-6 text-center shadow-sm">
        <p className="mb-4 text-sm font-medium text-gray-500">
          Kjenner du noen som trenger hjelp — eller noen som kan hjelpe? Del siden.
        </p>
        <div className="flex justify-center">
          <ShareButtons
            title="Din Helt — Finn pålitelig hjelp til hverdagen"
            text="Finn hjelp til hverdagen, eller meld deg som hjelper:"
          />
        </div>
      </div>
    </div>
    </>
  );
}
