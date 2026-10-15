// Kiểm bản production từ bên ngoài sau khi promote (docs/van-hanh.md, mục 8): /version.json trên domain chính phải mang đúng
// version, commit và environment "production" kèm X-Robots-Tag noindex, còn trang chủ trả 2xx và không bị noindex (site phải
// được Google index). Hàm thuần cho tests/unit/release-verify.test.ts; CLI cho release.yml:
//   node scripts/release-verify.mjs '<dòng NEXT_PUBLIC_SITE_URL=... do vercel pull ghi>' <version> <sha>
// Thử tới 20 lần, cách nhau 15 giây: domain cần vài giây để trỏ sang bản vừa promote.
import { setTimeout as sleep } from 'node:timers/promises'
import { pathToFileURL } from 'node:url'
import { parseEnv } from 'node:util'

/**
 * @param {string} text  một dòng hay cả tệp .env do `vercel pull` ghi
 * @returns {string} origin của domain production, ví dụ https://eduflow.agentra.io.vn
 */
export function siteUrlFromEnv(text) {
  const raw = (parseEnv(text).NEXT_PUBLIC_SITE_URL ?? '').trim()
  if (!raw) throw new Error('NEXT_PUBLIC_SITE_URL của môi trường Production trên Vercel đang trống.')
  let url
  try {
    url = new URL(raw)
  } catch {
    // JSON.stringify: giá trị lạ không được xuống dòng trong lệnh workflow.
    throw new Error(`NEXT_PUBLIC_SITE_URL của Production không phải URL: ${JSON.stringify(raw)}`)
  }
  if (url.protocol !== 'https:') throw new Error(`NEXT_PUBLIC_SITE_URL của Production phải là https://, đang là ${JSON.stringify(raw)}`)
  return url.origin
}

/** @typedef {{ version: string, commit: string, environment: string }} Expected */

/**
 * @param {unknown} body
 * @param {Expected} expected
 * @returns {string[]}
 */
export function versionProblems(body, expected) {
  if (!body || typeof body !== 'object') return ['/version.json không phải một đối tượng JSON']
  const got = /** @type {Record<string, unknown>} */ (body)
  /** @type {Array<keyof Expected>} */
  const keys = ['version', 'commit', 'environment']
  return keys.filter((key) => got[key] !== expected[key]).map((key) => `${key} là ${JSON.stringify(got[key])}, cần ${JSON.stringify(expected[key])}`)
}

/**
 * Giữ 'follow' (trang chủ có thể chuyển / sang /vi cùng origin) nhưng phản hồi cuối phải vẫn ở origin của domain chính:
 * nếu không, domain chuyển sang *.vercel.app có thể khớp tag mà domain chính chưa phục vụ bản phát hành.
 * @param {Response} res
 * @param {string} siteUrl
 * @param {string} label
 * @returns {string | null}
 */
function redirectProblem(res, siteUrl, label) {
  if (!res.url) return null
  let origin = ''
  try {
    origin = new URL(res.url).origin
  } catch {}
  return origin === new URL(siteUrl).origin ? null : `${label} bị chuyển hướng sang ${JSON.stringify(res.url)}, khác origin ${siteUrl}`
}

/**
 * @param {string} siteUrl
 * @param {Expected} expected
 * @param {typeof fetch} fetchImpl
 * @returns {Promise<string[]>}
 */
async function problemsNow(siteUrl, expected, fetchImpl) {
  try {
    const res = await fetchImpl(`${siteUrl}/version.json`, { headers: { 'Cache-Control': 'no-cache' }, signal: AbortSignal.timeout(10_000) })
    const moved = redirectProblem(res, siteUrl, '/version.json')
    if (moved) return [moved]
    if (!res.ok) return [`/version.json trả HTTP ${res.status}`]
    const problems = versionProblems(await res.json().catch(() => null), expected)
    // Route handler chỉ được chứng minh noindex trên `next start`; ở đây kiểm lại trên domain thật.
    const robots = res.headers.get('x-robots-tag') ?? ''
    if (!/noindex/i.test(robots)) problems.push(`X-Robots-Tag của /version.json là ${JSON.stringify(robots)}, cần chứa noindex`)
    if (problems.length > 0) return problems
    const home = await fetchImpl(`${siteUrl}/`, { signal: AbortSignal.timeout(10_000) })
    const homeMoved = redirectProblem(home, siteUrl, 'trang chủ')
    if (homeMoved) return [homeMoved]
    if (!home.ok) return [`trang chủ trả HTTP ${home.status}`]
    if (/noindex/i.test(home.headers.get('x-robots-tag') ?? '')) return ['trang chủ mang noindex trong header X-Robots-Tag']
    const html = await home.text()
    const metaRobots = html.match(/<meta\b[^>]*\bname=["']robots["'][^>]*>/gi) ?? []
    if (metaRobots.some((tag) => /noindex/i.test(tag))) return ['trang chủ mang noindex trong thẻ meta robots']
    return []
  } catch (err) {
    return [`không gọi được ${siteUrl}: ${err instanceof Error ? err.message : err}`]
  }
}

/**
 * @param {{ siteUrl: string, expected: Expected, fetchImpl?: typeof fetch, wait?: (ms: number) => Promise<unknown>,
 *   attempts?: number, intervalMs?: number, log?: (line: string) => void }} options
 * @returns {Promise<void>}
 */
export async function verifyLive({ siteUrl, expected, fetchImpl = fetch, wait = sleep, attempts = 20, intervalMs = 15_000, log = console.log }) {
  /** @type {string[]} */
  let problems = []
  for (let i = 1; i <= attempts; i++) {
    problems = await problemsNow(siteUrl, expected, fetchImpl)
    if (problems.length === 0) return
    log(`Lần ${i}/${attempts}: ${problems.join('; ')}`)
    if (i < attempts) await wait(intervalMs)
  }
  throw new Error(`${siteUrl}/version.json chưa đúng sau ${attempts} lần thử: ${problems.join('; ')}`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [line = '', version = '', commit = ''] = process.argv.slice(2)
  try {
    const siteUrl = siteUrlFromEnv(line)
    await verifyLive({ siteUrl, expected: { version, commit, environment: 'production' } })
    console.log(`${siteUrl}/version.json: ${version}, ${commit}, production.`)
  } catch (err) {
    // Một dòng duy nhất: thông điệp có thể chứa chuỗi từ mạng hay từ đối số.
    console.log(`::error::${(err instanceof Error ? err.message : String(err)).replace(/[\r\n]+/g, ' ')}`)
    process.exit(1)
  }
}
