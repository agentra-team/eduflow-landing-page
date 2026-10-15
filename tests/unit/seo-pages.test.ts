import { beforeAll, expect, test } from 'vitest'
import { routing } from '@/i18n/routing'
import { brand } from '@/lib/seo/brand'
import { BRAND_SUFFIX, finalTitle, indexablePages } from '@/lib/seo/pages'
import vi from '@/messages/vi.json'

beforeAll(() => {
  process.env.NEXT_PUBLIC_SITE_URL = 'https://eduflow.test'
})

const each = () => indexablePages().flatMap((p) => routing.locales.map((locale) => ({ p, locale, seo: p.seo[locale] })))
const len = (s: string) => [...s].length

test('the brand suffix is the one the layout title template adds', () => {
  expect(BRAND_SUFFIX).toBe(` · ${vi.common.siteName}`)
})

test('every title is at most 60 characters with its suffix and names EduFlow at most once (spec §9.2)', () => {
  const bad = each()
    .map(({ p, locale, seo }) => ({ where: `${p.id} ${locale}`, title: finalTitle(seo) }))
    .filter(({ title }) => len(title) > 60 || (title.match(/EduFlow/g) ?? []).length > 1)
    .map(({ where, title }) => `${where}: ${title} (${len(title)})`)
  expect(bad).toEqual([])
})

test('every meta description is 110 to 160 characters (spec §9.2)', () => {
  const bad = each()
    .filter(({ seo }) => len(seo.description) < 110 || len(seo.description) > 160)
    .map(({ p, locale, seo }) => `${p.id} ${locale} (${len(seo.description)})`)
  expect(bad).toEqual([])
})

test('titles and descriptions are unique within each language', () => {
  for (const locale of routing.locales) {
    const pages = indexablePages().map((p) => p.seo[locale])
    expect(new Set(pages.map(finalTitle)).size, locale).toBe(pages.length)
    expect(new Set(pages.map((s) => s.description)).size, locale).toBe(pages.length)
  }
})

test('no two pages share a primary keyword (spec §4.2)', () => {
  for (const locale of routing.locales) {
    const keywords = indexablePages().flatMap((p) => (p.keyword ? [p.keyword[locale].toLowerCase()] : []))
    const dupes = keywords.filter((k, i) => keywords.indexOf(k) !== i)
    expect(dupes, locale).toEqual([])
  }
})

test('the title of every product page carries its primary keyword', () => {
  const bad = indexablePages()
    .filter((p) => p.keyword && !p.id.includes(':'))
    .flatMap((p) => routing.locales.filter((l) => !finalTitle(p.seo[l]).toLowerCase().includes(p.keyword![l].toLowerCase())).map((l) => `${p.id} ${l}`))
  expect(bad).toEqual([])
})

test('the home page uses the canonical description word for word', () => {
  const home = indexablePages().find((p) => p.id === '/')!
  expect(home.seo.vi.description).toBe(brand.description.vi)
  expect(home.seo.en.description).toBe(brand.description.en)
})

// Spec §1, §4.2: 17 trang và 12 bài, mỗi trang hai ngôn ngữ, là 58 URL.
test('the site has exactly 29 indexable pages, 58 URLs', () => {
  expect(indexablePages()).toHaveLength(29)
  expect(indexablePages().filter((p) => p.id.startsWith('topic:'))).toHaveLength(6)
  expect(indexablePages().filter((p) => p.id.startsWith('doc:'))).toHaveLength(12)
})
