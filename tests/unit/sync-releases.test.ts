import { spawnSync } from 'node:child_process'
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { expect, test } from 'vitest'

const SCRIPT = resolve('scripts/sync-releases.mjs')

function run(files: string[]) {
  const work = mkdtempSync(join(tmpdir(), 'sync-releases-'))
  const feed = join(work, 'feed')
  mkdirSync(join(work, 'content'))
  mkdirSync(feed)
  for (const f of files) copyFileSync(resolve('tests/fixtures', f), join(feed, f))
  const res = spawnSync(process.execPath, [SCRIPT, '--from', feed, '--base', 'https://feed.example.test/desktop/'], { cwd: work, encoding: 'utf8' })
  return { res, read: () => JSON.parse(readFileSync(join(work, 'content', 'releases.json'), 'utf8')) }
}

test('sync-releases keeps a Windows-only release and writes null for macOS', () => {
  const { res, read } = run(['latest.yml'])
  expect(res.status).toBe(0)
  const out = read()
  expect(out.baseUrl).toBe('https://feed.example.test/desktop/')
  expect(out.windows.version).toBeTruthy()
  expect(out.mac).toBeNull()
})

test('sync-releases stops when neither file exists', () => {
  const { res } = run([])
  expect(res.status).toBe(1)
  expect(res.stderr).toContain('latest.yml')
})
