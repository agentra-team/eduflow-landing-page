/*
 * Chuyển hướng và header của next.config.ts, tách ra để test được (tests/unit/next-routes.test.ts) và để e2e lặp qua đúng
 * danh sách này. Không import gì có tiền tố @/: next.config.ts và Playwright đều nạp tệp này trực tiếp.
 */
export type Env = Record<string, string | undefined>
export type RedirectRule = { source: string; destination: string; permanent: boolean; has?: Array<{ type: 'host'; value: string }> }
export type HeaderRule = { source: string; headers: Array<{ key: string; value: string }> }

/**
 * URL cũ → URL mới (spec §4.3). Site chưa lên domain nên không có thứ hạng để mất; vẫn đặt 308 phòng khi app, tài liệu
 * hay tin nhắn đã trỏ tới. Đích phải là đường dẫn đang sống, không được là nguồn của một chuyển hướng khác.
 */
export const LEGACY_REDIRECTS: ReadonlyArray<{ source: string; destination: string }> = [
  { source: '/pho-thong', destination: '/ai-cho-giao-vien' },
  { source: '/en/k12', destination: '/en/ai-for-teachers' },
  { source: '/hoc-phan', destination: '/ai-cho-giang-vien' },
  { source: '/en/university-courses', destination: '/en/ai-for-lecturers' },
  { source: '/chuong-trinh', destination: '/ra-soat-chuong-trinh-dao-tao' },
  { source: '/en/program-review', destination: '/en/curriculum-review' },
  { source: '/huong-dan-cai-dat/macos', destination: '/huong-dan/cai-dat-macos' },
  { source: '/en/install/macos', destination: '/en/docs/install-macos' },
  { source: '/huong-dan-cai-dat/windows', destination: '/huong-dan/cai-dat-windows' },
  { source: '/en/install/windows', destination: '/en/docs/install-windows' },
]

const SECURITY_HEADERS = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'X-Frame-Options', value: 'DENY' },
]

export function redirectRules(env: Env): RedirectRule[] {
  const rules: RedirectRule[] = LEGACY_REDIRECTS.map((r) => ({ ...r, permanent: true }))
  // Bí danh *.vercel.app của bản production chuyển 308 về domain chính (spec §4.3, §9.1). Chỉ ở production: bản preview cũng
  // nằm ở *.vercel.app và phải xem được. Domain chính không khớp mẫu host này nên không vòng lặp.
  if (env.VERCEL_ENV === 'production') {
    const site = (env.NEXT_PUBLIC_SITE_URL ?? '').trim().replace(/\/+$/, '')
    rules.push({ source: '/:path*', has: [{ type: 'host', value: '(?<host>.+)\\.vercel\\.app' }], destination: `${site}/:path*`, permanent: true })
  }
  return rules
}

export function headerRules(env: Env): HeaderRule[] {
  // Vercel tự gửi X-Robots-Tag cho preview; đặt tường minh để không phụ thuộc cấu hình của dự án (spec §9.1).
  const extra = env.VERCEL_ENV === 'preview' ? [{ key: 'X-Robots-Tag', value: 'noindex' }] : []
  return [{ source: '/(.*)', headers: [...SECURITY_HEADERS, ...extra] }]
}
