/** Mã project Microsoft Clarity (bản đồ nhiệt, bản ghi phiên) của eduflow.agentra.io.vn. Mã công khai: nó nằm trong thẻ script gửi cho mọi khách. */
export const CLARITY_PROJECT_ID = 'z6n0gfh6zp'

declare global {
  interface Window {
    clarity?: (...args: unknown[]) => void
  }
}

/**
 * Mã Clarity của bản dựng này, hoặc undefined để không nạp Clarity. NEXT_PUBLIC_CLARITY_PROJECT_ID thắng (ci.yml đặt mã giả cho e2e);
 * không có thì chỉ bản production (VERCEL_ENV=production, workflow Release đặt) dùng mã thật, để dev, preview và e2e không đổ phiên giả
 * vào Clarity. Gọi ở server (layout): VERCEL_ENV không có tiền tố NEXT_PUBLIC_ nên không tới được client.
 */
export function clarityProjectId(env: Record<string, string | undefined> = process.env): string | undefined {
  const override = env.NEXT_PUBLIC_CLARITY_PROJECT_ID?.trim()
  if (override) return override
  return env.VERCEL_ENV === 'production' ? CLARITY_PROJECT_ID : undefined
}

/** Thẻ Clarity chuẩn của Microsoft, kèm tín hiệu Consent API v2: chỉ được chạy sau khi khách đồng ý (hoặc khi thanh cookie tắt). */
export function claritySnippet(id: string): string {
  return (
    '(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};' +
    't=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;' +
    'y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y)})' +
    `(window,document,"clarity","script",${JSON.stringify(id)});` +
    'window.clarity("consentv2",{ad_Storage:"denied",analytics_Storage:"granted"});'
  )
}
