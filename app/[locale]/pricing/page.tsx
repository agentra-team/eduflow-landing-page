import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import { SectionHead } from '@/components/home/SectionHead'
import { JsonLd } from '@/components/seo/JsonLd'
import { ButtonAnchor, ButtonLink } from '@/components/ui/Button'
import { Callout } from '@/components/ui/Callout'
import { Container } from '@/components/ui/Container'
import { CtaBand } from '@/components/ui/CtaBand'
import { Icon } from '@/components/ui/Icon'
import { Section } from '@/components/ui/Section'
import { WindowFrame } from '@/components/ui/WindowFrame'
import type { Locale } from '@/i18n/routing'
import { contactSalesHref } from '@/lib/contact'
import { breadcrumb } from '@/lib/seo/jsonld'
import { buildMetadata } from '@/lib/seo/metadata'
import { staticSeo } from '@/lib/seo/pages'
import { absoluteUrl } from '@/lib/seo/urls'

const STEPS = ['s1', 's2', 's3', 's4', 's5', 's6', 's7'] as const
const FREE = ['i1', 'i2', 'i3', 'i4', 'i5', 'i6', 'i7', 'i8'] as const
const BUDGET = [
  { key: 'normal', dot: 'bg-good' },
  { key: 'near', dot: 'bg-warn-dot' },
  { key: 'over', dot: 'bg-crit' },
] as const

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as Locale
  return buildMetadata({ locale, page: '/pricing', seo: staticSeo(locale, '/pricing') })
}

export default async function PricingPage() {
  const locale = (await getLocale()) as Locale
  const [t, tc] = await Promise.all([getTranslations('pricing'), getTranslations('common')])
  const sales = contactSalesHref(locale)
  return (
    <main id="main" className="flex-1">
      <section className="bg-[radial-gradient(900px_300px_at_20%_-80px,var(--color-accent-soft)_0%,transparent_70%)] pt-12 pb-10 md:pt-16 md:pb-14">
        <Container className="flex flex-col gap-5">
          <SectionHead as="h1" align="left" eyebrow={t('hero.eyebrow')} title={t('hero.h1')} lead={t('hero.lead')} />
          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonAnchor href={sales} size="lg" icon="mail">{t('cta.sales')}</ButtonAnchor>
            <ButtonLink href="/download" variant="secondary" size="lg" icon="download">{t('cta.download')}</ButtonLink>
          </div>
        </Container>
      </section>

      <Section className="pt-4 md:pt-8">
        <Container>
          <SectionHead align="left" eyebrow={t('steps.eyebrow')} title={t('steps.h2')} />
          <ol className="mt-8 grid gap-4 md:mt-10 md:grid-cols-2">
            {STEPS.map((s, i) => (
              <li key={s} className="flex gap-4 rounded-card border border-line bg-card p-5">
                <span className="font-mono text-[15px] font-semibold text-accent">{String(i + 1).padStart(2, '0')}</span>
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-[17px] font-semibold">{t(`steps.${s}.title`)}</h3>
                  <p className="text-[15px] leading-relaxed text-ink2">{t(`steps.${s}.body`)}</p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      <Section className="border-y border-line bg-card">
        <Container className="flex flex-col gap-4">
          <h2 className="font-display text-[26px] font-semibold">{t('formula.title')}</h2>
          <p className="rounded-control border border-line bg-page px-5 py-4 font-mono text-[15px] text-ink md:text-[17px]">{t('formula.expr')}</p>
          <p className="max-w-[820px] text-[15px] leading-relaxed text-ink2">{t('formula.note')}</p>
        </Container>
      </Section>

      <Section>
        <Container>
          <SectionHead align="left" eyebrow={t('budget.eyebrow')} title={t('budget.h2')} />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {BUDGET.map(({ key, dot }) => (
              <div key={key} className="flex flex-col gap-2 rounded-card border border-line bg-card p-5">
                <span className="inline-flex items-center gap-2 text-[16px] font-semibold">
                  <span className={`h-2.5 w-2.5 rounded-full ${dot}`} aria-hidden="true" />
                  {t(`budget.${key}.title`)}
                </span>
                <p className="text-[15px] leading-relaxed text-ink2">{t(`budget.${key}.desc`)}</p>
              </div>
            ))}
          </div>
          <div className="mt-5">
            <Callout kind="info">{t('budget.essential')}</Callout>
          </div>
        </Container>
      </Section>

      <Section className="border-t border-line bg-card">
        <Container className="grid items-start gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="flex flex-col gap-5">
            <SectionHead align="left" eyebrow={t('free.eyebrow')} title={t('free.h2')} />
            <ul className="grid gap-2.5 sm:grid-cols-2">
              {FREE.map((i) => (
                <li key={i} className="flex items-start gap-2 text-[15px] text-ink2">
                  <Icon name="check" size={18} className="mt-0.5 shrink-0 text-accent" />
                  {t(`free.${i}`)}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-2">
            <WindowFrame src="/images/product/usage.webp" alt={t('imageAlt')} title={t('windowTitle')} sizes="(min-width: 1024px) 620px, 100vw" />
            <p className="text-[13.5px] text-muted">{tc('sampleData')}</p>
          </div>
        </Container>
      </Section>

      <CtaBand title={t('cta.h2')} sub={t('cta.sub')} primary={{ externalHref: sales, label: t('cta.sales'), icon: 'mail' }} secondary={{ href: '/download', label: t('cta.download') }} />
      <JsonLd data={breadcrumb([{ name: tc('siteName'), url: absoluteUrl(locale, '/') }, { name: t('hero.eyebrow'), url: absoluteUrl(locale, '/pricing') }])} />
    </main>
  )
}
