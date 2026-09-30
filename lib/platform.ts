import type { Platform } from '@/lib/releases/types'

export type DetectedOs = 'windows' | 'macos'

/** Trình duyệt không phân biệt được chip Mac, nên macOS ứng với cả hai bản (spec §6.2). */
export const PLATFORM_FOR_OS: Record<DetectedOs, Platform[]> = {
  windows: ['windows-x64'],
  macos: ['macos-arm64', 'macos-x64'],
}

/** Nhận hệ điều hành desktop từ user agent (ưu tiên Client Hints). iOS/iPadOS/Linux → null. */
export function detectPlatform(userAgent: string, uaDataPlatform?: string): DetectedOs | null {
  if (uaDataPlatform) {
    if (uaDataPlatform === 'Windows') return 'windows'
    if (uaDataPlatform === 'macOS') return 'macos'
    return null
  }
  if (/iPhone|iPad|iPod/i.test(userAgent)) return null
  if (/Windows NT/i.test(userAgent)) return 'windows'
  if (/Macintosh|Mac OS X/i.test(userAgent)) return 'macos'
  return null
}
