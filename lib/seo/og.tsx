import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'
import { LogoMark } from '@/components/ui/Logo'
import { topicCopy, type TopicId } from '@/content/topics'
import type { Locale } from '@/i18n/routing'
import { site } from '@/lib/site'

export const OG_SIZE = { width: 1200, height: 630 }

async function fonts() {
  const dir = join(process.cwd(), 'assets/fonts')
  const [semibold, regular] = await Promise.all([readFile(join(dir, 'PlusJakartaSans-SemiBold.ttf')), readFile(join(dir, 'PlusJakartaSans-Regular.ttf'))])
  return [
    { name: 'PlusJakartaSans', data: semibold, weight: 600 as const, style: 'normal' as const },
    { name: 'PlusJakartaSans', data: regular, weight: 400 as const, style: 'normal' as const },
  ]
}

/** Ảnh Open Graph 1200×630: nền navy tới xanh lá Agentra, logo, tiêu đề và dòng phụ (spec §9.1, blue retheme §4.5). */
export async function ogImage({ title, subtitle, badge }: { title: string; subtitle: string; badge?: string }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          background: 'linear-gradient(135deg, #141736 0%, #6A9C39 100%)',
          color: '#ffffff',
          fontFamily: 'PlusJakartaSans',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <LogoMark size={56} tone="white" />
          <span style={{ fontSize: 34, fontWeight: 600, letterSpacing: -0.5 }}>EduFlow</span>
          {badge ? (
            <span
              style={{
                marginLeft: 16,
                padding: '6px 16px',
                borderRadius: 999,
                background: 'rgba(1,215,223,0.18)',
                border: '1px solid rgba(1,215,223,0.6)',
                color: '#FFFFFF',
                fontSize: 24,
                fontWeight: 600,
              }}
            >
              {badge}
            </span>
          ) : null}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div style={{ fontSize: title.length > 80 ? 56 : 66, fontWeight: 600, lineHeight: 1.12, letterSpacing: -1, maxWidth: 1000 }}>{title}</div>
          <div style={{ fontSize: 30, fontWeight: 400, lineHeight: 1.4, color: 'rgba(255,255,255,0.8)', maxWidth: 1056 }}>{subtitle}</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 24, color: 'rgba(255,255,255,0.65)' }}>
          <span>{new URL(site.siteUrl()).host}</span>
          <span>macOS · Windows</span>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: await fonts() },
  )
}

/** Ảnh chia sẻ riêng của trang chủ đề (spec §7.2). */
export function topicOgImage(locale: Locale, id: TopicId) {
  const { share } = topicCopy(locale, id)
  return ogImage({ title: share.title, subtitle: share.subtitle })
}
