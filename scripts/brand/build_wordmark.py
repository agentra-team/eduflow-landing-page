"""Dựng public/brand/eduflow-wordmark*.svg: chữ A Agentra (PO 2026-10-22) + chữ "EduFlow" (Plus Jakarta Sans 600) đã chuyển thành path.

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
NAVY, LIGHT, GREEN, WHITE = '#141736', '#8CBF3C', '#6A9C39', '#FFFFFF'
VIEWBOX = 428  # chữ A vẽ trên viewBox "36 36 428 428"


def mark(left: str, right: str, right_opacity: str = '') -> str:
    """Chữ A Agentra: nét trái xanh lá sáng, nét phải xanh lá."""
    return (
        f'<polygon points="255,72 313,174 153,428 41,428" fill="{left}"/>'
        f'<polygon points="331,206 458,428 344,428 282,327 251,327" fill="{right}"{right_opacity}/>'
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
        ('eduflow-wordmark.svg', mark(LIGHT, GREEN), NAVY),
        ('eduflow-wordmark-white.svg', mark(WHITE, WHITE, ' fill-opacity="0.75"'), WHITE),
    )
    for name, glyph, text in variants:
        svg = (
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {MARK}" role="img" aria-label="EduFlow">'
            f'<g transform="scale({MARK / VIEWBOX:.4f}) translate(-36 -36)">{glyph}</g>'
            f'<g fill="{text}" transform="translate(0 {dy:.2f})"><path d="{word}"/></g>'
            '</svg>\n'
        )
        Path(out_dir, name).write_text(svg, encoding='utf-8')
        print(f'{name}: viewBox 0 0 {width} {MARK}')


if __name__ == '__main__':
    if len(sys.argv) != 3:
        sys.exit('Cách dùng: python3 scripts/brand/build_wordmark.py <PlusJakartaSans[wght].ttf> <thư mục ra>')
    main(sys.argv[1], sys.argv[2])
