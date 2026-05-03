import { NextResponse, type NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/auth/requireAdmin'
import { uploadConversationFile } from '@/lib/ghl/conversations'

export const runtime = 'nodejs'
export const maxDuration = 30

const MAX_FILES = 5
const MAX_SIZE = 10 * 1024 * 1024 // 10MB total

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error

  const { id: conversationId } = await ctx.params

  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return NextResponse.json({ error: 'invalid multipart body' }, { status: 400 })
  }

  const files: File[] = []
  for (const value of form.getAll('files')) {
    if (value instanceof File) files.push(value)
  }
  if (files.length === 0) return NextResponse.json({ error: 'no files' }, { status: 400 })
  if (files.length > MAX_FILES) {
    return NextResponse.json({ error: `max ${MAX_FILES} files` }, { status: 400 })
  }
  const totalSize = files.reduce((acc, f) => acc + f.size, 0)
  if (totalSize > MAX_SIZE) {
    return NextResponse.json({ error: `combined size exceeds ${MAX_SIZE} bytes` }, { status: 400 })
  }

  const urls: string[] = []
  for (const file of files) {
    const buf = Buffer.from(await file.arrayBuffer())
    try {
      const res = await uploadConversationFile(conversationId, {
        name: file.name,
        type: file.type || 'application/octet-stream',
        buffer: buf,
      })
      const uploaded = res.uploadedFiles ?? {}
      // GHL returns object keyed by filename → URL
      for (const url of Object.values(uploaded)) {
        if (typeof url === 'string') urls.push(url)
      }
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : 'upload failed', urls },
        { status: 502 }
      )
    }
  }

  return NextResponse.json({ urls })
}
