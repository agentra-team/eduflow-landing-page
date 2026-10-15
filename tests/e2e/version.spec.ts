import { readFileSync } from 'node:fs'
import { expect, test } from '@playwright/test'

const { version } = JSON.parse(readFileSync('package.json', 'utf8')) as { version: string }

// docs/van-hanh.md, mục 8: workflow Release đọc tệp này trên domain chính để biết bản vừa promote đã chạy.
test('/version.json names the version of the build, outside the locale routing and the index', async ({ request }) => {
  const res = await request.get('/version.json', { maxRedirects: 0 })
  expect(res.status()).toBe(200)
  expect(res.headers()['content-type']).toContain('application/json')
  expect(res.headers()['x-robots-tag']).toBe('noindex')
  const body = await res.json()
  expect(Object.keys(body).sort()).toEqual(['commit', 'environment', 'version'])
  expect(body.version).toBe(version)
  // Bản dựng ngoài Vercel không có commit; trường hợp có commit do unit test và job verify của workflow Release phủ.
  expect(body.commit).toBeNull()
})

test('/version.json is prerendered at build time, not rendered per request', () => {
  const manifest = JSON.parse(readFileSync('.next/prerender-manifest.json', 'utf8')) as { routes: Record<string, unknown> }
  expect(Object.keys(manifest.routes)).toContain('/version.json')
})
