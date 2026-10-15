import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import { DocHelp } from '@/components/docs/DocHelp'
import { SectionHead } from '@/components/home/SectionHead'
import { JsonLd } from '@/components/seo/JsonLd'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { DOCS, docHref, docsByGroup, docsInOrder, QUICK_START } from '@/content/docs'
import { DOC_SLUGS } from '@/content/docs/slugs'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { breadcrumb, collectionPage } from '@/lib/seo/jsonld'
import { buildMetadata } from '@/lib/seo/metadata'
import { staticSeo } from '@/lib/seo/pages'
import { absoluteUrl } from '@/lib/seo/urls'

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as Locale
  return buildMetadata({ locale, page: '/docs', seo: staticSeo(locale, '/docs') })
}

/** Mục lục hướng dẫn (spec §7.3): khối "Bắt đầu trong 5 phút", các nhóm bài, rồi khối hỏi Agentra. */
export default async function DocsIndexPage() {
  const locale = (await getLocale()) as Locale
  const [t, tc] = await Promise.all([getTranslations('docs'), getTranslations('common')])
  const url = absoluteUrl(locale, '/docs')
  const card = 'flex min-h-11 flex-col gap-1.5 rounded-card border border-line bg-card p-5 hover:border-muted'
  return (
    <main id="main" className="flex-1">
      <section className="pt-12 pb-8 md:pt-16 md:pb-10">
        <Container>
          <SectionHead as="h1" align="left" eyebrow={t('eyebrow')} title={t('h1')} lead={t('lead')} />
        </Container>
      </section>
      <Section className="pt-0 md:pt-0">
        <Container className="flex flex-col gap-12">
          <section className="flex flex-col gap-4">
            <h2 className="text-[24px] font-bold">{t('quickStart.h2')}</h2>
            <p className="text-ink2">{t('quickStart.lead')}</p>
            <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {QUICK_START.map((id, i) => (
                <li key={id}>
                  <Link href={docHref(locale, id)} className={card}>
                    <span className="font-mono text-[13px] font-semibold text-accent-strong">{String(i + 1).padStart(2, '0')}</span>
                    <span className="font-semibold">{DOCS[id][locale].title}</span>
                    <span className="text-[14.5px] text-ink2">{DOCS[id][locale].description}</span>
                  </Link>
                </li>
              ))}
            </ol>
          </section>
          {docsByGroup().map(({ group, ids }) => (
            <section key={group} className="flex flex-col gap-4">
              <h2 className="text-[24px] font-bold">{t(`groups.${group}`)}</h2>
              <ul className="grid gap-4 md:grid-cols-2">
                {ids.map((id) => (
                  <li key={id}>
                    <Link href={docHref(locale, id)} className={card}>
                      <span className="font-semibold">{DOCS[id][locale].title}</span>
                      <span className="text-[14.5px] text-ink2">{DOCS[id][locale].description}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          <DocHelp title={t('notFound.h2')} body={t('notFound.body')} />
        </Container>
      </Section>
      <JsonLd data={breadcrumb([{ name: tc('siteName'), url: absoluteUrl(locale, '/') }, { name: t('home'), url }])} />
      <JsonLd
        data={collectionPage({
          url,
          name: t('h1'),
          description: staticSeo(locale, '/docs').description,
          locale,
          items: docsInOrder().map((id) => ({ name: DOCS[id][locale].title, url: absoluteUrl(locale, '/docs/[slug]', { slug: DOC_SLUGS[id][locale] }) })),
        })}
      />
    </main>
  )
}
