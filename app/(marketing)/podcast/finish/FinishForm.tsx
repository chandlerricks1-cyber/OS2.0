'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Logo } from '@/components/shared/Logo'
import { useSystemTheme } from '@/hooks/useSystemTheme'
import { ArrowRight, Sun, Moon, Lock, CheckCircle2 } from 'lucide-react'

interface FinishFormProps {
  leadId: string
  defaultFullName: string
  defaultEmail: string
  defaultPhone: string
}

export function FinishForm({ leadId, defaultFullName, defaultEmail, defaultPhone }: FinishFormProps) {
  const { isDark, toggle } = useSystemTheme()
  const router = useRouter()

  const [form, setForm] = useState({
    full_name: defaultFullName,
    email: defaultEmail,
    phone: defaultPhone,
    password: '',
    confirm_password: '',
    _honey: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})

    const newErrors: Record<string, string> = {}
    if (!form.full_name.trim()) newErrors.full_name = 'Required'
    if (!form.email.trim()) newErrors.email = 'Required'
    if (!form.phone.trim()) newErrors.phone = 'Required'
    if (!form.password) newErrors.password = 'Required'
    else if (form.password.length < 8) newErrors.password = 'At least 8 characters'
    if (form.password !== form.confirm_password) newErrors.confirm_password = 'Passwords don\'t match'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/podcast/finish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: leadId,
          full_name: form.full_name,
          email: form.email,
          phone: form.phone,
          password: form.password,
          _honey: form._honey,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        if (res.status === 409 && data.redirect) {
          router.push(data.redirect)
          return
        }
        if (data.fields) setErrors(data.fields)
        else setErrors({ form: data.error || 'Something went wrong. Please try again.' })
        setSubmitting(false)
        return
      }

      router.push('/dashboard')
    } catch {
      setErrors({ form: 'Something went wrong. Please try again.' })
      setSubmitting(false)
    }
  }

  // Theme classes
  const pageBg = isDark ? 'bg-page-dark' : 'bg-white'
  const heading = isDark ? 'text-white' : 'text-page-dark'
  const body = isDark ? 'text-gray-400' : 'text-gray-600'
  const muted = isDark ? 'text-gray-500' : 'text-gray-400'
  const card = isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
  const headerBorder = isDark ? 'border-white/10' : 'border-gray-200'
  const labelCls = isDark ? 'text-gray-300' : 'text-gray-700'
  const inputCls = isDark
    ? 'bg-neutral-800 border-neutral-700 text-white placeholder-neutral-500'
    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'

  const inputBase = `w-full rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-gradient-end focus:border-brand-gradient-end outline-none transition-all border ${inputCls}`
  const labelBase = `block text-sm font-semibold mb-2 ${labelCls}`

  return (
    <div className={`min-h-screen transition-colors duration-300 ${pageBg}`}>
      {/* Header */}
      <div className={`border-b px-6 py-4 ${headerBorder}`}>
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Logo height={56} variant={isDark ? 'light' : 'dark'} />
          <div className="flex items-center gap-3">
            <span className={`text-sm ${body}`}>Finalize Account</span>
            <button
              onClick={toggle}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${isDark ? 'bg-white/10 text-gray-400 hover:text-white' : 'bg-gray-100 text-gray-500 hover:text-gray-900'}`}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Intro */}
      <div className="max-w-2xl mx-auto px-6 pt-12 pb-8">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-brand-gradient-start to-brand-gradient-end flex items-center justify-center mb-6">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
          <h1 className={`text-3xl md:text-4xl font-black tracking-tight mb-4 ${heading}`}>
            You&apos;re all set!{' '}
            <span className="block sm:inline mt-2 sm:mt-0 text-transparent bg-clip-text bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end">
              Login to your Crucible Dashboard
            </span>
          </h1>
          <p className={`text-lg max-w-xl mx-auto ${body}`}>
            Confirm your details and set a password to access your dashboard. We&apos;ve already
            populated it with the answers you gave — head in and see your numbers.
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-6 pb-24">
        <input
          type="text"
          name="_honey"
          value={form._honey}
          onChange={(e) => update('_honey', e.target.value)}
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
        />

        <div className={`rounded-[25px] p-8 border space-y-5 ${card}`}>
          <div>
            <label htmlFor="full_name" className={labelBase}>Full Name</label>
            <input
              id="full_name"
              type="text"
              value={form.full_name}
              onChange={(e) => update('full_name', e.target.value)}
              className={inputBase}
              autoComplete="name"
            />
            {errors.full_name && <p className="text-red-400 text-sm mt-1">{errors.full_name}</p>}
          </div>

          <div>
            <label htmlFor="email" className={labelBase}>Email</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              className={inputBase}
              autoComplete="email"
            />
            {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="phone" className={labelBase}>Phone</label>
            <input
              id="phone"
              type="tel"
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              className={inputBase}
              autoComplete="tel"
            />
            {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone}</p>}
          </div>

          <div className="border-t border-white/5 pt-5">
            <div className="flex items-center gap-2 mb-4">
              <Lock className={`w-4 h-4 ${muted}`} />
              <p className={`text-sm font-medium ${labelCls}`}>Set your password</p>
            </div>

            <div className="space-y-5">
              <div>
                <label htmlFor="password" className={labelBase}>Password</label>
                <input
                  id="password"
                  type="password"
                  placeholder="Min 8 characters"
                  value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  className={inputBase}
                  autoComplete="new-password"
                />
                {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
              </div>

              <div>
                <label htmlFor="confirm_password" className={labelBase}>Confirm Password</label>
                <input
                  id="confirm_password"
                  type="password"
                  value={form.confirm_password}
                  onChange={(e) => update('confirm_password', e.target.value)}
                  className={inputBase}
                  autoComplete="new-password"
                />
                {errors.confirm_password && <p className="text-red-400 text-sm mt-1">{errors.confirm_password}</p>}
              </div>
            </div>
          </div>
        </div>

        {errors.form && (
          <div className="rounded-xl border border-red-400/30 bg-red-400/10 px-5 py-4 mt-6 text-center">
            <p className="text-red-400 text-sm">{errors.form}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="btn-gradient !flex w-full h-14 items-center justify-center gap-2 text-base mt-6 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? 'Setting up your account...' : (<>Go to Dashboard <ArrowRight className="w-4 h-4" /></>)}
        </button>
        <p className={`text-sm text-center mt-4 ${muted}`}>
          No email verification needed — you&apos;re signed in immediately.
        </p>
      </form>
    </div>
  )
}
