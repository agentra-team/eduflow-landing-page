const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]', '0.0.0.0'])

/** Build production trên Vercel phải có domain thật, nếu không canonical và sitemap sẽ trỏ về localhost (spec §11). */
export function assertProductionEnv(env: Record<string, string | undefined>): void {
  if (env.VERCEL_ENV !== 'production') return
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
