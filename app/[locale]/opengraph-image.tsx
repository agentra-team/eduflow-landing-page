import { getTranslations } from 'next-intl/server'
import { routing, type Locale } from '@/i18n/routing'
import { OG_SIZE, ogImage } from '@/lib/seo/og'

export const alt = 'EduFlow'
export const size = OG_SIZE
export const contentType = 'image/png'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale: locale as Locale, namespace: 'home.hero' })
  return ogImage({ title: t('h1'), subtitle: t('sub').split('. ')[0] })
}
