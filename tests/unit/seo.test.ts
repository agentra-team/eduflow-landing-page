import { beforeAll, expect, test, vi } from 'vitest'

vi.mock('@/lib/releases/feed', () => ({ fetchFeed: async () => null }))

beforeAll(() => {
  process.env.NEXT_PUBLIC_SITE_URL = 'https://eduflow.test'
})

test('absoluteUrl localizes slugs and prefixes', async () => {
  const { absoluteUrl } = await import('@/lib/seo/urls')
  expect(absoluteUrl('vi', '/')).toBe('https://eduflow.test')
  expect(absoluteUrl('en', '/')).toBe('https://eduflow.test/en')
  expect(absoluteUrl('vi', '/k12')).toBe('https://eduflow.test/pho-thong')
  expect(absoluteUrl('en', '/university')).toBe('https://eduflow.test/en/university-courses')
  expect(absoluteUrl('vi', '/pricing')).toBe('https://eduflow.test/cach-tinh-phi')
  expect(absoluteUrl('en', '/install/[os]', { os: 'macos' })).toBe('https://eduflow.test/en/install/macos')
  expect(absoluteUrl('vi', '/install/[os]', { os: 'windows' })).toBe('https://eduflow.test/huong-dan-cai-dat/windows')
})

test('buildMetadata emits canonical + hreflang with x-default = vi', async () => {
  const { buildMetadata } = await import('@/lib/seo/metadata')
  const m = buildMetadata({ locale: 'en', page: '/pricing', title: 'Pricing', description: 'd' })
  expect(m.alternates?.canonical).toBe('https://eduflow.test/en/pricing')
  expect(m.alternates?.languages).toEqual({
    vi: 'https://eduflow.test/cach-tinh-phi',
    en: 'https://eduflow.test/en/pricing',
    'x-default': 'https://eduflow.test/cach-tinh-phi',
  })
  expect(m.openGraph).toMatchObject({ locale: 'en_US', siteName: 'EduFlow', url: 'https://eduflow.test/en/pricing' })
  expect(buildMetadata({ locale: 'vi', page: '/', title: 'T', description: 'd', absoluteTitle: true }).title).toEqual({ absolute: 'T' })
})

test('sitemap lists 24 urls (12 pages × 2 locales) with alternates', async () => {
  const { default: sitemap } = await import('@/app/sitemap')
  const entries = await sitemap()
  expect(entries).toHaveLength(24)
  const urls = entries.map((e) => e.url)
  for (const u of ['https://eduflow.test', 'https://eduflow.test/pho-thong', 'https://eduflow.test/en/program-review', 'https://eduflow.test/cach-tinh-phi', 'https://eduflow.test/en/install/windows']) {
    expect(urls).toContain(u)
  }
  const dl = entries.find((e) => e.url.endsWith('/tai-ve'))!
  expect(dl.alternates?.languages).toMatchObject({ en: 'https://eduflow.test/en/download', 'x-default': 'https://eduflow.test/tai-ve' })
})
