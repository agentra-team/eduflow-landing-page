import type { Platform } from '@/lib/releases/types'

export type DetectedOs = 'windows' | 'macos'

/** Trình duyệt không phân biệt được chip Mac, nên macOS ứng với cả hai bản (spec §6.2). */
export const PLATFORM_FOR_OS: Record<DetectedOs, Platform[]> = {
  windows: ['windows-x64'],
  macos: ['macos-arm64', 'macos-x64'],
}

/** Nhận hệ điều hành desktop từ user agent (ưu tiên Client Hints). iOS/iPadOS/Linux → null.
 *  iPadOS 13+ tự xưng "Macintosh"; máy Mac không có màn cảm ứng, nên maxTouchPoints > 1 là iPad. */
export function detectPlatform(userAgent: string, uaDataPlatform?: string, maxTouchPoints = 0): DetectedOs | null {
  if (uaDataPlatform) {
    if (uaDataPlatform === 'Windows') return 'windows'
    if (uaDataPlatform === 'macOS') return 'macos'
    return null
  }
  if (/iPhone|iPad|iPod/i.test(userAgent)) return null
  if (/Windows NT/i.test(userAgent)) return 'windows'
  if (/Macintosh|Mac OS X/i.test(userAgent)) return maxTouchPoints > 1 ? null : 'macos'
  return null
}
