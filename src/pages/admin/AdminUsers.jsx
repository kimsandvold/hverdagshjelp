import { useEffect } from 'react';
import useAdminStore from '../../stores/useAdminStore';
import AdminTable from '../../components/admin/AdminTable';
import Badge from '../../components/ui/Badge';

const roleOrder = ['user', 'helper', 'admin'];

function nextRole(current) {
  const idx = roleOrder.indexOf(current);
  return roleOrder[(idx + 1) % roleOrder.length];
}

export default function AdminUsers() {
  const users = useAdminStore((s) => s.users);
  const loading = useAdminStore((s) => s.loading);
  const fetchUsers = useAdminStore((s) => s.fetchUsers);
  const updateUserRole = useAdminStore((s) => s.updateUserRole);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const columns = [
    { key: 'name', label: 'Navn' },
    { key: 'email', label: 'E-post' },
    {
      key: 'role',
      label: 'Rolle',
      render: (value) => <Badge type={value || 'user'} />,
    },
    { key: 'phone', label: 'Telefon' },
    {
      key: 'created_at',
      label: 'Opprettet',
      render: (value) =>
        value ? new Date(value).toLocaleDateString('nb-NO') : '',
    },
  ];

  const actions = [
    {
      label: 'Endre rolle',
      onClick: (row) => updateUserRole(row.id, nextRole(row.role || 'user')),
      variant: 'secondary',
    },
  ];

  if (loading && users.length === 0) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">Brukere</h1>
      <AdminTable columns={columns} data={users} actions={actions} />
    </div>
  );
}
