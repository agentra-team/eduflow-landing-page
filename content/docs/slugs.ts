import type { Locale } from '@/i18n/routing'

/**
 * Mã và slug của bài hướng dẫn (spec §7.4). Tệp nhỏ, không import MDX hay sổ bài, để component phía client (nút đổi ngôn ngữ,
 * thẻ bộ cài của trang Tải về) dùng được mà không kéo sổ bài vào JS phía client (quyết định 1).
 * Slug là chữ thường không dấu nối bằng gạch, duy nhất qua cả hai ngôn ngữ: ảnh chia sẻ /og/docs/<slug> suy ra ngôn ngữ từ slug.
 * Thêm bài: thêm mã vào DOC_IDS, slug vào DOC_SLUGS, mục vào DOCS (content/docs/index.ts) và hai tệp MDX.
 */
export const DOC_IDS = ['install-macos', 'install-windows', 'activation-and-trial', 'interface-tour', 'create-a-test', 'export-test-versions', 'lesson-plans', 'lesson-slides', 'using-the-assistant', 'adding-documents', 'costs-and-budget', 'troubleshooting'] as const
export type DocId = (typeof DOC_IDS)[number]

export const DOC_SLUGS: Record<DocId, Record<Locale, string>> = {
  'install-macos': { vi: 'cai-dat-macos', en: 'install-macos' },
  'install-windows': { vi: 'cai-dat-windows', en: 'install-windows' },
  'activation-and-trial': { vi: 'kich-hoat-va-dung-thu', en: 'activation-and-trial' },
  'interface-tour': { vi: 'lam-quen-giao-dien', en: 'interface-tour' },
  'create-a-test': { vi: 'soan-de-kiem-tra', en: 'create-a-test' },
  'export-test-versions': { vi: 'xuat-nhieu-ma-de', en: 'export-test-versions' },
  'lesson-plans': { vi: 'soan-giao-an-5512', en: 'lesson-plans' },
  'lesson-slides': { vi: 'tao-slide-bai-giang', en: 'lesson-slides' },
  'using-the-assistant': { vi: 'dung-tro-ly-ai', en: 'using-the-assistant' },
  'adding-documents': { vi: 'nap-tai-lieu', en: 'adding-documents' },
  'costs-and-budget': { vi: 'chi-phi-va-ngan-sach', en: 'costs-and-budget' },
  troubleshooting: { vi: 'xu-ly-su-co', en: 'troubleshooting' },
}

export function docIdFromSlug(locale: Locale, slug: string): DocId | undefined {
  return DOC_IDS.find((id) => DOC_SLUGS[id][locale] === slug)
}

/** Bài và ngôn ngữ của một slug bất kỳ. */
export function findDocSlug(slug: string): { id: DocId; locale: Locale } | undefined {
  for (const id of DOC_IDS) {
    for (const locale of ['vi', 'en'] as const) if (DOC_SLUGS[id][locale] === slug) return { id, locale }
  }
  return undefined
}

/** href cho `Link` của next-intl: slug theo đúng ngôn ngữ của trang đang dựng. */
export function docHref(locale: Locale, id: DocId) {
  return { pathname: '/docs/[slug]' as const, params: { slug: DOC_SLUGS[id][locale] } }
}

/** params theo từng ngôn ngữ cho buildMetadata và sổ trang. */
export function docParams(id: DocId): Record<Locale, { slug: string }> {
  return { vi: { slug: DOC_SLUGS[id].vi }, en: { slug: DOC_SLUGS[id].en } }
}
