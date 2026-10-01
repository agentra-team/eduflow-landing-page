import { parse } from 'yaml'
import { isFeed } from './parse'

export const FEED_TIMEOUT_MS = 5000
export const FEED_REVALIDATE_SECONDS = 600

type FetchLike = (url: string, init?: RequestInit) => Promise<Response>

/** Tải một tệp .yml của feed. Mọi lỗi (HTTP, hết giờ, YAML hỏng, nội dung không phải feed) → null + một dòng log nhãn cố định (spec §7.4). */
export async function fetchFeed(url: string, fetchImpl: FetchLike = fetch): Promise<unknown | null> {
  try {
    const res = await fetchImpl(url, {
      signal: AbortSignal.timeout(FEED_TIMEOUT_MS),
      next: { revalidate: FEED_REVALIDATE_SECONDS },
    })
    if (!res.ok) {
      console.error('release_feed_unavailable', url, res.status)
      return null
    }
    const body: unknown = parse(await res.text())
    // Trang lỗi HTML hay tệp rỗng trả 200 không phải feed: coi như không có, để snapshot còn thay được.
    if (!isFeed(body)) {
      console.error('release_feed_unavailable', url, 'not a feed')
      return null
    }
    return body
  } catch (err) {
    console.error('release_feed_unavailable', url, err instanceof Error ? err.message : String(err))
    return null
  }
}
