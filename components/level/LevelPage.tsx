import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import { Faq } from '@/components/home/Faq'
import { SectionHead } from '@/components/home/SectionHead'
import { JsonLd } from '@/components/seo/JsonLd'
import { ButtonLink } from '@/components/ui/Button'
import { Callout } from '@/components/ui/Callout'
import { Container } from '@/components/ui/Container'
import { CtaBand } from '@/components/ui/CtaBand'
import { Icon } from '@/components/ui/Icon'
import { Section } from '@/components/ui/Section'
import { WindowFrame } from '@/components/ui/WindowFrame'
import { DOCS, docHref } from '@/content/docs'
import { topicCopy, topicPage } from '@/content/topics'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { cn } from '@/lib/cn'
import { breadcrumb, faqPage, webPage } from '@/lib/seo/jsonld'
import { buildMetadata } from '@/lib/seo/metadata'
import { finalTitle, pageName, staticSeo } from '@/lib/seo/pages'
import { absoluteUrl } from '@/lib/seo/urls'
import { LEVELS, type LevelKey } from './levels'

const SCREENS = ['s1', 's2', 's3'] as const
const OUTCOMES = ['o1', 'o2', 'o3', 'o4', 'o5', 'o6'] as const

// Ba namespace levels.k12, levels.university, levels.program cùng một hình dạng (tests/unit/i18n.test.ts kiểm);
// ép kiểu về levels.k12 để next-intl kiểm khoá.
const ns = (level: LevelKey) => `levels.${level}` as 'levels.k12'

export async function levelMetadata(level: LevelKey): Promise<Metadata> {
  const locale = (await getLocale()) as Locale
  return buildMetadata({ locale, page: LEVELS[level].page, seo: staticSeo(locale, LEVELS[level].page) })
}

