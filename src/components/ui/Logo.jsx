import { Link } from 'react-router-dom'

export default function Logo({ to = '/', className = '', light = false }) {
  const iconColor = light ? '#ffffff' : '#1e3a5f'
  const textColor = light
    ? 'text-white'
    : 'text-primary-500'

  return (
    <Link to={to} className={`flex items-center gap-2.5 ${className}`}>
      <svg
        viewBox="0 0 36 36"
        className="h-8 w-8 shrink-0"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Rounded square background */}
        <rect width="36" height="36" rx="8" fill={iconColor} />

        {/* H monogram with house-roof crossbar */}
        {/* Left vertical bar */}
        <line
          x1="12" y1="9"
          x2="12" y2="27"
          stroke={light ? '#1e3a5f' : '#ffffff'}
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        {/* Right vertical bar */}
        <line
          x1="24" y1="9"
          x2="24" y2="27"
          stroke={light ? '#1e3a5f' : '#ffffff'}
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        {/* Roof-shaped crossbar */}
        <path
          d="M12 20 L18 14 L24 20"
          stroke={light ? '#1e3a5f' : '#ffffff'}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <span className={`text-xl font-bold tracking-tight ${textColor}`}>
        Hverdagshjelp
      </span>
    </Link>
  )
}
