import { parse } from 'yaml'

export const FEED_TIMEOUT_MS = 5000
export const FEED_REVALIDATE_SECONDS = 600

type FetchLike = (url: string, init?: RequestInit) => Promise<Response>

/** Tải một tệp .yml của feed. Mọi lỗi (HTTP, hết giờ, YAML hỏng) → null + một dòng log nhãn cố định (spec §7.4). */
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
    return parse(await res.text()) ?? null
  } catch (err) {
    console.error('release_feed_unavailable', url, err instanceof Error ? err.message : String(err))
    return null
  }
}
