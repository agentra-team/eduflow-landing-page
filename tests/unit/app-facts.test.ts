import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'
import { appFacts } from '@/lib/seo/app-facts'
import en from '@/messages/en.json'
import vi from '@/messages/vi.json'

// Spec §8.3, §12.1: mọi con số và khẳng định về app phải khớp lib/seo/app-facts.ts. Cách quét như test giá hiện có.
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const rel = (f: string) => relative(ROOT, f).split(sep).join('/')
const walk = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(dir, e.name)) : e.isFile() ? [join(dir, e.name)] : []))
const values = (o: unknown, p = ''): Array<[string, string]> =>
  typeof o === 'object' && o !== null ? Object.entries(o).flatMap(([k, v]) => values(v, p ? `${p}.${k}` : k)) : [[p, String(o)]]

// Biến thể câu ký số đang không dùng (theo cờ) không bị quét: nó chỉ hiện khi cờ đổi.
const INACTIVE = `download.signing.${appFacts.installerSigned ? 'unsigned' : 'signed'}.`

/** Mọi chữ nói về app: bộ chữ hai ngôn ngữ, module nội dung (.ts) và MDX trong content/. */
const texts = (): Array<[string, string]> => [
  ...values(vi).filter(([k]) => !k.startsWith(INACTIVE)).map(([k, v]) => [`vi:${k}`, v] as [string, string]),
  ...values(en).filter(([k]) => !k.startsWith(INACTIVE)).map(([k, v]) => [`en:${k}`, v] as [string, string]),
  ...walk(join(ROOT, 'content'))
    .filter((f) => /\.(ts|mdx)$/.test(f))
    .map((f) => [rel(f), readFileSync(f, 'utf8')] as [string, string]),
]

// Số viết bằng chữ. Không có "tư" ("đầu tư mức...") để khỏi bắt nhầm.
const WORDS: Record<string, number> = {
  một: 1, hai: 2, ba: 3, bốn: 4, năm: 5, sáu: 6, bảy: 7, tám: 8, chín: 9, mười: 10, 'mười một': 11, 'mười hai': 12,
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12,
}
const NUM = `(\\d+|${Object.keys(WORDS).sort((a, b) => b.length - a.length).join('|')})`
// Trước số không được là chữ, số hay gạch nối: "K-12 level" không phải "12 mức".
const rx = (body: string) => new RegExp(`(?<![\\p{L}\\d-])${NUM}${body}`, 'giu')
const toNumber = (s: string) => (/^\d+$/.test(s) ? Number(s) : WORDS[s.toLowerCase()])

const GATES = new Set<number>([appFacts.k12Gates, appFacts.testGates, appFacts.courseGates, appFacts.programGates])
const LEVELS = new Set<number>([appFacts.matrixLevels, appFacts.cv7991Levels])

const RULES: Array<{ name: string; re: RegExp; ok: (n: number) => boolean }> = [
  { name: 'test versions (vi)', re: rx(' mã(?![\\p{L}])'), ok: (n) => n >= 1 && n <= appFacts.maxTestVersions },
  { name: 'test versions (en)', re: rx(' (?:test )?versions?\\b'), ok: (n) => n >= 1 && n <= appFacts.maxTestVersions },
  { name: 'gates (vi)', re: rx(' cổng(?![\\p{L}])'), ok: (n) => GATES.has(n) },
  { name: 'gates (en)', re: rx(' (?:quality )?gates?\\b'), ok: (n) => GATES.has(n) },
  { name: 'matrix levels (vi)', re: rx(' mức(?![\\p{L}])'), ok: (n) => LEVELS.has(n) },
  { name: 'matrix levels (en)', re: rx('[- ]levels?\\b'), ok: (n) => LEVELS.has(n) },
  { name: 'money (vi)', re: rx(' đồng(?![\\p{L}])'), ok: (n) => n === appFacts.localWorkCostVnd },
]

