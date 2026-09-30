import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import { SectionHead } from '@/components/home/SectionHead'
import { JsonLd } from '@/components/seo/JsonLd'
import { Container } from '@/components/ui/Container'
import { PRIVACY } from '@/content/privacy'
import type { Locale } from '@/i18n/routing'
import { formatDate } from '@/lib/format'
import { breadcrumb } from '@/lib/seo/jsonld'
import { buildMetadata } from '@/lib/seo/metadata'
import { absoluteUrl } from '@/lib/seo/urls'

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as Locale
  const { meta } = await PRIVACY[locale]()
  return buildMetadata({ locale, page: '/privacy', title: meta.title, description: meta.description ?? meta.title })
}

export default async function PrivacyPage() {
  const locale = (await getLocale()) as Locale
  const [{ default: Policy, meta }, tc, tf] = await Promise.all([PRIVACY[locale](), getTranslations('common'), getTranslations('install')])
  return (
    <main id="main" className="flex-1">
      <section className="bg-[radial-gradient(900px_300px_at_20%_-80px,#E8F3E7_0%,rgba(232,243,231,0)_70%)] pt-12 pb-8 md:pt-16 md:pb-10">
        <Container className="flex flex-col gap-3">
          <SectionHead as="h1" align="left" eyebrow={tc('privacyPolicy')} title={meta.title} lead={meta.description} />
          {meta.updated ? <p className="text-sm text-muted">{tf('updated', { date: formatDate(meta.updated, locale) })}</p> : null}
        </Container>
      </section>
      <section className="pb-16 md:pb-24">
        <Container>
          <article className="flex max-w-[780px] flex-col gap-5">
            <Policy />
          </article>
        </Container>
      </section>
      <JsonLd data={breadcrumb([{ name: tc('siteName'), url: absoluteUrl(locale, '/') }, { name: meta.title, url: absoluteUrl(locale, '/privacy') }])} />
    </main>
  )
}
