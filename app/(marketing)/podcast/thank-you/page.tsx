'use client'

import { Logo } from '@/components/shared/Logo'
import { useSystemTheme } from '@/hooks/useSystemTheme'
import { CheckCircle2, Sun, Moon } from 'lucide-react'
import Link from 'next/link'

export default function PodcastThankYouPage() {
  const { isDark, toggle } = useSystemTheme()

  const pageBg = isDark ? 'bg-page-dark' : 'bg-white'
  const heading = isDark ? 'text-white' : 'text-page-dark'
  const body = isDark ? 'text-gray-400' : 'text-gray-600'
  const muted = isDark ? 'text-gray-500' : 'text-gray-400'
  const headerBorder = isDark ? 'border-white/10' : 'border-gray-200'

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${pageBg}`}>
      {/* Header */}
      <div className={`border-b px-6 py-4 ${headerBorder}`}>
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Logo height={56} variant={isDark ? 'light' : 'dark'} />
          <button
            onClick={toggle}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${isDark ? 'bg-white/10 text-gray-400 hover:text-white' : 'bg-gray-100 text-gray-500 hover:text-gray-900'}`}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="text-center max-w-lg">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-gradient-start to-brand-gradient-end flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>

          <h1 className={`text-3xl sm:text-4xl font-black mb-4 tracking-tight ${heading}`}>
            You&apos;re{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end">
              all set!
            </span>
          </h1>

          <p className={`text-lg mb-4 leading-relaxed ${body}`}>
            Chandler will review your answers and confirm your episode date.
            You&apos;ll receive an email with the recording details.
          </p>

          <p className={`mb-10 ${muted}`}>
            In the meantime, start thinking about the story behind your business —
            that&apos;s what makes for the best episodes.
          </p>

          <Link href="/" className="btn-gradient px-10 py-4 text-base inline-block">
            Back to Crucible
          </Link>
        </div>
      </div>
    </div>
  )
}
