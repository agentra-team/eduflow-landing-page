import { expect, test } from '@playwright/test'
import { waitForHydration } from './hydration'

const VI_PAGES = ['/', '/ai-cho-giao-vien', '/ai-cho-giang-vien', '/ra-soat-chuong-trinh-dao-tao', '/tro-ly-ai', '/cach-tinh-phi', '/minh-bach-ai', '/tai-ve', '/huong-dan-cai-dat/macos', '/huong-dan-cai-dat/windows', '/lien-he', '/chinh-sach-bao-mat']

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

test('tapping the logo closes the open menu and releases the scroll lock', async ({ page }) => {
  // Bắt đầu ở trang con: đường dẫn phải đổi thì mới là điều hướng (bấm logo ngay trên trang chủ không đi đâu).
  await page.goto('/ai-cho-giao-vien')
  const menuButton = page.getByRole('button', { name: 'Mở menu' })
  // Ruling 51: cú click trước khi hydrate bị mất vì nút chưa có trình xử lý.
  await waitForHydration(menuButton)
  await menuButton.click()
  const nav = page.locator('#mobile-nav')
  await expect(nav).toBeVisible()
  await expect(page.locator('body')).toHaveCSS('overflow', 'hidden')
  // Logo: liên kết duy nhất trong header có tên đúng là "EduFlow" (nút tải và các mục menu đều có thêm chữ).
  await page.locator('header').getByRole('link', { name: 'EduFlow', exact: true }).click()
  await expect(page).toHaveURL(/\/$/)
  await expect(nav).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Mở menu' })).toHaveAttribute('aria-expanded', 'false')
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden')
})

test('the open menu sits above the cookie bar, so its download button is not covered at 375 x 667', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 })
  await page.goto('/')
  const menuButton = page.getByRole('button', { name: 'Mở menu' })
  await waitForHydration(menuButton)
  // Thanh cookie do client dựng sau khi hydrate.
  await expect(page.getByRole('button', { name: 'Đồng ý' })).toBeVisible()
  await menuButton.click()
  const nav = page.locator('#mobile-nav')
  const download = nav.getByRole('link', { name: 'Tải EduFlow' })
  await expect(download).toBeVisible()
  // Phần tử nằm trên cùng tại tâm của nút tải ('download') hoặc của thanh cookie ('bar-center'): true khi nó thuộc nút tải, hoặc thuộc panel menu.
  const topmostIsInside = (point: 'download' | 'bar-center') =>
    page.evaluate((which) => {
      const panel = document.querySelector('#mobile-nav')!
      const link = [...panel.querySelectorAll('a')].find((a) => a.textContent?.includes('Tải EduFlow'))!
      const bar = document.querySelector('[role="region"]')!
      const rect = (which === 'download' ? link : bar).getBoundingClientRect()
      const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2)
      return hit !== null && (which === 'download' ? link : panel).contains(hit)
    }, point)
  // Nguyên nhân: tâm thanh cookie (nằm trọn trong vùng của panel) phải thuộc panel, tức panel che thanh chứ không ngược lại.
  expect(await topmostIsInside('bar-center')).toBe(true)
  // Triệu chứng: nút "Tải EduFlow" nhận được cú chạm.
  expect(await topmostIsInside('download')).toBe(true)
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
