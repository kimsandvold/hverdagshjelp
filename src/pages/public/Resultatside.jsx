import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useHelperStore from '../../stores/useHelperStore';
import useLocationStore from '../../stores/useLocationStore';
import HelperCard from '../../components/HelperCard';
import HelperFilters from '../../components/HelperFilters';
import SearchBar from '../../components/ui/SearchBar';
import Button from '../../components/ui/Button';
import SEO from '../../components/SEO';
import MinioAd from '../../components/MinioAd';

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
    <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8 overflow-hidden">
      <SEO
        title="Finn din hjelper"
        description="Finn hjelpere nær deg for hverdagslige oppgaver."
        url="https://hverdagshjelp.no/search"
      />
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
        <div className="flex-1">
          <div className="mb-4">
            <SearchBar variant="small" initialQuery={searchParams.get('q') || ''} />
          </div>

          <div className="mb-4 sm:mb-6 flex items-center justify-between gap-3">
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
              {loading && helpers.length === 0
                ? 'Søker...'
                : `${helpers.length} ${helpers.length === 1 ? 'hjelper funnet' : 'hjelpere funnet'}`}
            </h1>
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
  );
}
