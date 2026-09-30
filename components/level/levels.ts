import type { IconName } from '@/components/ui/icons'
import type { PageKey } from '@/i18n/routing'

export type LevelKey = 'k12' | 'university' | 'program'
export type Shot = { src: string; width: number; height: number }

const shot = (name: string): Shot => ({ src: `/images/product/${name}.webp`, width: 1600, height: 1000 })

type Six<T> = [T, T, T, T, T, T]

export const LEVELS: Record<LevelKey, { page: PageKey; screens: [Shot, Shot, Shot]; icons: Six<IconName> }> = {
  k12: {
    page: '/k12',
    screens: [shot('exam-setup'), shot('result'), shot('slide-studio')],
    icons: ['layers', 'shuffle', 'check', 'file', 'monitor', 'archive'],
  },
  university: {
    page: '/university',
    screens: [shot('course-workbench'), shot('course-gates'), shot('course-approval')],
    icons: ['graduation', 'clock', 'file', 'monitor', 'shield', 'book'],
  },
  program: {
    page: '/program',
    screens: [shot('program-graph'), shot('program-review'), shot('what-if')],
    icons: ['graph', 'warning', 'search', 'check', 'user-check', 'refresh'],
  },
}
