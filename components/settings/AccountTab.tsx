'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Download, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function AccountTab({ email }: { email: string }) {
  const router = useRouter()
  const [exporting, setExporting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleExport() {
    setExporting(true)
    try {
      const res = await fetch('/api/settings/export')
      if (!res.ok) throw new Error('Export failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `crucible-export-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      setError('Failed to export data')
    } finally {
      setExporting(false)
    }
  }

  async function handleDelete() {
    if (confirmText !== 'DELETE') return
    setDeleting(true)
    setError(null)
    try {
      const res = await fetch('/api/settings/account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: 'DELETE' }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      // Sign out and redirect
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/login')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete account')
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Data export */}
      <div className="bg-white border border-gray-200 rounded-[25px] p-6 space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          Export your data
        </h2>
        <p className="text-sm text-gray-600">
          Download a JSON file containing your profile, business metrics, and reports.
        </p>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-dark text-white text-sm font-semibold disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {exporting ? 'Exporting...' : 'Download my data'}
        </button>
      </div>

      {/* Danger zone */}
      <div className="bg-white border border-red-200 rounded-[25px] p-6 space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <h2 className="text-sm font-semibold text-red-600 uppercase tracking-wide">
            Danger zone
          </h2>
        </div>
        <p className="text-sm text-gray-600">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>

        {!showDeleteDialog ? (
          <button
            onClick={() => setShowDeleteDialog(true)}
            className="px-4 py-2 rounded-full border border-red-300 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors"
          >
            Delete my account
          </button>
        ) : (
          <div className="space-y-3 p-4 bg-red-50 rounded-xl">
            <p className="text-sm text-red-700 font-medium">
              Type <span className="font-mono font-bold">DELETE</span> to confirm account deletion for{' '}
              <span className="font-medium">{email}</span>
            </p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type DELETE"
              className="w-full text-sm px-3 py-2 rounded-lg border border-red-300 focus:outline-none focus:ring-2 focus:ring-red-300"
            />
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                disabled={confirmText !== 'DELETE' || deleting}
                className="px-4 py-2 rounded-full bg-red-600 text-white text-sm font-semibold disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Permanently delete'}
              </button>
              <button
                onClick={() => {
                  setShowDeleteDialog(false)
                  setConfirmText('')
                }}
                className="px-4 py-2 rounded-full text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    </div>
  )
}
