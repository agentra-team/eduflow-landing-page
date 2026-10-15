// Kiểm một tag trước khi phát hành production (docs/van-hanh.md, mục 8), như releaseTag.mjs của DocOps application: tag có dạng
// vX.Y.Z, trỏ tới một commit nằm trên main, và khớp `version` trong package.json của chính commit đó. Hàm thuần cho
// tests/unit/release-tag.test.ts; CLI cho .github/workflows/release.yml:
//   node scripts/release-tag.mjs <tag>     ghi tag, sha, version vào $GITHUB_OUTPUT; sai thì in ::error:: và thoát 1
import { execFileSync } from 'node:child_process'
import { appendFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

/** vX.Y.Z, không số 0 thừa ở đầu, không hậu tố. Script không import được TypeScript nên giữ mẫu riêng; tests/unit/release-tag.test.ts khẳng định mẫu này trùng RELEASE_TAG_PATTERN của lib/env.ts. */
export const TAG_PATTERN = /^v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/

/**
 * @param {string} tag
 * @param {string} version
 * @returns {boolean}
 */
export function tagMatchesVersion(tag, version) {
  return TAG_PATTERN.test(tag) && tag === `v${version}`
}

/**
 * @param {string} tag
 * @param {{ cwd?: string, mainRef?: string }} [options]  mainRef: nhánh main đã fetch (trên GitHub Actions là origin/main)
 * @returns {{ tag: string, sha: string, version: string }}
 */
export function checkReleaseTag(tag, { cwd = process.cwd(), mainRef = 'origin/main' } = {}) {
  // Kiểm dạng trước mọi lệnh git: chuỗi lạ từ ô nhập tay (ví dụ bắt đầu bằng "-") không bao giờ tới git.
  if (!TAG_PATTERN.test(tag)) throw new Error(`Tag "${tag}" không có dạng vX.Y.Z (ví dụ v1.0.0).`)
  /** @param {...string} args */
  const git = (...args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
  /**
   * @param {string} ref
   * @returns {string | null}
   */
  const commitOf = (ref) => {
    try {
      return git('rev-parse', '--verify', '--quiet', `${ref}^{commit}`)
    } catch {
      return null
    }
  }
  const sha = commitOf(`refs/tags/${tag}`)
  if (!sha) throw new Error(`Không thấy tag ${tag} trong repo.`)
  if (!commitOf(mainRef)) throw new Error(`Không thấy ${mainRef}: checkout phải lấy đủ lịch sử và tag (fetch-depth: 0).`)
  try {
    git('merge-base', '--is-ancestor', sha, mainRef)
  } catch {
    throw new Error(`Tag ${tag} trỏ tới ${sha}, commit này không nằm trên main: hoà vào main rồi gắn tag lên commit của main.`)
  }
  const { version } = JSON.parse(git('show', `${sha}:package.json`))
  if (!tagMatchesVersion(tag, version)) {
    throw new Error(`Tag ${tag} không khớp version ${version} trong package.json của commit ${sha}: nâng version bằng commit phát hành rồi gắn tag mới.`)
  }
  return { tag, sha, version }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const { tag, sha, version } = checkReleaseTag(process.argv[2] ?? '')
    if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `tag=${tag}\nsha=${sha}\nversion=${version}\n`)
    console.log(`Tag ${tag} khớp version ${version}; commit ${sha} nằm trên main.`)
  } catch (err) {
    console.log(`::error::${err instanceof Error ? err.message : err}`)
    process.exit(1)
  }
}
