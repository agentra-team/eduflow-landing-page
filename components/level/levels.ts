import type { IconName } from '@/components/ui/icons'
import type { DocId } from '@/content/docs/slugs'
import type { TopicId } from '@/content/topics'

export type LevelKey = 'k12' | 'university' | 'program'
export type Shot = { src: string; width: number; height: number }

const shot = (name: string): Shot => ({ src: `/images/product/${name}.webp`, width: 1600, height: 1000 })

type Six<T> = [T, T, T, T, T, T]

export const LEVELS: Record<LevelKey, { page: '/k12' | '/university' | '/program'; screens: [Shot, Shot, Shot]; icons: Six<IconName>; topics: TopicId[]; docs: DocId[] }> = {
  k12: {
    page: '/k12',
    screens: [shot('exam-setup'), shot('result'), shot('slide-studio')],
    icons: ['layers', 'shuffle', 'check', 'file', 'monitor', 'archive'],
    topics: ['test-generator', 'test-versions', 'lesson-plans', 'lesson-slides'],
    docs: ['create-a-test', 'export-test-versions', 'lesson-plans', 'lesson-slides'],
  },
  university: {
    page: '/university',
    screens: [shot('course-workbench'), shot('course-gates'), shot('course-approval')],
    icons: ['graduation', 'file', 'search', 'spark', 'shield', 'clock'],
    topics: ['course-syllabus'],
    docs: ['adding-documents', 'using-the-assistant'],
  },
  program: {
    page: '/program',
    screens: [shot('program-graph'), shot('program-review'), shot('what-if')],
    icons: ['book', 'file', 'spark', 'graph', 'warning', 'refresh'],
    topics: ['course-syllabus', 'vs-chatgpt'],
    docs: ['adding-documents', 'using-the-assistant'],
  },
}
