import { expect, test } from 'vitest'
import { DOC_GROUPS, DOC_TITLE_SUFFIX, DOCS, docsInOrder, QUICK_START } from '@/content/docs'
import { DOC_IDS, DOC_SLUGS, docIdFromSlug, findDocSlug } from '@/content/docs/slugs'
import { extractToc, scanDocLines, slugifyHeading } from '@/lib/docs/toc'
import { checkDocBody, todayInVietnam, validateDocs } from '@/lib/docs/validate'

const base = { slugs: DOC_SLUGS, groups: DOC_GROUPS, suffix: DOC_TITLE_SUFFIX, today: '2026-10-15' }
const copy = (title: string) => ({ title, description: 'd'.repeat(120), keyword: 'k' })
const entry = (over: Record<string, unknown> = {}) => ({ group: 'start', order: 1, updatedAt: '2026-10-01', vi: copy('Bài'), en: copy('Article'), ...over })

test('the real registry passes every rule', () => {
  expect(validateDocs({ ...base, docs: DOCS, today: todayInVietnam() })).toEqual([])
})

test('slugs are kebab-case, both languages exist and no slug repeats across languages', () => {
  const all = DOC_IDS.flatMap((id) => [DOC_SLUGS[id].vi, DOC_SLUGS[id].en])
  for (const s of all) expect(s).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  expect(new Set(all).size).toBe(all.length)
  for (const id of DOC_IDS) {
    expect(docIdFromSlug('vi', DOC_SLUGS[id].vi)).toBe(id)
    expect(docIdFromSlug('en', DOC_SLUGS[id].vi)).toBeUndefined()
    expect(findDocSlug(DOC_SLUGS[id].en)).toEqual({ id, locale: 'en' })
  }
})

test('the reading order walks the groups in order and every quick-start article exists', () => {
  const order = docsInOrder()
  expect([...order].sort()).toEqual([...DOC_IDS].sort())
  const groups = order.map((id) => DOC_GROUPS.indexOf(DOCS[id].group))
  expect(groups).toEqual([...groups].sort((a, b) => a - b))
  for (const id of QUICK_START) expect(DOC_IDS).toContain(id)
})

test('each broken field is reported with its file and field name', () => {
  const run = (docs: Record<string, ReturnType<typeof entry>>, slugs: Record<string, { vi: string; en: string }>) =>
    validateDocs({ ...base, docs, slugs }).join('\n')
  const slugs = { a: { vi: 'bai-a', en: 'article-a' } }
  expect(run({ a: entry({ group: 'misc' }) }, slugs)).toMatch(/content\/docs\/index\.ts \(a\): group "misc"/)
  expect(run({ a: entry({ updatedAt: '2026-10-16' }) }, slugs)).toMatch(/updatedAt 2026-10-16 ở tương lai/)
  expect(run({ a: entry({ updatedAt: '2026-02-30' }) }, slugs)).toMatch(/updatedAt "2026-02-30" không phải ngày/)
  expect(run({ a: entry({ updatedAt: '2026-13-01' }) }, slugs)).toMatch(/updatedAt "2026-13-01" không phải ngày/)
  expect(run({ a: entry({ vi: { ...copy('Bài'), description: 'ngắn' } }) }, slugs)).toMatch(/content\/docs\/vi\/bai-a\.mdx: description dài 4 ký tự/)
  expect(run({ a: entry({ en: copy('A very long article title that goes on and on and on') }) }, slugs)).toMatch(/content\/docs\/en\/article-a\.mdx: title kèm hậu tố dài \d+ ký tự.*thêm metaTitle/)
  expect(run({ a: entry({ vi: copy('Cài EduFlow') }) }, slugs)).toMatch(/title đã có "EduFlow"/)
  expect(run({ a: entry(), b: entry() }, { ...slugs, b: { vi: 'bai-b', en: 'article-b' } })).toMatch(/order 1 trùng với a trong nhóm start/)
  expect(run({ a: entry(), b: entry({ order: 2 }) }, { ...slugs, b: { vi: 'bai-a', en: 'article-b' } })).toMatch(/slug "bai-a" trùng/)
  expect(run({ a: entry() }, { a: { vi: 'Bai_A', en: 'article-a' } })).toMatch(/slug "Bai_A" phải khớp/)
})

