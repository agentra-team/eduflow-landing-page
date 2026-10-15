// Dựng icon của site từ hình học dấu hiệu EduFlow (Lockups.dc.html, lưới 120): app/icon.svg (favicon), app/icon.png (192),
// app/apple-icon.png (180, cũng là logo JSON-LD) và public/brand/eduflow-mark*.svg. Chạy từ gốc repo: node scripts/brand/build-icons.mjs
import { writeFile } from 'node:fs/promises'
import sharp from 'sharp'

const OLIVE = '#567F2E'
const ORANGE = '#F2A541'
const WHITE = '#FFFFFF'

/** Dấu hiệu đầy đủ: thân một màu, tua (dây, nút, quả tua) màu khác. */
const markFull = (body, tassel) =>
  `<g fill="${body}"><polygon points="60,12 112,34 60,56 8,34"/><polygon points="22,45 36,51 36,108 22,108"/>` +
  `<rect x="22" y="72" width="52" height="13" rx="2"/><rect x="22" y="95" width="70" height="13" rx="2"/></g>` +
  `<path d="M60 34 L98 40 V64" fill="none" stroke="${tassel}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>` +
  `<circle cx="60" cy="34" r="4.5" fill="${tassel}"/><rect x="93" y="62" width="10" height="17" rx="3" fill="${tassel}"/>`

/** Bản rút gọn cho cỡ 48 px trở xuống: bỏ dây tua, hai thanh dày hơn (ô 48 px trong lockup app icon). */
const markSmall = (body, tassel) =>
  `<g fill="${body}"><polygon points="60,12 112,34 60,56 8,34"/><polygon points="22,45 36,51 36,108 22,108"/>` +
  `<rect x="22" y="70" width="54" height="16" rx="2"/><rect x="22" y="92" width="72" height="16" rx="2"/></g>` +
  `<rect x="93" y="58" width="12" height="20" rx="3" fill="${tassel}"/>`

/** Ô vuông nền olive, dấu hiệu trắng, tua cam. radius 0: ô kín (Apple tự bo góc). */
const tile = (size, radius, markSize, mark) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">` +
  `<rect width="${size}" height="${size}" rx="${radius}" fill="${OLIVE}"/>` +
  `<g transform="translate(${(size - markSize) / 2} ${(size - markSize) / 2}) scale(${markSize / 120})">${mark}</g></svg>\n`

const svgFiles = {
  // Favicon hiện ở 16 tới 32 px: bản rút gọn trong ô 48 px của lockup (bo 12, dấu hiệu 36).
  'app/icon.svg': tile(48, 12, 36, markSmall(WHITE, ORANGE)),
  // Bản màu dùng currentColor (spec §5.3): màu olive đặt ở thẻ gốc, đổi được bằng CSS khi nhúng inline.
  'public/brand/eduflow-mark.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" style="color:${OLIVE}" role="img" aria-label="EduFlow">${markFull('currentColor', ORANGE)}</svg>\n`,
  'public/brand/eduflow-mark-white.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" role="img" aria-label="EduFlow">${markFull(WHITE, ORANGE)}</svg>\n`,
}
for (const [path, svg] of Object.entries(svgFiles)) await writeFile(path, svg)

// PNG theo lockup app icon 180 px (bo 40, dấu hiệu 128), co giãn theo cạnh.
await sharp(Buffer.from(tile(180, 0, 128, markFull(WHITE, ORANGE)))).png().toFile('app/apple-icon.png')
await sharp(Buffer.from(tile(192, (40 / 180) * 192, (128 / 180) * 192, markFull(WHITE, ORANGE)))).png().toFile('app/icon.png')
console.log('Đã ghi', [...Object.keys(svgFiles), 'app/apple-icon.png', 'app/icon.png'].join(', '))
