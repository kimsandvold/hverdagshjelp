import { useState, useEffect, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Circle, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import useHelperStore from '../stores/useHelperStore';
import useLocationStore from '../stores/useLocationStore';
import categoryIcons from '../data/categoryIcons';
import { supabase } from '../lib/supabase';
import { getBrowserLocation, searchPlace } from '../lib/geo';

// Fix Leaflet default marker icon (broken by Vite bundling)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const NORWAY_CENTER = { lat: 64.5, lng: 12.0 };

function MapClickHandler({ onMapClick }) {
  useMapEvents({ click(e) { onMapClick(e.latlng); } });
  return null;
}

function InvalidateSize() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 200);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

function RecenterMap({ lat, lng, radiusKm }) {
  const map = useMap();
  useEffect(() => {
    if (lat == null || lng == null) return;
    const latOffset = radiusKm / 111;
    const lngOffset = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));
    const bounds = L.latLngBounds(
      [lat - latOffset, lng - lngOffset],
      [lat + latOffset, lng + lngOffset]
    );
    map.fitBounds(bounds, { padding: [15, 15], animate: true });
  }, [lat, lng, radiusKm, map]);
  return null;
}

function FitToCircle({ lat, lng, radiusKm }) {
  const map = useMap();
  useEffect(() => {
    if (lat == null || lng == null) return;
    const latOffset = radiusKm / 111;
    const lngOffset = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));
    const bounds = L.latLngBounds(
      [lat - latOffset, lng - lngOffset],
      [lat + latOffset, lng + lngOffset]
    );
    map.fitBounds(bounds, { padding: [20, 20], animate: false });
  }, [lat, lng, radiusKm, map]);
  return null;
}

const availabilityOptions = [
  { key: 'dag', label: 'Dag' },
  { key: 'kveld', label: 'Kveld' },
  { key: 'natt', label: 'Natt' },
  { key: 'hverdager', label: 'Hverdager' },
  { key: 'helg', label: 'Helg' },
];

