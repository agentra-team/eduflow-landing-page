// Chụp artboard app EduFlow (../eduflow-application/docs/thiet-ke/canvas/project/*.dc.html) thành WebP cho site, không kèm thanh tiêu đề của app (WindowFrame vẽ khung).
// Dùng: node scripts/capture-product-images.mjs [<thư mục artboard>] [--os macOS|Windows]
import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { chromium } from '@playwright/test'
import sharp from 'sharp'

const args = process.argv.slice(2)
const osIdx = args.indexOf('--os')
const os = osIdx > -1 ? args[osIdx + 1] : 'macOS'
const positional = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--os')
const srcDir = resolve(positional[0] ?? '../eduflow-application/docs/thiet-ke/canvas/project')
const outDir = 'public/images/product'
const SHOTS = [
  { artboard: 'AssistantHome', out: 'assistant-home', width: 2000, quality: 74 },
  { artboard: 'Result', out: 'result', width: 1600, quality: 72 },
  { artboard: 'ExamSetup', out: 'exam-setup', width: 1600, quality: 72 },
  { artboard: 'SlideStudio', out: 'slide-studio', width: 1600, quality: 72 },
  { artboard: 'CourseWorkbench', out: 'course-workbench', width: 1600, quality: 72 },
  { artboard: 'CourseGates', out: 'course-gates', width: 1600, quality: 72 },
  { artboard: 'CourseApproval', out: 'course-approval', width: 1600, quality: 72 },
  { artboard: 'ProgramGraph', out: 'program-graph', width: 1600, quality: 72 },
  { artboard: 'ProgramReview', out: 'program-review', width: 1600, quality: 72 },
  { artboard: 'WhatIf', out: 'what-if', width: 1600, quality: 72 },
  { artboard: 'AssistantStates', out: 'assistant-states', width: 1600, quality: 72 },
  { artboard: 'Usage', out: 'usage', width: 1600, quality: 72 },
  { artboard: 'JobsCost', out: 'jobs-cost', width: 1600, quality: 72 },
]

