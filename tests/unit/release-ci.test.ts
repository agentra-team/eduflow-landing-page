import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'
import { expect, test } from 'vitest'
import { ciVerdict, listCiRuns, waitForGreenCi } from '@/scripts/release-ci.mjs'

const SHA = 'c'.repeat(40)
type RunPatch = Partial<{ id: number; head_sha: string; event: string; head_branch: string | null; status: string; conclusion: string | null }>
const run = (patch: RunPatch = {}) => ({
  id: 1,
  head_sha: SHA,
  event: 'push',
  head_branch: 'main' as string | null,
  status: 'completed',
  conclusion: 'success' as string | null,
  html_url: 'https://github.com/agentra-code/eduflow-landing-page/actions/runs/1',
  ...patch,
})
// Đồng hồ giả: wait chỉ cộng thời gian, test chạy tức thì.
const fakeClock = () => {
  let t = 0
  return {
    now: () => t,
    wait: async (ms: number) => {
      t += ms
    },
  }
}

test('missing when no push run on main exists for the commit', () => {
  expect(ciVerdict([], SHA).verdict).toBe('missing')
  const others = [run({ head_sha: 'd'.repeat(40) }), run({ event: 'pull_request' }), run({ head_branch: 'feature' })]
  expect(ciVerdict(others, SHA).verdict).toBe('missing')
})

test('pending while the run is queued or in progress; green only on success', () => {
  for (const status of ['queued', 'in_progress', 'waiting']) expect(ciVerdict([run({ status, conclusion: null })], SHA).verdict).toBe('pending')
  expect(ciVerdict([run()], SHA).verdict).toBe('green')
  for (const conclusion of ['failure', 'cancelled', 'timed_out', 'skipped']) expect(ciVerdict([run({ conclusion })], SHA).verdict).toBe('red')
})

// Review Focus 2: chạy lại sau lỗi thoáng qua.
test('the newest run of the commit decides', () => {
  expect(ciVerdict([run({ id: 1, conclusion: 'failure' }), run({ id: 2 })], SHA).verdict).toBe('green')
  expect(ciVerdict([run({ id: 3, conclusion: 'failure' }), run({ id: 2 })], SHA).verdict).toBe('red')
})

// Review Focus 1: commit phát hành và tag được đẩy cùng lúc.
test('waits while CI is missing or running, then returns the green run', async () => {
  const answers = [[], [run({ status: 'queued', conclusion: null })], [run({ status: 'in_progress', conclusion: null })], [run()]]
  const clock = fakeClock()
  const lines: string[] = []
  const got = await waitForGreenCi({ sha: SHA, listRuns: async () => answers.shift() ?? [], ...clock, log: (l: string) => lines.push(l) })
  expect(got.conclusion).toBe('success')
  expect(lines).toHaveLength(3)
  expect(clock.now()).toBe(90_000)
})

test('fails at once on a red CI, naming the conclusion and the run', async () => {
  const clock = fakeClock()
  await expect(waitForGreenCi({ sha: SHA, listRuns: async () => [run({ conclusion: 'failure' })], ...clock, log: () => {} })).rejects.toThrow(
    /failure.*actions\/runs\/1/,
  )
  expect(clock.now()).toBe(0)
})

test('fails when the commit gets no CI run within the grace period', async () => {
  const clock = fakeClock()
  await expect(waitForGreenCi({ sha: SHA, listRuns: async () => [], ...clock, log: () => {} })).rejects.toThrow(
    /không có lần chạy CI nào do push lên main sau 10 phút/,
  )
  expect(clock.now()).toBe(10 * 60_000)
})

test('fails when CI is still running at the timeout', async () => {
  const clock = fakeClock()
  const running = async () => [run({ status: 'in_progress', conclusion: null })]
  await expect(waitForGreenCi({ sha: SHA, listRuns: running, ...clock, log: () => {} })).rejects.toThrow(/Hết 45 phút/)
  expect(clock.now()).toBe(45 * 60_000)
})

test('a GitHub API error is retried like a CI still running', async () => {
  const clock = fakeClock()
  let calls = 0
  const listRuns = async () => {
    calls += 1
    if (calls === 1) throw new Error('HTTP 502')
    return [run()]
  }
  await expect(waitForGreenCi({ sha: SHA, listRuns, ...clock, log: () => {} })).resolves.toMatchObject({ conclusion: 'success' })
  expect(calls).toBe(2)
})

test('lists the push runs of ci.yml on main for one commit, with the token', async () => {
  const seen: Array<{ url: string; auth: string | null }> = []
  const fetchImpl = (async (url: string, init?: RequestInit) => {
    seen.push({ url, auth: new Headers(init?.headers).get('authorization') })
    return new Response(JSON.stringify({ total_count: 1, workflow_runs: [run()] }), { status: 200 })
  }) as unknown as typeof fetch
  const runs = await listCiRuns({ sha: SHA, repo: 'agentra-code/eduflow-landing-page', token: 't0k', fetchImpl })
  expect(runs).toHaveLength(1)
  expect(seen).toEqual([
    {
      url: `https://api.github.com/repos/agentra-code/eduflow-landing-page/actions/workflows/ci.yml/runs?head_sha=${SHA}&event=push&branch=main&per_page=100`,
      auth: 'Bearer t0k',
    },
  ])
  const denied = (async () => new Response('{}', { status: 403 })) as unknown as typeof fetch
  await expect(listCiRuns({ sha: SHA, repo: 'x/y', token: 't', fetchImpl: denied })).rejects.toThrow(/HTTP 403/)
})

test('the CLI refuses an argument that is not a commit sha', () => {
  const r = spawnSync(process.execPath, [resolve('scripts/release-ci.mjs'), 'main'], {
    encoding: 'utf8',
    env: { ...process.env, GITHUB_TOKEN: 't', GITHUB_REPOSITORY: 'x/y' },
  })
  expect(r.status).toBe(1)
  expect(r.stdout).toMatch(/^::error::"main" không phải sha/m)
})
