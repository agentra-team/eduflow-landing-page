import { spawnSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { expect, test } from 'vitest'

const SCRIPT = resolve('scripts/sync-releases.mjs')

/** Chép các fixture có tên vào thư mục feed, rồi ghi mỗi mục của `extra` thành một tệp với đúng nội dung đó. */
function run(files: string[], extra: Record<string, string> = {}) {
  const work = mkdtempSync(join(tmpdir(), 'sync-releases-'))
  const feed = join(work, 'feed')
  mkdirSync(join(work, 'content'))
  mkdirSync(feed)
  for (const f of files) copyFileSync(resolve('tests/fixtures', f), join(feed, f))
  for (const [name, body] of Object.entries(extra)) writeFileSync(join(feed, name), body)
  const res = spawnSync(process.execPath, [SCRIPT, '--from', feed, '--base', 'https://feed.example.test/desktop/'], { cwd: work, encoding: 'utf8' })
  return { res, work, read: () => JSON.parse(readFileSync(join(work, 'content', 'releases.json'), 'utf8')) }
}

test('sync-releases keeps a Windows-only release and writes null for macOS', () => {
  const { res, read } = run(['latest.yml'])
  expect(res.status).toBe(0)
  const out = read()
  expect(out.baseUrl).toBe('https://feed.example.test/desktop/')
  expect(out.windows.version).toBeTruthy()
  expect(out.mac).toBeNull()
})

test('sync-releases keeps a macOS-only release and writes null for Windows', () => {
  const { res, read } = run(['latest-mac.yml'])
  expect(res.status).toBe(0)
  expect(read().windows).toBeNull()
  expect(read().mac.version).toBeTruthy()
})

test('sync-releases stops when neither file exists', () => {
  const { res, work } = run([])
  expect(res.status).toBe(1)
  expect(res.stderr).toContain('latest.yml')
  expect(res.stderr).toContain('Không thấy')
  expect(existsSync(join(work, 'content', 'releases.json'))).toBe(false)
})

test('sync-releases stops on a file that is not a feed and writes nothing', () => {
  for (const body of ['{', '', '<!doctype html><title>Oops</title>']) {
    const { res, work } = run(['latest.yml'], { 'latest-mac.yml': body })
    expect(res.status).not.toBe(0)
    expect(existsSync(join(work, 'content', 'releases.json'))).toBe(false)
  }
})
