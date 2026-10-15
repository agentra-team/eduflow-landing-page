import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import { AssistantShowcase } from '@/components/home/AssistantShowcase'
import { CostTeaser } from '@/components/home/CostTeaser'
import { DownloadBlock } from '@/components/home/DownloadBlock'
import { FAQ_KEYS, FaqSection } from '@/components/home/FaqSection'
import { FinalCta } from '@/components/home/FinalCta'
import { Hero } from '@/components/home/Hero'
import { LevelCards } from '@/components/home/LevelCards'
import { PipelineStrip } from '@/components/home/PipelineStrip'
import { TrustGrid } from '@/components/home/TrustGrid'
import { JsonLd } from '@/components/seo/JsonLd'
import type { Locale } from '@/i18n/routing'
import { getReleases, latestRelease } from '@/lib/releases'
import { faqPage, softwareApplication, webPage } from '@/lib/seo/jsonld'
import { buildMetadata } from '@/lib/seo/metadata'
import { finalTitle, staticSeo } from '@/lib/seo/pages'
import { absoluteUrl } from '@/lib/seo/urls'

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as Locale
  return buildMetadata({ locale, page: '/', seo: staticSeo(locale, '/') })
}

export default async function HomePage() {
  const locale = (await getLocale()) as Locale
  const [{ assets }, t] = await Promise.all([getReleases(), getTranslations('home.faq')])
  const latest = latestRelease(assets)
  const seo = staticSeo(locale, '/')
  return (
    <main id="main" className="flex-1">
      <Hero assets={assets} />
      <LevelCards />
      <AssistantShowcase />
      <PipelineStrip />
      <TrustGrid />
      <CostTeaser />
      <DownloadBlock assets={assets} locale={locale} latest={latest} />
      <FaqSection />
      <FinalCta />
      <JsonLd data={webPage({ url: absoluteUrl(locale, '/'), name: finalTitle(seo), description: seo.description, locale })} />
      <JsonLd data={softwareApplication(assets, locale)} />
      <JsonLd data={faqPage(FAQ_KEYS.map((k) => ({ q: t(`${k}.q`), a: t(`${k}.a`) })))} />
    </main>
  )
}
