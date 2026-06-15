import { notFound } from 'next/navigation'
import type { Metadata, Viewport } from 'next'
import { AVATAR_SLUGS, getAvatar } from '@/lib/pov-pro/avatars'
import { BRAND_THEME_COLOR } from '@/lib/pov-pro/constants'
import { PovProLanding } from '@/components/pov-pro/PovProLanding'

// Static-generate one page per avatar; unknown slugs 404.
export const dynamicParams = false

export const viewport: Viewport = {
  themeColor: BRAND_THEME_COLOR,
}

export function generateStaticParams() {
  return AVATAR_SLUGS.map((avatar) => ({ avatar }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ avatar: string }>
}): Promise<Metadata> {
  const { avatar: slug } = await params
  const avatar = getAvatar(slug)
  if (!avatar) return {}

  const { meta } = avatar
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: `/pov-pro/${slug}` },
    openGraph: {
      title: meta.ogTitle ?? meta.title,
      description: meta.ogDescription ?? meta.description,
      type: 'website',
      siteName: 'Crucible',
      ...(meta.ogImage ? { images: [{ url: meta.ogImage }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.ogTitle ?? meta.title,
      description: meta.ogDescription ?? meta.description,
      ...(meta.ogImage ? { images: [meta.ogImage] } : {}),
    },
  }
}

export default async function PovProAvatarPage({
  params,
}: {
  params: Promise<{ avatar: string }>
}) {
  const { avatar: slug } = await params
  const avatar = getAvatar(slug)
  if (!avatar) notFound()

  return <PovProLanding avatar={avatar} />
}
