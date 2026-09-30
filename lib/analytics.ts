import { sendGAEvent } from '@next/third-parties/google'
import { track as vercelTrack } from '@vercel/analytics'
import type { Locale } from '@/i18n/routing'
import type { Platform } from '@/lib/releases/types'

/** Sự kiện đo lường: tập đóng (spec §10). */
export type AnalyticsEvent =
  | { name: 'download_click'; platform: Platform; version: string; location: 'hero' | 'home_block' | 'download_page' | 'guide' }
  | { name: 'cta_click'; id: string; location: string }
  | { name: 'contact_click'; channel: 'email' | 'phone' | 'zalo' | 'maps' }
  | { name: 'locale_switch'; from: Locale; to: Locale }
  | { name: 'faq_open'; id: string }
  | { name: 'consent_change'; value: 'granted' | 'denied' }

type Deps = {
  ga?: (...args: Parameters<typeof sendGAEvent>) => void
  vercel?: (name: string, props: Record<string, string>) => void
  gaLoaded?: () => boolean
}

export function isGaLoaded(): boolean {
  return typeof window !== 'undefined' && typeof (window as { gtag?: unknown }).gtag === 'function'
}

/** Gửi tới Vercel Analytics luôn; tới GA4 chỉ khi gtag đã nạp (sau khi đồng ý cookie). Không bao giờ ném lỗi. */
export function track(event: AnalyticsEvent, deps: Deps = {}): void {
  const { name, ...rest } = event
  const props = rest as Record<string, string>
  const vercel = deps.vercel ?? vercelTrack
  const ga = deps.ga ?? sendGAEvent
  const gaLoaded = deps.gaLoaded ?? isGaLoaded
  try {
    vercel(name, props)
  } catch {
    /* analytics không được làm hỏng trang */
  }
  if (gaLoaded()) {
    try {
      ga('event', name, props)
    } catch {
      /* như trên */
    }
  }
}