export async function LevelPage({ level }: { level: LevelKey }) {
  const locale = (await getLocale()) as Locale
  const [t, tc, tn, tl] = await Promise.all([getTranslations(ns(level)), getTranslations('common'), getTranslations('nav'), getTranslations('levelCommon')])
  const cfg = LEVELS[level]
  // Hỏi đáp hiện ra và JSON-LD FAQPage dựng từ cùng một danh sách.
  const faq = (['q1', 'q2', 'q3', 'q4', 'q5'] as const).map((k) => ({ id: `${level}-${k}`, q: t(`faq.${k}.q`), a: t(`faq.${k}.a`) }))
  const seo = staticSeo(locale, cfg.page)
  const url = absoluteUrl(locale, cfg.page)
  return (
    <main id="main" className="flex-1">
      <section className="bg-[radial-gradient(900px_300px_at_20%_-80px,var(--color-accent-soft)_0%,transparent_70%)] pt-12 pb-10 md:pt-16 md:pb-14">
        <Container className="flex flex-col gap-5">
          <SectionHead as="h1" align="left" eyebrow={t('hero.eyebrow')} title={t('hero.h1')} lead={t('hero.lead')} />
          <p className="text-[15px] text-ink2">{t('hero.audience')}</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/download" size="lg" icon="download">{tc('download')}</ButtonLink>
            <ButtonLink href="/assistant" variant="secondary" size="lg" icon="spark">{tn('assistant')}</ButtonLink>
          </div>
          <div className="max-w-[760px]">
            <Callout kind="note">{t('hero.note')}</Callout>
          </div>
        </Container>
      </section>

      <Section className="pt-4 md:pt-8">
        <Container className="flex flex-col gap-14 md:gap-20">
          <SectionHead align="left" eyebrow={t('screens.eyebrow')} title={t('screens.h2')} />
          {SCREENS.map((s, i) => (
            <div
              key={s}
              className={cn(
                'grid items-center gap-8 lg:gap-14',
                // Hàng lẻ: chữ sang phải, ảnh vẫn ở cột rộng 1.2fr.
                i % 2 === 1 ? 'lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:[&>*:first-child]:order-2' : 'lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]',
              )}
            >
              <div className="flex flex-col gap-3">
                <span className="font-mono text-[13px] font-semibold text-accent">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="font-display text-[24px] leading-tight font-semibold">{t(`screens.${s}.title`)}</h3>
                <p className="text-[16px] leading-relaxed text-ink2">{t(`screens.${s}.desc`)}</p>
              </div>
              <WindowFrame
                src={cfg.screens[i].src}
                width={cfg.screens[i].width}
                height={cfg.screens[i].height}
                alt={t(`screens.${s}.alt`)}
                title={t(`screens.${s}.windowTitle`)}
                priority={i === 0}
                sizes="(min-width: 1024px) 680px, 100vw"
              />
            </div>
          ))}
          <p className="text-[13.5px] text-muted">{tc('sampleData')}</p>
        </Container>
      </Section>

      <Section className="border-y border-line bg-card">
        <Container>
          <SectionHead eyebrow={t('outcomes.eyebrow')} title={t('outcomes.h2')} />
          <div className="mt-8 grid gap-4 md:mt-12 md:grid-cols-3 md:gap-6">
            {OUTCOMES.map((o, i) => (
              <div key={o} className="flex flex-col gap-3 rounded-card border border-line bg-page p-6">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-accent-soft text-accent">
                  <Icon name={cfg.icons[i]} size={20} />
                </span>
                <h3 className="text-[17px] leading-snug font-semibold">{t(`outcomes.${o}.title`)}</h3>
                <p className="text-[15px] leading-relaxed text-ink2">{t(`outcomes.${o}.desc`)}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="flex flex-col gap-3 rounded-card border border-accent-line bg-accent-soft p-6 md:p-8">
            <h2 className="font-display text-[24px] font-semibold">{t('gates.title')}</h2>
            <p className="text-[16px] leading-relaxed text-ink2">{t('gates.body')}</p>
            <p className="inline-flex items-center gap-2 text-[15px] font-semibold text-accent">
              <Icon name="shield" size={18} />
              {t('gates.rule')}
            </p>
          </div>
        </Container>
      </Section>

      <Section className="pt-0 md:pt-0">
        <Container className="flex flex-col gap-12">
          <section className="flex flex-col gap-6">
            <SectionHead align="left" eyebrow={tl('topicsEyebrow')} title={tl('topicsH2')} />
            <ul className="grid gap-4 md:grid-cols-2">
              {cfg.topics.map((id) => (
                <li key={id}>
                  <Link href={topicPage(id)} className="flex min-h-11 flex-col gap-1.5 rounded-card border border-line bg-card p-5 hover:border-muted">
                    <span className="font-semibold">{topicCopy(locale, id).name}</span>
                    <span className="text-[14.5px] text-ink2">{topicCopy(locale, id).card}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
          <section className="flex flex-col gap-6">
            <SectionHead align="left" eyebrow={tl('docsEyebrow')} title={tl('docsH2')} />
            <ul className="grid gap-4 md:grid-cols-2">
              {cfg.docs.map((id) => (
                <li key={id}>
                  <Link href={docHref(locale, id)} className="flex min-h-11 flex-col gap-1.5 rounded-card border border-line bg-card p-5 hover:border-muted">
                    <span className="font-semibold">{DOCS[id][locale].title}</span>
                    <span className="text-[14.5px] text-ink2">{DOCS[id][locale].description}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </Container>
      </Section>

      <Section className="border-t border-line bg-card">
        <Container>
          <SectionHead eyebrow={tl('faqEyebrow')} title={tl('faqH2')} />
          <Faq items={faq} />
        </Container>
      </Section>

      <CtaBand title={t('cta.h2')} sub={t('cta.sub')} primary={{ href: '/download', label: tc('download') }} secondary={{ href: '/contact', label: tc('contactSales') }} />
      <JsonLd data={breadcrumb([{ name: tc('siteName'), url: absoluteUrl(locale, '/') }, { name: pageName(locale, cfg.page), url }])} />
      <JsonLd data={webPage({ url, name: finalTitle(seo), description: seo.description, locale, about: pageName(locale, cfg.page) })} />
      <JsonLd data={faqPage(faq)} />
    </main>
  )
}
