import { expect, test } from '@playwright/test'

const FEED = /^http:\/\/localhost:3300\/.+\.(exe|dmg)$/

test('download page lists the three installers from the feed', async ({ page }) => {
  await page.goto('/tai-ve')
  const links = page.locator('main a[download]')
  await expect(links).toHaveCount(3)
  const hrefs = await links.evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).href))
  for (const href of hrefs) expect(href).toMatch(FEED)
  expect(hrefs.some((h) => h.includes('EduFlow%20Setup'))).toBe(true)
  expect(hrefs.some((h) => h.endsWith('-arm64.dmg'))).toBe(true)
  await expect(page.getByTestId('prelaunch')).toHaveCount(0)
})

test('home page download block links the same three installers', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('#tai-ve a[download]')).toHaveCount(3)
})
