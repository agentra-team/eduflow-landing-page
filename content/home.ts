import type { DocId } from '@/content/docs/slugs'
import type { TopicId } from '@/content/topics'
import { appFacts } from '@/lib/seo/app-facts'

/** Mười câu hỏi đáp của trang chủ, đúng thứ tự hiển thị; FAQPage dựng từ chính danh sách này (spec §6.12). */
export const HOME_FAQ_KEYS = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10'] as const

/** Đích link của các khối trang chủ (spec §4.5, §6): hub dẫn tới mọi pillar và mọi spoke. Chữ ở messages `home`. */
export const HOME_LINKS: {
  features: Record<'tests' | 'lessons' | 'assistant' | 'syllabus', Array<{ topic: TopicId } | { page: '/assistant' | '/program' }>>
  roles: Record<'teacher' | 'head' | 'lecturer' | 'qa', DocId>
  docs: DocId[]
} = {
  features: {
    tests: [{ topic: 'test-generator' }, { topic: 'test-versions' }],
    lessons: [{ topic: 'lesson-plans' }, { topic: 'lesson-slides' }],
    assistant: [{ page: '/assistant' }],
    syllabus: [{ topic: 'course-syllabus' }, { page: '/program' }],
  },
  roles: { teacher: 'create-a-test', head: 'export-test-versions', lecturer: 'adding-documents', qa: 'using-the-assistant' },
  docs: ['activation-and-trial', 'create-a-test', 'lesson-plans', 'using-the-assistant'],
}

/** Số của dải dữ kiện (spec §6.3): luôn lấy từ app-facts, nhãn ở messages `home.facts`. */
export const HOME_FACTS = { levels: appFacts.levels, versions: appFacts.maxTestVersions, localCost: appFacts.localWorkCostVnd }
