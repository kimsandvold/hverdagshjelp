import { Link } from 'react-router-dom';
import Badge from './ui/Badge';
import useFavoritesStore from '../stores/useFavoritesStore';
import useAuthStore from '../stores/useAuthStore';

function calculateAge(birthDate) {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

const AVATAR_COLORS = {
  blue:   { bg: '#bfdbfe', text: '#1d4ed8', border: '#60a5fa' },
  green:  { bg: '#bbf7d0', text: '#15803d', border: '#4ade80' },
  purple: { bg: '#e9d5ff', text: '#7e22ce', border: '#c084fc' },
  rose:   { bg: '#fecdd3', text: '#be123c', border: '#fb7185' },
  amber:  { bg: '#fde68a', text: '#b45309', border: '#fbbf24' },
  teal:   { bg: '#99f6e4', text: '#0f766e', border: '#2dd4bf' },
  indigo: { bg: '#c7d2fe', text: '#4338ca', border: '#818cf8' },
  orange: { bg: '#fed7aa', text: '#c2410c', border: '#fb923c' },
};

export { AVATAR_COLORS };

export default function HelperCard({ helper }) {
  const firstLetter = helper.name?.charAt(0)?.toUpperCase() ?? '?';
  const colorKey = helper.avatar_color;
  const avatarStyle = AVATAR_COLORS[colorKey] || null;
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isFavorite = useFavoritesStore((state) => state.isFavorite(helper.id));
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  const handleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return;
    toggleFavorite(helper.id);
  };

  const services = helper.services || [];
  const visibleServices = services.slice(0, 4);
  const extraCount = services.length - 4;

  return (
    <Link
      to={`/helper/${helper.id}`}
      className={`block rounded-xl p-4 sm:p-5 shadow-sm transition-shadow hover:shadow-md overflow-hidden ${
        helper.ambassador || helper.tier === 'premium'
          ? 'border-l-3 border-l-accent-400 bg-accent-50/30'
          : 'bg-white'
      }`}
    >
      {/* Top row: avatar + name/location + badges/bookmark */}
      <div className="flex items-start gap-3 sm:gap-4">
        {/* Avatar */}
        {helper.avatar_url ? (
          <img
            src={helper.avatar_url}
            alt={helper.name}
            className="h-11 w-11 sm:h-14 sm:w-14 flex-shrink-0 rounded-full object-cover"
            style={avatarStyle ? { border: `2.5px solid ${avatarStyle.border}` } : undefined}
          />
        ) : (
          <div
            className="flex h-11 w-11 sm:h-14 sm:w-14 flex-shrink-0 items-center justify-center rounded-full text-base sm:text-lg font-bold bg-primary-200 text-primary-700"
            style={avatarStyle ? { backgroundColor: avatarStyle.bg, color: avatarStyle.text } : undefined}
          >
            {firstLetter}
          </div>
        )}

        {/* Name, location */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-gray-900 truncate">
                {helper.name}
              </h3>
              {/* Location | Age | Languages */}
              <p className="mt-0.5 flex flex-wrap items-center gap-y-0.5 text-xs text-gray-400">
                {(helper.location || helper.location_label) && (
                  <span className="text-sm text-gray-500">{helper.location || helper.location_label}</span>
                )}
                {helper.birth_date && (
                  <>
                    {(helper.location || helper.location_label) && <span className="mx-1.5 text-gray-300">|</span>}
                    <span>{calculateAge(helper.birth_date)} år</span>
                  </>
                )}
                {helper.languages?.length > 0 && (
                  <>
                    {(helper.location || helper.location_label || helper.birth_date) && <span className="mx-1.5 text-gray-300">|</span>}
                    <span>{helper.languages.map((l) => l.language).join(', ')}</span>
                  </>
                )}
              </p>
            </div>

            {/* Badges + Bookmark */}
            <div className="flex flex-shrink-0 items-center gap-1 sm:gap-2">
              {(helper.ambassador || helper.tier === 'premium') && <Badge type="premium" />}
              {!helper.ambassador && helper.tier === 'basic' && <Badge type="basic" />}
              {helper.verified && <span className="hidden sm:inline"><Badge type="verified" /></span>}
              {isAuthenticated && (
                <button
                  type="button"
                  onClick={handleFavorite}
                  className="rounded-full p-1 transition-colors hover:bg-gray-100 cursor-pointer"
                  title={isFavorite ? 'Fjern fra lagrede' : 'Lagre hjelper'}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 ${isFavorite ? 'fill-primary-500 text-primary-500' : 'text-gray-400'}`}
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
          </div>

        </div>
      </div>

      {/* Description */}
      {helper.description && (
        <p className="mt-3 line-clamp-2 text-sm text-gray-500">
          {helper.description}
        </p>
      )}

      {/* Service category chips */}
      {services.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {visibleServices.map((s) => (
              <span
                key={s.category}
                className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary-700"
              >
                {s.categoryName || s.category}
              </span>
          ))}
          {extraCount > 0 && (
            <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1.5 text-xs text-gray-500">
              +{extraCount} til
            </span>
          )}
        </div>
      )}

      {/* CTA */}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-gray-400">Se profil for detaljer</span>
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600">
          Send forespørsel
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </Link>
  );
}
