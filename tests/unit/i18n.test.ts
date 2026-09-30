import { describe, expect, test } from 'vitest'
import { routing } from '@/i18n/routing'
import en from '@/messages/en.json'
import vi from '@/messages/vi.json'

const flatten = (o: unknown, p = ''): string[] =>
  typeof o === 'object' && o !== null ? Object.entries(o).flatMap(([k, v]) => flatten(v, p ? `${p}.${k}` : k)) : [p]

describe('i18n', () => {
  test('pathnames cover every page with the slugs of spec §5', () => {
    expect(routing.pathnames).toEqual({
      '/': '/',
      '/k12': { vi: '/pho-thong', en: '/k12' },
      '/university': { vi: '/hoc-phan', en: '/university-courses' },
      '/program': { vi: '/chuong-trinh', en: '/program-review' },
      '/assistant': { vi: '/tro-ly-ai', en: '/ai-assistant' },
      '/pricing': { vi: '/cach-tinh-phi', en: '/pricing' },
      '/ai-transparency': { vi: '/minh-bach-ai', en: '/ai-transparency' },
      '/download': { vi: '/tai-ve', en: '/download' },
      '/install/[os]': { vi: '/huong-dan-cai-dat/[os]', en: '/install/[os]' },
      '/contact': { vi: '/lien-he', en: '/contact' },
      '/privacy': { vi: '/chinh-sach-bao-mat', en: '/privacy' },
    })
  })
  test('vi and en messages have the same keys', () => {
    expect(flatten(en).sort()).toEqual(flatten(vi).sort())
  })
  test('vi is the default locale without prefix and without detection', () => {
    expect(routing.defaultLocale).toBe('vi')
    expect(routing.localePrefix).toBe('as-needed')
    expect(routing.localeDetection).toBe(false)
  })
  test('the three level namespaces share one shape', () => {
    const shape = (o: unknown) => flatten(o).sort()
    expect(shape(vi.levels.university)).toEqual(shape(vi.levels.k12))
    expect(shape(vi.levels.program)).toEqual(shape(vi.levels.k12))
  })
})
