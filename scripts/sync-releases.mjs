// Cập nhật content/releases.json từ feed kênh ổn định (URL) hoặc thư mục release cục bộ, kèm URL gốc để dựng link tải.
// Dùng: node scripts/sync-releases.mjs [--from <url|thư mục>] [--base <url gốc khi đọc từ thư mục>]
import { readFile, stat, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { parse } from 'yaml'

const arg = (name) => {
  const i = process.argv.indexOf(name)
  return i > -1 ? process.argv[i + 1] : undefined
}
const from = arg('--from') || process.env.DOWNLOAD_FEED_URL
if (!from) {
  console.error('Thiếu nguồn: đặt DOWNLOAD_FEED_URL hoặc truyền --from <url|thư mục>')
  process.exit(1)
}
const isDir = await stat(from).then((s) => s.isDirectory()).catch(() => false)
const rawBase = isDir ? arg('--base') || process.env.DOWNLOAD_FEED_URL : from
if (!rawBase) {
  console.error('Đọc từ thư mục cần --base <url gốc> hoặc DOWNLOAD_FEED_URL để dựng link tải')
  process.exit(1)
}
const baseUrl = rawBase.endsWith('/') ? rawBase : `${rawBase}/`

async function readSource(name) {
  if (isDir) return readFile(join(from, name), 'utf8')
  const res = await fetch(baseUrl + name, { signal: AbortSignal.timeout(15000) })
  if (!res.ok) throw new Error(`${baseUrl}${name}: HTTP ${res.status}`)
  return res.text()
}

const [windows, mac] = await Promise.all([readSource('latest.yml'), readSource('latest-mac.yml')])
const out = { baseUrl, windows: parse(windows), mac: parse(mac) }
await writeFile('content/releases.json', `${JSON.stringify(out, null, 2)}\n`)
console.log(`content/releases.json ← ${from} (Windows ${out.windows?.version}, macOS ${out.mac?.version})`)
