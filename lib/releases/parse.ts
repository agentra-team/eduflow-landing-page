import type { Platform, ReleaseAsset } from './types'

interface FeedFile {
  url: string
  sha512: string
  size: number
}
interface Feed {
  version: string
  releaseDate?: string
  path?: string
  files: FeedFile[]
}

function isFile(x: unknown): x is FeedFile {
  if (!x || typeof x !== 'object') return false
  const f = x as Record<string, unknown>
  return typeof f.url === 'string' && typeof f.sha512 === 'string' && typeof f.size === 'number'
}

function isFeed(x: unknown): x is Feed {
  if (!x || typeof x !== 'object') return false
  const f = x as Record<string, unknown>
  return typeof f.version === 'string' && Array.isArray(f.files) && f.files.every(isFile)
}

/** Ghép URL tải: tên tệp Windows có dấu cách nên phải mã hoá. */
export function joinUrl(baseUrl: string, fileName: string): string {
  return `${baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`}${encodeURIComponent(fileName)}`
}

function toAsset(platform: Platform, feed: Feed, file: FeedFile, baseUrl: string): ReleaseAsset {
  return {
    platform,
    version: feed.version,
    fileName: file.url,
    url: joinUrl(baseUrl, file.url),
    sizeBytes: file.size,
    sha512: file.sha512,
    releaseDate: feed.releaseDate ?? '',
  }
}

/**
 * latest.yml (Windows) và latest-mac.yml (macOS) → danh sách tệp tải, thứ tự windows-x64, macos-arm64, macos-x64.
 * Bỏ .zip và .blockmap (chỉ cho auto-update). Feed thiếu hoặc sai hình dạng → bỏ qua phần đó, không ném lỗi (spec §7.3).
 */
export function parseFeeds(input: { windows?: unknown; mac?: unknown }, baseUrl: string): ReleaseAsset[] {
  const out: ReleaseAsset[] = []
  if (isFeed(input.windows)) {
    const feed = input.windows
    const exe = feed.files.find((f) => f.url.endsWith('.exe') && (!feed.path || f.url === feed.path)) ?? feed.files.find((f) => f.url.endsWith('.exe'))
    if (exe) out.push(toAsset('windows-x64', feed, exe, baseUrl))
  }
  if (isFeed(input.mac)) {
    const feed = input.mac
    const arm64 = feed.files.find((f) => f.url.endsWith('-arm64.dmg'))
    const x64 = feed.files.find((f) => f.url.endsWith('.dmg') && !f.url.includes('arm64'))
    if (arm64) out.push(toAsset('macos-arm64', feed, arm64, baseUrl))
    if (x64) out.push(toAsset('macos-x64', feed, x64, baseUrl))
  }
  return out
}
