import { expect, test } from '@playwright/test'
import { priceHits } from './prices'

export const PAGES: Array<[string, 'vi' | 'en']> = [
  ['/', 'vi'], ['/en', 'en'],
  ['/ai-cho-giao-vien', 'vi'], ['/en/ai-for-teachers', 'en'],
  ['/ai-cho-giang-vien', 'vi'], ['/en/ai-for-lecturers', 'en'],
  ['/ra-soat-chuong-trinh-dao-tao', 'vi'], ['/en/curriculum-review', 'en'],
  ['/tro-ly-ai', 'vi'], ['/en/ai-assistant', 'en'],
  ['/cach-tinh-phi', 'vi'], ['/en/pricing', 'en'],
  ['/minh-bach-ai', 'vi'], ['/en/ai-transparency', 'en'],
  ['/tai-ve', 'vi'], ['/en/download', 'en'],
  ['/huong-dan-cai-dat/macos', 'vi'], ['/huong-dan-cai-dat/windows', 'vi'],
  ['/en/install/macos', 'en'], ['/en/install/windows', 'en'],
  ['/lien-he', 'vi'], ['/en/contact', 'en'],
  ['/chinh-sach-bao-mat', 'vi'], ['/en/privacy', 'en'],
]

for (const [path, lang] of PAGES) {
  test(`${path} renders with SEO basics`, async ({ page }) => {
    const errors: string[] = []
    page.on('console', (m) => m.type() === 'error' && !m.text().includes('/_vercel/') && errors.push(m.text()))
    page.on('pageerror', (e) => errors.push(e.message))
    const res = await page.goto(path)
    expect(res?.status()).toBe(200)
    await expect(page.locator('html')).toHaveAttribute('lang', lang)
    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1)
    // Trang thường không bị noindex (index, follow là mặc định nên không cần thẻ robots).
    await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(0)
    expect(await page.locator('link[rel="alternate"][hreflang]').count()).toBeGreaterThanOrEqual(3)
    await expect(page.locator('meta[property="og:image"]')).toHaveCount(1)
    const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).map((s) => JSON.parse(s))
    // Spec §9: Organization trên mọi trang, đúng một khối (Ruling 35).
    expect(ld.filter((d) => d['@type'] === 'Organization')).toHaveLength(1)
    await expect(page.locator('main#main')).toHaveCount(1)
    // Spec §13: không trang nào chứa ký tự gạch ngang dài (U+2014). Dựng ký tự bằng mã để tệp test không chứa nó.
    expect(await page.content()).not.toContain(String.fromCharCode(0x2014))
    expect(errors).toEqual([])
  })
}

test('locale switch keeps the current page', async ({ page }) => {
  await page.goto('/cach-tinh-phi')
  await page.locator('header').getByRole('link', { name: 'EN', exact: true }).click()
  await expect(page).toHaveURL(/\/en\/pricing$/)
  await page.locator('header').getByRole('link', { name: 'VI', exact: true }).click()
  await expect(page).toHaveURL(/\/cach-tinh-phi$/)
})

test('unknown paths give a localized 404', async ({ page }) => {
  expect((await page.goto('/khong-co-trang-nay'))?.status()).toBe(404)
  await expect(page.locator('h1')).toHaveText('Không tìm thấy trang')
  expect((await page.goto('/en/no-such-page'))?.status()).toBe(404)
  await expect(page.locator('h1')).toHaveText('Page not found')
})

// Next tự thêm `noindex` cho trang 404. Metadata của layout từng thêm một thẻ robots "index, follow" nữa, nên trang 404 mang hai thẻ đối nghịch.
for (const path of ['/khong-co-trang-nay', '/en/no-such-page']) {
  test(`${path} carries exactly one robots meta, and it is noindex`, async ({ page }) => {
    expect((await page.goto(path))?.status()).toBe(404)
    const robots = page.locator('meta[name="robots"]')
    await expect(robots).toHaveCount(1)
    await expect(robots).toHaveAttribute('content', /noindex/)
  })
}

for (const path of ['/cach-tinh-phi', '/en/pricing']) {
  test(`${path} shows no price figure`, async ({ page }) => {
    await page.goto(path)
    // NFC để chữ Việt viết dạng tổ hợp (vd. "đồng") vẫn khớp regex.
    const text = (await page.locator('main').innerText()).normalize('NFC')
    expect(text.length).toBeGreaterThan(500)
    // Spec §15: không công bố đơn giá. Các dạng ghi giá bị bắt, và cụm được phép ("0 đồng", "÷ 1.000.000"), nằm ở tests/e2e/prices.ts.
    expect(priceHits(text)).toEqual([])
  })
}

// Ruling 27: với optimisticRouting bật, trang 404 tiếng Anh gửi hàng trăm yêu cầu _rsc mỗi giây không dừng.
// Trang bình thường dừng ở khoảng 13 tới 27 yêu cầu; `next dev` không tái hiện được lỗi này, nên test chạy trên bản build.
for (const path of ['/', '/en', '/en/no-such-page']) {
  test(`no runaway prefetch on ${path}`, async ({ page }) => {
    let rsc = 0
    page.on('request', (r) => {
      if (new URL(r.url()).searchParams.has('_rsc')) rsc++
    })
    await page.goto(path)
    await page.waitForTimeout(2000)
    expect(rsc).toBeLessThan(60)
  })
}

// Ruling 29: không cuộn ngang ở bề rộng máy tính bảng (spec §8.3); lưới footer từng tràn từ 768 tới 829 px.
for (const width of [640, 768, 820, 1024]) {
  test(`no horizontal overflow at ${width} px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    for (const path of ['/', '/en', '/tai-ve', '/en/pricing']) {
      await page.goto(path)
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
      expect(overflow, path).toBeLessThanOrEqual(0)
    }
  })
}

// Spec §4.5: link đổi ngôn ngữ trỏ thẳng URL cuối, không qua /vi/... rồi chuyển hướng.
test('language links point straight at the final URL', async ({ page }) => {
  await page.goto('/ai-cho-giao-vien')
  const hrefs = await page.locator('a[hreflang]').evaluateAll((as) => as.map((a) => a.getAttribute('href')))
  expect(hrefs.length).toBeGreaterThanOrEqual(4)
  expect(hrefs.filter((h) => h?.startsWith('/vi'))).toEqual([])
  expect(hrefs).toContain('/en/ai-for-teachers')
})
