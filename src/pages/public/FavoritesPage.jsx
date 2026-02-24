import { useState, useEffect } from 'react';
import useFavoritesStore from '../../stores/useFavoritesStore';
import HelperCard from '../../components/HelperCard';
import SEO from '../../components/SEO';

export default function FavoritesPage() {
  const getFavoriteHelpers = useFavoritesStore((state) => state.getFavoriteHelpers);
  const [helpers, setHelpers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFavoriteHelpers().then((data) => {
      setHelpers(data);
      setLoading(false);
    });
  }, [getFavoriteHelpers]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="py-8">
      <SEO title="Lagrede hjelpere" description="Dine lagrede hjelpere." noindex />
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Lagrede hjelpere</h1>

      {helpers.length > 0 ? (
        <div className="space-y-3">
          {helpers.map((helper) => (
            <HelperCard key={helper.id} helper={helper} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl bg-white p-12 text-center">
          <p className="text-lg text-gray-500">
            Du har ingen lagrede hjelpere ennå. Trykk på bokmerke-ikonet ved en hjelper for å lagre dem her.
          </p>
        </div>
      )}
    </div>
  );
}
