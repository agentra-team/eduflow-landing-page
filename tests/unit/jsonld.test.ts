import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { breadcrumb, collectionPage, faqPage, ids, organization, softwareApplication, techArticle, webPage, website } from '@/lib/seo/jsonld'
import { brand } from '@/lib/seo/brand'

const asset = {
  platform: 'windows-x64' as const,
  version: '1.0.0',
  fileName: 'EduFlow Setup 1.0.0.exe',
  url: 'https://feed.example.test/desktop/EduFlow%20Setup%201.0.0.exe',
  sizeBytes: 157058273,
  sha512: 'abc',
  releaseDate: '2026-10-01T02:00:00.000Z',
}

beforeEach(() => vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://eduflow.test'))
afterEach(() => vi.unstubAllEnvs())

const LOGO = { '@type': 'ImageObject', url: 'https://eduflow.test/apple-icon.png', width: 180, height: 180 }
const PUBLISHER = { '@type': 'Organization', '@id': 'https://agentra.io.vn/#organization', name: 'Agentra JSC', url: 'https://agentra.io.vn', logo: LOGO }
const IS_PART_OF = { '@type': 'WebSite', '@id': 'https://eduflow.test/#website', name: 'EduFlow', url: 'https://eduflow.test' }

test('stable @ids tie every page into one graph', () => {
  expect(ids.organization()).toBe('https://agentra.io.vn/#organization')
  expect(ids.website()).toBe('https://eduflow.test/#website')
  expect(ids.software()).toBe('https://eduflow.test/#software')
  expect(ids.webpage('https://eduflow.test/tai-ve')).toBe('https://eduflow.test/tai-ve#webpage')
  expect(ids.article('https://eduflow.test/huong-dan/x')).toBe('https://eduflow.test/huong-dan/x#article')
})

test('organization', () => {
  expect(organization('vi')).toEqual({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://agentra.io.vn/#organization',
    name: 'Agentra JSC',
    alternateName: 'Agentra',
    url: 'https://agentra.io.vn',
    logo: LOGO,
    description: brand.organization.vi,
    email: 'info@agentra.io.vn',
    address: { '@type': 'PostalAddress', addressLocality: 'Đà Nẵng', addressCountry: 'VN' },
    contactPoint: [{ '@type': 'ContactPoint', email: 'info@agentra.io.vn', contactType: 'customer support', availableLanguage: ['vi', 'en'] }],
  })
})

test('website', () => {
  expect(website('en')).toEqual({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': 'https://eduflow.test/#website',
    url: 'https://eduflow.test',
    name: 'EduFlow',
    alternateName: 'Agentra EduFlow',
    description: brand.description.en,
    inLanguage: ['vi', 'en'],
    publisher: { '@id': 'https://agentra.io.vn/#organization' },
  })
})

test('softwareApplication describes the v1 app without offers or ratings', () => {
  expect(softwareApplication([asset], 'vi')).toEqual({
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': 'https://eduflow.test/#software',
    name: 'EduFlow',
    alternateName: 'Agentra EduFlow',
    url: 'https://eduflow.test',
    description: brand.description.vi,
    disambiguatingDescription: brand.disambiguation.vi,
    applicationCategory: 'EducationalApplication',
    applicationSubCategory: brand.category.vi,
    operatingSystem: 'macOS 12+ (Apple Silicon, Intel), Windows 10 22H2+ (x64)',
    inLanguage: 'vi',
    featureList: brand.features.vi,
    audience: { '@type': 'Audience', audienceType: brand.audience.vi },
    downloadUrl: 'https://eduflow.test/tai-ve',
    softwareHelp: { '@type': 'CreativeWork', url: 'https://eduflow.test/huong-dan-cai-dat/macos' },
    publisher: PUBLISHER,
    softwareVersion: '1.0.0',
    datePublished: '2026-10-01',
  })
  expect(softwareApplication([], 'en')).not.toHaveProperty('softwareVersion')
})

test('softwareApplication takes the newest of two assets, whatever the order, and skips a missing date', () => {
  const newer = { ...asset, platform: 'macos-arm64' as const, version: '1.0.1', releaseDate: '2026-10-03T02:00:00.000Z' }
  for (const assets of [[asset, newer], [newer, asset]]) expect(softwareApplication(assets, 'vi')).toMatchObject({ softwareVersion: '1.0.1', datePublished: '2026-10-03' })
  expect(softwareApplication([{ ...asset, releaseDate: '' }], 'vi')).not.toHaveProperty('datePublished')
})

test('webPage, techArticle and collectionPage point back to the site and the app', () => {
  expect(webPage({ url: 'https://eduflow.test/ai-cho-giao-vien', name: 'N', description: 'D', locale: 'vi', about: 'AI cho giáo viên' })).toEqual({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': 'https://eduflow.test/ai-cho-giao-vien#webpage',
    url: 'https://eduflow.test/ai-cho-giao-vien',
    name: 'N',
    description: 'D',
    inLanguage: 'vi',
    about: { '@type': 'Thing', name: 'AI cho giáo viên' },
    isPartOf: IS_PART_OF,
    mentions: { '@type': 'SoftwareApplication', '@id': 'https://eduflow.test/#software', name: 'EduFlow', url: 'https://eduflow.test' },
    publisher: PUBLISHER,
  })
  expect(
    techArticle({ url: 'https://eduflow.test/huong-dan/x', headline: 'H', description: 'D', locale: 'vi', dateModified: '2026-10-15', section: 'Bắt đầu', image: 'https://eduflow.test/og/docs/x' }),
  ).toEqual({
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    '@id': 'https://eduflow.test/huong-dan/x#article',
    url: 'https://eduflow.test/huong-dan/x',
    mainEntityOfPage: 'https://eduflow.test/huong-dan/x',
    headline: 'H',
    description: 'D',
    inLanguage: 'vi',
    dateModified: '2026-10-15',
    articleSection: 'Bắt đầu',
    image: 'https://eduflow.test/og/docs/x',
    isPartOf: IS_PART_OF,
    about: { '@type': 'SoftwareApplication', '@id': 'https://eduflow.test/#software', name: 'EduFlow' },
    author: PUBLISHER,
    publisher: PUBLISHER,
  })
  expect(collectionPage({ url: 'https://eduflow.test/huong-dan', name: 'N', description: 'D', locale: 'vi', items: [{ name: 'A', url: 'https://eduflow.test/huong-dan/a' }] })).toEqual({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': 'https://eduflow.test/huong-dan#webpage',
    url: 'https://eduflow.test/huong-dan',
    name: 'N',
    description: 'D',
    inLanguage: 'vi',
    isPartOf: IS_PART_OF,
    mainEntity: { '@type': 'ItemList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'A', url: 'https://eduflow.test/huong-dan/a' }] },
  })
})

test('faqPage and breadcrumb', () => {
  expect(faqPage([{ q: 'A?', a: 'B' }])).toEqual({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [{ '@type': 'Question', name: 'A?', acceptedAnswer: { '@type': 'Answer', text: 'B' } }],
  })
  expect(breadcrumb([{ name: 'Home', url: 'https://x' }, { name: 'Download', url: 'https://x/tai-ve' }])).toEqual({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://x' },
      { '@type': 'ListItem', position: 2, name: 'Download', item: 'https://x/tai-ve' },
    ],
  })
})
