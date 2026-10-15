import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import { parse } from 'yaml'

type Step = { name?: string; id?: string; uses?: string; run?: string; with?: Record<string, unknown>; env?: Record<string, string> }
type Job = {
  needs?: string | string[]
  if?: string
  environment?: unknown
  permissions?: Record<string, string>
  env?: Record<string, string>
  outputs?: Record<string, string>
  steps: Step[]
}

const text = readFileSync(new URL('../../.github/workflows/release.yml', import.meta.url), 'utf8')
const workflow = parse(text) as {
  on: Record<string, unknown>
  permissions: unknown
  concurrency: unknown
  env?: Record<string, string>
  jobs: Record<string, Job>
}
const jobs = workflow.jobs
// Mã của workflow, bỏ dòng chú thích: chú thích được phép nhắc tới điều mã không được làm.
const code = text
  .split('\n')
  .filter((line) => !/^\s*#/.test(line))
  .join('\n')
const step = (job: string, name: string): Step => {
  const found = jobs[job].steps.find((s) => s.name === name)
  if (!found) throw new Error(`release.yml: job ${job} không có bước "${name}"`)
  return found
}
const allSteps = () => Object.values(jobs).flatMap((j) => j.steps)

describe('release.yml: when it runs', () => {
  // So khớp nguyên văn có chủ ý: trigger và quyền của token là bề mặt bảo mật của một repo công khai.
  test('only on a v* tag push or by hand with a tag, never on a pull request', () => {
    expect(Object.keys(workflow.on).sort()).toEqual(['push', 'workflow_dispatch'])
    expect(workflow.on.push).toEqual({ tags: ['v*'] })
    expect(workflow.on.workflow_dispatch).toMatchObject({ inputs: { tag: { required: true, type: 'string' } } })
    expect(code).not.toMatch(/pull_request|workflow_run/)
  })

  test('one release at a time, never cancelled, with a token that starts with no permission', () => {
    expect(workflow.concurrency).toEqual({ group: 'release-production', 'cancel-in-progress': false })
    expect(workflow.permissions).toEqual({})
    expect(Object.keys(jobs)).toEqual(['gate', 'deploy', 'verify', 'github-release'])
    expect(jobs.gate.permissions).toEqual({ contents: 'read', actions: 'read' })
    expect(jobs.deploy.permissions).toEqual({ contents: 'read' })
    expect(jobs.verify.permissions).toEqual({ contents: 'read' })
    expect(jobs['github-release'].permissions).toEqual({ contents: 'write' })
  })
})

describe('release.yml: secrets and supply chain', () => {
  // So khớp nguyên văn có chủ ý: phạm vi của secret, sha ghim của action và việc không dùng cache là bề mặt bảo mật.
  test('Vercel secrets live only in the deploy job, under the production environment', () => {
    for (const [name, job] of Object.entries(jobs)) {
      if (name === 'deploy') continue
      expect(JSON.stringify(job), name).not.toMatch(/\bsecrets\b/)
      expect(job.environment, name).toBeUndefined()
    }
    expect(jobs.deploy.environment).toBe('production')
    expect(JSON.stringify(jobs.deploy).match(/secrets\.\w+/g)?.sort()).toEqual([
      'secrets.VERCEL_ORG_ID',
      'secrets.VERCEL_PROJECT_ID',
      'secrets.VERCEL_TOKEN',
      'secrets.VERCEL_TOKEN',
    ])
  })

  test('the whole file uses exactly these secrets, never the secrets context as a whole, and none at the top level', () => {
    expect(code.match(/secrets\.\w+/g)?.sort()).toEqual([
      'secrets.VERCEL_ORG_ID',
      'secrets.VERCEL_PROJECT_ID',
      'secrets.VERCEL_TOKEN',
      'secrets.VERCEL_TOKEN',
    ])
    // Mỗi lần nhắc tới secrets đều là một trong bốn dòng trên: không có toJSON(secrets), secrets['...'] hay secrets: inherit.
    expect(code.match(/\bsecrets\b/g)).toHaveLength(4)
    expect(JSON.stringify(workflow.env ?? {})).not.toMatch(/\bsecrets\b/)
  })

  // Đặt token theo bước chỉ giữ token khỏi env của bước khác; trong cùng job, mã chạy trước vẫn với tới nó (docs/van-hanh.md, mục 8.5).
  test('VERCEL_TOKEN is set in the env of the pull and deploy steps only, not in the env of install or build', () => {
    expect(jobs.deploy.env).not.toHaveProperty('VERCEL_TOKEN')
    const withToken = jobs.deploy.steps.filter((s) => s.env?.VERCEL_TOKEN).map((s) => s.name)
    expect(withToken).toEqual(['Pull production settings and variables', 'Deploy staged, then promote'])
    const install = jobs.deploy.steps.find((s) => s.run === 'pnpm install --frozen-lockfile')
    expect(install).toBeDefined()
    expect(install?.env ?? {}).not.toHaveProperty('VERCEL_TOKEN')
    expect(step('deploy', 'Build for production').env).not.toHaveProperty('VERCEL_TOKEN')
  })

  test('every checkout leaves no credentials behind, the verify job included', () => {
    expect(jobs.verify.steps[0].uses).toMatch(/^actions\/checkout@/)
    expect(jobs.verify.steps[0].with).toMatchObject({ 'persist-credentials': false })
    const checkouts = allSteps().filter((s) => s.uses?.startsWith('actions/checkout@'))
    expect(checkouts).toHaveLength(3)
    for (const s of checkouts) expect(s.with?.['persist-credentials']).toBe(false)
  })

  test('every action is pinned to a full commit sha, and the Vercel CLI to an exact version outside package.json', () => {
    const uses = allSteps()
      .map((s) => s.uses)
      .filter((u): u is string => Boolean(u))
    expect(uses.length).toBeGreaterThan(5)
    for (const u of uses) expect(u).toMatch(/^[\w.-]+\/[\w.-]+@[0-9a-f]{40}$/)
    expect(jobs.deploy.env?.VERCEL_CLI).toMatch(/^vercel@\d+\.\d+\.\d+$/)
    expect(readFileSync(new URL('../../package.json', import.meta.url), 'utf8')).not.toMatch(/"vercel"/)
  })

  test('no Actions cache at all: setup-node turns its automatic cache off, no step asks for one', () => {
    expect(code).not.toMatch(/^\s*cache:/m)
    expect(code).toMatch(/^\s*package-manager-cache: false$/m)
    const setupNode = allSteps().filter((s) => s.uses?.startsWith('actions/setup-node@'))
    expect(setupNode).toHaveLength(3)
    for (const s of setupNode) expect(s.with?.['package-manager-cache']).toBe(false)
    for (const s of allSteps()) {
      expect(s.with ?? {}, s.name ?? s.uses).not.toHaveProperty('cache')
      expect(s.uses ?? '').not.toMatch(/^actions\/cache[@/]/)
    }
  })

  test('no expression inside a run script: values reach the shell through env', () => {
    for (const [name, job] of Object.entries(jobs)) {
      for (const s of job.steps) expect(s.run ?? '', `${name}: ${s.name ?? s.uses}`).not.toContain('${{')
    }
  })
})

describe('release.yml: the order of checks', () => {
  // So khớp nguyên văn có chủ ý: chữ ký dòng lệnh của ba script và bốn biến lúc dựng là hợp đồng với scripts/ và lib/env.ts.
  test('the gate checks the tag, main and CI with the scripts of the workflow commit, before anything is built', () => {
    expect(jobs.gate.steps[0].uses).toMatch(/^actions\/checkout@/)
    expect(jobs.gate.steps[0].with).toMatchObject({ 'fetch-depth': 0, 'persist-credentials': false })
    const tag = step('gate', 'Tag is vX.Y.Z, on main, and matches package.json')
    expect(tag.id).toBe('tag')
    expect(tag.env).toEqual({ TAG: "${{ github.event_name == 'workflow_dispatch' && inputs.tag || github.ref_name }}" })
    expect(tag.run).toBe('node scripts/release-tag.mjs "$TAG"')
    const ci = step('gate', 'CI of the tagged commit is green')
    expect(ci.env).toEqual({ GITHUB_TOKEN: '${{ github.token }}', SHA: '${{ steps.tag.outputs.sha }}' })
    expect(ci.run).toBe('node scripts/release-ci.mjs "$SHA"')
    expect(jobs.gate.outputs).toEqual({
      tag: '${{ steps.tag.outputs.tag }}',
      sha: '${{ steps.tag.outputs.sha }}',
      version: '${{ steps.tag.outputs.version }}',
    })
    expect(jobs.deploy.needs).toBe('gate')
  })

  test('deploy builds exactly the tagged commit, with VERCEL_ENV=production, the commit and the tag', () => {
    expect(jobs.deploy.steps[0].with).toMatchObject({ ref: '${{ needs.gate.outputs.sha }}', 'persist-credentials': false })
    expect(step('deploy', 'Pull production settings and variables').run).toBe('npx --yes "$VERCEL_CLI" pull --yes --environment=production')
    const build = step('deploy', 'Build for production')
    expect(build.env).toEqual({
      VERCEL_ENV: 'production',
      NEXT_PUBLIC_VERCEL_ENV: 'production',
      VERCEL_GIT_COMMIT_SHA: '${{ needs.gate.outputs.sha }}',
      RELEASE_TAG: '${{ needs.gate.outputs.tag }}',
    })
    expect(build.run).toBe('npx --yes "$VERCEL_CLI" build --prod')
    expect(jobs.deploy.outputs).toEqual({ site_env_line: '${{ steps.site.outputs.line }}' })
  })

  test('verify reads /version.json after deploy; the GitHub Release follows only a tag push', () => {
    expect(jobs.verify.needs).toEqual(['gate', 'deploy'])
    const check = step('verify', '/version.json on the production domain names this release')
    expect(check.env).toEqual({
      SITE_ENV_LINE: '${{ needs.deploy.outputs.site_env_line }}',
      VERSION: '${{ needs.gate.outputs.version }}',
      SHA: '${{ needs.gate.outputs.sha }}',
    })
    expect(check.run).toBe('node scripts/release-verify.mjs "$SITE_ENV_LINE" "$VERSION" "$SHA"')
    expect(jobs['github-release'].needs).toEqual(['gate', 'verify'])
    expect(jobs['github-release'].if).toBe("github.event_name == 'push'")
    expect(jobs['github-release'].steps[0].run).toContain('gh release create "$TAG" --repo "$GITHUB_REPOSITORY" --verify-tag --generate-notes')
  })
})

// Review Focus 4: promote đúng URL vừa tạo (cả khi project đang ở trạng thái sau Instant Rollback), dừng nếu không có URL
// hoặc nếu chính lệnh deploy hỏng.
describe('release.yml: the deploy step, run with a fake npx', () => {
  const script = step('deploy', 'Deploy staged, then promote').run ?? ''
  const SHA = 'a'.repeat(40)
  const URL_OF_BUILD = 'https://eduflow-landing-page-abc123-agentra.vercel.app'
  let dir = ''
  beforeAll(() => {
    dir = mkdtempSync(join(tmpdir(), 'release-deploy-'))
    // npx giả: ghi đối số vào $CALLS; với deploy thì in một dòng thừa rồi URL (khi FAKE_URL có giá trị), như CLI thật in ra
    // stdout, rồi thoát với mã FAKE_DEPLOY_EXIT (mặc định 0).
    const fake = [
      '#!/bin/sh',
      'echo "$*" >> "$CALLS"',
      'case "$*" in',
      '  *" deploy "*) echo "Vercel CLI 61.1.0"; [ -n "$FAKE_URL" ] && echo "$FAKE_URL"; exit "${FAKE_DEPLOY_EXIT:-0}" ;;',
      'esac',
      'exit 0',
      '',
    ]
    writeFileSync(join(dir, 'npx'), fake.join('\n'), { mode: 0o755 })
  })
  afterAll(() => rmSync(dir, { recursive: true, force: true }))
  const runStep = (fakeUrl: string, deployExit = 0) => {
    const calls = join(dir, 'calls')
    const summary = join(dir, 'summary')
    writeFileSync(calls, '')
    writeFileSync(summary, '')
    const r = spawnSync('bash', ['-c', script], {
      // npx giả đứng đầu PATH nên thắng npx thật; mọi biến bước deploy đọc đều đặt rõ ở đây.
      env: {
        ...process.env,
        PATH: `${dir}:${process.env.PATH}`,
        CALLS: calls,
        FAKE_URL: fakeUrl,
        FAKE_DEPLOY_EXIT: String(deployExit),
        VERCEL_CLI: 'vercel@61.1.0',
        RELEASE_TAG: 'v1.0.0',
        SHA,
        GITHUB_STEP_SUMMARY: summary,
      },
      encoding: 'utf8',
    })
    return { status: r.status, stdout: r.stdout, calls: readFileSync(calls, 'utf8').split('\n').filter(Boolean) }
  }
  const DEPLOY_CALL = `--yes vercel@61.1.0 deploy --prebuilt --prod --skip-domain --meta releaseTag=v1.0.0 --meta releaseSha=${SHA}`

  test('deploys staged with the release metadata, then promotes that very URL', () => {
    const r = runStep(URL_OF_BUILD)
    expect(r.status).toBe(0)
    expect(r.calls).toEqual([DEPLOY_CALL, `--yes vercel@61.1.0 promote ${URL_OF_BUILD} --yes --timeout=5m`])
  })

  test('stops before promote when deploy prints no deployment URL', () => {
    const r = runStep('')
    expect(r.status).not.toBe(0)
    expect(r.calls).toEqual([DEPLOY_CALL])
    expect(r.stdout).toContain('::error::')
  })

  test('stops before promote when deploy fails, even if it printed a URL', () => {
    const r = runStep(URL_OF_BUILD, 1)
    expect(r.status).not.toBe(0)
    expect(r.calls).toEqual([DEPLOY_CALL])
    expect(r.calls.join('\n')).not.toContain(' promote ')
  })
})
