import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { expect, test } from 'vitest'
import manifest from '@/app/manifest'

const path = (p: string) => fileURLToPath(new URL(`../../${p}`, import.meta.url))
const read = (p: string) => readFileSync(path(p), 'utf8')

test('brand marks use the logo colours on the 120 grid of the lockups', () => {
  for (const f of ['public/brand/eduflow-mark.svg', 'public/brand/eduflow-mark-white.svg']) {
    expect(read(f), f).toContain('viewBox="0 0 120 120"')
    expect(read(f), f).toContain('#F2A541')
  }
  const color = read('public/brand/eduflow-mark.svg')
  expect(color).toMatch(/<svg[^>]*style="color:#567F2E"/)
  expect(color).toContain('fill="currentColor"')
  expect(read('public/brand/eduflow-mark-white.svg')).toContain('#FFFFFF')
})

test('wordmarks carry the lettering as paths, never as text or a font', () => {
  for (const f of ['public/brand/eduflow-wordmark.svg', 'public/brand/eduflow-wordmark-white.svg']) {
    const svg = read(f)
    expect(svg, f).toMatch(/viewBox="0 0 \d+ 104"/)
    expect((svg.match(/<path/g) ?? []).length, f).toBeGreaterThanOrEqual(3)
    expect(svg, f).not.toMatch(/<text|font-family|Sora/i)
  }
})

test('the favicon is the small mark (no tassel cord) on an olive tile', () => {
  const svg = read('app/icon.svg')
  expect(svg).toContain('fill="#567F2E"')
  expect(svg).not.toContain('<path')
})

test('PNG icons have the declared sizes and the Apple icon is opaque', async () => {
  const meta = async (p: string) => sharp(path(p)).metadata()
  expect(await meta('app/apple-icon.png')).toMatchObject({ width: 180, height: 180 })
  expect(await meta('app/icon.png')).toMatchObject({ width: 192, height: 192 })
  expect((await sharp(path('app/apple-icon.png')).stats()).isOpaque).toBe(true)
  expect(manifest().theme_color).toBe('#567F2E')
})
