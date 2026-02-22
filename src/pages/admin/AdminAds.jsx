import { useEffect, useState } from 'react';
import useAdminStore from '../../stores/useAdminStore';
import AdminTable from '../../components/admin/AdminTable';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';

const emptyForm = {
  title: '',
  description: '',
  href: '',
  image_url: '',
  cta: 'Les mer',
  bg_color: '#1a1a2e',
  text_color: '#ffffff',
  accent_color: '#3b82f6',
  active: true,
};

export default function AdminAds() {
  const ads = useAdminStore((s) => s.ads);
  const loading = useAdminStore((s) => s.loading);
  const fetchAds = useAdminStore((s) => s.fetchAds);
  const addAd = useAdminStore((s) => s.addAd);
  const updateAd = useAdminStore((s) => s.updateAd);
  const deleteAd = useAdminStore((s) => s.deleteAd);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setErrors({});
    setForm({
      title: row.title || '',
      description: row.description || '',
      href: row.href || '',
      image_url: row.image_url || '',
      cta: row.cta || 'Les mer',
      bg_color: row.bg_color || '#1a1a2e',
      text_color: row.text_color || '#ffffff',
      accent_color: row.accent_color || '#3b82f6',
      active: row.active ?? true,
    });
    setModalOpen(true);
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Slett annonse "${row.title}"?`)) return;
    await deleteAd(row.id);
  };

  const handleToggleActive = async (row) => {
    await updateAd(row.id, { active: !row.active });
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Tittel er påkrevd';
    if (!form.description.trim()) errs.description = 'Beskrivelse er påkrevd';
    if (!form.href.trim()) errs.href = 'Lenke er påkrevd';
    if (!form.cta.trim()) errs.cta = 'CTA-tekst er påkrevd';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSaving(true);
    try {
      let result;
      if (editing) {
        result = await updateAd(editing.id, form);
      } else {
        result = await addAd(form);
      }
      if (result?.error) {
        console.error('Ad save error:', result.error);
        setErrors({ form: 'Kunne ikke lagre: ' + result.error.message });
      } else {
        setModalOpen(false);
      }
    } catch (err) {
      console.error('Ad save exception:', err);
      setErrors({ form: 'Noe gikk galt ved lagring.' });
    }
    setSaving(false);
  };

  const truncate = (str, max) => str && str.length > max ? str.slice(0, max) + '...' : str;

  const columns = [
    { key: 'title', label: 'Tittel', render: (val) => truncate(val, 30) },
    {
      key: 'active',
      label: 'Status',
      render: (val) => (
        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${val ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
          {val ? 'Aktiv' : 'Inaktiv'}
        </span>
      ),
    },
  ];

  const actions = [
    { label: (row) => row.active ? 'Deaktiver' : 'Aktiver', onClick: handleToggleActive, variant: 'secondary' },
    { label: 'Rediger', onClick: openEdit, variant: 'secondary' },
    { label: 'Slett', onClick: handleDelete, variant: 'danger' },
  ];

  if (loading && ads.length === 0) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  const inputClass = (field) => `w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${errors[field] ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'}`;
  const FieldError = ({ field }) => errors[field] ? <p className="mt-1 text-xs text-red-600">{errors[field]}</p> : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Annonser</h1>
        <Button onClick={openCreate}>Legg til annonse</Button>
      </div>

      <AdminTable columns={columns} data={ads} actions={actions} />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Rediger annonse' : 'Ny annonse'}
        closeOnBackdrop={false}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {errors.form && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{errors.form}</p>}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Tittel</label>
            <input type="text" value={form.title} onChange={(e) => { setForm({ ...form, title: e.target.value }); setErrors((prev) => ({ ...prev, title: undefined })); }} className={inputClass('title')} />
            <FieldError field="title" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Beskrivelse</label>
            <textarea rows={3} value={form.description} onChange={(e) => { setForm({ ...form, description: e.target.value }); setErrors((prev) => ({ ...prev, description: undefined })); }} className={inputClass('description')} />
            <FieldError field="description" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Lenke (URL)</label>
            <input type="text" value={form.href} onChange={(e) => { setForm({ ...form, href: e.target.value }); setErrors((prev) => ({ ...prev, href: undefined })); }} className={inputClass('href')} placeholder="https://example.com" />
            <FieldError field="href" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Bilde-URL</label>
            <input type="text" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className={inputClass()} placeholder="https://example.com/image.webp" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">CTA-tekst</label>
            <input type="text" value={form.cta} onChange={(e) => { setForm({ ...form, cta: e.target.value }); setErrors((prev) => ({ ...prev, cta: undefined })); }} className={inputClass('cta')} placeholder="Besøk nettside" />
            <FieldError field="cta" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Bakgrunn</label>
              <div className="flex items-center gap-2">
                <input type="color" value={form.bg_color} onChange={(e) => setForm({ ...form, bg_color: e.target.value })} className="h-9 w-9 cursor-pointer rounded border border-gray-300" />
                <input type="text" value={form.bg_color} onChange={(e) => setForm({ ...form, bg_color: e.target.value })} className={inputClass()} />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Tekst</label>
              <div className="flex items-center gap-2">
                <input type="color" value={form.text_color} onChange={(e) => setForm({ ...form, text_color: e.target.value })} className="h-9 w-9 cursor-pointer rounded border border-gray-300" />
                <input type="text" value={form.text_color} onChange={(e) => setForm({ ...form, text_color: e.target.value })} className={inputClass()} />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Aksent</label>
              <div className="flex items-center gap-2">
                <input type="color" value={form.accent_color} onChange={(e) => setForm({ ...form, accent_color: e.target.value })} className="h-9 w-9 cursor-pointer rounded border border-gray-300" />
                <input type="text" value={form.accent_color} onChange={(e) => setForm({ ...form, accent_color: e.target.value })} className={inputClass()} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="ad-active"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
              className="h-4 w-4 accent-primary-500"
            />
            <label htmlFor="ad-active" className="text-sm text-gray-700">Aktiv</label>
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
