import { GUIDE_OS } from '@/content/install'
import { PRIVACY_META } from '@/content/privacy/meta'
import type { Locale, PageKey } from '@/i18n/routing'
import en from '@/messages/en.json'
import vi from '@/messages/vi.json'
import { absoluteUrl } from './urls'

/*
 * Sổ trang indexable (spec §9.1): nguồn duy nhất cho title, description, URL, từ khoá chính và lastmod của mọi trang được
 * index. generateMetadata của từng trang, sitemap, llms.txt và test đều đọc ở đây, nên test đo đúng cái trang in ra.
 * Thêm trang: trang tĩnh thêm vào STATIC_PAGES; trang chủ đề thêm ở content/topics; bài hướng dẫn thêm ở content/docs.
 */

/** Hậu tố mà template title của app/[locale]/layout.tsx nối vào (`%s · ${common.siteName}`). */
export const BRAND_SUFFIX = ' · EduFlow'

/** Chữ SEO của một trang ở một ngôn ngữ. `absoluteTitle`: không nối hậu tố; `titleSuffix`: hậu tố riêng thay BRAND_SUFFIX. */
export type Seo = { title: string; description: string; absoluteTitle?: boolean; titleSuffix?: string }

type Messages = typeof vi
type Meta = { title: string; description: string }
type StaticEntry = {
  meta: (m: Messages, locale: Locale) => Meta
  absoluteTitle?: boolean
  /** Từ khoá chính theo bản đồ ở lib/seo/brand.ts; null là trang không nhắm từ khoá. */
  keyword: Record<Locale, string> | null
  updatedAt?: string
}

const MESSAGES: Record<Locale, Messages> = { vi, en }
const both = <T>(f: (locale: Locale) => T): Record<Locale, T> => ({ vi: f('vi'), en: f('en') })

export const STATIC_PAGES = {
  '/': { meta: (m) => m.home.meta, absoluteTitle: true, keyword: { vi: 'phần mềm AI cho giáo viên', en: 'AI software for teachers' } },
  '/k12': { meta: (m) => m.levels.k12.meta, keyword: { vi: 'AI cho giáo viên', en: 'AI for teachers' } },
  '/university': { meta: (m) => m.levels.university.meta, keyword: { vi: 'AI cho giảng viên', en: 'AI for lecturers' } },
  '/program': { meta: (m) => m.levels.program.meta, keyword: { vi: 'rà soát chương trình đào tạo', en: 'curriculum review' } },
  '/assistant': { meta: (m) => m.assistant.meta, keyword: { vi: 'trợ lý AI cho giáo viên', en: 'AI assistant for teachers' } },
  '/pricing': { meta: (m) => m.pricing.meta, absoluteTitle: true, keyword: { vi: 'chi phí EduFlow', en: 'EduFlow pricing' } },
  '/download': { meta: (m) => m.download.meta, absoluteTitle: true, keyword: { vi: 'tải EduFlow', en: 'download EduFlow' } },
  '/ai-transparency': { meta: (m) => m.transparency.meta, keyword: { vi: 'minh bạch AI', en: 'AI and data transparency' } },
  '/contact': { meta: (m) => m.contact.meta, absoluteTitle: true, keyword: { vi: 'liên hệ Agentra EduFlow', en: 'contact Agentra EduFlow' } },
  '/privacy': { meta: (_, locale) => PRIVACY_META[locale], keyword: null, updatedAt: PRIVACY_META.vi.updated },
} satisfies Partial<Record<PageKey, StaticEntry>>

export type StaticPageKey = keyof typeof STATIC_PAGES

export function staticSeo(locale: Locale, key: StaticPageKey): Seo {
  const entry: StaticEntry = STATIC_PAGES[key]
  const { title, description } = entry.meta(MESSAGES[locale], locale)
  return { title, description, ...(entry.absoluteTitle ? { absoluteTitle: true } : {}) }
}

export type IndexablePage = {
  /** Mã ổn định: khoá trang tĩnh, `topic:<id>` hoặc `doc:<id>`. */
  id: string
  key: PageKey
  params?: Record<Locale, Record<string, string>>
  seo: Record<Locale, Seo>
  keyword: Record<Locale, string> | null
  /** Ngày nội dung đổi thật, YYYY-MM-DD. Không có thì sitemap bỏ lastmod (trang chủ và Tải về lấy ngày phát hành bản app). */
  updatedAt?: string
}

export function indexablePages(): IndexablePage[] {
  const statics = (Object.keys(STATIC_PAGES) as StaticPageKey[]).map((key): IndexablePage => {
    const entry: StaticEntry = STATIC_PAGES[key]
    return { id: key, key, seo: both((l) => staticSeo(l, key)), keyword: entry.keyword, ...(entry.updatedAt ? { updatedAt: entry.updatedAt } : {}) }
  })
  // Hai trang cài đặt cũ, tới khi hai bài này chuyển vào trung tâm hướng dẫn.
  const install = GUIDE_OS.map(
    (os): IndexablePage => ({
      id: `install:${os}`,
      key: '/install/[os]',
      params: both(() => ({ os })),
      seo: both((l) => MESSAGES[l].install.meta[os]),
      keyword: null,
    }),
  )
  return [...statics, ...install]
}

export function pageUrl(p: IndexablePage, locale: Locale): string {
  return absoluteUrl(locale, p.key, p.params?.[locale])
}

/** Đúng chuỗi trong thẻ <title> của trang. */
export function finalTitle(seo: Seo): string {
  return seo.absoluteTitle ? seo.title : `${seo.title}${seo.titleSuffix ?? BRAND_SUFFIX}`
}
