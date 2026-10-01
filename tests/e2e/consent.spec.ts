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
