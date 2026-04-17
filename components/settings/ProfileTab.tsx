'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, X } from 'lucide-react'
import type { SettingsProfile } from './SettingsShell'

function getInitials(name: string | null, email: string): string {
  if (name) {
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }
  return email[0].toUpperCase()
}

export function ProfileTab({ profile }: { profile: SettingsProfile }) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState(profile.full_name ?? '')
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function handleAvatarUpload(file: File) {
    setUploading(true)
    setMessage(null)
    const form = new FormData()
    form.append('file', file)
    try {
      const res = await fetch('/api/settings/avatar', { method: 'POST', body: form })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setAvatarUrl(json.url)
      router.refresh()
    } catch (e) {
      setMessage({ type: 'error', text: e instanceof Error ? e.message : 'Upload failed' })
    } finally {
      setUploading(false)
    }
  }

  async function handleAvatarRemove() {
    setUploading(true)
    setMessage(null)
    try {
      const res = await fetch('/api/settings/avatar', { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to remove avatar')
      setAvatarUrl(null)
      router.refresh()
    } catch (e) {
      setMessage({ type: 'error', text: e instanceof Error ? e.message : 'Remove failed' })
    } finally {
      setUploading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch('/api/settings/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: name }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setMessage({ type: 'success', text: 'Profile updated' })
      router.refresh()
    } catch (e) {
      setMessage({ type: 'error', text: e instanceof Error ? e.message : 'Save failed' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Avatar */}
      <div className="bg-white border border-gray-200 rounded-[25px] p-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Profile picture
        </h2>
        <div className="flex items-center gap-4">
          <div className="relative">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-brand-orange/10 text-brand-orange flex items-center justify-center text-xl font-bold">
                {getInitials(profile.full_name, profile.email)}
              </div>
            )}
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors shadow-sm"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-1">
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="text-sm font-medium text-brand-orange hover:underline"
            >
              {uploading ? 'Uploading...' : 'Upload photo'}
            </button>
            {avatarUrl && (
              <button
                onClick={handleAvatarRemove}
                disabled={uploading}
                className="block text-sm text-gray-500 hover:text-red-600"
              >
                Remove
              </button>
            )}
            <p className="text-xs text-gray-400">JPG, PNG or GIF. Max 2 MB.</p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleAvatarUpload(file)
              e.target.value = ''
            }}
          />
        </div>
      </div>

      {/* Profile info */}
      <div className="bg-white border border-gray-200 rounded-[25px] p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          Profile information
        </h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
            placeholder="Your name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={profile.email}
            disabled
            className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
          />
          <p className="text-xs text-gray-400 mt-1">Contact support to change your email address.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Member since</label>
          <p className="text-sm text-gray-600">
            {new Date(profile.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
          </p>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-full bg-brand-orange text-white text-sm font-semibold disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save changes'}
          </button>
          {message && (
            <p className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {message.text}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
