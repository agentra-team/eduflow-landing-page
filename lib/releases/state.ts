import { PLATFORM_FOR_OS, type DetectedOs } from '@/lib/platform'
import type { ReleaseAsset } from './types'

export type DownloadState = 'available' | 'prelaunch'

/** Không có tệp nào từ feed hay snapshot → trạng thái sắp phát hành (spec §6.8). */
export function downloadState(assets: ReleaseAsset[]): DownloadState {
  return assets.length > 0 ? 'available' : 'prelaunch'
}

/** Hệ điều hành của người xem đã có bản cài chưa (feed có thể phát hành lệch hai nền tảng). */
export function hasAssetFor(assets: ReleaseAsset[], os: DetectedOs): boolean {
  return assets.some((a) => PLATFORM_FOR_OS[os].includes(a.platform))
}
