import type { Platform, ReleaseAsset } from './types'

interface FeedFile {
  url: string
  sha512: string
  size: number
}
interface Feed {
  version: string
  /** Chưa kiểm: feed có thể ghi số (YAML `releaseDate: 20261001`), chữ rác hay bỏ trống. `toReleaseDate` là chỗ duy nhất đổi nó thành chuỗi hợp lệ. */
  releaseDate?: unknown
  path?: string
  files: FeedFile[]
}

function isFile(x: unknown): x is FeedFile {
  if (!x || typeof x !== 'object') return false
  const f = x as Record<string, unknown>
  return typeof f.url === 'string' && typeof f.sha512 === 'string' && typeof f.size === 'number'
}

/**
 * Luật hình dạng feed của electron-updater, một nguồn duy nhất: chuỗi `version` và ít nhất một tệp đủ `url`, `sha512`, `size`.
 * `fetchFeed` (feed.ts) dùng nó lúc chạy; scripts/sync-releases.mjs là .mjs thuần nên chép lại đúng luật này, sửa ở đây thì sửa ở đó.
 */
export function isFeed(x: unknown): x is Feed {
  if (!x || typeof x !== 'object') return false
  const f = x as Record<string, unknown>
  return typeof f.version === 'string' && Array.isArray(f.files) && f.files.length > 0 && f.files.every(isFile)
}

/** Ghép URL tải: tên tệp Windows có dấu cách nên phải mã hoá. */
export function joinUrl(baseUrl: string, fileName: string): string {
  return `${baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`}${encodeURIComponent(fileName)}`
}

/**
 * Ranh giới của ngày phát hành: chỉ giữ chuỗi mà Date.parse hiểu, còn lại (số, chữ rác, rỗng, vắng) là ''. Mọi nơi dùng ngày phía sau (so sánh,
 * định dạng, JSON-LD, sitemap) nhờ đó chỉ phải xử lý một chuỗi, và '' nghĩa là "không rõ ngày".
 */
function toReleaseDate(raw: unknown): string {
  return typeof raw === 'string' && !Number.isNaN(Date.parse(raw)) ? raw : ''
}

function toAsset(platform: Platform, feed: Feed, file: FeedFile, baseUrl: string): ReleaseAsset {
  return {
    platform,
    version: feed.version,
    fileName: file.url,
    url: joinUrl(baseUrl, file.url),
    sizeBytes: file.size,
    sha512: file.sha512,
    releaseDate: toReleaseDate(feed.releaseDate),
  }
}

/**
 * latest.yml (Windows) và latest-mac.yml (macOS) → danh sách tệp tải, thứ tự windows-x64, macos-arm64, macos-x64.
 * macOS: .dmg khi feed có; không có thì .zip (app dựng bản macOS trên Linux từ 16/10/2026, nơi không làm được dmg, nên feed
 * chỉ có zip). Bỏ .blockmap. Feed thiếu hoặc sai hình dạng → bỏ qua phần đó, không ném lỗi (spec §7.3).
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
    const arm64 = feed.files.find((f) => f.url.endsWith('-arm64.dmg')) ?? feed.files.find((f) => f.url.endsWith('-arm64.zip'))
    const x64 =
      feed.files.find((f) => f.url.endsWith('.dmg') && !f.url.includes('arm64')) ??
      feed.files.find((f) => f.url.endsWith('.zip') && !f.url.includes('arm64'))
    if (arm64) out.push(toAsset('macos-arm64', feed, arm64, baseUrl))
    if (x64) out.push(toAsset('macos-x64', feed, x64, baseUrl))
  }
  return out
}
