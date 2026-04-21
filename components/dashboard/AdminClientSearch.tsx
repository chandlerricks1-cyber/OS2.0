'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'
import type { ClientOption } from '@/types/cruciblePro'

interface AdminClientSearchProps {
  clients: ClientOption[]
  targetUserId: string
}

export function AdminClientSearch({ clients, targetUserId }: AdminClientSearchProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selected = clients.find((c) => c.id === targetUserId)

  const filtered = query
    ? clients.filter((c) => {
        const q = query.toLowerCase()
        return (
          c.email.toLowerCase().includes(q) ||
          (c.full_name?.toLowerCase().includes(q) ?? false)
        )
      })
    : clients

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function selectClient(clientId: string) {
    setOpen(false)
    setQuery('')
    router.replace(`/dashboard?client=${clientId}`)
    router.refresh()
  }

  return (
    <div ref={containerRef} className="bg-white border border-gray-200 rounded-[25px] p-4 relative">
      <div className="flex items-center gap-3">
        <span className="text-xs uppercase tracking-wide text-gray-500 font-semibold whitespace-nowrap">
          Viewing client
        </span>
        <div className="flex-1 max-w-md relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={open ? query : (selected?.full_name ?? selected?.email ?? '')}
              onChange={(e) => {
                setQuery(e.target.value)
                if (!open) setOpen(true)
              }}
              onFocus={() => {
                setOpen(true)
                setQuery('')
              }}
              placeholder="Search clients..."
              className="w-full text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg pl-9 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
            />
            {open && query && (
              <button
                onClick={() => {
                  setQuery('')
                  inputRef.current?.focus()
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {open && (
            <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-elevated max-h-64 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500">No clients found</div>
              ) : (
                filtered.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => selectClient(c.id)}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center justify-between gap-2 ${
                      c.id === targetUserId ? 'bg-gray-50 font-medium' : ''
                    }`}
                  >
                    <span className="truncate">
                      {c.full_name ? (
                        <>
                          <span className="text-gray-900">{c.full_name}</span>
                          <span className="text-gray-400 ml-1.5">{c.email}</span>
                        </>
                      ) : (
                        <span className="text-gray-900">{c.email}</span>
                      )}
                    </span>
                    {c.crucible_pro_status === 'active' && (
                      <span className="text-xs font-medium text-brand-orange-dark bg-brand-cream-100 px-2 py-0.5 rounded-full flex-shrink-0">
                        Pro
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
