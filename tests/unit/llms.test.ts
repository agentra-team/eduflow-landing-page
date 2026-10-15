import { beforeAll, expect, test } from 'vitest'
import { TOPIC_IDS, TOPICS } from '@/content/topics'
import { brand } from '@/lib/seo/brand'
import { llmsFullTxt, llmsTxt } from '@/lib/seo/llms'
import { indexablePages, pageUrl } from '@/lib/seo/pages'

const SITE = 'https://eduflow.agentra.io.vn'
beforeAll(() => {
  process.env.NEXT_PUBLIC_SITE_URL = SITE
})

test('llms.txt opens with the canonical description and the disambiguation', () => {
  const txt = llmsTxt({ release: { version: '1.0.0', releaseDate: '2026-10-01T02:00:00.000Z' } })
  expect(txt.startsWith(`# EduFlow\n\n> ${brand.description.vi}\n\n${brand.description.en}\n`)).toBe(true)
  expect(txt).toContain(brand.disambiguation.vi)
  expect(txt).toContain(brand.disambiguation.en)
  expect(txt).toContain('1.0.0 (2026-10-01)')
  expect(llmsTxt({ release: null })).not.toMatch(/Latest version/)
})

// Spec §12.1: llms.txt liệt kê đúng tập trang indexable, trên gốc canonical.
test('llms.txt links exactly the indexable pages, on the canonical origin', () => {
  const txt = llmsTxt({ release: null })
  const links = [...txt.matchAll(/\]\((https?:[^)]+)\)/g)].map((m) => m[1])
  const pages = indexablePages().flatMap((p) => [pageUrl(p, 'vi'), pageUrl(p, 'en')])
  expect(links.filter((l) => !l.endsWith('.txt') && !l.endsWith('.xml')).sort()).toEqual([...pages].sort())
  for (const l of links) expect(l.startsWith(SITE)).toBe(true)
  expect(txt).toContain(`${SITE}/llms-full.txt`)
  expect(txt).toContain(`${SITE}/sitemap.xml`)
  expect(txt).not.toMatch(/localhost|vercel\.app/)
})

test('llms-full.txt carries every topic page and the home FAQ as shown', () => {
  const full = llmsFullTxt()
  for (const id of TOPIC_IDS) {
    for (const locale of ['vi', 'en'] as const) {
      const c = TOPICS[locale][id]
      expect(full).toContain(`## ${c.h1}`)
      expect(full).toContain(`**${c.definition.term}** ${c.definition.rest}`)
      for (const item of c.limits.items) expect(full).toContain(item)
      for (const f of c.faq) expect(full).toContain(f.a)
    }
  }
  expect(full).toContain(brand.description.vi)
  expect(full).not.toMatch(/\{\w+\}/)
})

test('both files avoid the em dash and a localhost origin', () => {
  for (const txt of [llmsTxt({ release: null }), llmsFullTxt()]) {
    expect(txt).not.toContain(String.fromCharCode(0x2014))
    expect(txt).not.toMatch(/localhost/)
  }
})