// Khẳng định bộ cài ĐÃ ký: cấm khi installerSigned = false.
const SIGNED_CLAIMS = [
  /đã ký số/i,
  /bộ cài[^.]{0,40}?đã (?:được )?ký/i,
  /Developer ID/i,
  // Chỉ notarize của Apple: "công chứng mã băm" (hash notarization) của máy chủ EduFlow là tính năng khác, được nêu.
  /(?<!(?:chưa|not)[^.]{0,20})(?:Apple notariz|notariz\w* by Apple)/i,
  /\bsigned (?:EduFlow )?installers?\b/i,
  /\binstallers? (?:is|are) (?:digitally |code[- ])?signed\b/i,
  /\bdigitally signed\b/i,
  /(?<!not )\bcode[- ]signed\b/i,
]
// Khẳng định bộ cài CHƯA ký: cấm khi installerSigned = true.
const UNSIGNED_CLAIMS = [/chưa (?:được )?ký số/i, /\bunsigned\b/i, /\bnot (?:yet )?(?:code[- ])?signed\b/i, /Unknown publisher/i, /nhà phát hành không xác định/i]

const numberHits = (text: string) =>
  RULES.flatMap((r) => [...text.normalize('NFC').matchAll(r.re)].filter((m) => !r.ok(toNumber(m[1]))).map((m) => `${r.name}: "${m[0]}"`))

test('every number about the app matches lib/seo/app-facts.ts', () => {
  expect(texts().flatMap(([where, text]) => numberHits(text).map((h) => `${where} ${h}`))).toEqual([])
})

test('copy about installer signing follows appFacts.installerSigned', () => {
  const forbidden = appFacts.installerSigned ? UNSIGNED_CLAIMS : SIGNED_CLAIMS
  const bad = texts().flatMap(([where, text]) => forbidden.filter((r) => r.test(text.normalize('NFC'))).map((r) => `${where} ${r}`))
  expect(bad).toEqual([])
})

// Một bộ chặn không bao giờ khớp thì vô dụng mà vẫn xanh: ghim cả câu nó phải bắt lẫn câu nó phải để yên.
test('the fact guards catch what they target and spare neutral wording', () => {
  for (const bad of ['Tối đa 30 mã đề', 'up to 32 test versions', '10 cổng chất lượng', '9 quality gates', 'ma trận năm mức', 'a five-level matrix', '500 đồng mỗi đề']) {
    expect(numberHits(bad), bad).not.toEqual([])
  }
  for (const fine of ['Tối đa 24 mã đề', 'Soạn đề 45 phút Toán 10, 4 mã đề', '12 cổng P1..P12', 'đề chạy 8 cổng', 'ma trận bốn mức', 'Four-level test blueprints', 'K-12 level', '0 đồng', 'ba tầng kết luận']) {
    expect(numberHits(fine), fine).toEqual([])
  }
  const caught = (patterns: RegExp[], text: string) => patterns.some((r) => r.test(text.normalize('NFC')))
  for (const bad of ['Bộ cài đã ký số', 'Tải bộ cài EduFlow đã ký cho Windows', 'ký Developer ID và được Apple notarize', 'The installer is signed with Developer ID', 'notarized by Apple', 'Digitally signed installers', 'Download the signed EduFlow installer', 'the Windows build is code-signed']) {
    expect(caught(SIGNED_CLAIMS, bad), bad).toBe(true)
  }
  for (const fine of ['Bộ cài hiện chưa ký số', 'chưa được Apple notarize', 'not notarized by Apple', 'The installer is not signed yet', 'gói đã ký của trưởng bộ môn', 'Signing locks the version, and its hash is notarized', 'The server notarizes the hash']) {
    expect(caught(SIGNED_CLAIMS, fine), fine).toBe(false)
  }
  for (const bad of ['Bộ cài hiện chưa ký số', 'an unsigned build', 'Unknown publisher']) expect(caught(UNSIGNED_CLAIMS, bad), bad).toBe(true)
})
