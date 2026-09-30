import { expect, test } from 'vitest'
import { ICON_NAMES, ICONS } from '@/components/ui/icons'

test('every icon has SVG path data and no emoji', () => {
  expect(ICON_NAMES.length).toBeGreaterThan(30)
  for (const name of ICON_NAMES) {
    expect(ICONS[name], name).toMatch(/<(path|circle|rect)/)
    expect(ICONS[name], name).not.toMatch(/[\u{1F300}-\u{1FAFF}]/u)
  }
  expect(ICON_NAMES).toContain('download')
  expect(ICON_NAMES).toContain('apple')
  expect(ICON_NAMES).toContain('windows')
})

test('EduFlow icons exist', () => {
  for (const name of ['spark', 'graduation', 'wifi-off', 'eye', 'wallet', 'layers', 'shuffle', 'receipt'] as const) {
    expect(ICON_NAMES).toContain(name)
    expect(ICONS[name]).toMatch(/<(path|circle|rect)/)
  }
})
