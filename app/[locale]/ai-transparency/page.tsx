import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import { SectionHead } from '@/components/home/SectionHead'
import { JsonLd } from '@/components/seo/JsonLd'
import { ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import type { Locale } from '@/i18n/routing'
import { formatDate } from '@/lib/format'
import { breadcrumb } from '@/lib/seo/jsonld'
import { buildMetadata } from '@/lib/seo/metadata'
import { staticSeo } from '@/lib/seo/pages'
import { absoluteUrl } from '@/lib/seo/urls'

const UPDATED = '2026-09-30'
const ITEMS = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8'] as const

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as Locale
  return buildMetadata({ locale, page: '/ai-transparency', seo: staticSeo(locale, '/ai-transparency') })
}

export default async function TransparencyPage() {
  const locale = (await getLocale()) as Locale
  const [t, tc, tn] = await Promise.all([getTranslations('transparency'), getTranslations('common'), getTranslations('nav')])
  return (
    <main id="main" className="flex-1">
      <section className="bg-[radial-gradient(900px_300px_at_20%_-80px,#E8F3E7_0%,rgba(232,243,231,0)_70%)] pt-12 pb-8 md:pt-16 md:pb-10">
        <Container className="flex flex-col gap-4">
          <SectionHead as="h1" align="left" eyebrow={t('eyebrow')} title={t('h1')} lead={t('lead')} />
          <p className="text-sm text-muted">{t('updated', { date: formatDate(UPDATED, locale) })}</p>
        </Container>
      </section>
      <section className="pb-16 md:pb-24">
        <Container>
          <ol className="flex max-w-[820px] flex-col divide-y divide-line border-y border-line">
            {ITEMS.map((key, i) => (
              <li key={key} className="flex gap-4 py-6 md:gap-6 md:py-7">
                <span className="w-8 shrink-0 pt-0.5 text-[15px] font-bold text-accent-strong tabular-nums md:w-10">{String(i + 1).padStart(2, '0')}</span>
                <div className="flex flex-col gap-2">
                  <h2 className="text-xl leading-snug font-semibold">{t(`${key}.title`)}</h2>
                  <p className="text-base leading-relaxed text-ink2">{t(`${key}.body`)}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/contact" icon="mail">{tn('contact')}</ButtonLink>
            <ButtonLink href="/privacy" variant="secondary" icon="arrow-right" iconAfter>{tc('privacyPolicy')}</ButtonLink>
          </div>
        </Container>
      </section>
      <JsonLd data={breadcrumb([{ name: tc('siteName'), url: absoluteUrl(locale, '/') }, { name: t('h1'), url: absoluteUrl(locale, '/ai-transparency') }])} />
    </main>
  )
}
