import { routing, type Locale } from '@/i18n/routing'
import { OG_SIZE, topicOgImage } from '@/lib/seo/og'

export const alt = 'EduFlow'
export const size = OG_SIZE
export const contentType = 'image/png'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return topicOgImage(locale as Locale, 'course-syllabus')
}
