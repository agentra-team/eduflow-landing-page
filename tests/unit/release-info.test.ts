import { readFileSync } from 'node:fs'
import { afterEach, expect, test, vi } from 'vitest'
import { dynamic, GET } from '@/app/version.json/route'
import sitemap from '@/app/sitemap'
import { buildInfo } from '@/lib/release'

// Sitemap không đọc feed hay snapshot thật trong test này.
vi.mock('@/lib/releases/feed', () => ({ fetchFeed: async () => null }))
vi.mock('@/lib/releases/snapshot', () => ({ releaseSnapshot: { baseUrl: null, windows: null, mac: null } }))

const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as { version: string }
const SHA = '0123456789abcdef0123456789abcdef01234567'

afterEach(() => vi.unstubAllEnvs())

test('build info carries the package version, the commit and the Vercel environment of the build', () => {
  expect(buildInfo({ VERCEL_GIT_COMMIT_SHA: SHA, VERCEL_ENV: 'production' }, '1.2.3')).toEqual({ version: '1.2.3', commit: SHA, environment: 'production' })
  expect(buildInfo({}).version).toBe(pkg.version)
})

test('a build outside Vercel, or with a malformed commit, reports null rather than a guess', () => {
  expect(buildInfo({}, '1.0.0')).toEqual({ version: '1.0.0', commit: null, environment: null })
  for (const bad of ['', 'abc123', SHA.toUpperCase(), `${SHA}0`]) expect(buildInfo({ VERCEL_GIT_COMMIT_SHA: bad }, '1.0.0').commit).toBeNull()
  expect(buildInfo({ VERCEL_GIT_COMMIT_SHA: ` ${SHA}\n` }, '1.0.0').commit).toBe(SHA)
  expect(buildInfo({ VERCEL_ENV: '  ' }, '1.0.0').environment).toBeNull()
})

test('/version.json is static JSON that search engines must not index', async () => {
  vi.stubEnv('VERCEL_GIT_COMMIT_SHA', SHA)
  vi.stubEnv('VERCEL_ENV', 'preview')
  const res = GET()
  expect(dynamic).toBe('force-static')
  expect(res.headers.get('x-robots-tag')).toBe('noindex')
  expect(res.headers.get('content-type')).toContain('application/json')
  expect(await res.json()).toEqual({ version: pkg.version, commit: SHA, environment: 'preview' })
})

test('the sitemap does not list /version.json', async () => {
  const urls = (await sitemap()).map((e) => e.url)
  expect(urls.length).toBeGreaterThan(0)
  expect(urls.filter((u) => new URL(u).pathname === '/version.json')).toEqual([])
})
