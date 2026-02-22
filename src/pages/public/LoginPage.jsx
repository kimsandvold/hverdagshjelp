import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../stores/useAuthStore';
import Button from '../../components/ui/Button';
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

export default function LoginPage() {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { loginUser, registerUser, googleLogin } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || '/search';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    if (mode === 'register') {
      if (!name.trim()) {
        setError('Fyll inn navnet ditt');
        setSubmitting(false);
        return;
      }
      if (password.length < 6) {
        setError('Passordet må være minst 6 tegn');
        setSubmitting(false);
        return;
      }
      const result = await registerUser({ name: name.trim(), email, password });
      if (result.success) {
        navigate(redirectTo);
      } else {
        setError(result.error);
      }
    } else {
      const result = await loginUser(email, password);
      if (result.success) {
        navigate(redirectTo);
      } else {
        setError(result.error);
      }
    }
    setSubmitting(false);
  };

  const handleGoogle = async () => {
    setError('');
    const result = await googleLogin();
    if (!result.success) {
      setError(result.error);
    }
    // Google login redirects — no navigate needed
  };

  return (
    <div className="mx-auto mt-16 max-w-md px-4">
      <SEO
        title="Logg inn"
        description="Logg inn på Hverdagshjelp.no"
        url="https://hverdagshjelp.no/login"
      />
      <div className="rounded-xl bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-center text-xl font-bold text-gray-900">
          {mode === 'login' ? 'Logg inn' : 'Opprett konto'}
        </h1>
        <p className="mb-6 text-center text-sm text-gray-500">
          {mode === 'login'
            ? 'Logg inn for å finne hjelp i ditt område.'
            : 'Registrer deg for å finne hjelp i ditt område.'}
        </p>

        {/* Google button */}
        <button
          type="button"
          onClick={handleGoogle}
          disabled={submitting}
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
        >
          <GoogleIcon />
          Fortsett med Google
        </button>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs text-gray-400">eller</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label htmlFor="login-name" className="mb-1 block text-sm font-medium text-gray-700">
                Navn
              </label>
              <input
                id="login-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ditt navn"
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-colors focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              />
            </div>
          )}

          <div>
            <label htmlFor="login-email" className="mb-1 block text-sm font-medium text-gray-700">
              E-post
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="din@epost.no"
              required
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-colors focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div>
            <label htmlFor="login-password" className="mb-1 block text-sm font-medium text-gray-700">
              Passord
            </label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'register' ? 'Minst 6 tegn' : 'Ditt passord'}
              required
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-colors focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" variant="primary" size="lg" className="w-full" disabled={submitting}>
            {submitting ? 'Venter...' : mode === 'login' ? 'Logg inn' : 'Opprett konto'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          {mode === 'login' ? (
            <>
              Har du ikke konto?{' '}
              <button
                type="button"
                onClick={() => { setMode('register'); setError(''); }}
                className="font-medium text-primary-500 hover:text-primary-600"
              >
                Registrer deg
              </button>
            </>
          ) : (
            <>
              Har du allerede konto?{' '}
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); }}
                className="font-medium text-primary-500 hover:text-primary-600"
              >
                Logg inn
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
