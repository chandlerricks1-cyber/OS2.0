interface CrucibleIconProps {
  size?: number
  className?: string
}

export function CrucibleIcon({ size = 32, className }: CrucibleIconProps) {
  const h = Math.round(size * 1.375)
  return (
    <svg
      width={size}
      height={h}
      viewBox="0 0 32 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Vessel body */}
      <path
        d="M4 2H28C29.1 2 30 2.9 30 4V7L26 24C25 28 21.5 30 18 30H14C10.5 30 7 28 6 24L2 7V4C2 2.9 2.9 2 4 2Z"
        fill="#C44325"
        stroke="#2B1A0E"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Inner warm glow */}
      <path
        d="M8 6H24L21 22C20.5 25 18.5 27 16 27C13.5 27 11.5 25 11 22L8 6Z"
        fill="#E86530"
      />
      {/* Highlight */}
      <path
        d="M12 7L14.5 20L17 19.5L14 7Z"
        fill="#F5A050"
        opacity="0.45"
      />
      {/* Top rim */}
      <rect x="2" y="2" width="28" height="5" rx="1.5" fill="#3D1A08" />
      {/* Golden pour */}
      <path
        d="M16 30 Q15 36 16 42"
        stroke="#F5B800"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="16" cy="43" r="1.5" fill="#F5B800" />
    </svg>
  )
}

interface LogoProps {
  iconSize?: number
  textSize?: 'sm' | 'base' | 'lg' | 'xl' | '2xl'
  textColor?: string
  className?: string
}

export function Logo({
  iconSize = 28,
  textSize = 'xl',
  textColor = 'text-brand-dark',
  className = '',
}: LogoProps) {
  const sizeMap = {
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <CrucibleIcon size={iconSize} />
      <span className={`font-black tracking-tight ${sizeMap[textSize]} ${textColor}`}>
        CRUCIBLE
      </span>
    </div>
  )
}
