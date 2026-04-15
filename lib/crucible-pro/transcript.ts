import type { TranscriptSegment } from '@/types/cruciblePro'

// Parse a pasted transcript. Supports:
// - WEBVTT / VTT (HH:MM:SS.mmm --> HH:MM:SS.mmm)
// - SRT (HH:MM:SS,mmm --> HH:MM:SS,mmm)
// - Zoom-style "Speaker Name   00:05:12" lines
// - Fallback: split on blank lines, no timestamps
export function parseTranscript(raw: string): TranscriptSegment[] | null {
  if (!raw || !raw.trim()) return null

  const trimmed = raw.trim()

  if (/^WEBVTT/i.test(trimmed) || /-->/.test(trimmed)) {
    const segments = parseVttOrSrt(trimmed)
    if (segments.length > 0) return segments
  }

  const zoomSegments = parseZoomStyle(trimmed)
  if (zoomSegments.length > 0) return zoomSegments

  // Fallback: paragraph splits, no timestamps
  return trimmed
    .split(/\n\s*\n/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((text) => ({ start_seconds: 0, speaker: null, text }))
}

function parseVttOrSrt(raw: string): TranscriptSegment[] {
  const cueRegex =
    /(\d{1,2}:\d{2}:\d{2}[.,]\d{1,3})\s*-->\s*(\d{1,2}:\d{2}:\d{2}[.,]\d{1,3})([^\n]*)\n([\s\S]*?)(?=\n\s*\n|\n\d{1,2}:\d{2}:\d{2}[.,]|\s*$)/g
  const segments: TranscriptSegment[] = []
  let match: RegExpExecArray | null
  while ((match = cueRegex.exec(raw)) !== null) {
    const start = timestampToSeconds(match[1])
    const text = match[4].trim()
    if (!text) continue
    const speakerMatch = text.match(/^<v\s+([^>]+)>/i) ?? text.match(/^([A-Z][^:]{1,60}):\s*/)
    const speaker = speakerMatch ? speakerMatch[1].trim() : null
    const cleaned = text.replace(/^<v\s+[^>]+>/i, '').replace(/<\/v>/gi, '').replace(/^[A-Z][^:]{1,60}:\s*/, '').trim()
    segments.push({ start_seconds: start, speaker, text: cleaned })
  }
  return segments
}

function parseZoomStyle(raw: string): TranscriptSegment[] {
  const lines = raw.split(/\r?\n/)
  const segments: TranscriptSegment[] = []
  let current: TranscriptSegment | null = null
  const headerRegex = /^([^\t]+?)\s+(\d{1,2}:\d{2}:\d{2})\s*$/
  const timestampLine = /^(\d{1,2}:\d{2}:\d{2})\s*$/
  let pendingSpeaker: string | null = null
  let pendingStart: number | null = null

  for (const line of lines) {
    const header = line.match(headerRegex)
    if (header) {
      if (current) segments.push(current)
      current = {
        start_seconds: timestampToSeconds(header[2]),
        speaker: header[1].trim(),
        text: '',
      }
      continue
    }
    const tsOnly = line.match(timestampLine)
    if (tsOnly) {
      pendingStart = timestampToSeconds(tsOnly[1])
      continue
    }
    if (pendingStart != null && !current) {
      current = { start_seconds: pendingStart, speaker: pendingSpeaker, text: line.trim() }
      pendingStart = null
      pendingSpeaker = null
      continue
    }
    if (current) {
      current.text = (current.text ? current.text + ' ' : '') + line.trim()
    }
  }
  if (current && current.text) segments.push(current)
  return segments.filter((s) => s.text)
}

function timestampToSeconds(ts: string): number {
  const parts = ts.replace(',', '.').split(':')
  if (parts.length !== 3) return 0
  const [h, m, s] = parts
  return Number(h) * 3600 + Number(m) * 60 + Number(s)
}

export function formatSeconds(total: number): string {
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = Math.floor(total % 60)
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}
