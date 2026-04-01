import Link from 'next/link'
import { Logo } from '@/components/shared/Logo'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center px-4 py-12">
      <Link href="/" className="mb-8">
        <Logo height={48} variant="light" />
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  )
}
