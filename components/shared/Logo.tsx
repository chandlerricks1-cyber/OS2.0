interface LogoProps {
  height?: number
  className?: string
}

export function Logo({ height = 40, className = '' }: LogoProps) {
  return (
    <img
      src="/logo.png"
      alt="Crucible"
      style={{ height: `${height}px`, width: 'auto' }}
      className={className}
    />
  )
}
