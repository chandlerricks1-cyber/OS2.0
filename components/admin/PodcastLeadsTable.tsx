'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, X } from 'lucide-react'

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  intake_complete: 'bg-green-100 text-green-700',
  scheduled: 'bg-purple-100 text-purple-700',
  recorded: 'bg-amber-100 text-amber-700',
  archived: 'bg-gray-100 text-gray-500',
}

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'new', label: 'New' },
  { value: 'intake_complete', label: 'Intake Complete' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'recorded', label: 'Recorded' },
  { value: 'archived', label: 'Archived' },
]

interface Lead {
  id: string
  full_name: string
  email: string
  phone: string
  preferred_date: string
  status: string
  created_at: string
  podcast_intake: { id: string }[] | { id: string } | null
  podcast_lead_tags: { tag: string }[] | null
}

export function PodcastLeadsTable({ leads }: { leads: Lead[] }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [tagFilter, setTagFilter] = useState('')

  // Collect all unique tags for the filter dropdown
  const allTags = useMemo(() => {
    const tags = new Set<string>()
    leads.forEach((l) => {
      if (Array.isArray(l.podcast_lead_tags)) {
        l.podcast_lead_tags.forEach((t) => tags.add(t.tag))
      }
    })
    return Array.from(tags).sort()
  }, [leads])

  const filtered = useMemo(() => {
    return leads.filter((lead) => {
      // Search filter
      if (search) {
        const q = search.toLowerCase()
        const matchesSearch =
          lead.full_name.toLowerCase().includes(q) ||
          lead.email.toLowerCase().includes(q) ||
          lead.phone.includes(q)
        if (!matchesSearch) return false
      }
      // Status filter
      if (statusFilter && lead.status !== statusFilter) return false
      // Tag filter
      if (tagFilter) {
        const tags = Array.isArray(lead.podcast_lead_tags) ? lead.podcast_lead_tags : []
        if (!tags.some((t) => t.tag === tagFilter)) return false
      }
      return true
    })
  }, [leads, search, statusFilter, tagFilter])

  const hasActiveFilters = search || statusFilter || tagFilter

  return (
    <div>
      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gradient-end focus:border-transparent"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-gradient-end bg-white"
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {/* Tag Filter */}
        {allTags.length > 0 && (
          <select
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-gradient-end bg-white"
          >
            <option value="">All Tags</option>
            {allTags.map((tag) => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        )}

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={() => { setSearch(''); setStatusFilter(''); setTagFilter('') }}
            className="flex items-center gap-1 px-3 py-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <X className="w-3.5 h-3.5" /> Clear
          </button>
        )}
      </div>

      {/* Results count */}
      {hasActiveFilters && (
        <p className="text-xs text-gray-400 mb-3">
          Showing {filtered.length} of {leads.length} leads
        </p>
      )}

      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {filtered.map((lead) => {
          const hasIntake = Array.isArray(lead.podcast_intake)
            ? lead.podcast_intake.length > 0
            : !!lead.podcast_intake
          const tags = Array.isArray(lead.podcast_lead_tags) ? lead.podcast_lead_tags : []
          return (
            <Link
              key={lead.id}
              href={`/dashboard/admin/podcast/${lead.id}`}
              className="block bg-white rounded-2xl border border-gray-200 p-4 active:bg-gray-50"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{lead.full_name}</p>
                  <p className="text-gray-500 text-xs truncate">{lead.email}</p>
                  <p className="text-gray-500 text-xs">{lead.phone}</p>
                </div>
                <span className={`shrink-0 inline-block px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[lead.status] || statusColors.new}`}>
                  {lead.status.replace('_', ' ')}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs mt-3 pt-3 border-t border-gray-100">
                <div>
                  <span className="text-gray-400">Preferred: </span>
                  <span className="text-gray-700">
                    {new Date(lead.preferred_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Submitted: </span>
                  <span className="text-gray-700">
                    {new Date(lead.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-400">Intake: </span>
                  {hasIntake ? (
                    <span className="text-green-600 font-medium">Complete</span>
                  ) : (
                    <span className="text-gray-500">Pending</span>
                  )}
                </div>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {tags.map((t) => (
                    <span key={t.tag} className="inline-block px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
                      {t.tag}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          )
        })}
        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400 text-sm">
            {hasActiveFilters ? 'No leads match your filters' : 'No podcast leads yet'}
          </div>
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-4 py-3 font-medium text-gray-500">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Email</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Phone</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Preferred Date</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Tags</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Intake</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Submitted</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((lead) => {
                const hasIntake = Array.isArray(lead.podcast_intake)
                  ? lead.podcast_intake.length > 0
                  : !!lead.podcast_intake
                const tags = Array.isArray(lead.podcast_lead_tags) ? lead.podcast_lead_tags : []
                return (
                  <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{lead.full_name}</td>
                    <td className="px-4 py-3 text-gray-600">{lead.email}</td>
                    <td className="px-4 py-3 text-gray-600">{lead.phone}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(lead.preferred_date + 'T00:00:00').toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[lead.status] || statusColors.new}`}>
                        {lead.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {tags.slice(0, 2).map((t) => (
                            <span key={t.tag} className="inline-block px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
                              {t.tag}
                            </span>
                          ))}
                          {tags.length > 2 && (
                            <span className="text-xs text-gray-400">+{tags.length - 2}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-300 text-xs">--</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {hasIntake ? (
                        <span className="text-green-600 font-medium text-xs">Complete</span>
                      ) : (
                        <span className="text-gray-400 text-xs">Pending</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {new Date(lead.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/admin/podcast/${lead.id}`} className="text-brand-gradient-end hover:underline text-xs font-medium">
                        View
                      </Link>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-gray-400">
                    {hasActiveFilters ? 'No leads match your filters' : 'No podcast leads yet'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
