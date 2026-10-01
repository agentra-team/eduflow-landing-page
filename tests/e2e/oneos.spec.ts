import { expect, test } from '@playwright/test'

test.use({ userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36' })

test('a Mac visitor on the Download page sees the Windows card and "macOS sắp có"', async ({ page }) => {
  await page.goto('/tai-ve')
  await expect(page.locator('main a[download]')).toHaveCount(1)
  await expect(page.locator('main a[download]')).toHaveAttribute('href', /\.exe$/)
  await expect(page.getByText('Bản cho macOS sắp có.')).toBeVisible()
})

test('the home page does not promise a macOS build and names the missing one', async ({ page }) => {
  await page.goto('/')
  const hero = page.locator('main section').first()
  await expect(hero.locator('a[download]')).toHaveCount(0)
  await expect(hero.getByRole('link', { name: 'Tải về cho macOS' })).toHaveCount(0)
  await expect(page.locator('#tai-ve').getByText('Bản cho macOS sắp có.')).toBeVisible()
  await expect(page.locator('#tai-ve a[download]')).toHaveCount(1)
})
