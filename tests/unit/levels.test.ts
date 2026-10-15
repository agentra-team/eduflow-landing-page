import { expect, test } from 'vitest'
import { LEVELS } from '@/components/level/levels'
import { DOC_IDS } from '@/content/docs/slugs'
import { TOPIC_IDS } from '@/content/topics'
import { STATIC_PAGES } from '@/lib/seo/pages'
import en from '@/messages/en.json'
import vi from '@/messages/vi.json'

// Spec §7.1: /k12 có bốn trang chủ đề Phổ thông; /university có đề cương học phần; /program dẫn đề cương và EduFlow và ChatGPT.
test('each level links the topic pages and guides of spec §7.1', () => {
  expect(LEVELS.k12.topics).toEqual(['test-generator', 'test-versions', 'lesson-plans', 'lesson-slides'])
  expect(LEVELS.university.topics).toEqual(['course-syllabus'])
  expect(LEVELS.program.topics).toEqual(['course-syllabus', 'vs-chatgpt'])
  for (const level of Object.values(LEVELS)) {
    for (const t of level.topics) expect(TOPIC_IDS).toContain(t)
    expect(level.docs.length).toBeGreaterThanOrEqual(2)
    for (const d of level.docs) expect(DOC_IDS).toContain(d)
  }
})

test('each level H1 carries its primary keyword and its FAQ has five questions in both languages', () => {
  for (const key of ['k12', 'university', 'program'] as const) {
    const keyword = STATIC_PAGES[`/${key}`].keyword
    expect(vi.levels[key].hero.h1.toLowerCase()).toContain(keyword.vi.toLowerCase())
    expect(en.levels[key].hero.h1.toLowerCase()).toContain(keyword.en.toLowerCase())
    for (const m of [vi, en]) expect(Object.keys(m.levels[key].faq).filter((k) => /^q\d$/.test(k))).toEqual(['q1', 'q2', 'q3', 'q4', 'q5'])
  }
})

// R-K1: app v1 chưa có màn soạn CLO, kế hoạch tuần, đề cương hay rà soát chương trình; trang Học phần và Chương trình phải nói là lộ trình.
test('the university and program pages label the unshipped tools as roadmap in both languages', () => {
  for (const key of ['university', 'program'] as const) {
    expect(vi.levels[key].hero.lead).toMatch(/lộ trình/)
    expect(en.levels[key].hero.lead).toMatch(/roadmap/i)
    expect(vi.levels[key].screens.s1.desc).toMatch(/dự kiến/)
    expect(en.levels[key].screens.s1.desc).toMatch(/planned/i)
  }
})
