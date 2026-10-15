import { readdirSync, readFileSync } from 'node:fs'
import { basename, dirname, extname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'
import { DOCS } from '@/content/docs'
import { TOPICS } from '@/content/topics'
import en from '@/messages/en.json'
import vi from '@/messages/vi.json'

// Ai thêm hoặc xoá tệp MDX thì sửa hai số này (tổng, và riêng tiếng Anh): nhờ đó chắc chắn bộ quét thấy tệp.
const MDX_TOTAL = 26
const MDX_ENGLISH = 13

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
const FORBIDDEN = [
  /\u2014/,
  /đạt kiểm định/i,
  /thay (thế )?(giáo viên|giảng viên)/i,
  /thay thế (thầy cô|thầy giáo|cô giáo|nhà giáo)/i,
  /\bAI (sẽ |đang |có thể |hoàn toàn )?thay (thế )?(thầy cô|thầy giáo|cô giáo|nhà giáo)/i,
  /replac(?:e|es|ed|ing) (?:the |all |your )?(?:teachers?|lecturers?|instructors?|educators?|professors?)\b/i,
]
// Không bắt "thay" đứng một mình trước "thầy cô": "không ký thay thầy cô" và "AI không thay thầy cô" nói điều ngược lại, mà văn bản tin cậy cần nói.
// Hai kiểu còn lại thì không nhập nhằng: "thay thế" là thay cho, và "AI" liền trước "thay" là AI làm chủ thể.

// OQ-L07: chưa nêu tên nhà cung cấp mô hình mà EduFlow dùng (spec 30/09 §15). "ChatGPT" là tên một sản phẩm được phép nhắc để so sánh
// (spec §7.2: trang /eduflow-va-chatgpt và cột ChatGPT trong bảng so sánh); tên mô hình dạng GPT-4o, GPT-5 thì vẫn cấm.
// GLM, Z.ai, Zhipu là nhà cung cấp thật của app. Google Analytics và Google Maps vẫn được nêu.
const PROVIDERS = [/anthropic/i, /claude/i, /openai/i, /(?<!\p{L})gpt-?\d/iu, /gemini/i, /google ai/i, /\bglm\b/i, /\bz\.ai\b/i, /zhipu/i]

// OQ-L07: chưa có cam kết về huấn luyện mô hình, cả dạng khẳng định lẫn phủ định. Chỉ bắt khi "huấn luyện" hay "train" đi với mô hình hoặc dữ liệu,
// để các nghĩa khác (huấn luyện viên, huấn luyện kỹ năng, teacher training) không bị chặn nhầm.
const TRAINING_CLAIMS = [
  /huấn luyện (lại )?(mô hình|model|AI|trí tuệ nhân tạo)/i,
  /huấn luyện (trên|bằng) (dữ liệu|nội dung)/i,
  /không (được )?(dùng|sử dụng) (để )?huấn luyện/i,
  /đào tạo (lại )?(mô hình|model)/i,
  /\btrain(?:s|ed|ing)? (?:on\b|(?:the |our |a |any |your )?(?:ai |ml )?models?\b)/i,
  /\bused? to train\b/i,
  /\bmodel training\b/i,
  /\btraining data\b/i,
]

// Chữ của trang chủ đề (content/topics) và của sổ bài hướng dẫn (content/docs/index.ts): cũng là chữ người xem đọc, nhưng không nằm
// trong messages hay MDX nên bộ quét phải đọc thẳng từ module. Khoá có tên mã chủ đề hoặc mã bài để báo lỗi chỉ đúng chỗ.
const topicTexts = (locale: 'vi' | 'en') => values(TOPICS[locale]).map(([k, v]) => [`topics.${locale}:${k}`, v] as [string, string])
const docTexts = (locale: 'vi' | 'en') =>
  Object.entries(DOCS).flatMap(([id, entry]) => values(entry[locale]).map(([k, v]) => [`docs-registry.${locale}:${id}.${k}`, v] as [string, string]))

// Mọi chữ người xem đọc được: bộ chữ hai ngôn ngữ, trang chủ đề, sổ bài hướng dẫn và các tệp MDX. Mỗi phần tử là [nơi, nội dung].
const copyTexts = (): Array<[string, string]> => [
  ...values(vi).map(([k, v]) => [`vi:${k}`, v] as [string, string]),
  ...values(en).map(([k, v]) => [`en:${k}`, v] as [string, string]),
  ...topicTexts('vi'),
  ...topicTexts('en'),
  ...docTexts('vi'),
  ...docTexts('en'),
  ...mdxFiles().map((f) => [rel(f), readFileSync(f, 'utf8')] as [string, string]),
]

// NFC trước khi so: cụm từ cấm viết dạng tổ hợp (chữ cái + dấu rời) cũng bị bắt.
const scan = (patterns: RegExp[]) =>
  copyTexts().flatMap(([where, text]) => patterns.filter((r) => r.test(text.normalize('NFC'))).map((r) => `${where} ${r}`))

test('copy rules: no em-dash, no promised accreditation, no "AI replaces teachers"', () => {
  // soft: một lần chạy báo được cả số tệp sai lẫn nội dung vi phạm.
  expect.soft(mdxFiles().length).toBe(MDX_TOTAL)
  expect(scan(FORBIDDEN)).toEqual([])
})

test('copy names no model provider (OQ-L07, spec §15)', () => {
  expect(scan(PROVIDERS)).toEqual([])
})

test('copy makes no claim about training models (OQ-L07, spec §15)', () => {
  expect(scan(TRAINING_CLAIMS)).toEqual([])
})

// Một bộ chặn không bao giờ khớp thì vô dụng mà vẫn xanh: ghim cả cụm nó phải bắt lẫn cụm nó phải để yên.
test('the copy guards catch the phrasings they target and spare neutral wording', () => {
  const caught = (patterns: RegExp[], text: string) => patterns.some((r) => r.test(text.normalize('NFC')))
  for (const bad of [
    'Đạt kiểm định ngay',
    'AI thay thầy cô soạn đề',
    'AI sẽ thay thế thầy cô',
    'Thay thế giáo viên bằng AI',
    'Máy thay thế thầy giáo',
    'AI sẽ thay giảng viên',
    'AI replaces the teacher',
    'Replace teachers with AI',
    'AI is replacing teachers',
  ]) {
    expect(caught(FORBIDDEN, bad), bad).toBe(true)
  }
  for (const bad of ['Powered by Claude', 'Dùng Anthropic', 'OpenAI API', 'GPT-5', 'GPT4o', 'Google Gemini', 'Google AI Studio', 'GLM-4.6', 'Z.ai', 'Zhipu AI']) {
    expect(caught(PROVIDERS, bad), bad).toBe(true)
  }
  for (const bad of [
    'Dữ liệu của trường không được dùng để huấn luyện',
    'Không dùng để huấn luyện mô hình',
    'Chúng tôi huấn luyện mô hình trên dữ liệu của trường',
    'Đào tạo lại mô hình mỗi quý',
    'We never train the model on your data',
    'We train on public data only',
    'Your files are never used to train models',
    'Used for model training',
    'Your training data stays with you',
  ]) {
    expect(caught(TRAINING_CLAIMS, bad), bad).toBe(true)
  }
  const all = [...FORBIDDEN, ...PROVIDERS, ...TRAINING_CLAIMS]
  for (const fine of [
    'Không duyệt, không ký thay người',
    'Máy đề xuất, thầy cô quyết định',
    'Trợ lý không ký thay thầy cô',
    'AI không thay thầy cô',
    'The assistant does not approve or sign for you',
    'Chương trình đào tạo của khoa',
    'Tập huấn và huấn luyện kỹ năng giảng dạy',
    'Một huấn luyện viên bóng đá',
    'Teacher training workshops and a training program',
    'Google Analytics và Google Maps',
    'Agentra ánh xạ tầng sang mô hình cụ thể',
    'The server relays content to the model',
    'EduFlow và ChatGPT: soạn đề, giáo án khác gì?',
    'ChatGPT soạn giáo án',
    'EduFlow vs ChatGPT',
  ]) {
    expect(caught(all, fine), fine).toBe(false)
  }
})

// Spec §6.4 và §15: cấp Chương trình là công cụ làm việc nội bộ, không phải báo cáo tự đánh giá. Ghi chú này nằm ở levels.program.hero.note
// và LevelPage hiện nó dưới nút ở đầu trang; xoá hay viết lại làm mất lời hứa này mà không test nào khác đỏ.
test('the program level states that it is an internal working document, not a self-assessment report', () => {
  const note = (m: { levels: { program: { hero: { note: string } } } }) => m.levels.program.hero.note.normalize('NFC')
  expect(note(vi)).toMatch(/tài liệu làm việc nội bộ/)
  expect(note(vi)).toMatch(/không phải báo cáo tự đánh giá/)
  expect(note(en)).toMatch(/internal working document/)
  expect(note(en)).toMatch(/not a self-assessment report/)
})

// Apple viết "Apple silicon" thường, nhưng bảng chọn bộ cài, tên nền tảng và mô tả của site đều viết "Apple Silicon".
test('Apple Silicon is capitalised the same way everywhere', () => {
  expect(copyTexts().filter(([, text]) => text.includes('Apple silicon')).map(([where]) => where)).toEqual([])
})

test('English copy carries no untranslated Vietnamese', () => {
  const VIETNAMESE = /[ăâđêôơưàáảãạằắẳẵặầấẩẫậèéẻẽẹềếểễệìíỉĩịòóỏõọồốổỗộờớởỡợùúủũụừứửữựỳýỷỹỵ]/i
  // Dấu chìm DÙNG THỬ được phép trong mọi chữ tiếng Anh, cả bộ chữ lẫn MDX.
  const WATERMARK = ['DÙNG THỬ']
  // Nhãn nút thật của app (giao diện tiếng Việt, AD-16) trong bài tiếng Anh nằm trong <Ui>...</Ui>: được phép, bộ chữ messages thì không.
  const stripUi = (s: string) => s.replace(/<Ui>[^<]*<\/Ui>/g, '')
  // NFC trước khi so, cả văn bản lẫn nhãn cho phép: chữ Việt dạng tổ hợp (chữ cái + dấu rời) cũng bị bắt và khớp.
  const clean = (s: string, allowed: string[]) =>
    allowed.reduce((acc, a) => acc.split(a.normalize('NFC')).join(''), s.normalize('NFC'))
  const mdx = mdxFiles().filter(isEnglish)
  expect.soft(mdx.length).toBe(MDX_ENGLISH)
  const guides: Array<[string, string]> = mdx.map((f) => [rel(f), readFileSync(f, 'utf8')])
  const offenders = [
    ...values(en).filter(([, text]) => VIETNAMESE.test(clean(text, WATERMARK))),
    ...topicTexts('en').filter(([, text]) => VIETNAMESE.test(clean(text, WATERMARK))),
    ...docTexts('en').filter(([, text]) => VIETNAMESE.test(clean(stripUi(text), WATERMARK))),
    ...guides.filter(([, text]) => VIETNAMESE.test(clean(stripUi(text), WATERMARK))),
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
  // AGENTS.md, CLAUDE.md ở gốc repo do Next tự sinh (đã vào .gitignore): bỏ qua đúng hai tệp đó, không bỏ tệp cùng tên ở nơi khác.
  const GENERATED = new Set(['AGENTS.md', 'CLAUDE.md'].map((n) => join(ROOT, n)))
  const files = walk(ROOT, skipDir).filter(isText).filter((f) => !GENERATED.has(f))
  expect(files.length).toBeGreaterThan(40)
  expect(files.filter((f) => EM_DASH.test(readFileSync(f, 'utf8'))).map(rel)).toEqual([])
})

