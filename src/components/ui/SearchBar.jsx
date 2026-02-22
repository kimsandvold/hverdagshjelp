import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useLocationStore from '../../stores/useLocationStore';

export default function SearchBar({
  variant = 'large',
  initialQuery = '',
}) {
  const [query, setQuery] = useState(initialQuery);
  const navigate = useNavigate();
  const locationStore = useLocationStore();

  const handleSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (locationStore.isSet) {
      params.set('lat', locationStore.lat);
      params.set('lng', locationStore.lng);
      params.set('radius', locationStore.radiusKm);
    }
    navigate(`/search?${params.toString()}`);
  };

  const isLarge = variant === 'large';

  return (
    <form
      onSubmit={handleSubmit}
      className={`w-full rounded-2xl bg-white shadow-sm ${
        isLarge ? 'p-4 sm:p-5 shadow-lg' : 'p-3 sm:p-4'
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Search input with inline icon */}
        <div className="relative flex-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`absolute top-1/2 -translate-y-1/2 ${
              isLarge ? 'left-3.5 h-5 w-5 text-gray-400' : 'left-1 h-6 w-6 text-gray-500'
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Hva trenger du hjelp med?"
            className={`w-full outline-none ${
              isLarge
                ? 'rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 py-4 text-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors'
                : 'bg-transparent pl-9 pr-4 py-2 text-xl font-medium text-gray-900 placeholder:text-gray-400'
            }`}
          />
        </div>

        {/* Search button */}
        <button
          type="submit"
          className={`flex-shrink-0 rounded-xl bg-primary-500 font-semibold text-white transition-colors hover:bg-primary-600 active:bg-primary-700 cursor-pointer ${
            isLarge ? 'px-8 py-4 text-lg' : 'px-6 py-3 text-base'
          }`}
        >
          Søk
        </button>
      </div>
    </form>
  );
}
