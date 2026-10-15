import type { ComponentType } from 'react'
import type { Locale } from '@/i18n/routing'
import { todayInVietnam, validateDocs } from '@/lib/docs/validate'
import { DOC_IDS, DOC_SLUGS, type DocId } from './slugs'

// Hai hàm chỉ cần slug, nằm ở slugs.ts để component phía client import được; mã phía server import ở đâu cũng được.
export { docHref, docParams } from './slugs'

/*
 * Sổ bài hướng dẫn (spec §7.4): nhóm, thứ tự, ngày cập nhật và chữ SEO của từng bài, hai ngôn ngữ. Metadata nằm ở đây thay
 * cho frontmatter MDX để Vitest kiểm được và build dừng khi sai (assertDocsValid trong generateStaticParams).
 * Mọi thao tác trong bài lấy từ `main` của repo app tại lúc viết; `updatedAt` là ngày nội dung đổi thật (giờ Việt Nam).
 */

/** Bốn nhóm, đúng thứ tự hiển thị: Bắt đầu, Phổ thông, Trợ lý và tài liệu, Chi phí và vận hành. */
export const DOC_GROUPS = ['start', 'k12', 'assistant', 'operations'] as const
export type DocGroup = (typeof DOC_GROUPS)[number]

export type DocCopy = {
  /** H1 của bài. Kèm hậu tố phải ≤ 60 ký tự, không thì đặt metaTitle. Không chứa "EduFlow" (hậu tố đã có). */
  title: string
  metaTitle?: string
  /** 110 tới 160 ký tự: meta description và câu dẫn dưới H1. */
  description: string
  /** Từ khoá dạng tác vụ ("cách cài EduFlow trên macOS"), không trùng từ khoá chính của trang nào. */
  keyword: string
}

export type DocEntry = { group: DocGroup; order: number; updatedAt: string; vi: DocCopy; en: DocCopy }

export const DOC_TITLE_SUFFIX: Record<Locale, string> = { vi: ' · Hướng dẫn EduFlow', en: ' · EduFlow Docs' }

export const DOCS: Record<DocId, DocEntry> = {
  'install-macos': {
    group: 'start',
    order: 1,
    updatedAt: '2026-10-15',
    vi: {
      title: 'Cài đặt trên macOS',
      description: 'Tải đúng bộ cài theo chip của máy Mac, kéo vào Applications, mở lần đầu khi macOS cảnh báo, kích hoạt key hoặc dùng thử và nhận bản mới.',
      keyword: 'cách cài EduFlow trên macOS',
    },
    en: {
      title: 'Install on macOS',
      description: 'Download the right installer for your Mac chip, drag it to Applications, open it past the first macOS warning, activate a key or a trial, and update.',
      keyword: 'install EduFlow on a Mac',
    },
  },
  'install-windows': {
    group: 'start',
    order: 2,
    updatedAt: '2026-10-15',
    vi: {
      title: 'Cài đặt trên Windows',
      description: 'Tải bộ cài EduFlow cho Windows 64-bit, chạy trình cài, mở qua cảnh báo SmartScreen, kích hoạt bằng key hoặc dùng thử và nhận bản mới trong app.',
      keyword: 'cách cài EduFlow trên Windows',
    },
    en: {
      title: 'Install on Windows',
      description: 'Download the EduFlow installer for 64-bit Windows, run it, get past the SmartScreen warning, activate with a key or a trial, and get new versions in the app.',
      keyword: 'install EduFlow on Windows',
    },
  },
}

/** Khối "Bắt đầu trong 5 phút" ở mục lục hướng dẫn: cài, kích hoạt, soạn đề đầu tiên (spec §7.3). */
export const QUICK_START: DocId[] = ['install-macos', 'install-windows']

/** Thứ tự đọc: theo nhóm (DOC_GROUPS), rồi theo `order` trong nhóm. Dẫn thanh bên và bài trước, bài sau. */
export function docsInOrder(): DocId[] {
  return [...DOC_IDS].sort((a, b) => DOC_GROUPS.indexOf(DOCS[a].group) - DOC_GROUPS.indexOf(DOCS[b].group) || DOCS[a].order - DOCS[b].order)
}

/** Nhóm có bài, đúng thứ tự hiển thị, mỗi nhóm theo thứ tự đọc. Dẫn thanh bên và mục lục hướng dẫn. */
export function docsByGroup(): Array<{ group: DocGroup; ids: DocId[] }> {
  const order = docsInOrder()
  return DOC_GROUPS.map((group) => ({ group, ids: order.filter((id) => DOCS[id].group === group) })).filter((g) => g.ids.length > 0)
}

/** Đường dẫn tệp MDX tính từ gốc repo. */
export function docFile(locale: Locale, id: DocId): string {
  return `content/docs/${locale}/${DOC_SLUGS[id][locale]}.mdx`
}

type MdxBody = { default: ComponentType<Record<string, unknown>> }

/** Bảng import tĩnh để Turbopack phân tích được. Thêm bài: thêm hai dòng ở đây. */
export const DOC_SOURCES: Record<Locale, Record<DocId, () => Promise<MdxBody>>> = {
  vi: {
    'install-macos': () => import('./vi/cai-dat-macos.mdx'),
    'install-windows': () => import('./vi/cai-dat-windows.mdx'),
  },
  en: {
    'install-macos': () => import('./en/install-macos.mdx'),
    'install-windows': () => import('./en/install-windows.mdx'),
  },
}

/** Dừng build khi sổ sai; thông báo nêu từng tệp và trường. */
export function assertDocsValid(today: string = todayInVietnam()): void {
  const errors = validateDocs({ docs: DOCS, slugs: DOC_SLUGS, groups: DOC_GROUPS, suffix: DOC_TITLE_SUFFIX, today })
  if (errors.length) throw new Error(`Sổ bài hướng dẫn sai:\n${errors.join('\n')}`)
}
