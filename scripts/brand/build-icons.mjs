// Dựng icon của site từ chữ A Agentra (PO 2026-10-22, viewBox "36 36 428 428"): app/icon.svg (favicon),
// app/icon.png (192), app/apple-icon.png (180, cũng là logo JSON-LD) và public/brand/eduflow-mark*.svg.
// Ô icon giống icon app desktop: nền trắng bo góc 228/1024, chữ A đặt ở 192..832 của 1024.
// Chạy từ gốc repo: node scripts/brand/build-icons.mjs
import { writeFile } from 'node:fs/promises'
import sharp from 'sharp'

const LIGHT = '#8CBF3C'
const GREEN = '#6A9C39'
const WHITE = '#FFFFFF'
const VIEWBOX = '36 36 428 428'

/** Chữ A: nét trái xanh lá sáng, nét phải xanh lá. Bản trắng: hai nét trắng, nét phải trắng mờ 75%. */
const mark = (left, right, rightOpacity) =>
  `<polygon points="255,72 313,174 153,428 41,428" fill="${left}"/>` +
  `<polygon points="331,206 458,428 344,428 282,327 251,327" fill="${right}"${rightOpacity ? ` fill-opacity="${rightOpacity}"` : ''}/>`

const markColor = mark(LIGHT, GREEN)
const markWhite = mark(WHITE, WHITE, '0.75')

/** Ô vuông nền trắng, chữ A màu (như icon app desktop). radius 0: ô kín (Apple tự bo góc). */
const tile = (size, radius) => {
  const at = +((size * 192) / 1024).toFixed(3)
  const span = +((size * 640) / 1024).toFixed(3)
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">` +
    `<rect width="${size}" height="${size}" rx="${+radius.toFixed(3)}" fill="${WHITE}"/>` +
    `<svg x="${at}" y="${at}" width="${span}" height="${span}" viewBox="${VIEWBOX}">${markColor}</svg></svg>\n`
  )
}

const svgFiles = {
  // Favicon hiện ở 16 tới 32 px: ô 48 bo 12.
  'app/icon.svg': tile(48, 12),
  'public/brand/eduflow-mark.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEWBOX}" role="img" aria-label="EduFlow">${markColor}</svg>\n`,
  'public/brand/eduflow-mark-white.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEWBOX}" role="img" aria-label="EduFlow">${markWhite}</svg>\n`,
}
for (const [path, svg] of Object.entries(svgFiles)) await writeFile(path, svg)

await sharp(Buffer.from(tile(180, 0))).png().toFile('app/apple-icon.png')
await sharp(Buffer.from(tile(192, (192 * 228) / 1024))).png().toFile('app/icon.png')
console.log('Đã ghi', [...Object.keys(svgFiles), 'app/apple-icon.png', 'app/icon.png'].join(', '))
