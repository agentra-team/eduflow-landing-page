import { expect, test } from 'vitest'
import { routing, type PageKey } from '@/i18n/routing'
import { headerRules, LEGACY_REDIRECTS, redirectRules } from '@/lib/next-routes'
import { localizedPath } from '@/lib/seo/urls'

// Đường dẫn công khai hiện tại của mọi trang tĩnh, hai ngôn ngữ.
const current = () =>
  new Set(
    (Object.keys(routing.pathnames) as PageKey[])
      .filter((k) => !k.includes('['))
      .flatMap((k) => routing.locales.map((l) => localizedPath(l, k))),
  )

test('legacy redirects point at live paths and never at another redirect', () => {
  const live = current()
  const sources = new Set(LEGACY_REDIRECTS.map((r) => r.source))
  for (const { source, destination } of LEGACY_REDIRECTS) {
    expect(live.has(source), `${source} vẫn là đường dẫn sống`).toBe(false)
    expect(sources.has(destination), `${destination} lại là nguồn chuyển hướng`).toBe(false)
  }
  for (const r of LEGACY_REDIRECTS.filter((r) => !r.destination.includes('/huong-dan/') && !r.destination.includes('/docs/'))) {
    expect(live.has(r.destination), r.destination).toBe(true)
  }
})

test('legacy redirects are permanent (308)', () => {
  // Đếm để một danh sách rỗng không thể qua.
  expect(redirectRules({})).toHaveLength(LEGACY_REDIRECTS.length)
  for (const rule of redirectRules({})) expect(rule.permanent).toBe(true)
})

test('only a production build sends *.vercel.app to the canonical domain', () => {
  const env = { NEXT_PUBLIC_SITE_URL: 'https://eduflow.agentra.io.vn/' }
  const host = (rules: ReturnType<typeof redirectRules>) => rules.filter((r) => r.has?.some((h) => h.type === 'host'))
  expect(host(redirectRules({ ...env, VERCEL_ENV: 'production' }))).toEqual([
    { source: '/:path*', has: [{ type: 'host', value: '(?<host>.+)\\.vercel\\.app' }], destination: 'https://eduflow.agentra.io.vn/:path*', permanent: true },
  ])
  expect(host(redirectRules({ ...env, VERCEL_ENV: 'preview' }))).toEqual([])
  expect(host(redirectRules(env))).toEqual([])
})

test('previews carry X-Robots-Tag noindex, production does not', () => {
  const robots = (env: Record<string, string>) => headerRules(env).flatMap((r) => r.headers).filter((h) => h.key === 'X-Robots-Tag')
  expect(robots({ VERCEL_ENV: 'preview' })).toEqual([{ key: 'X-Robots-Tag', value: 'noindex' }])
  expect(robots({ VERCEL_ENV: 'production' })).toEqual([])
  expect(headerRules({}).flatMap((r) => r.headers).map((h) => h.key)).toContain('Strict-Transport-Security')
})
