const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]', '0.0.0.0'])

// Tag phát hành vX.Y.Z: không số 0 thừa ở đầu, không hậu tố. Cùng mẫu với TAG_PATTERN của scripts/release-tag.mjs (test giữ hai bên khớp).
export const RELEASE_TAG_PATTERN = /^v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/

/**
 * Chốt chặn của bản dựng production, gọi ở đầu next.config.ts.
 *
 * 1. Dựng cho Vercel (`VERCEL=1`: Vercel tự dựng, hoặc `vercel build`) phải có `RELEASE_TAG` dạng vX.Y.Z, biến mà chỉ workflow
 *    Release đặt sau khi kiểm tag (docs/van-hanh.md, mục 8). Nhờ đó lần dựng production đầu tiên Vercel tự tạo khi import repo,
 *    nút Redeploy và "Promote to Production" của bản preview (cả hai dựng lại trên Vercel), và `vercel --prod` từ máy cá nhân đều
 *    dừng. Dựng production ngoài Vercel (ví dụ bước seo-audit trên CI) không có `VERCEL=1` nên không cần biến này.
 *    Trên Vercel mà thiếu `VERCEL_ENV` thì không loại trừ được production nên cũng dừng (đóng kín).
 * 2. Phải có domain thật, nếu không canonical và sitemap sẽ trỏ về localhost (spec §11).
 */
export function assertProductionEnv(env: Record<string, string | undefined>): void {
  if (env.VERCEL === '1' && !env.VERCEL_ENV) {
    throw new Error(
      'Không xác định được môi trường Vercel (VERCEL_ENV trống). Bật "Automatically expose System Environment Variables" (Enable access to System Environment Variables) trong Settings, Environment Variables của project.',
    )
  }
  if (env.VERCEL_ENV !== 'production') return
  if (env.VERCEL === '1' && !RELEASE_TAG_PATTERN.test(env.RELEASE_TAG ?? '')) {
    throw new Error(
      'Bản production chỉ được dựng bởi workflow Release từ một tag vX.Y.Z (RELEASE_TAG thiếu hoặc sai dạng). Xem docs/van-hanh.md, mục 8.',
    )
  }
  const raw = (env.NEXT_PUBLIC_SITE_URL ?? '').trim()
  if (!raw) throw new Error('NEXT_PUBLIC_SITE_URL phải được đặt cho build production (OQ-L01).')
  let real = false
  try {
    const { protocol, hostname } = new URL(raw)
    real = (protocol === 'http:' || protocol === 'https:') && !LOCAL_HOSTS.has(hostname) && !hostname.endsWith('.localhost')
  } catch {
    // Không phải URL: giữ real = false.
  }
  if (!real) throw new Error('NEXT_PUBLIC_SITE_URL phải là URL http(s) đầy đủ, không trỏ về localhost, cho build production (OQ-L01).')
}
