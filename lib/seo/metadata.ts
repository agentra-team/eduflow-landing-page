import type { Metadata } from 'next'
import type { Locale, PageKey } from '@/i18n/routing'
import { DOC_SLUGS, type DocId } from '@/content/docs/slugs'
import { isTopicPage } from '@/content/topics'
import { site } from '@/lib/site'
import type { Seo } from './pages'
import { absoluteUrl } from './urls'

/** Trang có ảnh chia sẻ riêng theo file convention `opengraph-image.tsx` trong thư mục của trang: Tải về và các trang chủ đề; còn lại dùng ảnh của trang chủ. */
const OWN_OG_IMAGE = new Set<PageKey>(['/download'])

/** URL tuyệt đối của ảnh chia sẻ 1200×630 theo file convention: đường dẫn theo khoá nội bộ, không tiền tố với vi, /en với en. */
export function ogImageUrl(locale: Locale, page: PageKey): string {
  const prefix = locale === 'vi' ? '' : `/${locale}`
  return `${site.siteUrl()}${prefix}${OWN_OG_IMAGE.has(page) || isTopicPage(page) ? page : ''}/opengraph-image`
}

/** Ảnh chia sẻ của một bài hướng dẫn (app/og/docs/[slug]/route.tsx). */
export function docOgImageUrl(locale: Locale, id: DocId): string {
  return `${site.siteUrl()}/og/docs/${DOC_SLUGS[id][locale]}`
}

/** Metadata chuẩn của một trang: title từ sổ trang, canonical, hreflang (x-default = vi), Open Graph, Twitter (spec §9). */
export function buildMetadata(opts: { locale: Locale; page: PageKey; params?: Record<Locale, Record<string, string>>; seo: Seo; ogImage?: string }): Metadata {
  const { locale, page, params, seo } = opts
  const url = absoluteUrl(locale, page, params?.[locale])
  const vi = absoluteUrl('vi', page, params?.vi)
  const en = absoluteUrl('en', page, params?.en)
  const image = { url: opts.ogImage ?? ogImageUrl(locale, page), width: 1200, height: 630, alt: seo.title }
  const title = seo.absoluteTitle ? { absolute: seo.title } : seo.titleSuffix ? { absolute: `${seo.title}${seo.titleSuffix}` } : seo.title
  return {
    title,
    description: seo.description,
    alternates: { canonical: url, languages: { vi, en, 'x-default': vi } },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url,
      siteName: site.name,
      locale: locale === 'vi' ? 'vi_VN' : 'en_US',
      alternateLocale: locale === 'vi' ? 'en_US' : 'vi_VN',
      type: 'website',
      images: [image],
    },
    twitter: { card: 'summary_large_image', title: seo.title, description: seo.description, images: [image.url] },
  }
}
