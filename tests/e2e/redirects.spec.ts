import { expect, test } from '@playwright/test'
import { LEGACY_REDIRECTS } from '../../lib/next-routes'

// Spec §4.3: URL cũ chuyển 308 thẳng tới URL mới, không qua bước trung gian.
for (const { source, destination } of LEGACY_REDIRECTS) {
  test(`${source} redirects permanently to ${destination}`, async ({ request }) => {
    const res = await request.get(source, { maxRedirects: 0 })
    expect(res.status()).toBe(308)
    expect(new URL(res.headers()['location'], 'http://localhost').pathname).toBe(destination)
  })
}

// Review Focus 1: dấu "/" cuối và chuỗi truy vấn của link cũ (ví dụ trong app hay tin nhắn) vẫn tới trang mới.
test('an old URL with a trailing slash and a query still lands on the new page', async ({ page }) => {
  const res = await page.goto('/pho-thong/?utm_source=app')
  expect(res?.status()).toBe(200)
  await expect(page).toHaveURL(/\/ai-cho-giao-vien\?utm_source=app$/)
})
