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
  suggested_tags: [],
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
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setTagInput('');
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
      suggested_tags: row.suggested_tags || [],
    });
    setTagInput('');
    setModalOpen(true);
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Slett kategori "${row.name}"?`)) return;
    await deleteCategory(row.id);
  };

  const handleAddTag = () => {
    const raw = tagInput.replace(/^#/, '').trim().toLowerCase();
    if (!raw) return;
    if (form.suggested_tags.includes(raw)) {
      setTagInput('');
      return;
    }
    setForm({ ...form, suggested_tags: [...form.suggested_tags, raw] });
    setTagInput('');
  };

  const handleRemoveTag = (tag) => {
    setForm({ ...form, suggested_tags: form.suggested_tags.filter((t) => t !== tag) });
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag();
    }
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
    {
      key: 'suggested_tags',
      label: 'Foreslåtte stikkord',
      render: (val) => {
        const tags = val || [];
        if (tags.length === 0) return <span className="text-gray-400">—</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 4).map((t) => (
              <span key={t} className="rounded-full bg-primary-50 px-2 py-0.5 text-xs text-primary-700">
                {t}
              </span>
            ))}
            {tags.length > 4 && (
              <span className="text-xs text-gray-400">+{tags.length - 4}</span>
            )}
          </div>
        );
      },
    },
    { key: 'sort_order', label: '#' },
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

          {/* Suggested tags */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Foreslåtte stikkord
            </label>
            <p className="mb-2 text-xs text-gray-500">
              Disse vises som klikkbare forslag når hjelpere velger stikkord for denne kategorien.
            </p>
            {form.suggested_tags.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-1.5">
                {form.suggested_tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-700"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-0.5 text-primary-400 hover:text-primary-700 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Skriv et stikkord..."
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
              <Button type="button" variant="secondary" onClick={handleAddTag}>
                Legg til
              </Button>
            </div>
            <p className="mt-1 text-xs text-gray-400">Trykk Enter eller komma for å legge til</p>
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
