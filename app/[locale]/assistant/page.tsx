import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import { SectionHead } from '@/components/home/SectionHead'
import { JsonLd } from '@/components/seo/JsonLd'
import { ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { CtaBand } from '@/components/ui/CtaBand'
import { Icon } from '@/components/ui/Icon'
import type { IconName } from '@/components/ui/icons'
import { Section } from '@/components/ui/Section'
import { WindowFrame } from '@/components/ui/WindowFrame'
import type { Locale } from '@/i18n/routing'
import { breadcrumb } from '@/lib/seo/jsonld'
import { buildMetadata } from '@/lib/seo/metadata'
import { absoluteUrl } from '@/lib/seo/urls'

const WHERE: Array<{ key: 'w1' | 'w2' | 'w3'; icon: IconName }> = [
  { key: 'w1', icon: 'message' },
  { key: 'w2', icon: 'monitor' },
  { key: 'w3', icon: 'external' },
]
const HOW: Array<{ key: 'c1' | 'c2' | 'c3' | 'c4'; icon: IconName }> = [
  { key: 'c1', icon: 'eye' },
  { key: 'c2', icon: 'layers' },
  { key: 'c3', icon: 'check' },
  { key: 'c4', icon: 'pen' },
]
const NEVER = ['n1', 'n2', 'n3', 'n4', 'n5'] as const
const STATES: Array<{ key: 's1' | 's2' | 's3' | 's4'; icon: IconName }> = [
  { key: 's1', icon: 'wifi-off' },
  { key: 's2', icon: 'lock' },
  { key: 's3', icon: 'key' },
  { key: 's4', icon: 'wallet' },
]

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as Locale
  const t = await getTranslations('assistant.meta')
  return buildMetadata({ locale, page: '/assistant', title: t('title'), description: t('description') })
}

export default async function AssistantPage() {
  const locale = (await getLocale()) as Locale
  const [t, tc] = await Promise.all([getTranslations('assistant'), getTranslations('common')])
  return (
    <main id="main" className="flex-1">
      <section className="overflow-hidden bg-[radial-gradient(1000px_420px_at_50%_-60px,#E8F3E7_0%,rgba(232,243,231,0)_70%)] pt-12 md:pt-16">
        <Container className="flex flex-col items-center gap-5 text-center">
          <SectionHead as="h1" eyebrow={t('hero.eyebrow')} title={t('hero.h1')} lead={t('hero.lead')} />
          <ButtonLink href="/download" size="lg" icon="download">{tc('download')}</ButtonLink>
        </Container>
        <div className="mx-auto mt-10 w-[calc(100%-32px)] max-w-[1080px]">
          <WindowFrame src="/images/product/assistant-home.webp" width={2000} height={1250} alt={t('hero.imageAlt')} title={t('hero.windowTitle')} priority sizes="(min-width: 1120px) 1078px, 100vw" className="rounded-b-none border-b-0" />
        </div>
      </section>

      <Section className="border-t border-line bg-card">
        <Container>
          <SectionHead eyebrow={t('where.eyebrow')} title={t('where.h2')} />
          <div className="mt-8 grid gap-4 md:mt-12 md:grid-cols-3 md:gap-6">
            {WHERE.map(({ key, icon }) => (
              <div key={key} className="flex flex-col gap-3 rounded-card border border-line bg-page p-6">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] bg-accent-soft text-accent-strong"><Icon name={icon} size={20} /></span>
                <h3 className="text-[17px] font-semibold">{t(`where.${key}.title`)}</h3>
                <p className="text-[15px] leading-relaxed text-ink2">{t(`where.${key}.desc`)}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-14">
          <div className="flex flex-col gap-6">
            <SectionHead align="left" eyebrow={t('how.eyebrow')} title={t('how.h2')} />
            <ul className="flex flex-col gap-4">
              {HOW.map(({ key, icon }) => (
                <li key={key} className="flex gap-3.5">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-accent-soft text-accent-strong"><Icon name={icon} size={20} /></span>
                  <div className="flex flex-col gap-1">
                    <b className="text-base">{t(`how.${key}.title`)}</b>
                    <span className="text-[15px] leading-relaxed text-ink2">{t(`how.${key}.desc`)}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <WindowFrame src="/images/product/result.webp" alt={t('how.imageAlt')} title={t('how.windowTitle')} sizes="(min-width: 1024px) 620px, 100vw" />
        </Container>
      </Section>

      <Section className="border-y border-line bg-card">
        <Container className="grid gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-4 rounded-card border border-line bg-page p-6 lg:col-span-1">
            <span className="text-[13px] font-bold tracking-[0.6px] text-accent-strong uppercase">{t('never.eyebrow')}</span>
            <h2 className="font-display text-[24px] font-bold">{t('never.h2')}</h2>
            <p className="text-[15px] text-ink2">{t('never.lead')}</p>
            <ul className="flex flex-col gap-2">
              {NEVER.map((n) => (
                <li key={n} className="flex items-center gap-2 text-[15px] text-ink">
                  <Icon name="close" size={16} className="shrink-0 text-crit" />
                  {t(`never.${n}`)}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-3 rounded-card border border-line bg-page p-6">
            <Icon name="wallet" size={22} className="text-accent-strong" />
            <h3 className="text-[18px] font-semibold">{t('cost.title')}</h3>
            <p className="text-[15px] leading-relaxed text-ink2">{t('cost.body')}</p>
          </div>
          <div className="flex flex-col gap-3 rounded-card border border-line bg-page p-6">
            <Icon name="lock" size={22} className="text-accent-strong" />
            <h3 className="text-[18px] font-semibold">{t('privacy.title')}</h3>
            <p className="text-[15px] leading-relaxed text-ink2">{t('privacy.body')}</p>
          </div>
        </Container>
      </Section>

      <Section>
        <Container className="flex flex-col gap-8">
          <SectionHead eyebrow={t('states.eyebrow')} title={t('states.h2')} lead={t('states.lead')} />
          <div className="grid gap-4 md:grid-cols-4">
            {STATES.map(({ key, icon }) => (
              <div key={key} className="flex flex-col gap-2 rounded-card border border-line bg-card p-5">
                <Icon name={icon} size={20} className="text-warn-text" />
                <h3 className="text-base font-semibold">{t(`states.${key}.title`)}</h3>
                <p className="text-[14.5px] leading-relaxed text-ink2">{t(`states.${key}.desc`)}</p>
              </div>
            ))}
          </div>
          <WindowFrame src="/images/product/assistant-states.webp" alt={t('states.imageAlt')} title={t('states.windowTitle')} sizes="(min-width: 1120px) 1078px, 100vw" />
          <p className="text-[13.5px] text-muted">{tc('sampleData')}</p>
        </Container>
      </Section>

      <CtaBand title={t('cta.h2')} sub={t('cta.sub')} primary={{ href: '/download', label: tc('download') }} secondary={{ href: '/contact', label: tc('contactSales') }} />
      <JsonLd data={breadcrumb([{ name: tc('siteName'), url: absoluteUrl(locale, '/') }, { name: t('hero.eyebrow'), url: absoluteUrl(locale, '/assistant') }])} />
    </main>
  )
}
