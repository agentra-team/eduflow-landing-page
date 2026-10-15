import { execFileSync, spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { afterAll, beforeAll, expect, test } from 'vitest'
import { RELEASE_TAG_PATTERN } from '@/lib/env'
import { TAG_PATTERN, checkReleaseTag, tagMatchesVersion } from '@/scripts/release-tag.mjs'

const SCRIPT = resolve('scripts/release-tag.mjs')
const GIT_ENV = { ...process.env, GIT_AUTHOR_NAME: 't', GIT_AUTHOR_EMAIL: 't@t', GIT_COMMITTER_NAME: 't', GIT_COMMITTER_EMAIL: 't@t' }
// Bỏ ký commit và hook của máy dev: repo tạm phải giống nhau ở mọi máy.
const git = (cwd: string, ...args: string[]) =>
  execFileSync('git', ['-c', 'commit.gpgsign=false', '-c', 'tag.gpgsign=false', '-c', 'core.hooksPath=/dev/null', ...args], {
    cwd,
    env: GIT_ENV,
    encoding: 'utf8',
  }).trim()

let root = ''
let repo = ''
const sha: Record<string, string> = {}
const OPTS = () => ({ cwd: repo, mainRef: 'main' })

function commit(version: string, message: string): string {
  writeFileSync(join(repo, 'package.json'), `${JSON.stringify({ name: 'x', version })}\n`)
  git(repo, 'add', 'package.json')
  git(repo, 'commit', '-q', '--allow-empty', '-m', message)
  return git(repo, 'rev-parse', 'HEAD')
}

beforeAll(() => {
  root = mkdtempSync(join(tmpdir(), 'release-tag-'))
  repo = join(root, 'repo')
  git(root, 'init', '-q', '-b', 'main', repo)
  sha.v100 = commit('1.0.0', 'chore(phat-hanh): 1.0.0')
  git(repo, 'tag', 'v1.0.0')
  sha.v110 = commit('1.1.0', 'chore(phat-hanh): 1.1.0')
  git(repo, 'tag', '-a', 'v1.1.0', '-m', 'EduFlow landing 1.1.0')
  sha.noBump = commit('1.1.0', 'fix: quên nâng version')
  git(repo, 'tag', 'v1.2.0')
  // origin/main như sau checkout fetch-depth 0 trên GitHub Actions: CLI mặc định đọc ref này.
  git(repo, 'update-ref', 'refs/remotes/origin/main', 'main')
  git(repo, 'checkout', '-q', '-b', 'side')
  sha.side = commit('1.3.0', 'side')
  git(repo, 'tag', 'v1.3.0')
  git(repo, 'checkout', '-q', 'main')
})
afterAll(() => rmSync(root, { recursive: true, force: true }))

// Script .mjs không import được TypeScript nên giữ mẫu riêng; test này bắt hai mẫu lệch nhau.
test('the script tag pattern is the same as RELEASE_TAG_PATTERN of lib/env.ts', () => {
  expect(TAG_PATTERN.source).toBe(RELEASE_TAG_PATTERN.source)
})

test('a release tag is vX.Y.Z and must name the version package.json carries', () => {
  expect(tagMatchesVersion('v1.0.0', '1.0.0')).toBe(true)
  expect(tagMatchesVersion('v1.0.1', '1.0.0')).toBe(false)
  expect(tagMatchesVersion('1.0.0', '1.0.0')).toBe(false)
  expect(tagMatchesVersion('v1.0.0-rc.1', '1.0.0-rc.1')).toBe(false)
  expect(tagMatchesVersion('v1.0', '1.0')).toBe(false)
  expect(tagMatchesVersion('v01.0.0', '01.0.0')).toBe(false)
})

// Review Focus 3: tag annotated (git tag -a) giải ra commit như tag thường.
test('a tag on main whose package.json matches resolves to its commit, lightweight or annotated', () => {
  expect(checkReleaseTag('v1.0.0', OPTS())).toEqual({ tag: 'v1.0.0', sha: sha.v100, version: '1.0.0' })
  expect(checkReleaseTag('v1.1.0', OPTS())).toEqual({ tag: 'v1.1.0', sha: sha.v110, version: '1.1.0' })
})

test('refuses a tag off main, a tag that does not match package.json, and an unknown tag', () => {
  expect(() => checkReleaseTag('v1.3.0', OPTS())).toThrow(/không nằm trên main/)
  expect(() => checkReleaseTag('v1.2.0', OPTS())).toThrow(/không khớp version 1\.1\.0/)
  expect(() => checkReleaseTag('v9.9.9', OPTS())).toThrow(/Không thấy tag v9\.9\.9/)
})

test('refuses when the main ref is missing, as after a shallow checkout', () => {
  expect(() => checkReleaseTag('v1.0.0', { cwd: repo, mainRef: 'origin/khong-co' })).toThrow(/fetch-depth: 0/)
})

// Review Focus 3: chuỗi lạ từ ô nhập tay bị từ chối trước mọi lệnh git (cwd không tồn tại: git chạy thì lỗi đã khác).
test.each(['--upload-pack=touch x', 'v1.0.0;id', 'v1.0', 'main', '', 'v1.0.0 ', 'refs/tags/v1.0.0'])('refuses %j before running git', (tag) => {
  expect(() => checkReleaseTag(tag, { cwd: join(root, 'khong-co'), mainRef: 'main' })).toThrow(/không có dạng vX\.Y\.Z/)
})

test('the CLI writes tag, sha and version to GITHUB_OUTPUT, or prints ::error:: and writes nothing', () => {
  const output = join(root, 'github-output')
  writeFileSync(output, '')
  const ok = spawnSync(process.execPath, [SCRIPT, 'v1.0.0'], { cwd: repo, env: { ...process.env, GITHUB_OUTPUT: output }, encoding: 'utf8' })
  expect(ok.status).toBe(0)
  expect(readFileSync(output, 'utf8')).toBe(`tag=v1.0.0\nsha=${sha.v100}\nversion=1.0.0\n`)

  writeFileSync(output, '')
  const bad = spawnSync(process.execPath, [SCRIPT, 'v1.2.0'], { cwd: repo, env: { ...process.env, GITHUB_OUTPUT: output }, encoding: 'utf8' })
  expect(bad.status).toBe(1)
  expect(bad.stdout).toMatch(/^::error::Tag v1\.2\.0 không khớp version 1\.1\.0/m)
  expect(readFileSync(output, 'utf8')).toBe('')
})
