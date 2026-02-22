import { useEffect, useState } from 'react';
import useAdminStore from '../../stores/useAdminStore';
import AdminTable from '../../components/admin/AdminTable';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';

const emptyForm = {
  name: '',
  slug: '',
  icon: '',
  description: '',
  color: '',
  sort_order: 0,
};

export default function AdminCategories() {
  const categories = useAdminStore((s) => s.categories);
  const loading = useAdminStore((s) => s.loading);
  const fetchCategories = useAdminStore((s) => s.fetchCategories);
  const addCategory = useAdminStore((s) => s.addCategory);
  const updateCategory = useAdminStore((s) => s.updateCategory);
  const deleteCategory = useAdminStore((s) => s.deleteCategory);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      name: row.name || '',
      slug: row.slug || '',
      icon: row.icon || '',
      description: row.description || '',
      color: row.color || '',
      sort_order: row.sort_order ?? 0,
    });
    setModalOpen(true);
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Slett kategori "${row.name}"?`)) return;
    await deleteCategory(row.id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    if (editing) {
      await updateCategory(editing.id, form);
    } else {
      await addCategory(form);
    }
    setSaving(false);
    setModalOpen(false);
  };

  const columns = [
    { key: 'name', label: 'Navn' },
    { key: 'slug', label: 'Slug' },
    { key: 'description', label: 'Beskrivelse' },
    { key: 'sort_order', label: 'Rekkefølge' },
  ];

  const actions = [
    { label: 'Rediger', onClick: openEdit, variant: 'secondary' },
    { label: 'Slett', onClick: handleDelete, variant: 'danger' },
  ];

  if (loading && categories.length === 0) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Kategorier</h1>
        <Button onClick={openCreate}>Legg til kategori</Button>
      </div>

      <AdminTable columns={columns} data={categories} actions={actions} />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Rediger kategori' : 'Ny kategori'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Navn</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Slug</label>
            <input
              type="text"
              required
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Ikon (emoji)</label>
            <input
              type="text"
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Beskrivelse</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Farge</label>
            <input
              type="text"
              value={form.color}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder="#3B82F6"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Rekkefølge</label>
            <input
              type="number"
              value={form.sort_order}
              onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>
              Avbryt
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Lagrer...' : editing ? 'Oppdater' : 'Opprett'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
