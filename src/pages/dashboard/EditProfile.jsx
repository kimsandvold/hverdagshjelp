import { useState, useEffect, useRef } from 'react';
import useAuthStore from '../../stores/useAuthStore';
import useHelperStore from '../../stores/useHelperStore';
import Button from '../../components/ui/Button';
import LocationPickerModal from '../../components/ui/LocationPickerModal';
import { supabase } from '../../lib/supabase';

function cropToSquare(file) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const size = 500;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');

      // Center-crop: take the largest centered square from the source
      const side = Math.min(img.width, img.height);
      const sx = (img.width - side) / 2;
      const sy = (img.height - side) / 2;

      ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);

      URL.revokeObjectURL(img.src);

      // Binary search for best quality that stays under 80KB
      const tryQuality = (q) =>
        new Promise((res) => canvas.toBlob((b) => res(b), 'image/jpeg', q));

      (async () => {
        let lo = 0.5;
        let hi = 0.92;
        let best = await tryQuality(hi);

        if (best.size <= 80_000) {
          resolve(best);
          return;
        }

        for (let i = 0; i < 6; i++) {
          const mid = (lo + hi) / 2;
          const blob = await tryQuality(mid);
          if (blob.size <= 80_000) {
            best = blob;
            lo = mid;
          } else {
            hi = mid;
          }
        }
        resolve(best);
      })();
    };
    img.src = URL.createObjectURL(file);
  });
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export default function EditProfile() {
  const profile = useAuthStore((state) => state.profile);
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const getHelperById = useHelperStore((state) => state.getHelperById);
  const updateHelper = useHelperStore((state) => state.updateHelper);

  const isHelper = role === 'helper';
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    description: '',
    location: '',
    lat: null,
    lng: null,
  });
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarOriginalPreview, setAvatarOriginalPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarFileSize, setAvatarFileSize] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Google avatar fallback
  const googleAvatarUrl =
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    null;

  useEffect(() => {
    if (!profile?.id) return;

    if (isHelper) {
      getHelperById(profile.id).then((data) => {
        if (data) {
          setFormData({
            name: data.name || '',
            phone: data.phone || '',
            description: data.description || '',
            location: data.location || '',
            lat: data.lat || null,
            lng: data.lng || null,
          });
          setAvatarUrl(data.avatar_url || null);
        }
        setLoading(false);
      });
    } else {
      setFormData({
        name: profile.name || '',
        phone: profile.phone || '',
        description: '',
        location: '',
        lat: null,
        lng: null,
      });
      setAvatarUrl(profile.avatar_url || null);
      setLoading(false);
    }
  }, [profile?.id, isHelper, getHelperById]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setSuccess(false);
  };

  const handleAvatarSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowed.includes(file.type)) {
      alert('Kun JPG, PNG, GIF og WebP er tillatt.');
      return;
    }

    setAvatarOriginalPreview(URL.createObjectURL(file));
    const cropped = await cropToSquare(file);
    setAvatarFile(cropped);
    setAvatarFileSize(cropped.size);
    setAvatarPreview(URL.createObjectURL(cropped));
    setSuccess(false);
  };

  const clearAvatarPreview = () => {
    setAvatarFile(null);
    setAvatarFileSize(null);
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
      setAvatarPreview(null);
    }
    if (avatarOriginalPreview) {
      URL.revokeObjectURL(avatarOriginalPreview);
      setAvatarOriginalPreview(null);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const deleteOldAvatar = async () => {
    if (!profile?.id) return;
    const path = `${profile.id}/avatar.jpg`;
    await supabase.storage.from('avatars').remove([path]);
  };

  const uploadAvatar = async () => {
    if (!avatarFile || !profile?.id) return null;

    setUploading(true);
    await deleteOldAvatar();

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
        clearAvatarPreview();
      }
    }

    if (isHelper) {
      await updateHelper(profile.id, {
        name: formData.name,
        phone: formData.phone,
        description: formData.description,
        location: formData.location,
        lat: formData.lat,
        lng: formData.lng,
        ...(newAvatarUrl !== undefined && { avatar_url: newAvatarUrl }),
      });
    } else {
      await updateProfile({
        name: formData.name,
        phone: formData.phone,
        ...(newAvatarUrl !== undefined && { avatar_url: newAvatarUrl }),
      });
    }

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

  // Show: preview if selecting new image → saved avatar → Google avatar → initials
  const displayAvatar = avatarPreview || avatarUrl || googleAvatarUrl;
  const initials = (formData.name || 'H').charAt(0).toUpperCase();

  return (
    <div className="py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Profil</h1>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-xl bg-white p-6 shadow-sm sm:p-8">
        {/* Avatar section — left-aligned */}
        <div>
          <label className="mb-3 block text-sm font-medium text-gray-700">Profilbilde</label>
          <div className="flex items-start gap-5">
            {/* Current / preview avatar */}
            <div className="shrink-0">
              <div className="h-20 w-20 overflow-hidden rounded-xl border-2 border-gray-100 bg-gray-100">
                {displayAvatar ? (
                  <img
                    src={displayAvatar}
                    alt="Profilbilde"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-primary-500 bg-primary-50">
                    {initials}
                  </div>
                )}
              </div>
            </div>

            {/* Upload controls */}
            <div className="flex flex-col gap-2 pt-0.5">
              <p className="text-xs text-gray-400">
                Vises som 500 &times; 500px. Bildet beskjæres automatisk til kvadrat.
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 cursor-pointer"
                >
                  Velg bilde
                </button>
                {avatarPreview && (
                  <button
                    type="button"
                    onClick={clearAvatarPreview}
                    className="rounded-lg px-2 py-1.5 text-sm text-gray-400 transition-colors hover:text-gray-600 cursor-pointer"
                  >
                    Angre
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleAvatarSelect}
                className="hidden"
              />
              {!avatarUrl && !avatarPreview && googleAvatarUrl && (
                <p className="text-xs text-gray-400">Viser Google-bildet ditt som standard</p>
              )}
            </div>
          </div>

          {/* Cropped preview — original vs result */}
          {avatarPreview && (
            <div className="mt-4 rounded-lg border border-gray-100 bg-gray-50 p-4">
              <p className="mb-3 text-xs font-medium text-gray-500">Forhåndsvisning</p>
              <div className="flex items-start gap-6">
                {/* Original */}
                {avatarOriginalPreview && (
                  <div className="shrink-0">
                    <p className="mb-1.5 text-[11px] text-gray-400">Original</p>
                    <div className="h-[100px] w-[100px] overflow-hidden rounded-lg border border-gray-200 bg-white">
                      <img
                        src={avatarOriginalPreview}
                        alt="Original"
                        className="h-full w-full object-contain"
                      />
                    </div>
                  </div>
                )}

                {/* Arrow */}
                {avatarOriginalPreview && (
                  <div className="flex items-center self-center pt-5">
                    <svg className="h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                  </div>
                )}

                {/* Cropped result */}
                <div className="shrink-0">
                  <p className="mb-1.5 text-[11px] text-gray-400">Beskjært (500 &times; 500px)</p>
                  <div className="h-[100px] w-[100px] overflow-hidden rounded-lg border-2 border-primary-200 bg-white">
                    <img
                      src={avatarPreview}
                      alt="Beskjært"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>

                {/* Info */}
                <div className="flex flex-col gap-2 pt-5">
                  <div className="flex items-center gap-1.5">
                    <div className="h-9 w-9 overflow-hidden rounded-full border border-gray-200">
                      <img src={avatarPreview} alt="" className="h-full w-full object-cover" />
                    </div>
                    <span className="text-[11px] text-gray-400">Sirkulær visning</span>
                  </div>
                  {avatarFileSize && (
                    <p className="text-[11px] text-gray-400">
                      {formatBytes(avatarFileSize)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
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

        {/* Helper-only fields */}
        {isHelper && (
          <>
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
          </>
        )}

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
