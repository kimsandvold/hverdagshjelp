import { useEffect } from 'react';
import useAdminStore from '../../stores/useAdminStore';
import AdminTable from '../../components/admin/AdminTable';
import Badge from '../../components/ui/Badge';

const tierLabels = {
  free: 'Gratis',
  basic: 'Basis',
  premium: 'Premium',
};

export default function AdminHelpers() {
  const helpers = useAdminStore((state) => state.helpers);
  const loading = useAdminStore((state) => state.loading);
  const fetchHelpers = useAdminStore((state) => state.fetchHelpers);
  const toggleActive = useAdminStore((state) => state.toggleActive);
  const toggleVerified = useAdminStore((state) => state.toggleVerified);

  useEffect(() => {
    fetchHelpers();
  }, [fetchHelpers]);

  const columns = [
    { key: 'name', label: 'Navn' },
    { key: 'email', label: 'E-post' },
    {
      key: 'services',
      label: 'Tjenester',
      render: (services) =>
        (services || []).map((s) => s.categoryName || s.category).join(', '),
    },
    { key: 'location', label: 'Sted' },
    {
      key: 'tier',
      label: 'Abonnement',
      render: (value) => tierLabels[value] || value,
    },
    {
      key: 'paymentStatus',
      label: 'Betalt',
      render: (value) => {
        if (!value) return <span className="text-gray-400">—</span>;
        const labels = { active: 'Aktiv', pending: 'Venter', stopped: 'Stoppet', expired: 'Utløpt' };
        const colors = { active: 'text-green-600', pending: 'text-yellow-600', stopped: 'text-red-600', expired: 'text-gray-500' };
        return <span className={`font-medium ${colors[value] || 'text-gray-500'}`}>{labels[value] || value}</span>;
      },
    },
    {
      key: 'lastPayment',
      label: 'Siste betaling',
      render: (value) =>
        value ? new Date(value).toLocaleDateString('nb-NO') : <span className="text-gray-400">—</span>,
    },
    {
      key: 'active',
      label: 'Status',
      render: (value) => (
        <Badge type={value ? 'verified' : 'inactive'} />
      ),
    },
    {
      key: 'verified',
      label: 'Verifisert',
      render: (value) => (value ? <Badge type="verified" /> : null),
    },
  ];

  const actions = [
    {
      label: 'Aktiv/Inaktiv',
      onClick: (row) => toggleActive(row.id),
      variant: 'secondary',
    },
    {
      label: 'Verifiser/Fjern',
      onClick: (row) => toggleVerified(row.id),
      variant: 'outline',
    },
  ];

  if (loading && helpers.length === 0) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">
        Administrer hjelpere
      </h1>
      <AdminTable columns={columns} data={helpers} actions={actions} />
    </div>
  );
}
