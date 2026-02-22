import { useEffect, useState } from 'react';
import useAdminStore from '../../stores/useAdminStore';
import AdminTable from '../../components/admin/AdminTable';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { AVATAR_COLORS } from '../../components/HelperCard';

const tierLabels = {
  free: 'Gratis',
  basic: 'Basis',
  premium: 'Premium',
};

const tierOptions = [
  { value: 'free', label: 'Gratis' },
  { value: 'basic', label: 'Basis' },
  { value: 'premium', label: 'Premium' },
];

export default function AdminHelpers() {
  const helpers = useAdminStore((state) => state.helpers);
  const loading = useAdminStore((state) => state.loading);
  const fetchHelpers = useAdminStore((state) => state.fetchHelpers);
  const toggleActive = useAdminStore((state) => state.toggleActive);
  const toggleVerified = useAdminStore((state) => state.toggleVerified);
  const updateHelper = useAdminStore((state) => state.updateHelper);

  const [editModal, setEditModal] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHelpers();
  }, [fetchHelpers]);

  const openEdit = (row) => {
    setEditForm({
      id: row.id,
      name: row.name || '',
      email: row.email || '',
      phone: row.phone || '',
      description: row.description || '',
      location: row.location || '',
      birthDate: row.birthDate || '',
      tier: row.tier || 'free',
      avatarColor: row.avatarColor || '',
      verified: row.verified ?? false,
      active: row.active ?? true,
    });
    setError(null);
    setEditModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const { id, email, ...updates } = editForm;
    const result = await updateHelper(id, updates);
    if (result?.error) {
      setError('Kunne ikke lagre: ' + result.error.message);
    } else {
      setEditModal(false);
    }
    setSaving(false);
  };

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
      label: 'Rediger',
      onClick: openEdit,
      variant: 'secondary',
    },
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

  const inputClass = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500';

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">
        Administrer hjelpere
      </h1>
      <AdminTable columns={columns} data={helpers} actions={actions} />

      <Modal
        isOpen={editModal}
        onClose={() => setEditModal(false)}
        title="Rediger hjelper"
        closeOnBackdrop={false}
        maxWidth="max-w-2xl"
      >
        {editForm && (
          <form onSubmit={handleSave} className="space-y-4" noValidate>
            {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Navn</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">E-post</label>
              <input
                type="email"
                value={editForm.email}
                disabled
                className={`${inputClass} bg-gray-50 text-gray-500`}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Telefon</label>
              <input
                type="tel"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Beskrivelse</label>
              <textarea
                rows={3}
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Sted</label>
              <input
                type="text"
                value={editForm.location}
                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Fødselsdato</label>
              <input
                type="date"
                value={editForm.birthDate}
                onChange={(e) => setEditForm({ ...editForm, birthDate: e.target.value })}
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Abonnement</label>
              <select
                value={editForm.tier}
                onChange={(e) => setEditForm({ ...editForm, tier: e.target.value })}
                className={inputClass}
              >
                {tierOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Avatarfarge</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(AVATAR_COLORS).map(([key, colors]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setEditForm({ ...editForm, avatarColor: editForm.avatarColor === key ? '' : key })}
                    className={`h-8 w-8 rounded-full border-2 transition-transform ${editForm.avatarColor === key ? 'scale-110 border-gray-800' : 'border-transparent hover:scale-105'}`}
                    style={{ backgroundColor: colors.bg, borderColor: editForm.avatarColor === key ? colors.border : undefined }}
                    title={key}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editForm.verified}
                  onChange={(e) => setEditForm({ ...editForm, verified: e.target.checked })}
                  className="h-4 w-4 accent-primary-500"
                />
                <span className="text-sm text-gray-700">Verifisert</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editForm.active}
                  onChange={(e) => setEditForm({ ...editForm, active: e.target.checked })}
                  className="h-4 w-4 accent-primary-500"
                />
                <span className="text-sm text-gray-700">Aktiv</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" type="button" onClick={() => setEditModal(false)}>
                Avbryt
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Lagrer...' : 'Lagre endringer'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
