import { expect, test } from 'vitest'
import { detectPlatform, PLATFORM_FOR_OS } from '@/lib/platform'

test('detects the OS from the user agent', () => {
  expect(detectPlatform('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')).toBe('windows')
  expect(detectPlatform('Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15')).toBe('macos')
  expect(detectPlatform('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)')).toBe(null)
  expect(detectPlatform('Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)')).toBe(null)
  expect(detectPlatform('Mozilla/5.0 (X11; Linux x86_64)')).toBe(null)
  expect(detectPlatform('')).toBe(null)
})

test('prefers the client hints platform when present', () => {
  expect(detectPlatform('', 'macOS')).toBe('macos')
  expect(detectPlatform('', 'Windows')).toBe('windows')
  expect(detectPlatform('Mozilla/5.0 (Windows NT 10.0)', 'Linux')).toBe(null)
})

test('maps OS to the platforms to show first', () => {
  expect(PLATFORM_FOR_OS.windows).toEqual(['windows-x64'])
  expect(PLATFORM_FOR_OS.macos).toEqual(['macos-arm64', 'macos-x64'])
})

test('an iPad that presents itself as a Mac is not a desktop (iPadOS 13+)', () => {
  const ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15'
  expect(detectPlatform(ua, undefined, 5)).toBe(null)
  expect(detectPlatform(ua, undefined, 0)).toBe('macos')
  expect(detectPlatform(ua)).toBe('macos')
})
