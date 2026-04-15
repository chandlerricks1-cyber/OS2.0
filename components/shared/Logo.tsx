interface LogoProps {
  height?: number
  variant?: 'dark' | 'light' | 'icon'
  className?: string
}

export function Logo({ height = 75, variant = 'dark', className = '' }: LogoProps) {
  const src =
    variant === 'icon'
      ? '/brand-icon.png'
      : variant === 'light'
      ? '/logo-light.png'
      : '/logo-dark.png'
  return (
    <img
      src={src}
      alt="Crucible"
      style={{ height: `${height}px`, width: 'auto' }}
      className={className}
    />
  )
}
