export type Platform = 'windows-x64' | 'macos-arm64' | 'macos-x64'

export interface ReleaseAsset {
  platform: Platform
  version: string
  fileName: string
  url: string
  sizeBytes: number
  sha512: string
  /** ISO 8601 */
  releaseDate: string
}

export type FeedSource = 'feed' | 'snapshot'

export interface ReleaseInfo {
  assets: ReleaseAsset[]
  source: { windows: FeedSource; mac: FeedSource }
}
