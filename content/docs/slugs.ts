import type { Locale } from '@/i18n/routing'

/**
 * Mã và slug của bài hướng dẫn (spec §7.4). Tệp nhỏ, không import MDX, để component phía client (nút đổi ngôn ngữ) dùng được.
 * Slug là chữ thường không dấu nối bằng gạch, duy nhất qua cả hai ngôn ngữ: ảnh chia sẻ /og/docs/<slug> suy ra ngôn ngữ từ slug.
 * Thêm bài: thêm mã vào DOC_IDS, slug vào DOC_SLUGS, mục vào DOCS (content/docs/index.ts) và hai tệp MDX.
 */
export const DOC_IDS = ['install-macos', 'install-windows'] as const
export type DocId = (typeof DOC_IDS)[number]

export const DOC_SLUGS: Record<DocId, Record<Locale, string>> = {
  'install-macos': { vi: 'cai-dat-macos', en: 'install-macos' },
  'install-windows': { vi: 'cai-dat-windows', en: 'install-windows' },
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
