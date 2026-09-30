import { expect, test } from 'vitest'
import { formatBytes, formatDate } from '@/lib/format'

test('formatBytes', () => {
  expect(formatBytes(157058273, 'vi')).toBe('150 MB')
  expect(formatBytes(194928638, 'en')).toBe('186 MB')
  expect(formatBytes(199815749, 'vi')).toBe('191 MB')
  expect(formatBytes(5 * 1024 * 1024 + 300000, 'en')).toBe('5.3 MB')
  expect(formatBytes(5 * 1024 * 1024 + 300000, 'vi')).toBe('5,3 MB')
  expect(formatBytes(800 * 1024, 'en')).toBe('800 KB')
})

test('formatDate', () => {
  expect(formatDate('2026-09-15T15:22:00.690Z', 'vi')).toBe('15/09/2026')
  expect(formatDate('2026-09-15T15:22:00.690Z', 'en')).toBe('15 Sep 2026')
  expect(formatDate('not a date', 'en')).toBe('')
})
