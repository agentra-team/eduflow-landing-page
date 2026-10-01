import { expect, test } from '@playwright/test'
import { waitForHydration } from './hydration'

// Build với NEXT_PUBLIC_GA_MEASUREMENT_ID=G-TEST (xem ci.yml) để có gì đó mà gate.
test('GA4 loads only after consent', async ({ page }) => {
  const gtm: string[] = []
  page.on('request', (r) => r.url().includes('googletagmanager.com') && gtm.push(r.url()))
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Đồng ý' })).toBeVisible()
  await page.waitForTimeout(800)
  expect(gtm).toHaveLength(0)
  await page.getByRole('button', { name: 'Đồng ý' }).click()
  await expect(page.getByRole('button', { name: 'Đồng ý' })).toHaveCount(0)
  await expect.poll(() => gtm.length, { timeout: 10_000 }).toBeGreaterThan(0)
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('eduflow.consent') ?? '{}'))
  expect(stored.value).toBe('granted')
  const loadedBeforeReload = gtm.length
  await page.reload()
  // Sau khi tải lại, thanh đồng ý vắng ngay cả khi chưa hydrate (server không dựng nó). Chờ React gắn vào, rồi chờ GA nạp lại
  // (chứng tỏ lựa chọn đã đọc được từ localStorage), và chỉ khi đó mới khẳng định không có thanh.
  await waitForHydration(page.locator('footer'))
  await expect.poll(() => gtm.length, { timeout: 10_000 }).toBeGreaterThan(loadedBeforeReload)
  await expect(page.getByRole('button', { name: 'Đồng ý' })).toHaveCount(0)
})

test('declining hides the bar and keeps GA off', async ({ page }) => {
  const gtm: string[] = []
  page.on('request', (r) => r.url().includes('googletagmanager.com') && gtm.push(r.url()))
  await page.goto('/en')
  await page.getByRole('button', { name: 'Decline' }).click()
  await page.waitForTimeout(800)
  expect(gtm).toHaveLength(0)
  await expect(page.getByRole('button', { name: 'Decline' })).toHaveCount(0)
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('eduflow.consent') ?? '{}'))
  expect(stored.value).toBe('denied')
})

test('the cookie bar is a region named "Thông báo cookie" in Vietnamese and "Cookie notice" in English', async ({ page }) => {
  // Nhãn vùng không được trùng chữ của liên kết bên trong ("Chính sách bảo mật").
  await page.goto('/')
  await expect(page.getByRole('region', { name: 'Thông báo cookie' })).toBeVisible()
  await page.goto('/en')
  await expect(page.getByRole('region', { name: 'Cookie notice' })).toBeVisible()
})

// Spec §12: localStorage bị chặn thì ConsentBar vẫn chạy trong phiên. Hồ sơ Chromium chặn dữ liệu trang ném SecurityError ngay khi đọc
// `window.localStorage`; ConsentBar và AnalyticsGate nằm ở layout gốc, không có error boundary ở trên, nên một lỗi ở đó làm sập cả trang.
test('with site data blocked the page still renders and the bar works for the session', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get() {
        throw new DOMException('Failed to read the localStorage property from Window: Access is denied for this document.', 'SecurityError')
      },
    })
  })
  const gtm: string[] = []
  page.on('request', (r) => r.url().includes('googletagmanager.com') && gtm.push(r.url()))
  await page.goto('/')
  // Ruling 51: thanh cookie do client dựng, nên chờ hydrate trước khi khẳng định gì về nó hay về trang.
  await waitForHydration(page.locator('footer'))
  const accept = page.getByRole('button', { name: 'Đồng ý' })
  await expect(accept).toBeVisible()
  await expect(page.getByRole('heading', { level: 1, name: /Soạn đề, giáo án/ })).toBeVisible()
  await page.waitForTimeout(800)
  expect(gtm).toHaveLength(0)
  await accept.click()
  await expect(accept).toHaveCount(0)
  await expect.poll(() => gtm.length, { timeout: 10_000 }).toBeGreaterThan(0)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})

test('when saving the choice fails, Accept still hides the bar and loads GA for the session', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException('The quota has been exceeded.', 'QuotaExceededError')
    }
  })
  const gtm: string[] = []
  page.on('request', (r) => r.url().includes('googletagmanager.com') && gtm.push(r.url()))
  await page.goto('/')
  await waitForHydration(page.locator('footer'))
  const accept = page.getByRole('button', { name: 'Đồng ý' })
  await expect(accept).toBeVisible()
  await accept.click()
  await expect(accept).toHaveCount(0)
  await expect.poll(() => gtm.length, { timeout: 10_000 }).toBeGreaterThan(0)
  expect(await page.evaluate(() => localStorage.getItem('eduflow.consent'))).toBeNull()
})

// Chính sách bảo mật: chỉ Google Analytics đặt cookie, và chỉ sau khi đồng ý. next-intl 4 mặc định đặt cookie NEXT_LOCALE khi Accept-Language
// lệch với ngôn ngữ của trang, và đặt header Link hreflang theo host của yêu cầu (lệch với thẻ head, vốn theo NEXT_PUBLIC_SITE_URL).
// Cả hai cặp (ngôn ngữ trình duyệt, trang) đều lệch ở một trong hai trang dưới đây.
for (const locale of ['en-US', 'vi-VN']) {
  test.describe(`Accept-Language ${locale}`, () => {
    test.use({ locale })

    test('no cookie and no hreflang Link header before any consent', async ({ page, context }) => {
      for (const path of ['/', '/en']) {
        const response = await page.goto(path)
        const headers = await response!.headersArray()
        expect(headers.filter((h) => h.name.toLowerCase() === 'set-cookie'), `${path} set-cookie`).toEqual([])
        expect(headers.filter((h) => h.name.toLowerCase() === 'link' && h.value.includes('hreflang')), `${path} link`).toEqual([])
      }
      expect(await context.cookies()).toEqual([])
    })
  })
}
