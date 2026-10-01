import type { MetadataRoute } from 'next'
import { GUIDE_OS } from '@/content/install'
import { routing, type PageKey } from '@/i18n/routing'
import { getReleases, latestRelease } from '@/lib/releases'
import { absoluteUrl } from '@/lib/seo/urls'

/** Mọi trang × 2 ngôn ngữ, kèm hreflang; chỉ trang Tải về có lastmod: ngày phát hành hợp lệ từ feed lúc build (spec §9). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { assets } = await getReleases()
  const latest = latestRelease(assets)
  const entries: MetadataRoute.Sitemap = []
  const push = (page: PageKey, priority: number, params?: Record<string, string>, lastModified?: Date) => {
    const vi = absoluteUrl('vi', page, params)
    const en = absoluteUrl('en', page, params)
    for (const locale of routing.locales) {
      entries.push({
        url: locale === 'vi' ? vi : en,
        ...(lastModified ? { lastModified } : {}),
        changeFrequency: 'monthly',
        priority,
        alternates: { languages: { vi, en, 'x-default': vi } },
      })
    }
  }
  push('/', 1)
  push('/k12', 0.9)
  push('/university', 0.9)
  push('/program', 0.9)
  push('/assistant', 0.8)
  push('/pricing', 0.8)
  // Ngày feed hỏng thì bỏ lastmod: Invalid Date làm serializer của Next ném RangeError và hỏng build.
  const date = latest?.releaseDate ? new Date(latest.releaseDate) : undefined
  push('/download', 0.9, undefined, date && !Number.isNaN(date.getTime()) ? date : undefined)
  for (const os of GUIDE_OS) push('/install/[os]', 0.7, { os })
  push('/ai-transparency', 0.6)
  push('/contact', 0.6)
  push('/privacy', 0.3)
  return entries
}
