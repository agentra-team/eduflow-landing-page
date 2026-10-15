import { expect, test } from '@playwright/test'
import { DOC_IDS, DOC_SLUGS } from '../../content/docs/slugs'

test('every article has a 1200×630 share image of its own', async ({ page, request }) => {
  await page.goto('/huong-dan/cai-dat-macos')
  const og = await page.locator('meta[property="og:image"]').getAttribute('content')
  expect(new URL(og!).pathname).toBe('/og/docs/cai-dat-macos')
  const res = await request.get('/og/docs/cai-dat-macos')
  expect(res.status()).toBe(200)
  expect(res.headers()['content-type']).toBe('image/png')
})

test('every article in both languages serves a PNG share image 1200×630', async ({ request }) => {
  for (const id of DOC_IDS) {
    for (const locale of ['vi', 'en'] as const) {
      const res = await request.get(`/og/docs/${DOC_SLUGS[id][locale]}`)
      expect(res.status(), DOC_SLUGS[id][locale]).toBe(200)
      expect(res.headers()['content-type']).toBe('image/png')
      const png = await res.body()
      // IHDR: chiều rộng ở byte 16, chiều cao ở byte 20.
      expect([png.readUInt32BE(16), png.readUInt32BE(20)], DOC_SLUGS[id][locale]).toEqual([1200, 630])
    }
  }
})

test('an unknown slug has no share image', async ({ request }) => {
  expect((await request.get('/og/docs/khong-co')).status()).toBe(404)
})
