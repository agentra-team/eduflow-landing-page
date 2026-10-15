import { expect, test } from 'vitest'
import { localeHref } from '@/i18n/switch'
import { routing, type PageKey } from '@/i18n/routing'

test('the switch gives the final URL of the same page in the other language', () => {
  expect(localeHref('/pricing', {}, 'vi', 'en')).toBe('/en/pricing')
  expect(localeHref('/pricing', { locale: 'en' }, 'en', 'vi')).toBe('/cach-tinh-phi')
  expect(localeHref('/k12', {}, 'vi', 'en')).toBe('/en/ai-for-teachers')
  expect(localeHref('/', {}, 'vi', 'en')).toBe('/en')
  expect(localeHref('/', {}, 'en', 'vi')).toBe('/')
})

// Review Focus 2: trên trang 404 (đường dẫn không phải khoá nào), nút đổi ngôn ngữ về trang chủ của ngôn ngữ kia.
test('an unknown path switches to the home page of the other language', () => {
  expect(localeHref('/khong-co-trang-nay', {}, 'vi', 'en')).toBe('/en')
  expect(localeHref(null, {}, 'en', 'vi')).toBe('/')
})

test('an article switches to its own slug in the other language, an unknown one to the docs index', () => {
  expect(localeHref('/docs/[slug]', { slug: 'cai-dat-macos' }, 'vi', 'en')).toBe('/en/docs/install-macos')
  expect(localeHref('/docs/[slug]', { slug: 'install-windows' }, 'en', 'vi')).toBe('/huong-dan/cai-dat-windows')
  expect(localeHref('/docs/[slug]', { slug: 'khong-co' }, 'vi', 'en')).toBe('/en/docs')
  expect(localeHref('/docs', {}, 'en', 'vi')).toBe('/huong-dan')
})

// Lúc prerender, trang tiếng Việt không biết URL đã rewrite (/huong-dan/cai-dat-macos), nên usePathname() của next-intl trả đường
// dẫn nội bộ đã điền slug ('/docs/cai-dat-macos') thay cho khoá '/docs/[slug]'; trên trình duyệt nó trả khoá. Hai bên phải ra cùng href.
test('a filled internal path from a prerendered page resolves to the same link as its key', () => {
  const params = { locale: 'vi', slug: 'cai-dat-macos' }
  expect(localeHref('/docs/cai-dat-macos', params, 'vi', 'en')).toBe(localeHref('/docs/[slug]', params, 'vi', 'en'))
  expect(localeHref('/docs/cai-dat-macos', params, 'vi', 'en')).toBe('/en/docs/install-macos')
  expect(localeHref('/docs/cai-dat-macos', params, 'vi', 'vi')).toBe('/huong-dan/cai-dat-macos')
  expect(localeHref('/docs/khong-co', { locale: 'vi', slug: 'khong-co' }, 'vi', 'en')).toBe('/en/docs')
  // Không có params khớp thì vẫn là đường dẫn lạ: về trang chủ.
  expect(localeHref('/docs/cai-dat-macos', {}, 'vi', 'en')).toBe('/en')
})

test('no switch link ever goes through /vi or ends with a slash', () => {
  for (const key of Object.keys(routing.pathnames) as PageKey[]) {
    if (key.includes('[')) continue
    for (const to of routing.locales) {
      const href = localeHref(key, {}, to === 'vi' ? 'en' : 'vi', to)
      expect(href.startsWith('/vi'), href).toBe(false)
      expect(href === '/' || !href.endsWith('/'), href).toBe(true)
    }
  }
})
