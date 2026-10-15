import type { Locale } from '@/i18n/routing'
import { latestRelease } from '@/lib/releases'
import type { ReleaseAsset } from '@/lib/releases/types'
import { site } from '@/lib/site'
import { appFacts } from './app-facts'
import { brand } from './brand'
import { absoluteUrl } from './urls'

type JsonLd = Record<string, unknown>
const CONTEXT = 'https://schema.org'

/**
 * `@id` ổn định nối thực thể của mọi trang thành một đồ thị (spec §9.1). Tổ chức lấy id trên site của công ty, như DocOps:
 * agentra.io.vn là trang chính thức của Agentra JSC, nên mọi sản phẩm của công ty trỏ về cùng một thực thể.
 */
export const ids = {
  organization: () => `${site.companyUrl}/#organization`,
  website: () => `${site.siteUrl()}/#website`,
  software: () => `${site.siteUrl()}/#software`,
  webpage: (url: string) => `${url}#webpage`,
  article: (url: string) => `${url}#article`,
}

/** Logo vuông PNG 180×180 (Google không nhận SVG làm logo): file convention app/apple-icon.png. */
const logo = () => ({ '@type': 'ImageObject', url: `${site.siteUrl()}/apple-icon.png`, width: 180, height: 180 })

/** Tổ chức ghi đủ tên và logo: validator chỉ đọc một trang, không theo `@id` sang trang khác. */
function publisher(): JsonLd {
  return { '@type': 'Organization', '@id': ids.organization(), name: site.company, url: site.companyUrl, logo: logo() }
}

const isPartOf = () => ({ '@type': 'WebSite', '@id': ids.website(), name: brand.name, url: absoluteUrl('vi', '/') })

/** Hệ điều hành theo app-facts, ví dụ "macOS 12+ (Apple Silicon, Intel), Windows 10 22H2+ (x64)". */
export function operatingSystems(): string {
  const { macos, windows } = appFacts.platforms
  return `macOS ${appFacts.minOs.macos}+ (${macos.join(', ')}), Windows ${appFacts.minOs.windows}+ (${windows.join(', ')})`
}

export function organization(locale: Locale): JsonLd {
  return {
    '@context': CONTEXT,
    '@type': 'Organization',
    '@id': ids.organization(),
    name: site.company,
    alternateName: 'Agentra',
    url: site.companyUrl,
    logo: logo(),
    description: brand.organization[locale],
    email: site.email,
    address: { '@type': 'PostalAddress', addressLocality: site.city[locale], addressCountry: 'VN' },
    contactPoint: [{ '@type': 'ContactPoint', email: site.email, contactType: 'customer support', availableLanguage: ['vi', 'en'] }],
    // Chỉ hồ sơ có thật (OQ-R3); rỗng thì bỏ hẳn khoá.
    ...(brand.sameAs.length ? { sameAs: brand.sameAs } : {}),
  }
}

export function website(locale: Locale): JsonLd {
  return {
    '@context': CONTEXT,
    '@type': 'WebSite',
    '@id': ids.website(),
    url: absoluteUrl('vi', '/'),
    name: brand.name,
    alternateName: brand.alternateName,
    description: brand.description[locale],
    inLanguage: ['vi', 'en'],
    publisher: { '@id': ids.organization() },
  }
}

/**
 * Ứng dụng: phiên bản và ngày từ feed. Không `offers`, không `aggregateRating`: giá theo báo giá, chưa có đánh giá thật.
 * Giao diện app là tiếng Việt nên `inLanguage` luôn 'vi'. `featureList` chỉ gồm tính năng v1 (brand.features).
 */
export function softwareApplication(assets: ReleaseAsset[], locale: Locale): JsonLd {
  const latest = latestRelease(assets)
  return {
    '@context': CONTEXT,
    '@type': 'SoftwareApplication',
    '@id': ids.software(),
    name: brand.name,
    alternateName: brand.alternateName,
    url: absoluteUrl(locale, '/'),
    description: brand.description[locale],
    disambiguatingDescription: brand.disambiguation[locale],
    applicationCategory: 'EducationalApplication',
    applicationSubCategory: brand.category[locale],
    operatingSystem: operatingSystems(),
    inLanguage: 'vi',
    featureList: brand.features[locale],
    audience: { '@type': 'Audience', audienceType: brand.audience[locale] },
    downloadUrl: absoluteUrl(locale, '/download'),
    // Trung tâm hướng dẫn (spec §9.1)
    softwareHelp: { '@type': 'CreativeWork', url: absoluteUrl(locale, '/docs') },
    publisher: publisher(),
    // Không rõ ngày phát hành ('') thì bỏ datePublished thay vì khai chuỗi rỗng.
    ...(latest ? { softwareVersion: latest.version, ...(latest.releaseDate ? { datePublished: latest.releaseDate.slice(0, 10) } : {}) } : {}),
  }
}

/** Trang cấp và trang chủ đề: nói rõ chủ đề (`about`), sản phẩm được nhắc tới (`mentions`) và thuộc site nào. */
export function webPage(input: {
  url: string
  name: string
  description: string
  locale: Locale
  about?: string
  keywords?: string[]
  image?: string
  dateModified?: string
}): JsonLd {
  return {
    '@context': CONTEXT,
    '@type': 'WebPage',
    '@id': ids.webpage(input.url),
    url: input.url,
    name: input.name,
    description: input.description,
    inLanguage: input.locale,
    ...(input.about ? { about: { '@type': 'Thing', name: input.about } } : {}),
    ...(input.keywords?.length ? { keywords: input.keywords.join(', ') } : {}),
    ...(input.image ? { primaryImageOfPage: { '@type': 'ImageObject', url: input.image } } : {}),
    ...(input.dateModified ? { dateModified: input.dateModified } : {}),
    isPartOf: isPartOf(),
    mentions: { '@type': 'SoftwareApplication', '@id': ids.software(), name: brand.name, url: absoluteUrl(input.locale, '/') },
    publisher: publisher(),
  }
}

/** Bài hướng dẫn. Thay HowTo: Google ngừng rich result HowTo từ 2023 (spec §7.4). */
export function techArticle(input: { url: string; headline: string; description: string; locale: Locale; dateModified: string; section: string; image: string }): JsonLd {
  return {
    '@context': CONTEXT,
    '@type': 'TechArticle',
    '@id': ids.article(input.url),
    url: input.url,
    mainEntityOfPage: input.url,
    headline: input.headline,
    description: input.description,
    inLanguage: input.locale,
    dateModified: input.dateModified,
    articleSection: input.section,
    image: input.image,
    isPartOf: isPartOf(),
    about: { '@type': 'SoftwareApplication', '@id': ids.software(), name: brand.name },
    author: publisher(),
    publisher: publisher(),
  }
}

/** Mục lục hướng dẫn. */
export function collectionPage(input: { url: string; name: string; description: string; locale: Locale; items: Array<{ name: string; url: string }> }): JsonLd {
  return {
    '@context': CONTEXT,
    '@type': 'CollectionPage',
    '@id': ids.webpage(input.url),
    url: input.url,
    name: input.name,
    description: input.description,
    inLanguage: input.locale,
    isPartOf: isPartOf(),
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: input.items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, url: it.url })),
    },
  }
}

export function faqPage(items: Array<{ q: string; a: string }>): JsonLd {
  return {
    '@context': CONTEXT,
    '@type': 'FAQPage',
    mainEntity: items.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
  }
}

export function breadcrumb(items: Array<{ name: string; url: string }>): JsonLd & { itemListElement: unknown[] } {
  return {
    '@context': CONTEXT,
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: it.url })),
  }
}
