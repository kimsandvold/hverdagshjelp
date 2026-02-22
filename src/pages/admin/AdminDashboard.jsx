import { useEffect } from 'react';
import useAdminStore from '../../stores/useAdminStore';
import StatsCard from '../../components/admin/StatsCard';

const tierLabels = {
  free: 'Gratis',
  basic: 'Basis',
  premium: 'Premium',
};

export default function AdminDashboard() {
  const stats = useAdminStore((state) => state.stats);
  const fetchStats = useAdminStore((state) => state.fetchStats);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (!stats) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">
        Adminoversikt
      </h1>

      {/* Main stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Totalt hjelpere"
          value={stats.total}
          subtitle="Alle registrerte hjelpere"
          color="primary"
        />
        <StatsCard
          title="Aktive"
          value={stats.active}
          subtitle={`${stats.total - stats.active} inaktive`}
          color="green"
        />
        <StatsCard
          title="Verifiserte"
          value={stats.verified}
          subtitle={`${stats.total - stats.verified} ikke verifisert`}
          color="blue"
        />
      </div>

      {/* Category breakdown */}
      <h2 className="mb-4 mt-10 text-lg font-semibold text-gray-900">
        Per kategori
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(stats.byCategory || []).map((cat) => (
          <StatsCard
            key={cat.id || cat.slug}
            title={cat.name}
            value={cat.count}
            subtitle={cat.description}
            color="primary"
          />
        ))}
      </div>

      {/* Tier breakdown */}
      <h2 className="mb-4 mt-10 text-lg font-semibold text-gray-900">
        Per abonnement
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(stats.byTier || []).map((t) => (
          <StatsCard
            key={t.tier}
            title={tierLabels[t.tier] || t.tier}
            value={t.count}
            subtitle={`${t.tier}-abonnenter`}
            color={t.tier === 'premium' ? 'accent' : t.tier === 'basic' ? 'blue' : 'primary'}
          />
        ))}
      </div>
    </div>
  );
}
