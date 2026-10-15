import { expect, test } from '@playwright/test'

// Spec §7.4: slug lạ, kể cả slug đúng của ngôn ngữ kia, trả 404 thật.
for (const path of ['/huong-dan/khong-co-bai-nay', '/en/docs/no-such-article', '/huong-dan/install-macos', '/en/docs/cai-dat-macos']) {
  test(`${path} is a real 404`, async ({ page }) => {
    expect((await page.goto(path))?.status()).toBe(404)
  })
}

test('the language switch on an article opens the same article in the other language', async ({ page }) => {
  await page.goto('/huong-dan/cai-dat-macos')
  await page.locator('header').getByRole('link', { name: 'EN', exact: true }).click()
  await expect(page).toHaveURL(/\/en\/docs\/install-macos$/)
  await page.locator('header').getByRole('link', { name: 'VI', exact: true }).click()
  await expect(page).toHaveURL(/\/huong-dan\/cai-dat-macos$/)
})

// Review Focus 2: trên một slug lạ, nút đổi ngôn ngữ về mục lục hướng dẫn của ngôn ngữ kia.
test('switching language on an unknown article lands on the other docs index', async ({ page }) => {
  await page.goto('/huong-dan/khong-co-bai-nay')
  await expect(page.locator('header a[hreflang="en"]')).toHaveAttribute('href', '/en/docs')
})

test('the sidebar marks the current article and every table-of-contents link has its target', async ({ page }) => {
  await page.goto('/huong-dan/cai-dat-windows')
  await expect(page.locator('a[aria-current="page"]:visible')).toHaveText('Cài đặt trên Windows')
  const targets = await page.locator('main nav a[href^="#"]').evaluateAll((as) => as.map((a) => a.getAttribute('href')!.slice(1)))
  expect(targets.length).toBeGreaterThanOrEqual(5)
  for (const id of new Set(targets)) await expect(page.locator(`[id="${id}"]`), id).toHaveCount(1)
})

test('the docs index links every article and carries a CollectionPage', async ({ page }) => {
  await page.goto('/huong-dan')
  await expect(page.locator('main a[href="/huong-dan/cai-dat-macos"]').first()).toBeVisible()
  const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).map((s) => JSON.parse(s))
  expect(ld.filter((d) => d['@type'] === 'CollectionPage')).toHaveLength(1)
})

test('an article carries a TechArticle and a three-step breadcrumb', async ({ page }) => {
  await page.goto('/en/docs/install-windows')
  const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).map((s) => JSON.parse(s))
  expect(ld.find((d) => d['@type'] === 'TechArticle')).toMatchObject({ headline: 'Install on Windows', inLanguage: 'en' })
  expect(ld.find((d) => d['@type'] === 'BreadcrumbList').itemListElement).toHaveLength(3)
})
