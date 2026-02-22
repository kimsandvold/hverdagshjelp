import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <SEO
        title="Side ikke funnet"
        description="Beklager, vi fant ikke siden du leter etter."
      />
      <h1 className="text-8xl font-bold text-primary-500">404</h1>
      <p className="mt-4 text-xl font-medium text-gray-700">
        Siden ble ikke funnet
      </p>
      <p className="mt-2 text-sm text-gray-500">
        {'Siden du leter etter finnes ikke eller har blitt flyttet.'}
      </p>
      <Link
        to="/"
        className="mt-8 inline-block rounded-lg bg-primary-500 px-6 py-3 font-medium text-white transition-colors hover:bg-primary-600"
      >
        {'G\u00e5 til forsiden'}
      </Link>
    </div>
  );
}
