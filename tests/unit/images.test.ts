import { statSync } from 'node:fs'
import { expect, test } from 'vitest'

export const PRODUCT_IMAGES = [
  'assistant-home', 'result', 'exam-setup', 'slide-studio', 'course-workbench', 'course-gates', 'course-approval',
  'program-graph', 'program-review', 'what-if', 'assistant-states', 'usage', 'jobs-cost',
] as const

test('every product image exists and weighs at most 200 KB (spec §8.3)', () => {
  for (const name of PRODUCT_IMAGES) {
    const size = statSync(`public/images/product/${name}.webp`).size
    expect(size, name).toBeGreaterThan(10_000)
    expect(size, name).toBeLessThanOrEqual(200 * 1024)
  }
})
