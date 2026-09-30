// Chụp artboard app EduFlow (../eduflow-application/docs/thiet-ke/canvas/project/*.dc.html) thành WebP cho site.
// Dùng: node scripts/capture-product-images.mjs [<thư mục artboard>] [--os macOS|Windows]
import { mkdtemp } from 'node:fs/promises'
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
  await page.goto(`file://${join(srcDir, `${shot.artboard}.dc.html`)}`, { waitUntil: 'load' })
  await page.evaluate((osName) => {
    // Artboard EduFlow khai báo logic trong <script type="text/x-dc">, trình duyệt không tự chạy thẻ này,
    // nên dựng lớp Component từ mã nguồn của nó.
    const source = document.querySelector('script[data-dc-script]')?.textContent ?? ''
    const Comp = source ? new Function('DCLogic', `${source}\nreturn Component`)(window.DCLogic) : null
    const vals = Comp ? (new Comp({ os: osName }).renderVals?.() ?? {}) : {}
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
      fonts: ['Be Vietnam Pro', 'Fraunces', 'JetBrains Mono'].every((name) => loaded.has(name)),
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
