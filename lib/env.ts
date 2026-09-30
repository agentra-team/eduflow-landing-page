/** Build production trên Vercel phải có domain thật, nếu không canonical và sitemap sẽ trỏ về localhost (spec §11). */
export function assertProductionEnv(env: Record<string, string | undefined>): void {
  if (env.VERCEL_ENV === 'production' && !(env.NEXT_PUBLIC_SITE_URL ?? '').trim()) {
    throw new Error('NEXT_PUBLIC_SITE_URL phải được đặt cho build production (OQ-L01).')
  }
}
