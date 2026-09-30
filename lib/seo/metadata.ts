import type { Metadata } from 'next'
import type { Locale, PageKey } from '@/i18n/routing'
import { site } from '@/lib/site'
import { absoluteUrl, localizedPath } from './urls'

/** Metadata chuẩn cho một trang: canonical, hreflang (x-default = vi), Open Graph, Twitter (spec §9). */
export function buildMetadata(opts: {
  locale: Locale
  page: PageKey
  params?: Record<string, string>
  title: string
  description: string
  /** Trang chủ: không nối template '· EduFlow'. */
  absoluteTitle?: boolean
}): Metadata {
  const { locale, page, params, title, description, absoluteTitle } = opts
  const url = absoluteUrl(locale, page, params)
  const vi = absoluteUrl('vi', page, params)
  const en = absoluteUrl('en', page, params)
  // Ảnh OG theo file convention nằm ở app/[locale]/opengraph-image.tsx (mọi trang) và
  // app/[locale]/download/opengraph-image.tsx (trang Tải về). URL ngoài: không tiền tố với vi, /en với en.
  const ogPath = `${localizedPath(locale, '/') === '/' ? '' : localizedPath(locale, '/')}${page === '/download' ? '/download' : ''}/opengraph-image`
  const ogImage = { url: `${site.siteUrl()}${ogPath}`, width: 1200, height: 630, alt: title }
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: url, languages: { vi, en, 'x-default': vi } },
    openGraph: {
      title,
      description,
      url,
      siteName: site.name,
      locale: locale === 'vi' ? 'vi_VN' : 'en_US',
      alternateLocale: locale === 'vi' ? 'en_US' : 'vi_VN',
      type: 'website',
      images: [ogImage],
    },
    twitter: { card: 'summary_large_image', title, description, images: [ogImage.url] },
  }
}
