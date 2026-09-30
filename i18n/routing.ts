import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['vi', 'en'],
  defaultLocale: 'vi',
  localePrefix: 'as-needed',
  localeDetection: false,
  pathnames: {
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
  },
})

export type Locale = (typeof routing.locales)[number]
export type PageKey = keyof typeof routing.pathnames
