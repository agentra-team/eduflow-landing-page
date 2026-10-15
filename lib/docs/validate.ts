import type { Locale } from '@/i18n/routing'
import { scanDocLines } from './toc'

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const LOCALES: Locale[] = ['vi', 'en']

type CopyLike = { title: string; metaTitle?: string; description: string; keyword: string }
type DocEntryLike = { group: string; order: number; updatedAt: string; topic?: string; vi: CopyLike; en: CopyLike }

/** Hôm nay theo giờ Việt Nam, YYYY-MM-DD. Build trên CI chạy theo UTC, còn ngày ghi trong bài là ngày Việt Nam. */
export function todayInVietnam(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now)
}

/** Ngày có thật trên lịch. Tháng hay ngày ngoài khoảng cho Date không hợp lệ: kiểm trước khi toISOString (nó ném RangeError). */
function isRealDate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false
  const d = new Date(`${s}T00:00:00Z`)
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s
}

/** Luật của sổ bài hướng dẫn (spec §7.4). Trả danh sách lỗi, mỗi lỗi nêu tệp và tên trường; rỗng là hợp lệ. */
export function validateDocs(input: {
  docs: Record<string, DocEntryLike>
  slugs: Record<string, Record<Locale, string>>
  groups: readonly string[]
  suffix: Record<Locale, string>
  /** Mã các trang chủ đề có thật (content/topics): trường `topic` của bài phải thuộc danh sách này. */
  topics: readonly string[]
  today: string
}): string[] {
  const errors: string[] = []
  const seenSlug = new Map<string, string>()
  const seenOrder = new Map<string, string>()
  for (const [id, entry] of Object.entries(input.docs)) {
    const where = `content/docs/index.ts (${id})`
    if (!input.groups.includes(entry.group)) errors.push(`${where}: group "${entry.group}" không thuộc ${input.groups.join(', ')}`)
    if (!Number.isInteger(entry.order) || entry.order < 1) errors.push(`${where}: order phải là số nguyên từ 1`)
    const orderKey = `${entry.group}#${entry.order}`
    const clash = seenOrder.get(orderKey)
    if (clash) errors.push(`${where}: order ${entry.order} trùng với ${clash} trong nhóm ${entry.group}`)
    else seenOrder.set(orderKey, id)
    if (entry.topic !== undefined && !input.topics.includes(entry.topic)) errors.push(`${where}: topic "${entry.topic}" không phải trang chủ đề có thật`)
    if (!isRealDate(entry.updatedAt)) errors.push(`${where}: updatedAt "${entry.updatedAt}" không phải ngày YYYY-MM-DD có thật`)
    else if (entry.updatedAt > input.today) errors.push(`${where}: updatedAt ${entry.updatedAt} ở tương lai (hôm nay ${input.today})`)
    for (const locale of LOCALES) {
      const slug = input.slugs[id]?.[locale] ?? ''
      const file = `content/docs/${locale}/${slug}.mdx`
      if (!SLUG.test(slug)) errors.push(`${file}: slug "${slug}" phải khớp ${SLUG}`)
      const other = seenSlug.get(slug)
      if (other) errors.push(`${file}: slug "${slug}" trùng với ${other}`)
      else seenSlug.set(slug, `${id} (${locale})`)
      const c = entry[locale]
      const field = c.metaTitle ? 'metaTitle' : 'title'
      const title = c.metaTitle ?? c.title
      const full = [...`${title}${input.suffix[locale]}`].length
      if (full > 60) errors.push(`${file}: ${field} kèm hậu tố dài ${full} ký tự (tối đa 60)${c.metaTitle ? '' : '; thêm metaTitle ngắn hơn'}`)
      if (/EduFlow/.test(title)) errors.push(`${file}: ${field} đã có "EduFlow", hậu tố sẽ lặp tên`)
      const d = [...c.description].length
      if (d < 110 || d > 160) errors.push(`${file}: description dài ${d} ký tự (cần 110 tới 160)`)
      if (!c.keyword.trim()) errors.push(`${file}: keyword trống`)
    }
  }
  return errors
}

/**
 * Luật thân bài (spec §7.4): tiêu đề từ ## tới ####, là chữ trơn (không link, mã, chữ đậm, thẻ), không trùng id; không cú pháp
 * ảnh Markdown (dùng <Figure>); <Step> có đủ id và title. Khối mã (```) được bỏ qua. Dùng chung bộ quét scanDocLines với mục lục.
 */
export function checkDocBody(file: string, source: string): string[] {
  const errors: string[] = []
  const ids = new Map<string, number>()
  const claim = (id: string, line: number) => {
    const first = ids.get(id)
    if (first) errors.push(`${file}:${line}: id "${id}" trùng với dòng ${first}`)
    else ids.set(id, line)
  }
  for (const it of scanDocLines(source)) {
    if (it.kind === 'heading') {
      const level = it.level ?? 0
      if (level === 1) errors.push(`${file}:${it.line}: không dùng tiêu đề # (H1 là title của bài)`)
      if (level > 4) errors.push(`${file}:${it.line}: tiêu đề sâu hơn ####`)
      if (/[[\]`*_<>]/.test(it.text)) errors.push(`${file}:${it.line}: tiêu đề phải là chữ trơn (không link, mã, chữ đậm hay thẻ)`)
      else if (level === 2) {
        if (!it.id) errors.push(`${file}:${it.line}: tiêu đề cho id rỗng`)
        else claim(it.id, it.line)
      }
    } else if (!it.id || !it.title) errors.push(`${file}:${it.line}: <Step> thiếu id hoặc title`)
    else claim(it.id, it.line)
  }
  // Cú pháp ảnh Markdown không thuộc cấu trúc mục lục, nên quét riêng (vẫn bỏ khối mã).
  let fenced = false
  source.split('\n').forEach((text, i) => {
    if (text.trimStart().startsWith('```')) fenced = !fenced
    else if (!fenced && /!\[[^\]]*\]\(/.test(text)) errors.push(`${file}:${i + 1}: dùng <Figure> thay cho cú pháp ảnh Markdown`)
  })
  return errors
}
