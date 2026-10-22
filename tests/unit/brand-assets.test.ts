import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { expect, test } from 'vitest'
import manifest from '@/app/manifest'

const path = (p: string) => fileURLToPath(new URL(`../../${p}`, import.meta.url))
const read = (p: string) => readFileSync(path(p), 'utf8')

// Chữ A Agentra (PO 2026-10-22): nét trái #8CBF3C, nét phải #6A9C39, viewBox "36 36 428 428".
const LEFT = '<polygon points="255,72 313,174 153,428 41,428"'
const RIGHT = '<polygon points="331,206 458,428 344,428 282,327 251,327"'
const OLD_LOGO = /<circle|#0177FB|#01D7DF|#FE6470/

test('brand marks are the Agentra A in the logo colours', () => {
  const color = read('public/brand/eduflow-mark.svg')
  expect(color).toContain('viewBox="36 36 428 428"')
  expect(color).toContain(`${LEFT} fill="#8CBF3C"/>`)
  expect(color).toContain(`${RIGHT} fill="#6A9C39"/>`)
  const white = read('public/brand/eduflow-mark-white.svg')
  expect(white).toContain('viewBox="36 36 428 428"')
  expect(white).toContain(`${LEFT} fill="#FFFFFF"/>`)
  expect(white).toContain(`${RIGHT} fill="#FFFFFF" fill-opacity="0.75"/>`)
  for (const svg of [color, white]) expect(svg).not.toMatch(OLD_LOGO)
})

test('wordmarks carry the A and the lettering as paths, never as text or a font', () => {
  for (const f of ['public/brand/eduflow-wordmark.svg', 'public/brand/eduflow-wordmark-white.svg']) {
    const svg = read(f)
    expect(svg, f).toMatch(/viewBox="0 0 414 104"/)
    expect(svg, f).toContain(LEFT)
    expect(svg, f).toContain(RIGHT)
    expect(svg, f).not.toMatch(OLD_LOGO)
    expect((svg.match(/<path/g) ?? []).length, f).toBeGreaterThanOrEqual(1)
    expect(svg, f).not.toMatch(/<text|font-family|Sora|Jakarta/i)
  }
})

test('the favicon is the coloured A on a white tile, like the desktop app icon', () => {
  const svg = read('app/icon.svg')
  expect(svg).toContain('rx="12" fill="#FFFFFF"')
  expect(svg).toContain(`${LEFT} fill="#8CBF3C"/>`)
  expect(svg).toContain(`${RIGHT} fill="#6A9C39"/>`)
  expect(svg).not.toMatch(OLD_LOGO)
})

test('PNG icons have the declared sizes and the Apple icon is opaque', async () => {
  const meta = async (p: string) => sharp(path(p)).metadata()
  expect(await meta('app/apple-icon.png')).toMatchObject({ width: 180, height: 180 })
  expect(await meta('app/icon.png')).toMatchObject({ width: 192, height: 192 })
  expect((await sharp(path('app/apple-icon.png')).stats()).isOpaque).toBe(true)
  expect(manifest().theme_color).toBe('#6A9C39')
})
