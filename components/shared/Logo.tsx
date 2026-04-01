interface LogoProps {
  height?: number
  variant?: 'dark' | 'light'
  className?: string
}

export function Logo({ height = 60, variant = 'dark', className = '' }: LogoProps) {
  const src = variant === 'light' ? '/logo-light.png' : '/logo-dark.png'
  return (
    <img
      src={src}
      alt="Crucible"
      style={{ height: `${height}px`, width: 'auto' }}
      className={className}
    />
  )
}
