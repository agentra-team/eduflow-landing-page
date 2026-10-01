import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import sitemap from '@/app/sitemap'

// Tệp riêng: seo.test.ts đã giả fetchFeed trả null, còn ở đây feed cần đổi theo từng ca.
const feeds = vi.hoisted(() => ({ windows: null as unknown, mac: null as unknown }))
vi.mock('@/lib/releases/feed', () => ({
  fetchFeed: async (url: string) => (url.endsWith('latest-mac.yml') ? feeds.mac : feeds.windows),
}))

const DOWNLOAD_URLS = ['https://eduflow.test/tai-ve', 'https://eduflow.test/en/download']
const RELEASE_DATE = '2026-10-01T02:00:00.000Z'

function publish(releaseDate: string) {
  const file = (url: string) => ({ url, sha512: 'abc', size: 1 })
  feeds.windows = { version: '1.0.0', releaseDate, path: 'EduFlow Setup 1.0.0.exe', files: [file('EduFlow Setup 1.0.0.exe')] }
  feeds.mac = { version: '1.0.0', releaseDate, files: [file('EduFlow-1.0.0-arm64.dmg'), file('EduFlow-1.0.0.dmg')] }
}

// Có khoá lastModified (kể cả giá trị undefined) là có.
const dated = (entries: Awaited<ReturnType<typeof sitemap>>) => entries.filter((e) => 'lastModified' in e)

beforeEach(() => {
  vi.stubEnv('DOWNLOAD_FEED_URL', 'https://feed.example.test/desktop')
  vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://eduflow.test')
  feeds.windows = null
  feeds.mac = null
})
afterEach(() => vi.unstubAllEnvs())

test('only the Download entries carry lastModified, from the feed release date', async () => {
  publish(RELEASE_DATE)
  const entries = await sitemap()
  expect(entries).toHaveLength(24)
  expect(dated(entries).map((e) => e.url).sort()).toEqual([...DOWNLOAD_URLS].sort())
  for (const e of dated(entries)) expect(e.lastModified).toEqual(new Date(RELEASE_DATE))
})

test('an unparseable release date gives no lastModified instead of an Invalid Date', async () => {
  publish('not a date')
  const entries = await sitemap()
  expect(entries).toHaveLength(24)
  expect(dated(entries)).toEqual([])
})

test('a feed that is down leaves every entry without lastModified', async () => {
  const entries = await sitemap()
  expect(entries).toHaveLength(24)
  expect(dated(entries)).toEqual([])
})
