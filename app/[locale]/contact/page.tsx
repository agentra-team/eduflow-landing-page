import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import { SectionHead } from '@/components/home/SectionHead'
import { JsonLd } from '@/components/seo/JsonLd'
import { CopyButton } from '@/components/site/CopyButton'
import { TrackedAnchor } from '@/components/site/TrackedAnchor'
import { buttonClasses } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import type { IconName } from '@/components/ui/icons'
import { Section } from '@/components/ui/Section'
import type { Locale } from '@/i18n/routing'
import { breadcrumb, organization } from '@/lib/seo/jsonld'
import { buildMetadata } from '@/lib/seo/metadata'
import { absoluteUrl } from '@/lib/seo/urls'
import { site } from '@/lib/site'

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as Locale
  const t = await getTranslations('contact.meta')
  return buildMetadata({ locale, page: '/contact', title: t('title'), description: t('description') })
}

const linkClass = 'inline-flex min-h-11 items-center gap-1.5 text-[14.5px] font-semibold text-accent-strong hover:text-accent md:min-h-0'

function ContactCard({ icon, label, value, sub, action }: { icon: IconName; label: string; value: React.ReactNode; sub: string; action: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3.5 rounded-xl border border-line bg-card p-6">
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-accent-strong">
        <Icon name={icon} size={22} />
      </span>
      <div className="flex flex-col gap-1.5">
        <span className="text-[13px] font-bold tracking-[0.5px] text-muted uppercase">{label}</span>
        <span className="text-xl leading-snug font-semibold break-words">{value}</span>
        <span className="text-[14.5px] leading-relaxed text-ink2">{sub}</span>
      </div>
      <div className="mt-auto">{action}</div>
    </div>
  )
}

export default async function ContactPage() {
  const locale = (await getLocale()) as Locale
  const [t, tc] = await Promise.all([getTranslations('contact'), getTranslations('common')])
  const address = `${site.address ? `${site.address}, ` : ''}${site.city[locale]}, ${site.country[locale]}`
  const STEPS: Array<{ key: 's1' | 's2' | 's3'; icon: IconName }> = [
    { key: 's1', icon: 'download' },
    { key: 's2', icon: 'key' },
    { key: 's3', icon: 'mail' },
  ]
  return (
    <main id="main" className="flex-1">
      <section className="bg-[radial-gradient(900px_300px_at_20%_-80px,#E8F3E7_0%,rgba(232,243,231,0)_70%)] pt-12 pb-10 md:pt-16 md:pb-12">
        <Container>
          <SectionHead as="h1" align="left" eyebrow={t('eyebrow')} title={t('h1')} lead={t('lead')} />
        </Container>
      </section>
      <section className="pb-16 md:pb-20">
        <Container className="grid gap-4 md:grid-cols-3 md:gap-6">
          <ContactCard
            icon="mail"
            label={t('email.label')}
            value={<TrackedAnchor channel="email" href={`mailto:${site.email}`} className="inline-flex min-h-11 items-center md:min-h-0">{site.email}</TrackedAnchor>}
            sub={t('email.sub')}
            action={<CopyButton value={site.email} label={t('email.copy')} doneLabel={t('email.copied')} />}
          />
          {site.phone ? (
            <ContactCard
              icon="phone"
              label={t('phone.label')}
              value={<TrackedAnchor channel="phone" href={`tel:${site.phone.replace(/\s+/g, '')}`} className="inline-flex min-h-11 items-center md:min-h-0">{site.phone}</TrackedAnchor>}
              sub={t('phone.sub')}
              action={site.zalo ? <TrackedAnchor channel="zalo" href={site.zalo} className={linkClass} rel="noopener"><Icon name="external" size={16} />{t('phone.zalo')}</TrackedAnchor> : null}
            />
          ) : null}
          <ContactCard
            icon="pin"
            label={t('address.label')}
            value={site.company}
            sub={address}
            action={<TrackedAnchor channel="maps" href={site.mapsUrl} className={linkClass} rel="noopener" target="_blank"><Icon name="external" size={16} />{t('address.maps')}</TrackedAnchor>}
          />
        </Container>
      </section>
      <Section id="nhan-key" className="scroll-mt-20 border-y border-line bg-card">
        <Container>
          <SectionHead align="left" eyebrow={t('key.eyebrow')} title={t('key.h2')} />
          <div className="mt-8 grid gap-4 md:mt-10 md:grid-cols-3 md:gap-6">
            {STEPS.map(({ key, icon }, i) => (
              <div key={key} className="flex flex-col gap-3.5 rounded-xl border border-line bg-card2 p-6">
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-accent-strong">
                    <Icon name={icon} size={22} />
                  </span>
                  <span className="text-[13px] font-bold text-muted">{t('key.step', { n: i + 1 })}</span>
                </div>
                <h3 className="text-lg leading-snug font-semibold">{t(`key.${key}.title`)}</h3>
                <p className="text-[15px] leading-relaxed text-ink2">{t(`key.${key}.desc`)}</p>
              </div>
            ))}
          </div>
          <p className="mt-5 text-[15px] text-ink2">{t('key.note')}</p>
        </Container>
      </Section>
      <Section>
        <Container className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
          <div className="flex flex-col gap-4">
            <SectionHead align="left" eyebrow={t('support.eyebrow')} title={t('support.h2')} />
            <p className="max-w-[520px] text-base leading-relaxed text-ink2">{t('support.lead')}</p>
            <ul className="flex flex-col gap-2.5">
              {(['i1', 'i2', 'i3', 'i4'] as const).map((key) => (
                <li key={key} className="flex items-start gap-2.5 text-[15.5px] leading-relaxed text-ink2">
                  <Icon name="check" size={18} strokeWidth={2} className="mt-1 shrink-0 text-accent" />
                  {t(`support.${key}`)}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-4 self-start rounded-xl border border-line bg-card p-6 md:p-7">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] bg-accent-soft text-accent-strong">
                <Icon name="bug" size={20} />
              </span>
              <b className="text-base">{t('support.boxTitle')}</b>
            </div>
            <p className="text-[15px] leading-relaxed text-ink2">{t('support.boxBody', { email: site.email })}</p>
            <TrackedAnchor
              channel="email"
              href={`mailto:${site.email}?subject=${encodeURIComponent(t('support.subject'))}`}
              className={buttonClasses('primary', 'md', true)}
            >
              <Icon name="mail" size={20} />
              <span>{t('support.btn')}</span>
            </TrackedAnchor>
          </div>
        </Container>
      </Section>
      <JsonLd data={organization()} />
      <JsonLd data={breadcrumb([{ name: tc('siteName'), url: absoluteUrl(locale, '/') }, { name: t('h1'), url: absoluteUrl(locale, '/contact') }])} />
    </main>
  )
}
