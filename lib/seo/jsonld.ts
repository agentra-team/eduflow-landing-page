import type { Locale } from '@/i18n/routing'
import type { ReleaseAsset } from '@/lib/releases/types'
import { site } from '@/lib/site'

type JsonLd = Record<string, unknown>
const CONTEXT = 'https://schema.org'

export function organization(locale: Locale): JsonLd {
  return {
    '@context': CONTEXT,
    '@type': 'Organization',
    name: site.company,
    url: site.companyUrl,
    logo: `${site.siteUrl()}/icon.svg`,
    email: site.email,
    address: { '@type': 'PostalAddress', addressLocality: site.city[locale], addressCountry: 'VN' },
    contactPoint: [{ '@type': 'ContactPoint', email: site.email, contactType: 'customer support', availableLanguage: ['vi', 'en'] }],
  }
}

export function softwareApplication(assets: ReleaseAsset[], locale: Locale, downloadPageUrl: string): JsonLd {
  const newest = [...assets].sort((a, b) => b.releaseDate.localeCompare(a.releaseDate))[0]
  // Không khai `offers`: EduFlow không công bố giá (spec §9).
  return {
    '@context': CONTEXT,
    '@type': 'SoftwareApplication',
    name: site.name,
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'macOS 12+, Windows 10 22H2+',
    inLanguage: locale,
    downloadUrl: downloadPageUrl,
    publisher: { '@type': 'Organization', name: site.company, url: site.companyUrl },
    ...(newest ? { softwareVersion: newest.version, datePublished: newest.releaseDate.slice(0, 10) } : {}),
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

export function howTo(input: { name: string; description: string; steps: Array<{ name: string; text: string }> }): JsonLd {
  return {
    '@context': CONTEXT,
    '@type': 'HowTo',
    name: input.name,
    description: input.description,
    step: input.steps.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, name: s.name, text: s.text })),
  }
}
