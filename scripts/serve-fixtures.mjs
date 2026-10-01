// Máy chủ feed giả cho e2e: phục vụ tests/fixtures/*.yml tại http://localhost:3300/.
// FIXTURE_MISSING=latest-mac.yml trả 404 cho tệp đó, để giả một bản phát hành chỉ có một hệ điều hành (Ruling 38).
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

const PORT = Number(process.env.FIXTURE_PORT ?? 3300)
const MISSING = new Set((process.env.FIXTURE_MISSING ?? '').split(',').filter(Boolean))
createServer(async (req, res) => {
  const name = decodeURIComponent((req.url ?? '/').split('?')[0].replace(/^\/+/, ''))
  if (!/^latest(-mac)?\.yml$/.test(name) || MISSING.has(name)) {
    res.writeHead(404).end('not found')
    return
  }
  try {
    const body = await readFile(join('tests/fixtures', name))
    res.writeHead(200, { 'content-type': 'text/yaml; charset=utf-8' }).end(body)
  } catch {
    res.writeHead(404).end('not found')
  }
}).listen(PORT, () => console.log(`fixture feed on http://localhost:${PORT}/`))
