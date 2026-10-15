import { expect, test } from 'vitest'
import { DOC_IDS } from '@/content/docs/slugs'
import { TOPIC_IDS, TOPIC_META, TOPICS, topicWordCount } from '@/content/topics'
import { routing } from '@/i18n/routing'
import { todayInVietnam } from '@/lib/docs/validate'

const all = () => TOPIC_IDS.flatMap((id) => routing.locales.map((locale) => ({ id, locale, c: TOPICS[locale][id] })))
const has = (text: string, term: string) => text.toLowerCase().includes(term.toLowerCase())

test('every topic has a routing key and a real update date', () => {
  for (const id of TOPIC_IDS) {
    expect(Object.hasOwn(routing.pathnames, `/${id}`), id).toBe(true)
    expect(TOPIC_META[id].updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(TOPIC_META[id].updatedAt <= todayInVietnam(), id).toBe(true)
  }
})

test('the H1 and the summary carry the primary keyword (spec §7.2)', () => {
  for (const { id, locale, c } of all()) {
    expect(has(c.h1, c.keywords[0]), `${id} ${locale} h1`).toBe(true)
    expect(has(c.inShort, c.keywords[0]), `${id} ${locale} inShort`).toBe(true)
  }
})

test('every topic has five FAQ answers, a dated comparison table, a "not yet" section and steps that link real guides', () => {
  for (const { id, locale, c } of all()) {
    const where = `${id} ${locale}`
    expect(c.faq, where).toHaveLength(5)
    expect(new Set(c.faq.map((f) => f.q)).size, where).toBe(5)
    for (const row of c.table.rows) expect(row, where).toHaveLength(c.table.head.length)
    expect(c.table.checkedAt, where).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(c.limits.items.length, where).toBeGreaterThanOrEqual(2)
    expect(c.howTo.steps.length, where).toBeGreaterThanOrEqual(3)
    for (const s of c.howTo.steps) if (s.doc) expect(DOC_IDS, where).toContain(s.doc)
  }
})

test('the English page mirrors the Vietnamese structure (spec §8.3)', () => {
  const shape = (locale: 'vi' | 'en', id: (typeof TOPIC_IDS)[number]) => {
    const c = TOPICS[locale][id]
    return [c.faq.length, c.table.head.length, c.table.rows.length, c.howTo.steps.length, c.limits.items.length, c.blocks?.length ?? 0, c.definition.paras?.length ?? 0]
  }
  for (const id of TOPIC_IDS) expect(shape('en', id), id).toEqual(shape('vi', id))
})

test('Vietnamese topic pages run 1,200 to 1,800 words (spec §7.2)', () => {
  for (const id of TOPIC_IDS) {
    const n = topicWordCount(TOPICS.vi[id])
    expect(n, id).toBeGreaterThanOrEqual(1200)
    expect(n, id).toBeLessThanOrEqual(1800)
  }
})
