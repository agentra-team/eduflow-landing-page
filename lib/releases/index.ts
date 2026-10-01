import { cache } from 'react'
import { site } from '@/lib/site'
import { fetchFeed } from './feed'
import { parseFeeds } from './parse'
import { releaseSnapshot, type ReleaseSnapshot } from './snapshot'
import type { Platform, ReleaseAsset, ReleaseInfo } from './types'

export type { FeedSource, Platform, ReleaseAsset, ReleaseInfo } from './types'

/** Ghép feed với snapshot, thuần để test. Không có URL gốc nào thì không dựng được link tải → không có tệp. */
export function resolveReleases(input: {
  base: string | null
  windows: unknown | null
  mac: unknown | null
  snapshot: ReleaseSnapshot
}): ReleaseInfo {
  const base = input.base ?? input.snapshot.baseUrl
  const windows = input.windows ?? input.snapshot.windows
  const mac = input.mac ?? input.snapshot.mac
  return {
    assets: base ? parseFeeds({ windows, mac }, base) : [],
    source: { windows: input.windows ? 'feed' : 'snapshot', mac: input.mac ? 'feed' : 'snapshot' },
  }
}

/** Tải feed thật (ISR 10 phút) khi có URL; mỗi lần render gọi một lần (React.cache). */
export const getReleases = cache(async (): Promise<ReleaseInfo> => {
  const base = site.feedUrl()
  const [windows, mac] = base
    ? await Promise.all([fetchFeed(`${base}latest.yml`), fetchFeed(`${base}latest-mac.yml`)])
    : [null, null]
  return resolveReleases({ base, windows, mac, snapshot: releaseSnapshot })
})

export function findAsset(assets: ReleaseAsset[], platform: Platform): ReleaseAsset | undefined {
  return assets.find((a) => a.platform === platform)
}

/** Thời điểm phát hành của một tệp; '' (không rõ ngày) xếp sau mọi ngày thật. */
const releasedAt = (asset: ReleaseAsset) => {
  const time = Date.parse(asset.releaseDate)
  return Number.isNaN(time) ? -Infinity : time
}

/**
 * Phiên bản và ngày mới nhất trong các tệp (Windows và macOS có thể phát hành lệch nhau). So theo thời điểm chứ không theo chữ, vì ngày hợp lệ
 * là mọi chuỗi Date.parse hiểu (parse.ts), không chỉ dạng ISO UTC. Hoà, hoặc không tệp nào có ngày, thì lấy tệp đứng trước.
 */
export function latestRelease(assets: ReleaseAsset[]): { version: string; releaseDate: string } | null {
  if (assets.length === 0) return null
  const newest = assets.reduce((best, asset) => (releasedAt(asset) > releasedAt(best) ? asset : best))
  return { version: newest.version, releaseDate: newest.releaseDate }
}