export default function HelperFilters() {
  const filters = useHelperStore((state) => state.filters);
  const toggleCategory = useHelperStore((state) => state.toggleCategory);
  const toggleAvailability = useHelperStore((state) => state.toggleAvailability);
  const toggleTag = useHelperStore((state) => state.toggleTag);
  const availableTags = useHelperStore((state) => state.availableTags);
  const setFilter = useHelperStore((state) => state.setFilter);
  const setGeoFilter = useHelperStore((state) => state.setGeoFilter);
  const clearGeoFilter = useHelperStore((state) => state.clearGeoFilter);
  const resetFilters = useHelperStore((state) => state.resetFilters);
  const fetchHelpers = useHelperStore((state) => state.fetchHelpers);
  const helpers = useHelperStore((state) => state.helpers);
  const locationStore = useLocationStore();
  const [categories, setCategories] = useState([]);

  // Map state
  const [mapCenter, setMapCenter] = useState(null);
  const [radiusKm, setRadiusKm] = useState(locationStore.radiusKm || 10);
  const [mapLoading, setMapLoading] = useState(true);

  // Place search state
  const [placeQuery, setPlaceQuery] = useState('');
  const [placeResults, setPlaceResults] = useState([]);
  const [placeSearching, setPlaceSearching] = useState(false);

  useEffect(() => {
    supabase
      .from('categories')
      .select('*')
      .order('sort_order')
      .then(({ data }) => setCategories(data || []));
  }, []);

  // Derive category counts from current search results
  const categoryCounts = {};
  for (const h of helpers) {
    const seen = new Set();
    for (const s of h.services || []) {
      if (!seen.has(s.category)) {
        seen.add(s.category);
        categoryCounts[s.category] = (categoryCounts[s.category] || 0) + 1;
      }
    }
  }

  // Initialize map position
  useEffect(() => {
    if (locationStore.isSet) {
      setMapCenter({ lat: locationStore.lat, lng: locationStore.lng });
      setRadiusKm(locationStore.radiusKm);
      setMapLoading(false);
    } else {
      getBrowserLocation().then((loc) => {
        setMapCenter(loc || NORWAY_CENTER);
        setMapLoading(false);
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleMapClick = useCallback((latlng) => {
    setMapCenter({ lat: latlng.lat, lng: latlng.lng });
  }, []);

  // Apply location filter when map center or radius changes
  const applyLocation = () => {
    if (mapCenter) {
      setGeoFilter(mapCenter.lat, mapCenter.lng, radiusKm);
      locationStore.setLocation({
        lat: mapCenter.lat,
        lng: mapCenter.lng,
        radiusKm,
        locationLabel: `${radiusKm} km radius`,
      });
      fetchHelpers();
    }
  };

  const clearLocation = () => {
    clearGeoFilter();
    locationStore.clearLocation();
    fetchHelpers();
  };

  const handleUseMyLocation = async () => {
    setMapLoading(true);
    const loc = await getBrowserLocation();
    setMapLoading(false);
    if (loc) {
      skipAutoSearch.current = true;
      setMapCenter(loc);
      setRadiusKm(4);
      setPlaceQuery('');
      setPlaceResults([]);
      setGeoFilter(loc.lat, loc.lng, 4);
      locationStore.setLocation({
        lat: loc.lat,
        lng: loc.lng,
        radiusKm: 4,
        locationLabel: 'Min posisjon',
      });
      fetchHelpers();
    }
  };

  // Debounced autocomplete as user types
  const placeSearchTimer = useRef(null);
  const skipAutoSearch = useRef(false);

  const doPlaceSearch = async (query) => {
    setPlaceSearching(true);
    const results = await searchPlace(query);
    setPlaceResults(results);
    setPlaceSearching(false);
  };

  useEffect(() => {
    if (skipAutoSearch.current) {
      skipAutoSearch.current = false;
      return;
    }
    if (placeSearchTimer.current) clearTimeout(placeSearchTimer.current);
    if (placeQuery.trim().length < 2) {
      setPlaceResults([]);
      return;
    }
    placeSearchTimer.current = setTimeout(() => {
      doPlaceSearch(placeQuery.trim());
    }, 400);
    return () => clearTimeout(placeSearchTimer.current);
  }, [placeQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePlaceSearch = (e) => {
    e.preventDefault();
    if (placeSearchTimer.current) clearTimeout(placeSearchTimer.current);
    if (placeQuery.trim().length >= 2) {
      doPlaceSearch(placeQuery.trim());
    }
  };

  const handlePickPlace = (place) => {
    skipAutoSearch.current = true;
    setMapCenter({ lat: place.lat, lng: place.lng });
    setRadiusKm(4);
    setPlaceQuery(place.label);
    setPlaceResults([]);
    // Auto-apply location filter
    setGeoFilter(place.lat, place.lng, 4);
    locationStore.setLocation({
      lat: place.lat,
      lng: place.lng,
      radiusKm: 4,
      locationLabel: place.label,
    });
    fetchHelpers();
  };

  const handleToggle = (slug) => {
    toggleCategory(slug);
    setTimeout(() => fetchHelpers(), 50);
  };

  const handleTagToggle = (tag) => {
    toggleTag(tag);
    setTimeout(() => fetchHelpers(), 50);
  };

  const handleAvailabilityToggle = (key) => {
    toggleAvailability(key);
    setTimeout(() => fetchHelpers(), 50);
  };

  const handleVerifiedToggle = () => {
    setFilter('verifiedOnly', !filters.verifiedOnly);
    setTimeout(() => fetchHelpers(), 50);
  };

  const handleReset = () => {
    resetFilters();
    locationStore.clearLocation();
    clearGeoFilter();
    setTimeout(() => fetchHelpers(), 50);
  };

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.availability.length > 0 ||
    filters.tags.length > 0 ||
    filters.verifiedOnly ||
    locationStore.isSet;

  return (
    <div className="space-y-6 rounded-xl bg-white p-5">
      {/* Inline map — area selector */}
      <div>
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Område
        </h3>

        {mapLoading ? (
          <div className="flex h-44 items-center justify-center rounded-lg bg-gray-100">
            <p className="text-xs text-gray-500">Henter posisjon...</p>
          </div>
        ) : mapCenter ? (
          <div className="h-44 w-full overflow-hidden rounded-lg">
            <MapContainer
              center={[mapCenter.lat, mapCenter.lng]}
              zoom={locationStore.isSet ? 11 : 5}
              className="h-full w-full"
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Circle
                key={`${mapCenter.lat}-${mapCenter.lng}-${radiusKm}`}
                center={[mapCenter.lat, mapCenter.lng]}
                radius={radiusKm * 1000}
                pathOptions={{
                  color: '#6366f1',
                  fillColor: '#6366f1',
                  fillOpacity: 0.15,
                  weight: 2,
                }}
              />
              <Marker
                position={[mapCenter.lat, mapCenter.lng]}
                draggable
                eventHandlers={{
                  dragend: (e) => {
                    const { lat, lng } = e.target.getLatLng();
                    setMapCenter({ lat, lng });
                  },
                }}
              />
              <InvalidateSize />
              <RecenterMap lat={mapCenter.lat} lng={mapCenter.lng} radiusKm={radiusKm} />
              <MapClickHandler onMapClick={handleMapClick} />
            </MapContainer>
          </div>
        ) : null}

        {/* Place search — below map so dropdown is visible */}
        <form onSubmit={handlePlaceSearch} className="relative mt-2">
          <input
            type="text"
            value={placeQuery}
            onChange={(e) => setPlaceQuery(e.target.value)}
            placeholder="Søk etter sted..."
            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-3 pr-9 text-sm outline-none transition-colors focus:border-primary-500 focus:ring-1 focus:ring-primary-200"
          />
          {placeSearching ? (
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
            </div>
          ) : (
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 hover:text-primary-500 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          )}
          {placeResults.length > 0 && (
            <ul className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
              {placeResults.map((place, i) => (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => handlePickPlace(place)}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-primary-50 cursor-pointer first:rounded-t-lg last:rounded-b-lg"
                  >
                    {place.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </form>

        {/* Radius slider */}
        <div className="mt-2">
          <label className="block text-xs font-medium text-gray-600">
            Radius: {radiusKm} km
          </label>
          <input
            type="range"
            min={1}
            max={200}
            value={radiusKm}
            onChange={(e) => setRadiusKm(Number(e.target.value))}
            onMouseUp={() => { if (locationStore.isSet && mapCenter) applyLocation(); }}
            onTouchEnd={() => { if (locationStore.isSet && mapCenter) applyLocation(); }}
            className="mt-1 w-full accent-primary-500"
          />
        </div>

        {/* Location action buttons */}
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={handleUseMyLocation}
            disabled={mapLoading}
            className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Min posisjon
          </button>
          {locationStore.isSet && (
            <button
              type="button"
              onClick={clearLocation}
              className="inline-flex flex-1 items-center justify-center rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 cursor-pointer"
            >
              Fjern område
            </button>
          )}
        </div>
      </div>

      {/* Categories */}
      <div>
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Kategorier
        </h3>
        <div className="space-y-0.5">
          {categories.map((cat) => {
            const isActive = filters.categories.includes(cat.slug);
            const count = categoryCounts[cat.slug] || 0;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleToggle(cat.slug)}
                className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div
                  className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border transition-colors ${
                    isActive
                      ? 'border-primary-500 bg-primary-500 text-white'
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  {isActive && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                {categoryIcons[cat.slug] && (
                  <div className="h-4 w-4 flex-shrink-0 text-gray-500">
                    {categoryIcons[cat.slug]}
                  </div>
                )}
                <span className="flex-1">{cat.name}</span>
                {count > 0 && (
                  <span className="text-xs text-gray-400">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tags — shown when categories are selected */}
      {filters.categories.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Tagger
          </h3>
          {availableTags.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {availableTags.map((tag) => {
                const isActive = filters.tags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagToggle(tag)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-gray-400">Ingen tagger for valgt kategori</p>
          )}
        </div>
      )}

      {/* Availability */}
      <div>
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Tilgjengelighet
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {availabilityOptions.map((opt) => {
            const isActive = filters.availability.includes(opt.key);
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => handleAvailabilityToggle(opt.key)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Verified only */}
      <div>
        <button
          type="button"
          onClick={handleVerifiedToggle}
          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors cursor-pointer hover:bg-gray-50"
        >
          <div
            className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border transition-colors ${
              filters.verifiedOnly
                ? 'border-green-500 bg-green-500 text-white'
                : 'border-gray-300 bg-white'
            }`}
          >
            {filters.verifiedOnly && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <span className="text-gray-700">Kun verifiserte hjelpere</span>
        </button>
      </div>

      {/* Reset button */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={handleReset}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 active:bg-gray-100 cursor-pointer"
        >
          Nullstill filtre
        </button>
      )}
    </div>
  );
}
