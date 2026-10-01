import { spawn, spawnSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:http'
import type { AddressInfo } from 'node:net'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { afterAll, expect, test } from 'vitest'
import { parse } from 'yaml'
import { isFeed } from '@/lib/releases/parse'

const SCRIPT = resolve('scripts/sync-releases.mjs')

// Thư mục tạm của mọi ca, dọn hết khi xong để không để lại gì trong tmpdir.
const workDirs: string[] = []
afterAll(() => {
  for (const dir of workDirs) rmSync(dir, { recursive: true, force: true })
})

/** Chép các fixture có tên vào thư mục feed, rồi ghi mỗi mục của `extra` thành một tệp với đúng nội dung đó. */
function run(files: string[], extra: Record<string, string> = {}) {
  const work = mkdtempSync(join(tmpdir(), 'sync-releases-'))
  workDirs.push(work)
  const feed = join(work, 'feed')
  mkdirSync(join(work, 'content'))
  mkdirSync(feed)
  for (const f of files) copyFileSync(resolve('tests/fixtures', f), join(feed, f))
  for (const [name, body] of Object.entries(extra)) writeFileSync(join(feed, name), body)
  const res = spawnSync(process.execPath, [SCRIPT, '--from', feed, '--base', 'https://feed.example.test/desktop/'], { cwd: work, encoding: 'utf8' })
  return { res, work, read: () => JSON.parse(readFileSync(join(work, 'content', 'releases.json'), 'utf8')) }
}

/** Chạy script bằng spawn bất đồng bộ: máy chủ HTTP của test nằm cùng tiến trình, spawnSync sẽ chặn vòng lặp sự kiện và treo. */
function runAsync(args: string[], cwd: string) {
  return new Promise<{ status: number | null; stdout: string; stderr: string }>((done, fail) => {
    const child = spawn(process.execPath, args, { cwd })
    let stdout = ''
    let stderr = ''
    child.stdout.on('data', (chunk) => (stdout += chunk))
    child.stderr.on('data', (chunk) => (stderr += chunk))
    child.on('error', fail)
    child.on('close', (status) => done({ status, stdout, stderr }))
  })
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

// Thân tệp có mặt nhưng không phải feed của electron-updater. Luật nằm ở `isFeed` (lib/releases/parse.ts), script chép lại cùng luật,
// nên mỗi ca kiểm cả hai: script dừng với mã 1 và không ghi gì, còn `isFeed` cũng từ chối đúng thân đó.
const NOT_FEEDS = [
  '',
  '<!doctype html><title>Oops</title>',
  'version: 1.0.0',
  'files: []',
  "files: [{ url: 'x.dmg' }]",
  'files: [{ url: x.dmg, sha512: abc, size: 1 }]',
  "version: 1.0.0\nfiles: [{ url: x.dmg, sha512: abc, size: '1' }]",
]

test.each(NOT_FEEDS)('sync-releases stops on a body that is not a feed and writes nothing: %j', (body) => {
  const { res, work } = run(['latest.yml'], { 'latest-mac.yml': body })
  const why = `body ${JSON.stringify(body)}`
  expect(res.status, `${why}: exit status`).toBe(1)
  expect(res.stderr, `${why}: stderr`).toContain('không phải feed')
  expect(existsSync(join(work, 'content', 'releases.json')), `${why}: releases.json must not be written`).toBe(false)
  expect(isFeed(parse(body)), `${why}: isFeed must reject it too`).toBe(false)
})

test('sync-releases names the file whose YAML cannot be read and writes nothing', () => {
  const { res, work } = run(['latest.yml'], { 'latest-mac.yml': '{' })
  expect(res.status).toBe(1)
  expect(res.stderr).toContain('latest-mac.yml')
  expect(existsSync(join(work, 'content', 'releases.json'))).toBe(false)
})

// Nhánh HTTP là đường chạy thật ở production: feed thật trả 404 cho tệp của hệ điều hành chưa phát hành.
test('sync-releases over HTTP keeps latest.yml and treats a 404 for latest-mac.yml as not published yet', async () => {
  const windows = readFileSync(resolve('tests/fixtures/latest.yml'))
  const server = createServer((req, res) => {
    if (req.url === '/desktop/latest.yml') res.writeHead(200, { 'content-type': 'text/yaml; charset=utf-8' }).end(windows)
    else res.writeHead(404).end('not found')
  })
  await new Promise<void>((ready) => server.listen(0, '127.0.0.1', ready))
  const work = mkdtempSync(join(tmpdir(), 'sync-releases-http-'))
  try {
    mkdirSync(join(work, 'content'))
    const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}/desktop/`
    const { status, stderr } = await runAsync([SCRIPT, '--from', base], work)
    expect(status, stderr).toBe(0)
    const out = JSON.parse(readFileSync(join(work, 'content', 'releases.json'), 'utf8'))
    expect(out.baseUrl).toBe(base)
    expect(out.windows.version).toBeTruthy()
    expect(out.mac).toBeNull()
  } finally {
    server.closeAllConnections()
    await new Promise<void>((closed) => server.close(() => closed()))
    rmSync(work, { recursive: true, force: true })
  }
})
