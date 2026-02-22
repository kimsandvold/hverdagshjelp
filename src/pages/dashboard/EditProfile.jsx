import { useState, useEffect, useRef } from 'react';
import useAuthStore from '../../stores/useAuthStore';
import useHelperStore from '../../stores/useHelperStore';
import Button from '../../components/ui/Button';
import LocationPickerModal from '../../components/ui/LocationPickerModal';
import { supabase } from '../../lib/supabase';

function resizeImage(file, maxSize = 500) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;
      if (width > height) {
        if (width > maxSize) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.85);
    };
    img.src = URL.createObjectURL(file);
  });
}

export default function EditProfile() {
  const profile = useAuthStore((state) => state.profile);
  const getHelperById = useHelperStore((state) => state.getHelperById);
  const updateHelper = useHelperStore((state) => state.updateHelper);

  const fileInputRef = useRef(null);
  const [helper, setHelper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    description: '',
    location: '',
    lat: null,
    lng: null,
    active: true,
  });
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (profile?.id) {
      getHelperById(profile.id).then((data) => {
        if (data) {
          setHelper(data);
          setFormData({
            name: data.name || '',
            phone: data.phone || '',
            description: data.description || '',
            location: data.location || '',
            lat: data.lat || null,
            lng: data.lng || null,
            active: data.active !== false,
          });
          setAvatarUrl(data.avatar_url || null);
        }
        setLoading(false);
      });
    }
  }, [profile?.id, getHelperById]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setSuccess(false);
  };

  const handleAvatarSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowed.includes(file.type)) {
      alert('Kun JPG, PNG og GIF er tillatt.');
      return;
    }

    const resized = await resizeImage(file);
    setAvatarFile(resized);
    setAvatarPreview(URL.createObjectURL(resized));
    setSuccess(false);
  };

  const uploadAvatar = async () => {
    if (!avatarFile || !profile?.id) return null;

    setUploading(true);
    const path = `${profile.id}/avatar.jpg`;

    const { error } = await supabase.storage
      .from('avatars')
      .upload(path, avatarFile, { upsert: true, contentType: 'image/jpeg' });

    if (error) {
      setUploading(false);
      return null;
    }

    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
    const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;
    setUploading(false);
    return publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    let newAvatarUrl = undefined;
    if (avatarFile) {
      const url = await uploadAvatar();
      if (url) {
        newAvatarUrl = url;
        setAvatarUrl(url);
        setAvatarFile(null);
        setAvatarPreview(null);
      }
    }

    await updateHelper(profile.id, {
      name: formData.name,
      phone: formData.phone,
      description: formData.description,
      location: formData.location,
      lat: formData.lat,
      lng: formData.lng,
      active: formData.active,
      ...(newAvatarUrl !== undefined && { avatar_url: newAvatarUrl }),
    });

    setSuccess(true);
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (!helper) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <p className="text-gray-500">Kunne ikke laste profildataene dine.</p>
      </div>
    );
  }

  const displayAvatar = avatarPreview || avatarUrl;
  const initials = (formData.name || 'H').charAt(0).toUpperCase();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Profil</h1>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-xl bg-white p-6 shadow-sm sm:p-8">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="group relative h-24 w-24 overflow-hidden rounded-full cursor-pointer"
          >
            {displayAvatar ? (
              <img src={displayAvatar} alt="Profilbilde" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-primary-100 text-3xl font-bold text-primary-500">
                {initials}
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif"
            onChange={handleAvatarSelect}
            className="hidden"
          />
          <p className="text-xs text-gray-400">Klikk for å endre bilde</p>
        </div>

        {/* Name */}
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
            Navn
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-colors focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          />
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="mb-1 block text-sm font-medium text-gray-700">
            Telefon
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-colors focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="mb-1 block text-sm font-medium text-gray-700">
            Beskrivelse
          </label>
          <textarea
            id="description"
            name="description"
            rows={5}
            value={formData.description}
            onChange={handleChange}
            placeholder="Fortell litt om deg selv..."
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-colors focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          />
        </div>

        {/* Location */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Sted</label>
          <div className="flex gap-2">
            <input
              name="location"
              type="text"
              value={formData.location}
              onChange={handleChange}
              placeholder="f.eks. Oslo"
              className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-colors focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            />
            <button
              type="button"
              onClick={() => setMapOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-3 text-sm text-gray-600 transition-colors hover:bg-gray-100 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Kart
            </button>
          </div>
          {formData.lat != null && (
            <p className="mt-1 text-xs text-green-600">Posisjon valgt på kart</p>
          )}
          <LocationPickerModal
            isOpen={mapOpen}
            onClose={() => setMapOpen(false)}
            onConfirm={(result) => {
              setMapOpen(false);
              if (result) {
                setFormData((prev) => ({ ...prev, lat: result.lat, lng: result.lng }));
              } else {
                setFormData((prev) => ({ ...prev, lat: null, lng: null }));
              }
              setSuccess(false);
            }}
            initialLat={formData.lat}
            initialLng={formData.lng}
          />
        </div>

        {/* Active toggle */}
        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-gray-700">Synlig profil</p>
            <p className="text-xs text-gray-400">Når av er profilen din skjult fra søk</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setFormData((prev) => ({ ...prev, active: !prev.active }));
              setSuccess(false);
            }}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
              formData.active ? 'bg-primary-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                formData.active ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Success message */}
        {success && (
          <p className="text-sm font-medium text-green-600">
            Profilen din ble oppdatert!
          </p>
        )}

        {/* Submit button */}
        <Button type="submit" variant="primary" size="lg" className="w-full" disabled={submitting || uploading}>
          {submitting || uploading ? 'Lagrer...' : 'Lagre endringer'}
        </Button>
      </form>
    </div>
  );
}
