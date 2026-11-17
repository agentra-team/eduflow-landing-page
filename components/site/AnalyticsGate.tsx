'use client'

import { GoogleAnalytics } from '@next/third-parties/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import Script from 'next/script'
import { useEffect } from 'react'
import { claritySnippet } from '@/lib/clarity'
import { consentBannerEnabled } from '@/lib/consent'
import { useConsent } from '@/lib/useConsent'

/**
 * Vercel Analytics và Speed Insights luôn bật (không cookie) khi chạy trên Vercel; GA4 và Microsoft Clarity chỉ khi có ID và
 * (không hỏi hoặc đã đồng ý). Ngoài Vercel (dev, e2e) hai script /_vercel/* không tồn tại nên không nhúng.
 */
export function AnalyticsGate({ gaId, clarityId }: { gaId?: string; clarityId?: string }) {
  const [consent] = useConsent()
  const onVercel = Boolean(process.env.NEXT_PUBLIC_VERCEL_ENV)
  const allowed = !consentBannerEnabled() || consent === 'granted'
  // Clarity đã nạp trong trang này mà lựa chọn đổi (tab khác xoá dữ liệu rồi chọn lại): báo Consent API v2 để Clarity dừng ghi và xoá
  // cookie của nó, hoặc ghi tiếp. Thẻ next/script có id chỉ chạy một lần mỗi trang, nên đồng ý lại cũng phải đi đường này.
  useEffect(() => {
    if (!clarityId || consent === 'pending') return
    window.clarity?.('consentv2', { ad_Storage: 'denied', analytics_Storage: allowed ? 'granted' : 'denied' })
  }, [clarityId, consent, allowed])
  return (
    <>
      {onVercel ? <Analytics /> : null}
      {onVercel ? <SpeedInsights /> : null}
      {allowed && gaId ? <GoogleAnalytics gaId={gaId} /> : null}
      {/* lazyOnload: nạp lúc trình duyệt rảnh sau load, không tranh băng thông với trang đang vẽ. */}
      {allowed && clarityId ? (
        <Script id="ms-clarity" strategy="lazyOnload">
          {claritySnippet(clarityId)}
        </Script>
      ) : null}
    </>
  )
}
