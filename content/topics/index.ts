import type { DocId } from '@/content/docs/slugs'
import type { Locale, PageKey } from '@/i18n/routing'
import { TOPICS_EN } from './en'
import { TOPICS_VI } from './vi'

/*
 * Trang chủ đề (spoke, spec §7.2): mỗi trang sở hữu MỘT từ khoá chính (bản đồ ở lib/seo/brand.ts). Danh sách này dẫn sổ trang,
 * sitemap, footer, llms.txt, JSON-LD và khối "Chủ đề liên quan". Khoá routing của cả sáu trang đã có ở i18n/routing.ts.
 * Thêm chủ đề: thêm mã ở đây, nội dung ở vi.ts và en.ts, thư mục route mỏng app/[locale]/<mã>/ (page.tsx, opengraph-image.tsx).
 */
export const TOPIC_IDS = ['test-generator', 'test-versions', 'lesson-plans', 'lesson-slides', 'course-syllabus', 'vs-chatgpt'] as const
export type TopicId = (typeof TOPIC_IDS)[number]

export const topicPage = (id: TopicId) => `/${id}` as const satisfies PageKey
export const isTopicPage = (page: string): boolean => TOPIC_IDS.some((id) => page === `/${id}`)

export type TopicMeta = {
  /** Trang cấp chứa chủ đề (link "lên pillar"); null: dẫn về trang chủ. */
  pillar: 'k12' | 'university' | 'program' | null
  /** Ảnh sản phẩm khớp đúng chủ đề; không có ảnh khớp thì bỏ trống (quyết định 13). */
  image?: { src: string; width: number; height: number }
  /** Ngày nội dung đổi thật, YYYY-MM-DD (sitemap, JSON-LD, dòng "Cập nhật"). */
  updatedAt: string
  /** Title đã có "EduFlow": không nối hậu tố. */
  absoluteTitle?: boolean
}

const shot = (name: string) => ({ src: `/images/product/${name}.webp`, width: 1600, height: 1000 })

export const TOPIC_META: Record<TopicId, TopicMeta> = {
  'test-generator': { pillar: 'k12', image: shot('exam-setup'), updatedAt: '2026-10-15' },
  'test-versions': { pillar: 'k12', updatedAt: '2026-10-15' },
  'lesson-plans': { pillar: 'k12', updatedAt: '2026-10-15' },
  'lesson-slides': { pillar: 'k12', updatedAt: '2026-10-15' },
  'course-syllabus': { pillar: 'university', image: shot('course-workbench'), updatedAt: '2026-10-15' },
  'vs-chatgpt': { pillar: null, image: shot('assistant-home'), updatedAt: '2026-10-15', absoluteTitle: true },
}

/** Link trong thân bài: trang chủ đề khác (anchor là `name` của nó), bài hướng dẫn, trang tĩnh, hoặc nguồn ngoài. */
export type TopicLink =
  | { topic: TopicId }
  | { doc: DocId }
  | { page: Exclude<PageKey, '/docs/[slug]'>; label: string }
  | { href: `https://${string}`; label: string }

export type TopicBlock = {
  h2: string
  paras?: string[]
  /** Danh sách; `title` in đậm đầu dòng. */
  items?: Array<{ title?: string; text: string; link?: TopicLink }>
  ordered?: boolean
}

export type TopicCopy = {
  /** Tên trang dạng từ khoá: nhãn thẻ, breadcrumb, footer, anchor text từ trang khác. */
  name: string
  /** Chuỗi trong <title>; kèm " · EduFlow" (trừ khi absoluteTitle) phải ≤ 60 ký tự. */
  metaTitle: string
  /** 110 tới 160 ký tự. */
  description: string
  /** Từ khoá chính đứng đầu (JSON-LD keywords); phải có trong h1 và inShort. */
  keywords: string[]
  /** Từ khoá phụ, in nhỏ trên H1. */
  eyebrow: string
  h1: string
  /** Trả lời ngay trong 2 tới 3 câu. */
  lead: string
  /** Mô tả một câu trên thẻ liên kết (trang cấp, chủ đề liên quan). */
  card: string
  /** Ô "Tóm tắt": câu trả lời gọn, đứng một mình vẫn đúng khi bị trích; từ khoá chính được in đậm. */
  inShort: string
  /** H2 "<...> là gì?": câu đầu là định nghĩa tự đủ nghĩa, `term` in đậm. */
  definition: { h2: string; term: string; rest: string; paras?: string[] }
  /** Bảng so sánh có ngày kiểm tra (spec §8.3). Cột đầu là tiêu chí. */
  table: { h2: string; caption: string; checkedAt: string; head: string[]; rows: string[][] }
  blocks?: TopicBlock[]
  /** Cách làm bằng EduFlow; bước nào có bài hướng dẫn thì gắn `doc`. */
  howTo: { h2: string; lead?: string; steps: Array<{ title: string; text: string; doc?: DocId }> }
  /** "EduFlow chưa làm gì": giới hạn thật, lấy từ v2-scope của app. */
  limits: { h2: string; items: string[] }
  /** Đúng 5 câu; FAQPage dựng từ chính mảng này. */
  faq: Array<{ q: string; a: string }>
  imageAlt: string
  /** Ảnh chia sẻ 1200×630: tiêu đề ngắn để không tràn. */
  share: { title: string; subtitle: string }
}

export const TOPICS: Record<Locale, Record<TopicId, TopicCopy>> = { vi: TOPICS_VI, en: TOPICS_EN }

export function topicCopy(locale: Locale, id: TopicId): TopicCopy {
  return TOPICS[locale][id]
}

/** Số chữ của phần thân hiển thị (cách nhau bằng khoảng trắng), để giữ bài trong 1.200 tới 1.800 chữ (spec §7.2). */
export function topicWordCount(c: TopicCopy): number {
  const texts = [
    c.lead,
    c.inShort,
    c.definition.term,
    c.definition.rest,
    ...(c.definition.paras ?? []),
    ...c.table.head,
    ...c.table.rows.flat(),
    ...(c.blocks ?? []).flatMap((b) => [b.h2, ...(b.paras ?? []), ...(b.items ?? []).flatMap((i) => [i.title ?? '', i.text])]),
    c.howTo.h2,
    c.howTo.lead ?? '',
    ...c.howTo.steps.flatMap((s) => [s.title, s.text]),
    c.limits.h2,
    ...c.limits.items,
    ...c.faq.flatMap((f) => [f.q, f.a]),
  ]
  return texts.join(' ').split(/\s+/).filter(Boolean).length
}
