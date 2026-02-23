import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useAuthStore from '../../stores/useAuthStore';
import Button from '../../components/ui/Button';
import { supabase } from '../../lib/supabase';
import SEO from '../../components/SEO';

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function Registrer() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { ref: referralCode } = useParams();
  const [referrer, setReferrer] = useState(null);
  const register = useAuthStore((state) => state.register);
  const googleLogin = useAuthStore((state) => state.googleLogin);
  const navigate = useNavigate();

  // Load referrer info
  useEffect(() => {
    if (referralCode) {
      supabase
        .from('helpers')
        .select('id, profiles(name)')
        .eq('id', referralCode)
        .single()
        .then(({ data }) => {
          if (data) setReferrer({ id: data.id, name: data.profiles.name });
        });
    }
  }, [referralCode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleGoogle = async () => {
    setError('');
    const result = await googleLogin({
      intent: 'helper',
      referredBy: referrer ? referralCode : undefined,
    });
    if (!result.success) {
      setError(result.error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    if (!formData.name.trim()) {
      setError('Navn er påkrevd');
      setSubmitting(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Passordet må være minst 6 tegn');
      setSubmitting(false);
      return;
    }

    const result = await register({
      name: formData.name.trim(),
      email: formData.email,
      password: formData.password,
      referredBy: referrer ? referralCode : undefined,
    });

    if (result.success) {
      navigate('/onboarding');
    } else {
      setError(result.error);
    }
    setSubmitting(false);
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <SEO
        title="Registrer deg som hjelper"
        description="Opprett en hjelperprofil og kom i gang."
        url="https://dinhelt.no/registrer"
      />
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Opprett hjelper-konto</h1>

      <div className="space-y-5 rounded-xl bg-white p-6 shadow-sm sm:p-8">
        {/* Google button */}
        <button
          type="button"
          onClick={handleGoogle}
          disabled={submitting}
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
        >
          <GoogleIcon />
          Fortsett med Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs text-gray-400">eller</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
              Fullt navn <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ola Nordmann"
              required
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-colors focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
              E-post <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="din@epost.no"
              required
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-colors focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
              Passord <span className="text-red-500">*</span>
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minst 6 tegn"
              required
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-colors focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            />
          </div>

          {/* Referral incentive */}
          <div className="rounded-lg border border-primary-100 bg-primary-50 p-4">
            <p className="text-sm font-medium text-primary-800">
              Verv en hjelper &ndash; spar 5&nbsp;% på abonnementet!
            </p>
            <p className="mt-1 text-xs text-primary-600">
              For hver hjelper du verver får du 5&nbsp;% rabatt på abonnementsprisen. Du kan spare opptil 70&nbsp;%.
            </p>
            {referralCode && (
              referrer ? (
                <p className="mt-2 text-xs font-medium text-primary-700">
                  Du ble henvist av <span className="font-bold">{referrer.name}</span>
                </p>
              ) : (
                <p className="mt-2 text-xs font-medium text-red-600">
                  Ugyldig vervekode
                </p>
              )
            )}
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" variant="primary" size="lg" className="w-full" disabled={submitting}>
            {submitting ? 'Oppretter konto...' : 'Opprett konto'}
          </Button>

          <p className="text-center text-sm text-gray-500">
            Har du allerede en konto?{' '}
            <a href="/login" className="font-medium text-primary-500 hover:text-primary-600">
              Logg inn
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
