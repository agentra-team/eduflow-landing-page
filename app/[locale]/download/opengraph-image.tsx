import { getTranslations } from 'next-intl/server'
import { routing, type Locale } from '@/i18n/routing'
import { getReleases, latestRelease } from '@/lib/releases'
import { OG_SIZE, ogImage } from '@/lib/seo/og'

export const alt = 'Tải EduFlow'
export const size = OG_SIZE
export const contentType = 'image/png'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const [t, { assets }] = await Promise.all([getTranslations({ locale: locale as Locale, namespace: 'download' }), getReleases()])
  const latest = latestRelease(assets)
  return ogImage({ title: t('h1'), subtitle: t('meta.description'), badge: latest ? `v${latest.version}` : undefined })
}
