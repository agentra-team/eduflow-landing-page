import { afterEach, expect, test, vi } from 'vitest'
import { site } from '@/lib/site'

afterEach(() => vi.unstubAllEnvs())

test('feedUrl is null when unset and gains a trailing slash when set', () => {
  vi.stubEnv('DOWNLOAD_FEED_URL', '')
  expect(site.feedUrl()).toBeNull()
  vi.stubEnv('DOWNLOAD_FEED_URL', 'https://feed.example.test/desktop')
  expect(site.feedUrl()).toBe('https://feed.example.test/desktop/')
})

test('siteUrl strips trailing slashes and defaults to localhost', () => {
  vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://eduflow.test//')
  expect(site.siteUrl()).toBe('https://eduflow.test')
  vi.stubEnv('NEXT_PUBLIC_SITE_URL', '')
  expect(site.siteUrl()).toBe('http://localhost:3000')
})
