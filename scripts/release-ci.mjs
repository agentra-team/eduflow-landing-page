// Cổng CI của workflow Release (docs/van-hanh.md, mục 8): commit được gắn tag phải có lần chạy workflow CI (ci.yml) do push lên
// main, và lần chạy mới nhất đó phải xanh. CI còn chạy thì chờ. Hàm thuần cho tests/unit/release-ci.test.ts; CLI cho release.yml:
//   node scripts/release-ci.mjs <sha>     đọc GITHUB_TOKEN, GITHUB_REPOSITORY, GITHUB_API_URL; không xanh thì in ::error:: và thoát 1
import { setTimeout as sleep } from 'node:timers/promises'
import { pathToFileURL } from 'node:url'

/**
 * Một lần chạy workflow, đúng các trường GitHub trả ở GET /repos/{repo}/actions/workflows/{id}/runs.
 * @typedef {{ id: number, head_sha: string, event: string, head_branch: string | null, status: string, conclusion: string | null, html_url: string }} Run
 */

/**
 * @param {Run[]} runs
 * @param {string} sha
 * @returns {{ verdict: 'green' | 'red' | 'pending' | 'missing', run: Run | null }}
 */
export function ciVerdict(runs, sha) {
  const mine = runs.filter((r) => r.head_sha === sha && r.event === 'push' && r.head_branch === 'main')
  if (mine.length === 0) return { verdict: 'missing', run: null }
  // Chạy lại (re-run) cập nhật chính lần chạy đó; nếu một commit có nhiều lần chạy thì lần mới nhất (id lớn nhất) quyết định.
  const run = mine.reduce((a, b) => (b.id > a.id ? b : a))
  if (run.status !== 'completed') return { verdict: 'pending', run }
  return { verdict: run.conclusion === 'success' ? 'green' : 'red', run }
}

/**
 * @param {{ sha: string, repo: string, token: string, apiUrl?: string, fetchImpl?: typeof fetch }} options
 * @returns {Promise<Run[]>}
 */
export async function listCiRuns({ sha, repo, token, apiUrl = 'https://api.github.com', fetchImpl = fetch }) {
  const query = new URLSearchParams({ head_sha: sha, event: 'push', branch: 'main', per_page: '100' })
  const res = await fetchImpl(`${apiUrl}/repos/${repo}/actions/workflows/ci.yml/runs?${query}`, {
    headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${token}`, 'X-GitHub-Api-Version': '2022-11-28' },
    signal: AbortSignal.timeout(15_000),
  })
  if (!res.ok) throw new Error(`GitHub API trả HTTP ${res.status} khi đọc các lần chạy CI`)
  const body = await res.json()
  return body.workflow_runs ?? []
}

/**
 * @param {{ sha: string, listRuns: () => Promise<Run[]>, wait?: (ms: number) => Promise<unknown>, now?: () => number,
 *   intervalMs?: number, timeoutMs?: number, missingGraceMs?: number, log?: (line: string) => void }} options
 * @returns {Promise<Run>}
 */
export async function waitForGreenCi({
  sha,
  listRuns,
  wait = sleep,
  now = Date.now,
  intervalMs = 30_000,
  timeoutMs = 45 * 60_000,
  missingGraceMs = 10 * 60_000,
  log = console.log,
}) {
  const start = now()
  for (;;) {
    /** @type {{ verdict: string, run: Run | null }} */
    let result
    try {
      result = ciVerdict(await listRuns(), sha)
    } catch (err) {
      // Lỗi mạng hay GitHub API thoáng qua: coi như CI chưa xong, thử lại ở vòng sau.
      result = { verdict: 'pending', run: null }
      log(`Không đọc được lần chạy CI (${err instanceof Error ? err.message : err}), thử lại.`)
    }
    const { verdict, run } = result
    if (verdict === 'green' && run) return run
    if (verdict === 'red' && run) {
      throw new Error(
        `CI của ${sha} không xanh (${run.conclusion}): ${run.html_url}. Đỏ do lỗi thoáng qua thì chạy lại CI rồi chạy lại workflow Release; còn lại thì sửa trên main và phát hành phiên bản mới.`,
      )
    }
    const waited = now() - start
    if (verdict === 'missing' && waited >= missingGraceMs) {
      throw new Error(
        `Commit ${sha} không có lần chạy CI nào do push lên main sau ${missingGraceMs / 60_000} phút. CI chạy cho commit đầu của mỗi lần push: gắn tag lên commit đầu của main.`,
      )
    }
    if (waited >= timeoutMs) throw new Error(`Hết ${timeoutMs / 60_000} phút mà CI của ${sha} chưa xong${run ? `: ${run.html_url}` : ''}.`)
    log(verdict === 'missing' ? `Chưa thấy lần chạy CI của ${sha}, chờ.` : `CI của ${sha} đang ${run?.status ?? 'chưa rõ'}, chờ.`)
    await wait(intervalMs)
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const sha = process.argv[2] ?? ''
  const { GITHUB_TOKEN: token, GITHUB_REPOSITORY: repo, GITHUB_API_URL: apiUrl } = process.env
  try {
    if (!/^[0-9a-f]{40}$/.test(sha)) throw new Error(`"${sha}" không phải sha của một commit.`)
    if (!token || !repo) throw new Error('Thiếu GITHUB_TOKEN hoặc GITHUB_REPOSITORY.')
    const run = await waitForGreenCi({ sha, listRuns: () => listCiRuns({ sha, repo, token, apiUrl }) })
    console.log(`CI của ${sha} xanh: ${run.html_url}`)
  } catch (err) {
    console.log(`::error::${err instanceof Error ? err.message : err}`)
    process.exit(1)
  }
}
