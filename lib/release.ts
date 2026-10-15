import pkg from '@/package.json'

export type BuildInfo = { version: string; commit: string | null; environment: string | null }

const COMMIT_SHA = /^[0-9a-f]{40}$/

/**
 * Phiên bản, commit và môi trường của bản dựng, trả ở /version.json (docs/van-hanh.md, mục 8). Đọc lúc dựng vì route sinh tĩnh.
 * Bản preview do Vercel dựng từ Git có sẵn VERCEL_GIT_COMMIT_SHA và VERCEL_ENV. Bản production do workflow Release dựng bằng
 * `vercel build`, nơi Vercel không cấp biến hệ thống, nên workflow tự đặt hai biến này. Dựng ở máy hay CI: commit và môi trường là null.
 */
export function buildInfo(env: Record<string, string | undefined> = process.env, version: string = pkg.version): BuildInfo {
  const commit = (env.VERCEL_GIT_COMMIT_SHA ?? '').trim()
  const environment = (env.VERCEL_ENV ?? '').trim()
  return { version, commit: COMMIT_SHA.test(commit) ? commit : null, environment: environment || null }
}
