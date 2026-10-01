import { expect, test } from '@playwright/test'
import { waitForHydration } from './hydration'

const VI_PAGES = ['/', '/pho-thong', '/hoc-phan', '/chuong-trinh', '/tro-ly-ai', '/cach-tinh-phi', '/minh-bach-ai', '/tai-ve', '/huong-dan-cai-dat/macos', '/huong-dan-cai-dat/windows', '/lien-he', '/chinh-sach-bao-mat']

test('mobile menu opens with the five nav links and a download button', async ({ page }) => {
  await page.goto('/')
  // Ruling 51: cú click trước khi hydrate bị mất vì nút chưa có trình xử lý.
  const menuButton = page.getByRole('button', { name: 'Mở menu' })
  await waitForHydration(menuButton)
  await menuButton.click()
  const nav = page.locator('#mobile-nav')
  await expect(nav.locator('nav').getByRole('link')).toHaveCount(5)
  await expect(nav.getByRole('link', { name: 'Tải EduFlow' })).toBeVisible()
  // Panel phải phủ hết màn hình dưới header. toBeVisible vẫn qua khi panel co còn 49 px, nên đo hộp thật.
  const box = await nav.boundingBox()
  const viewport = page.viewportSize()
  expect(box).not.toBeNull()
  expect(viewport).not.toBeNull()
  expect(box!.y).toBeLessThanOrEqual(72)
  expect(box!.height).toBeGreaterThanOrEqual(viewport!.height - 73)
})

test('on a phone the hero button never starts an installer download', async ({ page }) => {
  await page.goto('/')
  const hero = page.locator('main section').first()
  // Ruling 51: chờ hydrate rồi mới khẳng định không có liên kết tải, vì nút chính của hero do client dựng theo hệ điều hành.
  await waitForHydration(hero.getByRole('link').first())
  await expect(hero.locator('a[download]')).toHaveCount(0)
  await expect(hero.getByText('EduFlow chạy trên máy tính macOS và Windows.')).toBeVisible()
})

for (const path of VI_PAGES) {
  test(`no horizontal overflow on ${path}`, async ({ page }) => {
    await page.goto(path)
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    expect(overflow).toBeLessThanOrEqual(0)
  })

  // Spec §8.3: vùng chạm tối thiểu 44 px trên điện thoại. Link nằm trong dòng chữ (display inline) được miễn.
  test(`tap targets are at least 44 px tall on ${path}`, async ({ page }) => {
    await page.goto(path)
    const small = await page.evaluate(() =>
      [...document.querySelectorAll('a, button, summary')]
        .filter((el) => {
          const box = el.getBoundingClientRect()
          return box.width > 1 && box.height > 1 && getComputedStyle(el).display !== 'inline'
        })
        .map((el) => ({ tag: el.tagName.toLowerCase(), text: (el.textContent ?? '').trim().slice(0, 40), height: Math.round(el.getBoundingClientRect().height) }))
        .filter((target) => target.height < 44),
    )
    expect(small).toEqual([])
  })
}
