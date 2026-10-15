import { expect, test } from 'vitest'
import { HOME_FACTS, HOME_FAQ_KEYS, HOME_LINKS } from '@/content/home'
import { DOC_IDS } from '@/content/docs/slugs'
import { TOPIC_IDS } from '@/content/topics'
import { brand } from '@/lib/seo/brand'
import en from '@/messages/en.json'
import vi from '@/messages/vi.json'

test('the home FAQ shows every question in messages, ten of them (spec §6.12)', () => {
  for (const m of [vi, en]) expect(Object.keys(m.home.faq).filter((k) => /^q\d+$/.test(k))).toEqual([...HOME_FAQ_KEYS])
  expect(HOME_FAQ_KEYS).toHaveLength(10)
})

test('"What is EduFlow?" is answered with the canonical description, word for word', () => {
  expect(vi.home.faq.q9.a.startsWith(brand.description.vi)).toBe(true)
  expect(en.home.faq.q9.a.startsWith(brand.description.en)).toBe(true)
})

test('the home H1 is the category sentence with the primary keyword', () => {
  expect(vi.home.hero.h1.toLowerCase()).toContain('phần mềm ai cho giáo viên')
  expect(en.home.hero.h1.toLowerCase()).toContain('ai software for teachers')
})

test('home links point at real topics and guides', () => {
  for (const links of Object.values(HOME_LINKS.features)) for (const l of links) if ('topic' in l) expect(TOPIC_IDS).toContain(l.topic)
  for (const d of [...Object.values(HOME_LINKS.roles), ...HOME_LINKS.docs]) expect(DOC_IDS).toContain(d)
})

test('the home facts are the literal numbers the page prints (P-F24)', () => {
  expect(HOME_FACTS).toEqual({ levels: 3, versions: 24, localCost: 0 })
})

test('the home copy never claims what the app does not do yet (R-K1)', () => {
  for (const m of [vi, en]) {
    const all = JSON.stringify([m.home, m.common.tagline, m.footer.tagline])
    // Không hứa bước ký riêng, công chứng, tự cập nhật, áp đề xuất vào bản nháp.
    expect(all).not.toMatch(/ký và|and sign|công chứng|notariz|Khởi động lại|Restart|tự báo khi có bản mới|tells you when a new version/i)
  }
})
