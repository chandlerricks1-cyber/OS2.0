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

// Before/after comparison — same company, scripted brand video vs POV content.
// Shown in the proof section (replaces the old reel placeholders). These play
// with sound so visitors can feel the difference.
export interface BeforeAfterClip {
  src: string
  kind: 'before' | 'after'
  /** Header label, e.g. "Before · Scripted brand video". */
  badge: string
  /** Setup → punchline caption above the clip. */
  hook: { setup: string; punch: string }
  /** Instagram-style engagement shown on the post. */
  stats: { views: string; likes: string; leads: string }
  /** The key differences called out as overlays on the clip. */
  points: string[]
}

export const BEFORE_AFTER: { before: BeforeAfterClip; after: BeforeAfterClip } = {
  before: {
    src: '/pov-examples/before-scripted.mp4',
    kind: 'before',
    badge: 'Before · Scripted brand video',
    hook: {
      setup: 'This is a good video, right?',
      punch: 'Wrong.',
    },
    stats: { views: '761', likes: '3', leads: '0' },
    points: ['Zero engagement', 'No organic growth', 'No lead potential'],
  },
  after: {
    src: '/pov-examples/after-pov.mp4',
    kind: 'after',
    badge: 'After · POV content',
    hook: {
      setup: 'Same company. One change — POV.',
      punch: 'Here’s what happened.',
    },
    stats: { views: '156K', likes: '6,293', leads: '71' },
    points: ['Authentic engagement platforms love', 'Free brand awareness', 'Views = leads'],
  },
}

/**
 * Returns `count` examples for a given page, rotated by `offset` so different
 * landing pages lead with different reels. Wraps around the full list.
 */
export function rotatedExamples(offset: number, count = 3): PovExample[] {
  // Only feature clips that have engagement chips — that section is social
  // proof, so a clip with no numbers would look broken. Fall back to the full
  // list only if there aren't enough with stats.
  const withStats = POV_EXAMPLES.filter((e) => e.stats)
  const pool = withStats.length >= count ? withStats : POV_EXAMPLES
  const total = pool.length
  if (total === 0) return []
  const n = Math.min(count, total)
  // Step by 1 per page so adjacent avatars lead with a different clip.
  const start = ((offset % total) + total) % total
  return Array.from({ length: n }, (_, i) => pool[(start + i) % total])
}
