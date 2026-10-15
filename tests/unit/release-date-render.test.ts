import { createElement, type ComponentProps, type ComponentType, type ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createTranslator, NextIntlClientProvider } from 'next-intl'
import { describe, expect, test, vi } from 'vitest'
import { PlatformCard } from '@/components/download/PlatformCard'
import { DownloadBlock } from '@/components/home/DownloadBlock'
import type { Locale } from '@/i18n/routing'
import { releaseLead } from '@/lib/format'
import enMessages from '@/messages/en.json'
import viMessages from '@/messages/vi.json'

// i18n/navigation kéo theo next-intl/navigation, mà bản ESM của nó import `next/navigation` không đuôi nên Node không nạp được ngoài Next.
// Link giả là đủ: bài test này chỉ đọc chữ của khối tải và thẻ nền tảng.
vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children, ...rest }: { href: unknown; children?: ReactNode; [prop: string]: unknown }) =>
    createElement('a', { href: typeof href === 'string' ? href : JSON.stringify(href), ...rest }, children),
}))

const MESSAGES = { vi: viMessages, en: enMessages }
const DATED = '2026-09-15T15:22:00.690Z'
const asset = (releaseDate: string) => ({
  platform: 'windows-x64' as const,
  version: '1.0.0',
  fileName: 'EduFlow Setup 1.0.0.exe',
  url: 'https://feed.example.test/desktop/EduFlow%20Setup%201.0.0.exe',
  sizeBytes: 157058273,
  sha512: 'abc',
  releaseDate,
})
// NextIntlClientProvider khai báo `children` bắt buộc; luật react/no-children-prop đòi children là đối số riêng của createElement.
const Provider = NextIntlClientProvider as ComponentType<Omit<ComponentProps<typeof NextIntlClientProvider>, 'children'>>
const render = (locale: Locale, node: ReactNode) =>
  renderToStaticMarkup(createElement(Provider, { locale, messages: MESSAGES[locale], timeZone: 'Asia/Ho_Chi_Minh' }, node))

describe('a release without a valid date', () => {
  test('the platform card ends its details line after the version, with no dangling separator', () => {
    const card = (locale: Locale, releaseDate: string) =>
      render(locale, createElement(PlatformCard, { asset: asset(releaseDate), locale, location: 'download_page' }))
    expect(card('vi', DATED)).toContain('150 MB · v1.0.0 · 15/09/2026</span>')
    expect(card('en', DATED)).toContain('150 MB · v1.0.0 · 15 Sep 2026</span>')
    expect(card('vi', '')).toContain('150 MB · v1.0.0</span>')
    expect(card('en', '')).toContain('150 MB · v1.0.0</span>')
  })

  test('the home download lead states the version only, without "phát hành ." or "released ."', () => {
    const lead = (locale: Locale, releaseDate: string) =>
      render(locale, createElement(DownloadBlock, { assets: [asset(releaseDate)], locale, latest: { version: '1.0.0', releaseDate } }))
    expect(lead('vi', DATED)).toContain('>Phiên bản 1.0.0, phát hành 15/09/2026.</p>')
    expect(lead('en', DATED)).toContain('>Version 1.0.0, released 15 Sep 2026.</p>')
    expect(lead('vi', '')).toContain('>Phiên bản 1.0.0.</p>')
    expect(lead('en', '')).toContain('>Version 1.0.0.</p>')
  })

  test('the Download page lead states the version and drops only the date', () => {
    const lead = (locale: Locale, releaseDate: string) => {
      const t = createTranslator({ locale, messages: MESSAGES[locale], namespace: 'download', timeZone: 'Asia/Ho_Chi_Minh' })
      const parts = releaseLead({ version: '1.0.0', releaseDate }, locale)
      return parts ? t(parts.key, parts.values) : undefined
    }
    expect(lead('vi', DATED)).toBe('Phiên bản 1.0.0, phát hành 15/09/2026.')
    expect(lead('en', DATED)).toBe('Version 1.0.0, released 15 Sep 2026.')
    expect(lead('vi', '')).toBe('Phiên bản 1.0.0.')
    expect(lead('en', '')).toBe('Version 1.0.0.')
  })
})
