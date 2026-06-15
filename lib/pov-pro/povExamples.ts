// Example POV reels shown under the hero so visitors instantly see what
// "POV content" means. Served from public/pov-examples (web-optimized, muted).
//
// To add the 6th (or more): drop a web-optimized .mp4 in public/pov-examples
// and add an entry here. The per-page rotation picks them up automatically.

/** Real engagement a clip earned. Omit for clips without confirmed numbers — no fakes. */
export interface PovExampleStats {
  views: string
  comments: string
  leads: string
}

export interface PovExample {
  /** Public path under /pov-examples. */
  src: string
  /** Short caption shown under the clip. */
  label: string
  /** Real engagement chips. Only rendered when present. */
  stats?: PovExampleStats
}

// Clips with confirmed engagement come first so the rotation leads with proof.
export const POV_EXAMPLES: PovExample[] = [
  {
    src: '/pov-examples/home-inspection-1.mp4',
    label: 'Home inspection',
    stats: { views: '19.1M', comments: '7,543', leads: '311' },
  },
  {
    src: '/pov-examples/roof-cleaning.mp4',
    label: 'Roof cleaning',
    stats: { views: '8.2M', comments: '4,475', leads: '273' },
  },
  {
    src: '/pov-examples/junk-removal.mp4',
    label: 'Junk removal',
    stats: { views: '7.6M', comments: '8,910', leads: '184' },
  },
  // TODO: add confirmed engagement stats for these two.
  { src: '/pov-examples/trash-bin-cleaning.mp4', label: 'Trash bin cleaning' },
  { src: '/pov-examples/home-inspection-2.mp4', label: 'Home inspection' },
  // { src: '/pov-examples/<sixth>.mp4', label: '<category>', stats: { ... } },
]

/**
 * Returns `count` examples for a given page, rotated by `offset` so different
 * landing pages lead with different reels. Wraps around the full list.
 */
export function rotatedExamples(offset: number, count = 3): PovExample[] {
  const total = POV_EXAMPLES.length
  if (total === 0) return []
  const n = Math.min(count, total)
  // Step by 2 per page so adjacent avatars don't share the same lead clip.
  const start = ((offset * 2) % total + total) % total
  return Array.from({ length: n }, (_, i) => POV_EXAMPLES[(start + i) % total])
}
