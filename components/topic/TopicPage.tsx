import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import Image from 'next/image'
import { Faq } from '@/components/home/Faq'
import { SectionHead } from '@/components/home/SectionHead'
import { JsonLd } from '@/components/seo/JsonLd'
import { ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { CtaBand } from '@/components/ui/CtaBand'
import { Icon } from '@/components/ui/Icon'
import { Section } from '@/components/ui/Section'
import { DOCS, docHref } from '@/content/docs'
import { TOPIC_IDS, TOPIC_META, topicCopy, topicPage, type TopicBlock, type TopicId, type TopicLink } from '@/content/topics'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { formatDate } from '@/lib/format'
import { breadcrumb, faqPage, webPage } from '@/lib/seo/jsonld'
import { buildMetadata } from '@/lib/seo/metadata'
import { finalTitle, pageName, topicSeo } from '@/lib/seo/pages'
import { absoluteUrl } from '@/lib/seo/urls'
import { site } from '@/lib/site'

const H2 = 'text-[24px] leading-[1.2] font-bold tracking-[-0.01em] text-balance md:text-[30px]'
const P = 'text-[16.5px] leading-relaxed text-ink2'
const LINK = 'font-semibold text-accent-strong underline underline-offset-2 hover:text-ink'
const PILLAR_PAGE = { k12: '/k12', university: '/university', program: '/program' } as const

export async function topicMetadata(id: TopicId): Promise<Metadata> {
  const locale = (await getLocale()) as Locale
  return buildMetadata({ locale, page: topicPage(id), seo: topicSeo(locale, id) })
}

/** In đậm lần xuất hiện đầu của từ khoá chính trong ô Tóm tắt (spec §7.2). */
function Highlight({ text, term }: { text: string; term: string }) {
  const i = text.toLowerCase().indexOf(term.toLowerCase())
  if (i < 0) return <>{text}</>
  return (
    <>
      {text.slice(0, i)}
      <strong className="font-semibold">{text.slice(i, i + term.length)}</strong>
      {text.slice(i + term.length)}
    </>
  )
}

function InlineLink({ link, locale }: { link: TopicLink; locale: Locale }) {
  if ('topic' in link) return <Link href={topicPage(link.topic)} className={LINK}>{topicCopy(locale, link.topic).name}</Link>
  if ('doc' in link) return <Link href={docHref(locale, link.doc)} className={LINK}>{DOCS[link.doc][locale].title}</Link>
  if ('href' in link) return <a href={link.href} className={LINK} rel="noopener">{link.label}</a>
  return <Link href={link.page} className={LINK}>{link.label}</Link>
}

function Block({ block, locale }: { block: TopicBlock; locale: Locale }) {
  const List = block.ordered ? 'ol' : 'ul'
  return (
    <section className="flex flex-col gap-4">
      <h2 className={H2}>{block.h2}</h2>
      {block.paras?.map((p) => <p key={p} className={P}>{p}</p>)}
      {block.items ? (
        <List className={block.ordered ? 'flex list-decimal flex-col gap-3 pl-6 marker:font-semibold marker:text-accent-strong' : 'flex flex-col gap-3'}>
          {block.items.map((it) => (
            <li key={it.text} className={block.ordered ? `pl-1 ${P}` : `flex gap-3 ${P}`}>
              {block.ordered ? null : <Icon name="check" size={20} className="mt-1 shrink-0 text-accent" />}
              <span>
                {it.title ? <strong className="font-semibold text-ink">{it.title}: </strong> : null}
                {it.text}
                {it.link ? <> <InlineLink link={it.link} locale={locale} />.</> : null}
              </span>
            </li>
          ))}
        </List>
      ) : null}
    </section>
  )
}

/** Trang chủ đề (spec §7.2): trả lời ngay, định nghĩa, bảng so sánh, cách làm, giới hạn, liên quan, hỏi đáp. */
export async function TopicPage({ id }: { id: TopicId }) {
  const locale = (await getLocale()) as Locale
  const [t, tc] = await Promise.all([getTranslations('topics'), getTranslations('common')])
  const c = topicCopy(locale, id)
  const meta = TOPIC_META[id]
  const url = absoluteUrl(locale, topicPage(id))
  const pillar = meta.pillar ? PILLAR_PAGE[meta.pillar] : null
  const firstDoc = c.howTo.steps.find((s) => s.doc)?.doc
  const siblings = TOPIC_IDS.filter((other) => other !== id)
  const crumbs = [
    { name: tc('siteName'), url: absoluteUrl(locale, '/') },
    ...(pillar ? [{ name: pageName(locale, pillar), url: absoluteUrl(locale, pillar) }] : []),
    { name: c.name, url },
  ]
  return (
    <main id="main" className="flex-1">
      <section className="bg-[radial-gradient(900px_300px_at_20%_-80px,#E8F3E7_0%,rgba(232,243,231,0)_70%)] pt-10 pb-10 md:pt-14 md:pb-12">
        <Container className="flex flex-col gap-4">
          <nav aria-label={t('breadcrumb')} className="flex flex-wrap items-center gap-2 text-[13.5px] text-muted">
            <Link href="/" className="inline-flex min-h-11 items-center hover:text-ink md:min-h-0">{tc('siteName')}</Link>
            {pillar ? (
              <>
                <Icon name="chevron-right" size={14} />
                <Link href={pillar} className="inline-flex min-h-11 items-center hover:text-ink md:min-h-0">{pageName(locale, pillar)}</Link>
              </>
            ) : null}
            <Icon name="chevron-right" size={14} />
            <span className="text-ink2" aria-current="page">{c.name}</span>
          </nav>
          <span className="text-[13px] font-bold tracking-[0.6px] text-accent-strong uppercase">{c.eyebrow}</span>
          <h1 className="max-w-[900px] font-display text-[32px] leading-[1.12] font-bold tracking-[-0.02em] text-balance md:text-[48px] md:leading-[1.08]">{c.h1}</h1>
          <p className="max-w-[800px] text-base leading-relaxed text-ink2 text-pretty md:text-lg">{c.lead}</p>
          <div className="mt-2 flex flex-col gap-2.5 sm:flex-row sm:gap-3">
            <ButtonLink href="/download" icon="download">{tc('download')}</ButtonLink>
            <ButtonLink href={firstDoc ? docHref(locale, firstDoc) : '/docs'} variant="secondary" icon="arrow-right" iconAfter>{t('readGuide')}</ButtonLink>
          </div>
          <p className="text-sm text-muted">{t('updated', { date: formatDate(meta.updatedAt, locale) })}</p>
        </Container>
      </section>

      <section className="pb-16 md:pb-24">
        <Container>
          <article className="flex max-w-[800px] flex-col gap-12 md:gap-14">
            <aside className="rounded-xl border border-accent-line bg-accent-soft p-5 md:p-6">
              <p className="text-[13px] font-bold tracking-[0.6px] text-accent-strong uppercase">{t('inShort')}</p>
              <p className="mt-2 text-[16.5px] leading-relaxed text-ink"><Highlight text={c.inShort} term={c.keywords[0]} /></p>
            </aside>

            <section className="flex flex-col gap-4">
              <h2 className={H2}>{c.definition.h2}</h2>
              <p className={P}><strong className="font-semibold text-ink">{c.definition.term}</strong> {c.definition.rest}</p>
              {c.definition.paras?.map((p) => <p key={p} className={P}>{p}</p>)}
            </section>

            {meta.image ? (
              <Image src={meta.image.src} alt={c.imageAlt} width={meta.image.width} height={meta.image.height} sizes="(min-width: 840px) 800px, 100vw" className="h-auto w-full rounded-xl border border-line" />
            ) : null}

            <section className="flex flex-col gap-4">
              <h2 className={H2}>{c.table.h2}</h2>
              <div tabIndex={0} role="region" aria-label={c.table.caption} className="overflow-x-auto rounded-xl border border-line bg-card">
                <table className="w-full min-w-[640px] border-collapse text-left text-[15px] leading-relaxed">
                  <caption className="sr-only">{c.table.caption}</caption>
                  <thead className="bg-sidebar">
                    <tr>{c.table.head.map((h) => <th key={h} scope="col" className="px-4 py-3 font-semibold">{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {c.table.rows.map((row) => (
                      <tr key={row[0]} className="border-t border-line">
                        {row.map((cell, i) =>
                          i === 0 ? <th key={i} scope="row" className="px-4 py-3 align-top font-semibold">{cell}</th> : <td key={i} className="px-4 py-3 align-top text-ink2">{cell}</td>,
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[13.5px] text-muted">{t('checked', { date: formatDate(c.table.checkedAt, locale) })}</p>
            </section>

            {c.blocks?.map((b) => <Block key={b.h2} block={b} locale={locale} />)}

            <section className="flex flex-col gap-4">
              <h2 className={H2}>{c.howTo.h2}</h2>
              {c.howTo.lead ? <p className={P}>{c.howTo.lead}</p> : null}
              <ol className="flex list-decimal flex-col gap-4 pl-6 marker:font-semibold marker:text-accent-strong">
                {c.howTo.steps.map((s) => (
                  <li key={s.title} className={`pl-1 ${P}`}>
                    <strong className="font-semibold text-ink">{s.title}.</strong> {s.text}
                    {s.doc ? <> <Link href={docHref(locale, s.doc)} className={LINK}>{DOCS[s.doc][locale].title}</Link></> : null}
                  </li>
                ))}
              </ol>
            </section>

            <section className="flex flex-col gap-4">
              <h2 className={H2}>{c.limits.h2}</h2>
              <ul className="flex list-disc flex-col gap-2.5 pl-6">
                {c.limits.items.map((it) => <li key={it} className={P}>{it}</li>)}
              </ul>
            </section>

            <section className="flex flex-col gap-4">
              <h2 className={H2}>{t('relatedH2')}</h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {pillar ? (
                  <li>
                    <Link href={pillar} className="flex min-h-11 flex-col gap-1 rounded-card border border-line bg-card p-4 hover:border-muted">
                      <span className="text-[12.5px] font-bold tracking-[0.5px] text-muted uppercase">{t('pillar')}</span>
                      <span className="font-semibold">{pageName(locale, pillar)}</span>
                    </Link>
                  </li>
                ) : null}
                {siblings.map((other) => (
                  <li key={other}>
                    <Link href={topicPage(other)} className="flex min-h-11 flex-col gap-1 rounded-card border border-line bg-card p-4 hover:border-muted">
                      <span className="font-semibold">{topicCopy(locale, other).name}</span>
                      <span className="text-[14.5px] text-ink2">{topicCopy(locale, other).card}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </article>
        </Container>
      </section>

      <Section className="border-t border-line bg-card">
        <Container>
          <SectionHead eyebrow={t('faqEyebrow')} title={t('faqH2')} />
          <Faq items={c.faq.map((f, i) => ({ id: `${id}-q${i + 1}`, ...f }))} />
        </Container>
      </Section>

      <CtaBand title={t('ctaH2')} sub={t('ctaSub')} primary={{ href: '/download', label: tc('download') }} secondary={{ href: '/contact', label: tc('contactSales') }} />
      <JsonLd
        data={webPage({
          url,
          name: finalTitle(topicSeo(locale, id)),
          description: c.description,
          locale,
          about: c.name,
          keywords: c.keywords,
          ...(meta.image ? { image: `${site.siteUrl()}${meta.image.src}` } : {}),
          dateModified: meta.updatedAt,
        })}
      />
      <JsonLd data={breadcrumb(crumbs)} />
      <JsonLd data={faqPage(c.faq)} />
    </main>
  )
}
