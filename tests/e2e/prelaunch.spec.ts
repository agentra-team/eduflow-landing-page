import { expect, test } from '@playwright/test'

test('download page shows the pre-launch notice and no installer link', async ({ page }) => {
  await page.goto('/tai-ve')
  await expect(page.getByTestId('prelaunch')).toBeVisible()
  await expect(page.locator('main a[download]')).toHaveCount(0)
  await page.getByTestId('prelaunch').getByRole('link').click()
  await expect(page).toHaveURL(/\/lien-he$/)
})

test('home hero and download block lead to contact, header button still reaches the notice', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('link', { name: 'Liên hệ để dùng sớm' }).first()).toHaveAttribute('href', '/lien-he')
  await expect(page.locator('#tai-ve').getByTestId('prelaunch')).toBeVisible()
  await page.locator('header').getByRole('link', { name: 'Tải EduFlow' }).click()
  await expect(page).toHaveURL(/\/tai-ve$/)
  await expect(page.getByTestId('prelaunch')).toBeVisible()
})