// Review Focus 4: CI build theo giờ UTC; ngày ghi trong bài là ngày Việt Nam.
test('today is the Vietnamese date, so an article dated today never fails a UTC build', () => {
  const lateEveningUtc = new Date('2026-10-15T18:30:00Z') // 01:30 ngày 16/10 ở Việt Nam
  expect(todayInVietnam(lateEveningUtc)).toBe('2026-10-16')
  const slugs = { a: { vi: 'bai-a', en: 'article-a' } }
  expect(validateDocs({ ...base, slugs, docs: { a: entry({ updatedAt: '2026-10-16' }) }, today: todayInVietnam(lateEveningUtc) })).toEqual([])
})

test('heading ids are plain kebab-case without diacritics', () => {
  expect(slugifyHeading('Bước 2: Đặt ngân sách tháng')).toBe('buoc-2-dat-ngan-sach-thang')
  expect(slugifyHeading('  Gỡ cài đặt  ')).toBe('go-cai-dat')
})

test('the table of contents follows ## headings and <Step> blocks in order, outside code fences', () => {
  const src = ['## Trước khi bắt đầu', '<Step n={1} id="chon-tep" title="Chọn đúng tệp">', '```', '## không phải tiêu đề', '```', '### Mục con', '## Gỡ cài đặt'].join('\n')
  expect(extractToc(src)).toEqual([
    { id: 'truoc-khi-bat-dau', label: 'Trước khi bắt đầu' },
    { id: 'chon-tep', label: 'Chọn đúng tệp' },
    { id: 'go-cai-dat', label: 'Gỡ cài đặt' },
  ])
})

// Review Focus 3: tiêu đề có định dạng làm id rỗng hay sai; hai tiêu đề trùng làm mục lục trỏ nhầm.
test('the body rules reject what would break headings, anchors or images', () => {
  const errs = (src: string) => checkDocBody('x.mdx', src).join('\n')
  expect(errs('# Tiêu đề một')).toMatch(/x\.mdx:1: không dùng tiêu đề #/)
  expect(errs('##### Quá sâu')).toMatch(/sâu hơn ####/)
  for (const h of ['## Có [link](https://x)', '## Có `mã`', '## **Đậm**', '## Có <Ui>Nút</Ui>']) expect(errs(h), h).toMatch(/chữ trơn/)
  expect(errs('![ảnh](/a.png)')).toMatch(/dùng <Figure>/)
  expect(errs('## Bước một\n\n## Bước một')).toMatch(/id "buoc-mot" trùng/)
  expect(errs('<Step n={1} id="a" title="A">\n## A')).toMatch(/id "a" trùng/)
  expect(errs('<Step n={1} title="Thiếu id">')).toMatch(/thiếu id hoặc title/)
  expect(errs('## !!!')).toMatch(/id rỗng/)
  expect(errs('## Trước khi bắt đầu\n\n```\n# lệnh shell\n```\n\n<Step n={1} id="mot" title="Một">')).toBe('')
})

// Một bộ quét duy nhất cho mục lục và luật thân bài, để hai bên không bao giờ lệch nhau.
test('scanDocLines returns headings and steps with line numbers and skips fenced code', () => {
  const src = ['## Một', '```', '## bỏ', '<Step n={1} id="x" title="X">', '```', '<Step n={1} id="chon" title="Chọn">', '### Con'].join('\n')
  expect(scanDocLines(src)).toEqual([
    { line: 1, kind: 'heading', level: 2, text: 'Một', id: 'mot' },
    { line: 6, kind: 'step', text: 'Chọn', id: 'chon', title: 'Chọn' },
    { line: 7, kind: 'heading', level: 3, text: 'Con', id: 'con' },
  ])
})
