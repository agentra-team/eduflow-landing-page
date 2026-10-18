import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { expect, test } from 'vitest'
import manifest from '@/app/manifest'

const path = (p: string) => fileURLToPath(new URL(`../../${p}`, import.meta.url))
const read = (p: string) => readFileSync(path(p), 'utf8')

// Logo C "Chữ E chấm" (spec blue retheme §4.4, bảng Main): thanh navy và ba chấm xanh, ngọc, hồng cam trên lưới 64.
const LOGO_C = ['<rect x="8" y="5" width="15" height="54" rx="7.5"', '<circle cx="40" cy="13" r="8"', '<circle cx="35" cy="32" r="8"', '<circle cx="40" cy="51" r="8"']

test('brand marks are logo C on the 64 grid with the logo colours', () => {
  for (const f of ['public/brand/eduflow-mark.svg', 'public/brand/eduflow-mark-white.svg']) {
    const svg = read(f)
    expect(svg, f).toContain('viewBox="0 0 64 64"')
    for (const shape of LOGO_C) expect(svg, f).toContain(shape)
    expect(svg, f).toContain('fill="#01D7DF"')
    expect(svg, f).toContain('fill="#FE6470"')
  }
  const color = read('public/brand/eduflow-mark.svg')
  expect(color).toMatch(/<svg[^>]*style="color:#141736"/)
  expect(color).toContain('fill="currentColor"')
  expect(color).toContain('fill="#0177FB"')
  const white = read('public/brand/eduflow-mark-white.svg')
  expect(white).toContain('<rect x="8" y="5" width="15" height="54" rx="7.5" fill="#FFFFFF"/>')
  expect(white).toContain('<circle cx="40" cy="13" r="8" fill="#FFFFFF" fill-opacity="0.75"/>')
})

test('wordmarks carry the lettering as paths, never as text or a font', () => {
  for (const f of ['public/brand/eduflow-wordmark.svg', 'public/brand/eduflow-wordmark-white.svg']) {
    const svg = read(f)
    expect(svg, f).toMatch(/viewBox="0 0 414 104"/)
    for (const shape of LOGO_C) expect(svg, f).toContain(shape)
    expect((svg.match(/<path/g) ?? []).length, f).toBeGreaterThanOrEqual(1)
    expect(svg, f).not.toMatch(/<text|font-family|Sora|Jakarta/i)
  }
})

test('the favicon is the white logo C on a blue tile', () => {
  const svg = read('app/icon.svg')
  expect(svg).toContain('rx="12" fill="#0177FB"')
  for (const shape of LOGO_C) expect(svg).toContain(shape)
  expect(svg).toContain('fill-opacity="0.75"')
})

test('PNG icons have the declared sizes and the Apple icon is opaque', async () => {
  const meta = async (p: string) => sharp(path(p)).metadata()
  expect(await meta('app/apple-icon.png')).toMatchObject({ width: 180, height: 180 })
  expect(await meta('app/icon.png')).toMatchObject({ width: 192, height: 192 })
  expect((await sharp(path('app/apple-icon.png')).stats()).isOpaque).toBe(true)
  expect(manifest().theme_color).toBe('#0177FB')
})