// Artboard còn vẽ theo theme xanh lá cũ: đổi mỗi màu cũ sang token cùng vai của theme xanh dương
// (packages/ui/src/tokens.css của app), Roboto sang Plus Jakarta Sans, độ đậm 700 sang 600, logo cũ sang logo chữ E chấm,
// câu phụ cũ của trợ lý sang câu mới của app.
const RETHEME = {
  '#F6F7F2': '#F6F8FB', '#EEF1EA': '#FFFFFF', '#FAFBF8': '#F8FAFD', '#16201A': '#141736', '#3F4A43': '#45465E',
  '#5B675F': '#7D8DA6', '#1F6A2B': '#0177FB', '#237A31': '#0177FB', '#2F8F3C': '#0177FB', '#1C6128': '#0167D9',
  '#1B5E26': '#0167D9', '#E8F3E7': '#E8F2FF', '#F4F8F2': '#F2F7FF', '#9BCB3C': '#01D7DF', '#567F2E': '#141736',
  '#F2A541': '#FE6470', '#DDE3DA': '#DFE5F1', '#EEF2EC': '#EEF2F8', '#C9D2C5': '#C8D3E5', '#C8D3CB': '#C8D3E5',
  '#E3E8E1': '#E6EBF3', '#1E2B23': '#141736', '#33443A': '#2A2D4A', '#ECEEE8': '#EEF2F8', '#F3F4F0': '#F3F6FA',
  '#D5DAD1': '#D9E0EC',
}
const MARK = '<svg width="30" height="30" viewBox="0 0 64 64" aria-hidden="true"><rect x="8" y="5" width="15" height="54" rx="7.5" fill="#141736"/><circle cx="40" cy="13" r="8" fill="#0177FB"/><circle cx="35" cy="32" r="8" fill="#01D7DF"/><circle cx="40" cy="51" r="8" fill="#FE6470"/></svg>'
const retheme = (html) => html
  .replace(/background: #567F2E([^"]*"><svg)[^]*?<\/svg>/g, (_, rest) => `background: transparent${rest.slice(0, -4)}${MARK}`)
  .replace(/#[0-9A-Fa-f]{6}\b/g, (hex) => RETHEME[hex.toUpperCase()] ?? hex)
  .replace(/rgba\(22, ?32, ?26,/gi, 'rgba(20,23,54,').replace(/rgba\(35, ?122, ?49,/gi, 'rgba(1,119,251,')
  .replace(/family=Roboto:wght@400;500;600;700/g, 'family=Plus+Jakarta+Sans:wght@400;500;600').replace(/'Roboto'/g, "'Plus Jakarta Sans'")
  .replace(/font-weight: ?700/g, 'font-weight: 600')
  .replace(/Biết thầy cô đang xem gì/g, 'Giúp đúng việc thầy cô đang làm')

const tmp = await mkdtemp(join(tmpdir(), 'eduflow-shots-'))
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })
await page.addInitScript(() => {
  window.DCLogic = class DCLogic {
    constructor(props) { this.props = props || {}; this.state = {} }
    setState() {}
    forceUpdate() {}
  }
})
for (const shot of SHOTS) {
  const html = join(tmp, `${shot.artboard}.dc.html`)
  await writeFile(html, retheme(await readFile(join(srcDir, `${shot.artboard}.dc.html`), 'utf8')))
  await page.goto(`file://${html}`, { waitUntil: 'load' })
  await page.evaluate((osName) => {
    // Artboard EduFlow khai báo logic trong <script type="text/x-dc">, trình duyệt không tự chạy thẻ này,
    // nên dựng lớp Component từ mã nguồn của nó.
    const source = document.querySelector('script[data-dc-script]')?.textContent ?? ''
    const Comp = source ? new Function('DCLogic', `${source}\nreturn Component`)(window.DCLogic) : null
    const vals = Comp ? (new Comp({ os: osName }).renderVals?.() ?? {}) : {}
    // Khung cửa sổ do WindowFrame của trang vẽ, nên bỏ thanh tiêu đề macOS và Windows của chính artboard.
    vals.isMac = false
    vals.isWin = false
    const lookup = (scope, path) => path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), scope)
    const fill = (html, scope) =>
      html.replace(/\{\{\s*([\w$.]+)\s*\}\}/g, (m, p) => { const v = lookup(scope, p); return v === undefined ? m : String(v) })
    const outermost = (root) => Array.from(root.querySelectorAll('sc-for')).filter((n) => !n.parentElement?.closest('sc-for'))
    const renderFor = (el, scope) => {
      const list = lookup(scope, (el.getAttribute('list') || '').replace(/[{}\s]/g, '')) || []
      const alias = el.getAttribute('as') || 'item'
      return list.map((item, i) => {
        const s = Object.assign({}, scope, { [alias]: item, $index: i })
        const tmpEl = document.createElement('div')
        tmpEl.innerHTML = el.innerHTML
        for (const n of outermost(tmpEl)) n.outerHTML = renderFor(n, s)
        return fill(tmpEl.innerHTML, s)
      }).join('')
    }
    for (const n of outermost(document.body)) n.outerHTML = renderFor(n, vals)
    document.body.innerHTML = fill(document.body.innerHTML, vals)
    // sc-if: giữ nội dung khi giá trị đúng, bỏ khi sai (khung macOS hay Windows). Xử lý từng phần tử một vì
    // thay outerHTML tạo lại các sc-if lồng bên trong.
    const truthy = (expr) => {
      const e = (expr || '').replace(/[{}\s]/g, '')
      if (e === 'true') return true
      if (e === 'false' || e === '') return false
      return Boolean(lookup(vals, e))
    }
    for (let n = document.querySelector('sc-if'); n; n = document.querySelector('sc-if')) {
      n.outerHTML = truthy(n.getAttribute('value')) ? n.innerHTML : ''
    }
  }, os)
  // Chờ stylesheet và font web nạp xong sau khi dựng lại DOM, rồi kiểm không còn lỗ {{…}} hay thẻ sc-* nào sót.
  const state = await page.evaluate(async () => {
    await Promise.all(
      Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map((l) =>
        l.sheet ? null : new Promise((done) => { l.addEventListener('load', done); l.addEventListener('error', done) })),
    )
    await Promise.all(Array.from(document.fonts).map((f) => f.load().catch(() => null)))
    await document.fonts.ready
    const root = document.querySelector('x-dc') ?? document.body
    const loaded = new Set(Array.from(document.fonts).filter((f) => f.status === 'loaded').map((f) => f.family.replace(/["']/g, '')))
    return {
      holes: (root.innerText.match(/\{\{[^}]*\}\}/g) ?? []).length,
      tags: root.querySelectorAll('sc-for, sc-if').length,
      fonts: ['Plus Jakarta Sans'].every((name) => loaded.has(name)),
    }
  })
  if (state.holes > 0 || state.tags > 0) throw new Error(`${shot.artboard}: còn ${state.holes} lỗ chưa điền, ${state.tags} thẻ sc-* chưa dựng`)
  if (!state.fonts) throw new Error(`${shot.artboard}: font web chưa nạp, cần mạng để tải Google Fonts`)
  await page.waitForTimeout(300)
  const png = join(tmp, `${shot.out}.png`)
  await page.screenshot({ path: png, type: 'png' })
  const out = join(outDir, `${shot.out}.webp`)
  const info = await sharp(png).resize({ width: shot.width }).webp({ quality: shot.quality }).toFile(out)
  console.log(`${out}  ${info.width}×${info.height}  ${Math.round(info.size / 1024)} KB`)
}
await browser.close()
