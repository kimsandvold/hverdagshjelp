const colorMap = {
  primary: 'text-primary-500',
  accent: 'text-accent-500',
  green: 'text-green-500',
  red: 'text-red-500',
  blue: 'text-blue-500',
};

export default function StatsCard({
  title,
  value,
  subtitle,
  color = 'primary',
}) {
  const valueColor = colorMap[color] ?? colorMap.primary;

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <p className={`text-3xl font-bold ${valueColor}`}>{value}</p>
      <p className="mt-1 text-sm font-medium text-gray-700">{title}</p>
      {subtitle && (
        <p className="mt-0.5 text-xs text-gray-400">{subtitle}</p>
      )}
    </div>
  );
}
