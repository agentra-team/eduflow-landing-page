import { describe, expect, test } from 'vitest'
import { routing } from '@/i18n/routing'
import en from '@/messages/en.json'
import vi from '@/messages/vi.json'

const flatten = (o: unknown, p = ''): string[] =>
  typeof o === 'object' && o !== null ? Object.entries(o).flatMap(([k, v]) => flatten(v, p ? `${p}.${k}` : k)) : [p]

describe('i18n', () => {
  test('pathnames cover every page with the keyword slugs of spec §4.2', () => {
    expect(routing.pathnames).toEqual({
      '/': '/',
      '/k12': { vi: '/ai-cho-giao-vien', en: '/ai-for-teachers' },
      '/university': { vi: '/ai-cho-giang-vien', en: '/ai-for-lecturers' },
      '/program': { vi: '/ra-soat-chuong-trinh-dao-tao', en: '/curriculum-review' },
      // Trang chủ đề (spoke), dựng ở content/topics
      '/test-generator': { vi: '/ai-tao-de-kiem-tra-theo-ma-tran', en: '/ai-test-generator' },
      '/test-versions': { vi: '/tron-de-trac-nghiem', en: '/shuffle-test-versions' },
      '/lesson-plans': { vi: '/ai-soan-giao-an', en: '/ai-lesson-plan-generator' },
      '/lesson-slides': { vi: '/tao-slide-bai-giang-bang-ai', en: '/ai-slide-generator' },
      '/course-syllabus': { vi: '/de-cuong-chi-tiet-hoc-phan', en: '/course-syllabus' },
      '/vs-chatgpt': { vi: '/eduflow-va-chatgpt', en: '/eduflow-vs-chatgpt' },
      '/assistant': { vi: '/tro-ly-ai', en: '/ai-assistant' },
      '/pricing': { vi: '/cach-tinh-phi', en: '/pricing' },
      '/ai-transparency': { vi: '/minh-bach-ai', en: '/ai-transparency' },
      '/download': { vi: '/tai-ve', en: '/download' },
      // Trung tâm hướng dẫn: slug bài khác nhau giữa hai ngôn ngữ (content/docs/slugs.ts)
      '/docs': { vi: '/huong-dan', en: '/docs' },
      '/docs/[slug]': { vi: '/huong-dan/[slug]', en: '/docs/[slug]' },
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
  test('the proxy sets no locale cookie and no hreflang Link header', () => {
    // next-intl 4 bật cả hai theo mặc định. Chính sách bảo mật nói chỉ GA đặt cookie và chỉ sau khi đồng ý, còn cookie ngôn ngữ chẳng bao giờ
    // được đọc (localeDetection tắt). hreflang đã có ở thẻ head và sitemap theo NEXT_PUBLIC_SITE_URL; header của proxy lấy host của yêu cầu
    // nên lệch với thẻ head trên các bí danh *.vercel.app.
    expect(routing.localeCookie).toBe(false)
    expect(routing.alternateLinks).toBe(false)
  })
  test('the three level namespaces share one shape', () => {
    const shape = (o: unknown) => flatten(o).sort()
    expect(shape(vi.levels.university)).toEqual(shape(vi.levels.k12))
    expect(shape(vi.levels.program)).toEqual(shape(vi.levels.k12))
  })
})
