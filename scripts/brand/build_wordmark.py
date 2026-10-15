"""Dựng public/brand/eduflow-wordmark*.svg: dấu hiệu + chữ "EduFlow" (Sora 700 "Edu", Sora 400 "Flow") đã chuyển thành path.

Chạy từ gốc repo: python3 scripts/brand/build_wordmark.py <đường dẫn Sora[wght].ttf> public/brand
Font: https://github.com/google/fonts/raw/main/ofl/sora/Sora%5Bwght%5D.ttf (OFL). Không commit font, chỉ commit SVG.
Hình học theo lockup thứ nhất của Lockups.dc.html: dấu hiệu 104, cách 20, chữ 72 px, letter-spacing -0.03em.
Sora không có chữ tiếng Việt có dấu thanh, nên site không nạp font này; chữ trong logo là path (spec §5.2, §5.3).
"""
import sys
from pathlib import Path

from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

MARK = 104
GAP = 20
SIZE = 72
TRACKING = -0.03  # em
OLIVE, ORANGE, WHITE = '#567F2E', '#F2A541', '#FFFFFF'

# Dấu hiệu trên lưới 120: thân một màu, tua (dây, nút, quả tua) một màu.
MARK_BODY = (
    '<polygon points="60,12 112,34 60,56 8,34"/>'
    '<polygon points="22,45 36,51 36,108 22,108"/>'
    '<rect x="22" y="72" width="52" height="13" rx="2"/>'
    '<rect x="22" y="95" width="70" height="13" rx="2"/>'
)
MARK_TASSEL = (
    '<path d="M60 34 L98 40 V64" fill="none" stroke="{c}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>'
    '<circle cx="60" cy="34" r="4.5" fill="{c}"/>'
    '<rect x="93" y="62" width="10" height="17" rx="3" fill="{c}"/>'
)


def instance(path: str, weight: int) -> TTFont:
    return instantiateVariableFont(TTFont(path), {'wght': weight})


def run(font: TTFont, text: str, x0: float, scale: float):
    """Path SVG của một đoạn chữ, gốc toạ độ ở đường cơ sở (trục y của font hướng lên, của SVG hướng xuống)."""
    glyphs = font.getGlyphSet()
    cmap = font.getBestCmap()
    hmtx = font['hmtx']
    track = TRACKING * font['head'].unitsPerEm
    parts, x, bounds = [], x0, None
    for ch in text:
        name = cmap[ord(ch)]
        transform = (scale, 0, 0, -scale, x, 0)
        pen = SVGPathPen(glyphs)
        glyphs[name].draw(TransformPen(pen, transform))
        parts.append(pen.getCommands())
        bp = BoundsPen(glyphs)
        glyphs[name].draw(TransformPen(bp, transform))
        if bp.bounds:
            b = bp.bounds
            bounds = b if bounds is None else (min(bounds[0], b[0]), min(bounds[1], b[1]), max(bounds[2], b[2]), max(bounds[3], b[3]))
        x += (hmtx[name][0] + track) * scale
    return ' '.join(parts), x, bounds


def main(font_path: str, out_dir: str) -> None:
    bold, regular = instance(font_path, 700), instance(font_path, 400)
    scale = SIZE / bold['head'].unitsPerEm
    edu, x1, b1 = run(bold, 'Edu', MARK + GAP, scale)
    flow, _, b2 = run(regular, 'Flow', x1, scale)
    top, bottom = min(b1[1], b2[1]), max(b1[3], b2[3])
    # Căn giữa khối chữ (đỉnh chữ cao nhất tới đáy chữ thấp nhất) theo tâm dấu hiệu.
    dy = MARK / 2 - (top + bottom) / 2
    width = round(max(b1[2], b2[2]) + 2)
    variants = (('eduflow-wordmark.svg', OLIVE, OLIVE), ('eduflow-wordmark-white.svg', WHITE, WHITE))
    for name, body, text in variants:
        svg = (
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {MARK}" role="img" aria-label="EduFlow">'
            f'<g transform="scale({MARK / 120:.4f})"><g fill="{body}">{MARK_BODY}</g>{MARK_TASSEL.format(c=ORANGE)}</g>'
            f'<g fill="{text}" transform="translate(0 {dy:.2f})"><path d="{edu}"/><path d="{flow}"/></g>'
            '</svg>\n'
        )
        Path(out_dir, name).write_text(svg, encoding='utf-8')
        print(f'{name}: viewBox 0 0 {width} {MARK}')


if __name__ == '__main__':
    if len(sys.argv) != 3:
        sys.exit('Cách dùng: python3 scripts/brand/build_wordmark.py <Sora[wght].ttf> <thư mục ra>')
    main(sys.argv[1], sys.argv[2])
