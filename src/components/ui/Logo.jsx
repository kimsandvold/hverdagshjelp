import { Link } from 'react-router-dom'

export default function Logo({ to = '/', className = '', light = false }) {
  const bgColor = light ? '#ffffff' : '#1F4163'
  const fgColor = light ? '#1F4163' : '#ffffff'
  const textColor = light ? 'text-white' : 'text-primary-500'

  return (
    <Link to={to} className={`flex items-center gap-2.5 ${className}`}>
      <svg
        viewBox="0 0 100 100"
        className="h-8 w-8 shrink-0"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect width="100" height="100" rx="22" fill={bgColor} />
        <path
          d="M50 82 C50 82 14 58 14 36 C14 24 22 16 33 16 C40 16 46 20 50 26 C54 20 60 16 67 16 C78 16 86 24 86 36 C86 58 50 82 50 82 Z"
          fill={fgColor}
        />
      </svg>

      <span className={`text-xl font-bold tracking-tight ${textColor}`}>
        Din Helt
      </span>
    </Link>
  )
}
