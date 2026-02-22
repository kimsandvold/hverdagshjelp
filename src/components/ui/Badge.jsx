const badgeConfig = {
  verified: {
    className: 'bg-green-100 text-green-800',
    label: '\u2713 Verifisert',
  },
  premium: {
    className: 'bg-accent-100 text-accent-800',
    label: '\u2605 Premium',
  },
  basic: {
    className: 'bg-blue-100 text-blue-800',
    label: 'Basis',
  },
  free: {
    className: 'bg-gray-100 text-gray-600',
    label: 'Gratis',
  },
  inactive: {
    className: 'bg-gray-100 text-gray-500',
    label: 'Inaktiv',
  },
  user: {
    className: 'bg-gray-100 text-gray-700',
    label: 'Bruker',
  },
  helper: {
    className: 'bg-blue-100 text-blue-800',
    label: 'Hjelper',
  },
  admin: {
    className: 'bg-purple-100 text-purple-800',
    label: 'Admin',
  },
};

export default function Badge({ type }) {
  const config = badgeConfig[type];

  if (!config) return null;

  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
