import { expect, test } from 'vitest'
import { formatAssetMeta, formatBytes, formatDate, releaseLead } from '@/lib/format'

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

// Ngày phát hành là dữ liệu của feed: có thể vắng hoặc hỏng (lib/releases/parse.ts đổi nó thành ''). Chữ hiện ra không được để lại dấu thừa.
test('formatAssetMeta joins size, version and date, and drops the date with its separator when there is none', () => {
  const asset = { sizeBytes: 157058273, version: '1.0.0', releaseDate: '2026-09-15T15:22:00.690Z' }
  expect(formatAssetMeta(asset, 'vi')).toBe('150 MB · v1.0.0 · 15/09/2026')
  expect(formatAssetMeta(asset, 'en')).toBe('150 MB · v1.0.0 · 15 Sep 2026')
  expect(formatAssetMeta({ ...asset, releaseDate: '' }, 'vi')).toBe('150 MB · v1.0.0')
  expect(formatAssetMeta({ ...asset, releaseDate: 'not a date' }, 'en')).toBe('150 MB · v1.0.0')
})

test('releaseLead names the release date only when there is a valid one', () => {
  const latest = { version: '1.0.0', releaseDate: '2026-09-15T15:22:00.690Z' }
  expect(releaseLead(latest, 'vi')).toEqual({ key: 'lead', values: { version: '1.0.0', date: '15/09/2026' } })
  expect(releaseLead(latest, 'en')).toEqual({ key: 'lead', values: { version: '1.0.0', date: '15 Sep 2026' } })
  expect(releaseLead({ ...latest, releaseDate: '' }, 'vi')).toEqual({ key: 'leadNoDate', values: { version: '1.0.0' } })
  expect(releaseLead({ ...latest, releaseDate: 'not a date' }, 'en')).toEqual({ key: 'leadNoDate', values: { version: '1.0.0' } })
  expect(releaseLead(null, 'vi')).toBeNull()
})
