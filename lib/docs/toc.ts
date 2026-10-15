import type { ReactNode } from 'react'

export type TocItem = { id: string; label: string }

/** id của tiêu đề: chữ thường không dấu, nối bằng gạch ("Bước 2: Đặt ngân sách" → "buoc-2-dat-ngan-sach"). */
export function slugifyHeading(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** id cho thẻ h2 trong MDX. Luật thân bài buộc tiêu đề là chữ trơn, nên children luôn là chuỗi. */
export function headingId(children: ReactNode): string | undefined {
  return typeof children === 'string' ? slugifyHeading(children) : undefined
}

/** Một mục cấu trúc của bài: tiêu đề Markdown hoặc khối `<Step>`. `id` của Step là undefined khi thiếu thuộc tính id. */
export type ScanItem = {
  line: number
  kind: 'heading' | 'step'
  level?: number
  text: string
  id?: string
  title?: string
}

/**
 * Bộ quét duy nhất của thân bài MDX, bỏ qua khối mã (```). Mục lục (extractToc) và luật thân bài (checkDocBody) cùng dùng nó,
 * nên mục lục không bao giờ trỏ tới id mà luật chưa kiểm.
 */
export function scanDocLines(source: string): ScanItem[] {
  const items: ScanItem[] = []
  let fenced = false
  source.split('\n').forEach((text, i) => {
    const line = i + 1
    if (text.trimStart().startsWith('```')) {
      fenced = !fenced
      return
    }
    if (fenced) return
    const h = /^(#{1,6})\s+(.*?)\s*$/.exec(text)
    if (h) items.push({ line, kind: 'heading', level: h[1].length, text: h[2], id: slugifyHeading(h[2]) })
    const step = /<Step\b([^>]*)>/.exec(text)
    if (step) {
      const id = /\bid="([^"]+)"/.exec(step[1])?.[1]
      const title = /\btitle="([^"]+)"/.exec(step[1])?.[1]
      items.push({ line, kind: 'step', text: title ?? '', id, title })
    }
  })
  return items
}

/** Mục lục từ nguồn MDX: tiêu đề `##` và khối `<Step id title>`, đúng thứ tự trong bài, bỏ qua khối mã. */
export function extractToc(source: string): TocItem[] {
  const items: TocItem[] = []
  for (const it of scanDocLines(source)) {
    if (it.kind === 'heading' && it.level === 2 && it.id) items.push({ id: it.id, label: it.text })
    else if (it.kind === 'step' && it.id && it.title) items.push({ id: it.id, label: it.title })
  }
  return items
}
