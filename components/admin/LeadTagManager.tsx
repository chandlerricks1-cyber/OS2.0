'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X } from 'lucide-react'

export function LeadTagManager({ leadId, tags }: { leadId: string; tags: string[] }) {
  const [currentTags, setCurrentTags] = useState(tags)
  const [newTag, setNewTag] = useState('')
  const [adding, setAdding] = useState(false)
  const [showInput, setShowInput] = useState(false)
  const router = useRouter()

  async function handleAdd() {
    if (!newTag.trim()) return
    setAdding(true)
    try {
      const res = await fetch('/api/admin/podcast/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_id: leadId, tag: newTag.trim() }),
      })
      if (res.ok) {
        setCurrentTags([...currentTags, newTag.trim()])
        setNewTag('')
        setShowInput(false)
        router.refresh()
      }
    } finally {
      setAdding(false)
    }
  }

  async function handleRemove(tag: string) {
    const res = await fetch('/api/admin/podcast/tags', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lead_id: leadId, tag }),
    })
    if (res.ok) {
      setCurrentTags(currentTags.filter((t) => t !== tag))
      router.refresh()
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {currentTags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-brand-gradient-end/10 text-brand-gradient-end"
          >
            {tag}
            <button
              onClick={() => handleRemove(tag)}
              className="hover:text-red-500 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}

        {showInput ? (
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setShowInput(false) }}
              placeholder="Tag name..."
              autoFocus
              className="w-32 px-2.5 py-1 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-gradient-end"
            />
            <button
              onClick={handleAdd}
              disabled={adding || !newTag.trim()}
              className="px-2 py-1 bg-brand-gradient-end text-white rounded-lg text-xs font-medium disabled:opacity-50"
            >
              Add
            </button>
            <button
              onClick={() => { setShowInput(false); setNewTag('') }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowInput(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs text-gray-400 border border-dashed border-gray-300 hover:border-gray-400 hover:text-gray-600 transition-colors"
          >
            <Plus className="w-3 h-3" /> Add tag
          </button>
        )}
      </div>
    </div>
  )
}
