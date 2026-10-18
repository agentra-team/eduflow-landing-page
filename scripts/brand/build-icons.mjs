// Dựng icon của site từ logo C "Chữ E chấm" (spec blue retheme §4.4, bảng Main, lưới 64): app/icon.svg (favicon),
// app/icon.png (192), app/apple-icon.png (180, cũng là logo JSON-LD) và public/brand/eduflow-mark*.svg.
// Chạy từ gốc repo: node scripts/brand/build-icons.mjs
import { writeFile } from 'node:fs/promises'
import sharp from 'sharp'

const NAVY = '#141736'
const BLUE = '#0177FB'
const TEAL = '#01D7DF'
const CORAL = '#FE6470'
const WHITE = '#FFFFFF'

/** Logo C: thanh dọc bo tròn và ba chấm xếp dọc. Bản trắng: thanh trắng, chấm trên trắng mờ 75%. */
const mark = (bar, top, topOpacity) =>
  `<rect x="8" y="5" width="15" height="54" rx="7.5" fill="${bar}"/>` +
  `<circle cx="40" cy="13" r="8" fill="${top}"${topOpacity ? ` fill-opacity="${topOpacity}"` : ''}/>` +
  `<circle cx="35" cy="32" r="8" fill="${TEAL}"/>` +
  `<circle cx="40" cy="51" r="8" fill="${CORAL}"/>`

const markWhite = mark(WHITE, WHITE, '0.75')

/**
 * Ô vuông nền xanh, logo trắng (như icon app trên bảng Main). radius 0: ô kín (Apple tự bo góc).
 * Hình vẽ chiếm x 8..48 của lưới 64 (tâm 28), nên dời sang phải 4 đơn vị lưới để nằm giữa ô.
 */
const tile = (size, radius, markSize, glyph) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">` +
  `<rect width="${size}" height="${size}" rx="${radius}" fill="${BLUE}"/>` +
  `<g transform="translate(${+((size - markSize) / 2 + (4 * markSize) / 64).toFixed(3)} ${+((size - markSize) / 2).toFixed(3)}) scale(${markSize / 64})">${glyph}</g></svg>\n`

const svgFiles = {
  // Favicon hiện ở 16 tới 32 px: ô 48 bo 12, logo 34.
  'app/icon.svg': tile(48, 12, 34, markWhite),
  // Bản màu: thanh navy dùng currentColor, màu đặt ở thẻ gốc, đổi được bằng CSS khi nhúng inline.
  'public/brand/eduflow-mark.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" style="color:${NAVY}" role="img" aria-label="EduFlow">${mark('currentColor', BLUE)}</svg>\n`,
  'public/brand/eduflow-mark-white.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="EduFlow">${markWhite}</svg>\n`,
}
for (const [path, svg] of Object.entries(svgFiles)) await writeFile(path, svg)

// PNG theo icon app 180 px (logo 120), co giãn theo cạnh.
await sharp(Buffer.from(tile(180, 0, 120, markWhite))).png().toFile('app/apple-icon.png')
await sharp(Buffer.from(tile(192, (40 / 180) * 192, (120 / 180) * 192, markWhite))).png().toFile('app/icon.png')
console.log('Đã ghi', [...Object.keys(svgFiles), 'app/apple-icon.png', 'app/icon.png'].join(', '))
