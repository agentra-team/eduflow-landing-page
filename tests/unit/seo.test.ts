import { beforeAll, expect, test, vi } from 'vitest'

vi.mock('@/lib/releases/feed', () => ({ fetchFeed: async () => null }))

beforeAll(() => {
  process.env.NEXT_PUBLIC_SITE_URL = 'https://eduflow.test'
})

test('absoluteUrl localizes slugs and prefixes', async () => {
  const { absoluteUrl } = await import('@/lib/seo/urls')
  expect(absoluteUrl('vi', '/')).toBe('https://eduflow.test')
  expect(absoluteUrl('en', '/')).toBe('https://eduflow.test/en')
  expect(absoluteUrl('vi', '/k12')).toBe('https://eduflow.test/ai-cho-giao-vien')
  expect(absoluteUrl('en', '/university')).toBe('https://eduflow.test/en/ai-for-lecturers')
  expect(absoluteUrl('vi', '/pricing')).toBe('https://eduflow.test/cach-tinh-phi')
  expect(absoluteUrl('en', '/docs/[slug]', { slug: 'install-macos' })).toBe('https://eduflow.test/en/docs/install-macos')
  expect(absoluteUrl('vi', '/docs')).toBe('https://eduflow.test/huong-dan')
})

test('buildMetadata takes the SEO copy from the page registry, with per-language params', async () => {
  const { buildMetadata } = await import('@/lib/seo/metadata')
  const m = buildMetadata({ locale: 'en', page: '/pricing', seo: { title: 'Pricing', description: 'd' } })
  expect(m.title).toBe('Pricing')
  expect(m.alternates?.canonical).toBe('https://eduflow.test/en/pricing')
  expect(m.alternates?.languages).toEqual({
    vi: 'https://eduflow.test/cach-tinh-phi',
    en: 'https://eduflow.test/en/pricing',
    'x-default': 'https://eduflow.test/cach-tinh-phi',
  })
  expect(m.openGraph).toMatchObject({ locale: 'en_US', siteName: 'EduFlow', url: 'https://eduflow.test/en/pricing' })
  expect(m.openGraph?.images).toEqual([{ url: 'https://eduflow.test/en/opengraph-image', width: 1200, height: 630, alt: 'Pricing' }])
  expect(buildMetadata({ locale: 'vi', page: '/', seo: { title: 'T', description: 'd', absoluteTitle: true } }).title).toEqual({ absolute: 'T' })
  expect(buildMetadata({ locale: 'en', page: '/pricing', seo: { title: 'Install', description: 'd', titleSuffix: ' · EduFlow Docs' } }).title).toEqual({
    absolute: 'Install · EduFlow Docs',
  })
  // Slug khác nhau giữa hai ngôn ngữ (bài hướng dẫn): canonical và hreflang dùng đúng params của từng ngôn ngữ.
  const d = buildMetadata({ locale: 'vi', page: '/docs/[slug]', params: { vi: { slug: 'cai-dat-macos' }, en: { slug: 'install-macos' } }, seo: { title: 'X', description: 'd' } })
  expect(d.alternates?.canonical).toBe('https://eduflow.test/huong-dan/cai-dat-macos')
  expect(d.alternates?.languages).toMatchObject({ en: 'https://eduflow.test/en/docs/install-macos' })
  expect(buildMetadata({ locale: 'vi', page: '/download', seo: { title: 'T', description: 'd' } }).openGraph?.images).toEqual([
    { url: 'https://eduflow.test/download/opengraph-image', width: 1200, height: 630, alt: 'T' },
  ])
})

test('the sitemap lists every indexable page in both languages, with hreflang', async () => {
  const { default: sitemap } = await import('@/app/sitemap')
  const { indexablePages, pageUrl } = await import('@/lib/seo/pages')
  const entries = await sitemap()
  const expected = indexablePages().flatMap((p) => [pageUrl(p, 'vi'), pageUrl(p, 'en')])
  expect(entries.map((e) => e.url).sort()).toEqual([...expected].sort())
  expect(new Set(expected).size).toBe(expected.length)
  const dl = entries.find((e) => e.url.endsWith('/tai-ve'))!
  expect(dl.alternates?.languages).toEqual({ vi: 'https://eduflow.test/tai-ve', en: 'https://eduflow.test/en/download', 'x-default': 'https://eduflow.test/tai-ve' })
})
