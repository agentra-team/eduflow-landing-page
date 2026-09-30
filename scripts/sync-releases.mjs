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

// Một nền tảng có thể phát hành trước: tệp thiếu (không có trong thư mục hoặc HTTP 404) ghi null, trang hiện "sắp có".
async function readOptional(name) {
  try {
    return parse(await readSource(name))
  } catch (err) {
    if (err?.code === 'ENOENT' || /HTTP 404/.test(String(err?.message))) return null
    throw err
  }
}
const [windows, mac] = await Promise.all([readOptional('latest.yml'), readOptional('latest-mac.yml')])
if (!windows && !mac) {
  console.error(`Không thấy latest.yml lẫn latest-mac.yml ở ${from}`)
  process.exit(1)
}
const out = { baseUrl, windows, mac }
await writeFile('content/releases.json', `${JSON.stringify(out, null, 2)}\n`)
console.log(`content/releases.json ← ${from} (Windows ${out.windows?.version ?? 'chưa có'}, macOS ${out.mac?.version ?? 'chưa có'})`)
