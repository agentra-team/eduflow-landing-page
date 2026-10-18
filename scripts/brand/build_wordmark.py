"""Dựng public/brand/eduflow-wordmark*.svg: logo C "Chữ E chấm" + chữ "EduFlow" (Plus Jakarta Sans 600) đã chuyển thành path.

Chạy từ gốc repo: python3 scripts/brand/build_wordmark.py <đường dẫn PlusJakartaSans[wght].ttf> public/brand
Font: https://github.com/google/fonts/raw/main/ofl/plusjakartasans/PlusJakartaSans%5Bwght%5D.ttf (OFL). Không commit font
biến thiên, chỉ commit SVG. Hình học theo phần đầu trang của bảng LandingHero (spec blue retheme §4.4, §4.5): logo 32,
cách 10, chữ 21 px đậm 600, letter-spacing -0.02em; ở đây phóng theo chiều cao 104.
Chữ là path để tệp SVG hiện đúng ở mọi nơi, kể cả khi trang chưa nạp font.
"""
import sys
from pathlib import Path

from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

MARK = 104
GAP = 32
SIZE = 68
TRACKING = -0.02  # em
WEIGHT = 600
NAVY, BLUE, TEAL, CORAL, WHITE = '#141736', '#0177FB', '#01D7DF', '#FE6470', '#FFFFFF'


def mark(bar: str, top: str, top_opacity: str = '') -> str:
    """Logo C trên lưới 64: thanh dọc bo tròn và ba chấm xếp dọc (bảng Main)."""
    return (
        f'<rect x="8" y="5" width="15" height="54" rx="7.5" fill="{bar}"/>'
        f'<circle cx="40" cy="13" r="8" fill="{top}"{top_opacity}/>'
        f'<circle cx="35" cy="32" r="8" fill="{TEAL}"/>'
        f'<circle cx="40" cy="51" r="8" fill="{CORAL}"/>'
    )


def num(v: float) -> str:
    return f'{v:.2f}'.rstrip('0').rstrip('.')


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
        pen = SVGPathPen(glyphs, ntos=num)
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
    font = instantiateVariableFont(TTFont(font_path), {'wght': WEIGHT})
    scale = SIZE / font['head'].unitsPerEm
    word, _, b = run(font, 'EduFlow', MARK + GAP, scale)
    # Căn giữa khối chữ (đỉnh chữ cao nhất tới đáy chữ thấp nhất) theo tâm logo.
    dy = MARK / 2 - (b[1] + b[3]) / 2
    width = round(b[2] + 2)
    variants = (
        ('eduflow-wordmark.svg', mark(NAVY, BLUE), NAVY),
        ('eduflow-wordmark-white.svg', mark(WHITE, WHITE, ' fill-opacity="0.75"'), WHITE),
    )
    for name, glyph, text in variants:
        svg = (
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {MARK}" role="img" aria-label="EduFlow">'
            f'<g transform="scale({MARK / 64:.4f})">{glyph}</g>'
            f'<g fill="{text}" transform="translate(0 {dy:.2f})"><path d="{word}"/></g>'
            '</svg>\n'
        )
        Path(out_dir, name).write_text(svg, encoding='utf-8')
        print(f'{name}: viewBox 0 0 {width} {MARK}')


if __name__ == '__main__':
    if len(sys.argv) != 3:
        sys.exit('Cách dùng: python3 scripts/brand/build_wordmark.py <PlusJakartaSans[wght].ttf> <thư mục ra>')
    main(sys.argv[1], sys.argv[2])
