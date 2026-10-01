import { createElement, type ComponentType, type ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, test, vi } from 'vitest'
import { DownloadLink } from '@/components/download/DownloadLink'
import { Button, ButtonAnchor, buttonClasses } from '@/components/ui/Button'

// Như release-date-render.test.ts: Button kéo i18n/navigation, nên cần Link giả để nạp ngoài Next.
vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children, ...rest }: { href: unknown; children?: ReactNode; [prop: string]: unknown }) =>
    createElement('a', { href: typeof href === 'string' ? href : JSON.stringify(href), ...rest }, children),
}))

const svgOf = (html: string) => /<svg[^>]*>/.exec(html)?.[0] ?? ''

// Các nút khai báo `children` bắt buộc, nên createElement đòi nó nằm trong props; luật react/no-children-prop lại đòi nó là đối số riêng.
// Hàm này nhận children như đối số riêng và vẫn kiểm kiểu các props còn lại.
const h = <P,>(type: ComponentType<P>, props: Omit<P, 'children'>, ...children: ReactNode[]) =>
  createElement(type as ComponentType<Omit<P, 'children'>>, props, ...children)

describe('Button focus ring', () => {
  test('is white on the dark CTA band, where the accent green is about 2.7:1 and below the 3:1 non-text level', () => {
    for (const variant of ['white', 'ghost-white'] as const) {
      const classes = buttonClasses(variant)
      expect(classes, variant).toContain('focus-visible:outline-white')
      expect(classes, variant).not.toContain('focus-visible:outline-accent')
    }
  })

  test('stays the accent green on the light variants', () => {
    for (const variant of ['primary', 'secondary'] as const) {
      const classes = buttonClasses(variant)
      expect(classes, variant).toContain('focus-visible:outline-accent')
      expect(classes, variant).not.toContain('focus-visible:outline-white')
    }
  })

  test('is still drawn: a 2px outline with an offset on every variant', () => {
    for (const variant of ['primary', 'secondary', 'white', 'ghost-white'] as const) {
      expect(buttonClasses(variant), variant).toContain('focus-visible:outline-2')
      expect(buttonClasses(variant), variant).toContain('focus-visible:outline-offset-2')
    }
  })
})

describe('Button icon', () => {
  test('never shrinks, so a long nowrap label cannot squeeze it to 0 px on a narrow phone', () => {
    expect(svgOf(renderToStaticMarkup(h(Button, { icon: 'download' }, 'A long label')))).toContain('class="shrink-0"')
    expect(svgOf(renderToStaticMarkup(h(Button, { icon: 'arrow-right', iconAfter: true }, 'A long label')))).toContain('class="shrink-0"')
    expect(svgOf(renderToStaticMarkup(h(ButtonAnchor, { icon: 'mail', href: 'mailto:a@b.c' }, 'A long label')))).toContain('class="shrink-0"')
  })

  test('is absent when the button has none', () => {
    expect(renderToStaticMarkup(h(Button, {}, 'Label'))).not.toContain('<svg')
  })

  test('the download link, which draws its own icon, never lets it shrink either', () => {
    const asset = {
      platform: 'windows-x64' as const,
      version: '1.0.0',
      fileName: 'EduFlow Setup 1.0.0.exe',
      url: 'https://feed.example.test/desktop/EduFlow%20Setup%201.0.0.exe',
      sizeBytes: 1,
      sha512: 'abc',
      releaseDate: '',
    }
    expect(svgOf(renderToStaticMarkup(h(DownloadLink, { asset, location: 'guide' }, 'Download the Windows installer')))).toContain('class="shrink-0"')
  })
})
