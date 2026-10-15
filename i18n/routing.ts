import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['vi', 'en'],
  defaultLocale: 'vi',
  localePrefix: 'as-needed',
  localeDetection: false,
  // next-intl 4 mặc định đặt cookie NEXT_LOCALE (khi Accept-Language lệch với trang) và header Link hreflang. Chính sách bảo mật nói chỉ Google
  // Analytics đặt cookie, và chỉ sau khi đồng ý; cookie ngôn ngữ lại không bao giờ được đọc vì localeDetection tắt. Header Link lấy host của yêu cầu
  // nên lệch với thẻ head (theo NEXT_PUBLIC_SITE_URL) trên các bí danh *.vercel.app. hreflang đã có ở thẻ head và sitemap.
  localeCookie: false,
  alternateLinks: false,
  // Slug là từ khoá chính của trang (bản đồ ở lib/seo/brand.ts). Khoá nội bộ giữ như cũ để ít đổi mã (spec §4.2).
  pathnames: {
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
    '/install/[os]': { vi: '/huong-dan-cai-dat/[os]', en: '/install/[os]' },
    '/contact': { vi: '/lien-he', en: '/contact' },
    '/privacy': { vi: '/chinh-sach-bao-mat', en: '/privacy' },
  },
})

export type Locale = (typeof routing.locales)[number]
export type PageKey = keyof typeof routing.pathnames
