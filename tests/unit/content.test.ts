import { readdirSync, readFileSync } from 'node:fs'
import { basename, dirname, extname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'
import en from '@/messages/en.json'
import vi from '@/messages/vi.json'

// Ai thêm hoặc xoá tệp MDX thì sửa hai số này (tổng, và riêng tiếng Anh): nhờ đó chắc chắn bộ quét thấy tệp.
const MDX_TOTAL = 6
const MDX_ENGLISH = 3

// Gốc repo tính từ vị trí tệp test này, không phụ thuộc thư mục đang chạy lệnh.
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const rel = (f: string) => relative(ROOT, f).split(sep).join('/')

const values = (o: unknown, p = ''): Array<[string, string]> =>
  typeof o === 'object' && o !== null
    ? Object.entries(o).flatMap(([k, v]) => values(v, p ? `${p}.${k}` : k))
    : [[p, String(o)]]

// Một bộ duyệt cho cả ba test. Không bắt lỗi: thư mục thiếu hoặc không đọc được thì test phải đỏ.
const walk = (dir: string, skipDir: (name: string) => boolean = () => false): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name)
    if (e.isDirectory()) return skipDir(e.name) ? [] : walk(p, skipDir)
    return e.isFile() ? [p] : []
  })

const mdxFiles = () => walk(join(ROOT, 'content')).filter((f) => f.endsWith('.mdx'))

// Trang tiếng Anh: có thư mục tên đúng "en", hoặc tên tệp đúng "en.mdx".
const isEnglish = (f: string) => {
  const parts = rel(f).split('/')
  return parts.slice(0, -1).includes('en') || parts.at(-1) === 'en.mdx'
}

// Luật nội dung của spec §15.
const FORBIDDEN = [/\u2014/, /đạt kiểm định/i, /thay (thế )?giáo viên/i, /replaces? teachers/i]

test('copy rules: no em-dash, no promised accreditation, no "AI replaces teachers"', () => {
  const mdx = mdxFiles()
  // soft: một lần chạy báo được cả số tệp sai lẫn nội dung vi phạm.
  expect.soft(mdx.length).toBe(MDX_TOTAL)
  const texts: Array<[string, string]> = [
    ...values(vi).map(([k, v]) => [`vi:${k}`, v] as [string, string]),
    ...values(en).map(([k, v]) => [`en:${k}`, v] as [string, string]),
    ...mdx.map((f) => [rel(f), readFileSync(f, 'utf8')] as [string, string]),
  ]
  // NFC trước khi so: cụm từ cấm viết dạng tổ hợp (chữ cái + dấu rời) cũng bị bắt.
  const hits = texts.flatMap(([where, text]) =>
    FORBIDDEN.filter((r) => r.test(text.normalize('NFC'))).map((r) => `${where} ${r}`),
  )
  expect(hits).toEqual([])
})

test('English copy carries no untranslated Vietnamese', () => {
  const VIETNAMESE = /[ăâđêôơưàáảãạằắẳẵặầấẩẫậèéẻẽẹềếểễệìíỉĩịòóỏõọồốổỗộờớởỡợùúủũụừứửữựỳýỷỹỵ]/i
  // Dấu chìm DÙNG THỬ được phép trong mọi chữ tiếng Anh, cả bộ chữ lẫn MDX.
  const WATERMARK = ['DÙNG THỬ']
  // Sáu nhãn nút thật của app (giao diện tiếng Việt, AD-16): chỉ hướng dẫn cài bản tiếng Anh (MDX) được gọi đúng tên, bộ chữ thì không.
  const BUTTON_LABELS = [
    'Kích hoạt',
    'Dùng thử',
    'Tải về',
    'Khởi động lại để cài',
    'Cài đặt',
    'Lưu trữ và sao lưu',
  ]
  // NFC trước khi so, cả văn bản lẫn nhãn cho phép: chữ Việt dạng tổ hợp (chữ cái + dấu rời) cũng bị bắt và khớp.
  const clean = (s: string, allowed: string[]) =>
    allowed.reduce((acc, a) => acc.split(a.normalize('NFC')).join(''), s.normalize('NFC'))
  const mdx = mdxFiles().filter(isEnglish)
  expect.soft(mdx.length).toBe(MDX_ENGLISH)
  const guides: Array<[string, string]> = mdx.map((f) => [rel(f), readFileSync(f, 'utf8')])
  const offenders = [
    ...values(en).filter(([, text]) => VIETNAMESE.test(clean(text, WATERMARK))),
    ...guides.filter(([, text]) => VIETNAMESE.test(clean(text, [...WATERMARK, ...BUTTON_LABELS]))),
  ].map(([where]) => where)
  expect(offenders).toEqual([])
})

// Cả mã nguồn, cấu hình và tài liệu, không chỉ chữ trên trang.
const SKIP_DIRS = new Set(['node_modules', 'out', 'coverage', 'test-results', 'playwright-report'])
const TEXT_EXTS = new Set('.ts .tsx .mts .mjs .js .json .md .mdx .css .yml .yaml .txt .svg .html'.split(' '))

test('no U+2014 em-dash in any source file', () => {
  const EM_DASH = /\u2014/
  const skipDir = (name: string) => (name.startsWith('.') && name !== '.github') || SKIP_DIRS.has(name)
  const isText = (f: string) => TEXT_EXTS.has(extname(f)) && basename(f) !== 'pnpm-lock.yaml'
  const files = walk(ROOT, skipDir).filter(isText)
  expect(files.length).toBeGreaterThan(40)
  expect(files.filter((f) => EM_DASH.test(readFileSync(f, 'utf8'))).map(rel)).toEqual([])
})
