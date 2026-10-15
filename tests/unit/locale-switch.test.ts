import { expect, test } from 'vitest'
import { localeHref } from '@/i18n/switch'
import { routing, type PageKey } from '@/i18n/routing'

test('the switch gives the final URL of the same page in the other language', () => {
  expect(localeHref('/pricing', {}, 'en')).toBe('/en/pricing')
  expect(localeHref('/pricing', { locale: 'en' }, 'vi')).toBe('/cach-tinh-phi')
  expect(localeHref('/k12', {}, 'en')).toBe('/en/ai-for-teachers')
  expect(localeHref('/', {}, 'en')).toBe('/en')
  expect(localeHref('/', {}, 'vi')).toBe('/')
})

// Review Focus 2: trên trang 404 (đường dẫn không phải khoá nào), nút đổi ngôn ngữ về trang chủ của ngôn ngữ kia.
test('an unknown path switches to the home page of the other language', () => {
  expect(localeHref('/khong-co-trang-nay', {}, 'en')).toBe('/en')
  expect(localeHref(null, {}, 'vi')).toBe('/')
})

test('no switch link ever goes through /vi or ends with a slash', () => {
  for (const key of Object.keys(routing.pathnames) as PageKey[]) {
    if (key.includes('[')) continue
    for (const to of routing.locales) {
      const href = localeHref(key, {}, to)
      expect(href.startsWith('/vi'), href).toBe(false)
      expect(href === '/' || !href.endsWith('/'), href).toBe(true)
    }
  }
})
