import type { MetadataRoute } from 'next'
import { routing } from '@/i18n/routing'
import { getReleases, latestRelease } from '@/lib/releases'
import { indexablePages, pageUrl } from '@/lib/seo/pages'

/**
 * Mọi trang indexable × 2 ngôn ngữ, kèm hreflang (spec §9.1). lastmod chỉ từ ngày thật: ngày đổi nội dung (updatedAt), hoặc
 * ngày phát hành bản app cho trang chủ và Tải về khi feed có. Không bao giờ là ngày build. Không changefreq, không priority:
 * Google bỏ qua cả hai.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { assets } = await getReleases()
  const release = validDate(latestRelease(assets)?.releaseDate)
  return indexablePages().flatMap((p) => {
    const vi = pageUrl(p, 'vi')
    const en = pageUrl(p, 'en')
    const date = p.key === '/' || p.key === '/download' ? release : p.updatedAt ? new Date(`${p.updatedAt}T00:00:00+07:00`) : undefined
    return routing.locales.map((locale) => ({
      url: locale === 'vi' ? vi : en,
      ...(date ? { lastModified: date } : {}),
      alternates: { languages: { vi, en, 'x-default': vi } },
    }))
  })
}

// Ngày feed hỏng thì bỏ lastmod: Invalid Date làm serializer của Next ném RangeError và hỏng build.
function validDate(iso: string | undefined): Date | undefined {
  if (!iso) return undefined
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? undefined : d
}
