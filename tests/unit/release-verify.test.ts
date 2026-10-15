import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'
import { expect, test } from 'vitest'
import { siteUrlFromEnv, verifyLive, versionProblems } from '@/scripts/release-verify.mjs'

const SHA = 'e'.repeat(40)
const EXPECTED = { version: '1.0.1', commit: SHA, environment: 'production' }
const json = (body: unknown, status = 200, headers: Record<string, string> = { 'x-robots-tag': 'noindex' }) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', ...headers } })
const home = (status = 200, headers: Record<string, string> = {}, html = '<html><head></head></html>') => new Response(html, { status, headers })

// Review Focus: dấu "/" cuối, khoảng trắng trong giá trị của Vercel.
test('the production site URL comes from the line vercel pull wrote, as a bare https origin', () => {
  expect(siteUrlFromEnv('NEXT_PUBLIC_SITE_URL="https://eduflow.agentra.io.vn/"')).toBe('https://eduflow.agentra.io.vn')
  expect(siteUrlFromEnv('VERCEL="1"\nNEXT_PUBLIC_SITE_URL=" https://eduflow.agentra.io.vn "\n')).toBe('https://eduflow.agentra.io.vn')
})

test('an empty, malformed or plain-http site URL stops the release', () => {
  expect(() => siteUrlFromEnv('')).toThrow(/đang trống/)
  expect(() => siteUrlFromEnv('NEXT_PUBLIC_SITE_URL=""')).toThrow(/đang trống/)
  expect(() => siteUrlFromEnv('NEXT_PUBLIC_SITE_URL="eduflow.agentra.io.vn"')).toThrow(/không phải URL/)
  expect(() => siteUrlFromEnv('NEXT_PUBLIC_SITE_URL="http://eduflow.agentra.io.vn"')).toThrow(/https/)
})

test('version.json must carry exactly the version, the commit and production', () => {
  expect(versionProblems(EXPECTED, EXPECTED)).toEqual([])
  expect(versionProblems({ ...EXPECTED, version: '1.0.0' }, EXPECTED)).toEqual(['version là "1.0.0", cần "1.0.1"'])
  expect(versionProblems({ ...EXPECTED, environment: 'preview', commit: null }, EXPECTED)).toHaveLength(2)
  expect(versionProblems(null, EXPECTED)).toEqual(['/version.json không phải một đối tượng JSON'])
})

test('retries until the domain serves the new release, then checks the home page', async () => {
  const answers = [new Response('', { status: 404 }), json({ ...EXPECTED, version: '1.0.0' }), json(EXPECTED), home()]
  const urls: string[] = []
  const fetchImpl = (async (url: string) => {
    urls.push(url)
    return answers.shift()
  }) as unknown as typeof fetch
  const lines: string[] = []
  await verifyLive({ siteUrl: 'https://eduflow.agentra.io.vn', expected: EXPECTED, fetchImpl, wait: async () => {}, log: (l: string) => lines.push(l) })
  expect(urls).toEqual([
    'https://eduflow.agentra.io.vn/version.json',
    'https://eduflow.agentra.io.vn/version.json',
    'https://eduflow.agentra.io.vn/version.json',
    'https://eduflow.agentra.io.vn/',
  ])
  expect(lines).toEqual(['Lần 1/20: /version.json trả HTTP 404', 'Lần 2/20: version là "1.0.0", cần "1.0.1"'])
})

test('gives up after the last attempt with the last problem, counting network errors as attempts', async () => {
  const fetchImpl = (async () => {
    throw new Error('ECONNREFUSED')
  }) as unknown as typeof fetch
  await expect(
    verifyLive({ siteUrl: 'https://x.test', expected: EXPECTED, fetchImpl, wait: async () => {}, attempts: 3, log: () => {} }),
  ).rejects.toThrow(/chưa đúng sau 3 lần thử: không gọi được https:\/\/x\.test: ECONNREFUSED/)
})

test('a broken home page fails the check even when version.json is right', async () => {
  const fetchImpl = (async (url: string) => (url.endsWith('/version.json') ? json(EXPECTED) : home(500))) as unknown as typeof fetch
  await expect(
    verifyLive({ siteUrl: 'https://x.test', expected: EXPECTED, fetchImpl, wait: async () => {}, attempts: 1, log: () => {} }),
  ).rejects.toThrow(/trang chủ trả HTTP 500/)
})

// Bằng chứng trên domain thật: noindex của /version.json mới chỉ được kiểm trên `next start`.
test('the live version.json must carry noindex', async () => {
  const fetchImpl = (async (url: string) => (url.endsWith('/version.json') ? json(EXPECTED, 200, {}) : home())) as unknown as typeof fetch
  await expect(
    verifyLive({ siteUrl: 'https://x.test', expected: EXPECTED, fetchImpl, wait: async () => {}, attempts: 1, log: () => {} }),
  ).rejects.toThrow(/X-Robots-Tag của \/version\.json là "", cần chứa noindex/)
})

test('the home page must stay indexable, in the header and in the meta tag', async () => {
  const run = (response: Response) =>
    verifyLive({
      siteUrl: 'https://x.test',
      expected: EXPECTED,
      fetchImpl: (async (url: string) => (url.endsWith('/version.json') ? json(EXPECTED) : response.clone())) as unknown as typeof fetch,
      wait: async () => {},
      attempts: 1,
      log: () => {},
    })
  await expect(run(home(200, { 'x-robots-tag': 'noindex, nofollow' }))).rejects.toThrow(/trang chủ mang noindex trong header/)
  await expect(run(home(200, {}, '<meta name="robots" content="noindex">'))).rejects.toThrow(/trang chủ mang noindex trong thẻ meta/)
  await expect(run(home(200, {}, '<meta name="robots" content="index, follow">'))).resolves.toBeUndefined()
})

test('the CLI stops with ::error:: when Production has no site URL', () => {
  const r = spawnSync(process.execPath, [resolve('scripts/release-verify.mjs'), 'NEXT_PUBLIC_SITE_URL=""', '1.0.1', SHA], { encoding: 'utf8' })
  expect(r.status).toBe(1)
  expect(r.stdout).toMatch(/^::error::NEXT_PUBLIC_SITE_URL của môi trường Production trên Vercel đang trống/m)
})

test('the CLI never lets a hostile value break out of the ::error:: line', () => {
  const r = spawnSync(process.execPath, [resolve('scripts/release-verify.mjs'), 'NEXT_PUBLIC_SITE_URL="foo\n::set-output name=x::y"', '1.0.1', SHA], {
    encoding: 'utf8',
  })
  expect(r.status).toBe(1)
  expect(r.stdout.trim().split('\n')).toHaveLength(1)
  expect(r.stdout).toMatch(/^::error::.*phải là https/)
})
