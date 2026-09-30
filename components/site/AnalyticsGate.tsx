'use client'

import { GoogleAnalytics } from '@next/third-parties/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { consentBannerEnabled } from '@/lib/consent'
import { useConsent } from '@/lib/useConsent'

/**
 * Vercel Analytics và Speed Insights luôn bật (không cookie) khi chạy trên Vercel; GA4 chỉ khi có ID và
 * (không hỏi hoặc đã đồng ý). Ngoài Vercel (dev, e2e) hai script /_vercel/* không tồn tại nên không nhúng.
 */
export function AnalyticsGate({ gaId }: { gaId?: string }) {
  const [consent] = useConsent()
  const onVercel = Boolean(process.env.NEXT_PUBLIC_VERCEL_ENV)
  const gaAllowed = Boolean(gaId) && (!consentBannerEnabled() || consent === 'granted')
  return (
    <>
      {onVercel ? <Analytics /> : null}
      {onVercel ? <SpeedInsights /> : null}
      {gaAllowed && gaId ? <GoogleAnalytics gaId={gaId} /> : null}
    </>
  )
}
