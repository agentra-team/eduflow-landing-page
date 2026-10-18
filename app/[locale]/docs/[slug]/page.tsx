import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { DocHelp } from '@/components/docs/DocHelp'
import { DocsNav } from '@/components/docs/DocsNav'
import { DocsPager } from '@/components/docs/DocsPager'
import { DocsToc } from '@/components/docs/DocsToc'
import { JsonLd } from '@/components/seo/JsonLd'
import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import { assertDocsValid, DOC_SOURCES, docParams, DOCS } from '@/content/docs'
import { DOC_IDS, DOC_SLUGS, docIdFromSlug } from '@/content/docs/slugs'
import { topicCopy, topicPage } from '@/content/topics'
import { Link } from '@/i18n/navigation'
import { routing, type Locale } from '@/i18n/routing'
import { extractToc } from '@/lib/docs/toc'
import { formatDate } from '@/lib/format'
import { breadcrumb, techArticle } from '@/lib/seo/jsonld'
import { buildMetadata, docOgImageUrl } from '@/lib/seo/metadata'
import { docSeo } from '@/lib/seo/pages'
import { absoluteUrl } from '@/lib/seo/urls'

type Params = Promise<{ locale: string; slug: string }>

// Slug lạ, kể cả slug của ngôn ngữ kia, trả 404 thật (spec §7.4). Nhánh này không có loading.tsx, nên notFound() chạy trước mọi Suspense.
export const dynamicParams = false

export function generateStaticParams() {
  // Build dừng ở đây khi sổ bài sai, kèm tên tệp và tên trường.
  assertDocsValid()
  return routing.locales.flatMap((locale) => DOC_IDS.map((id) => ({ locale, slug: DOC_SLUGS[id][locale] })))
}

async function resolve(params: Params) {
  const { locale: raw, slug } = await params
  const locale = raw as Locale
  const id = docIdFromSlug(locale, slug)
  if (!id) notFound()
  return { locale, id }
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, id } = await resolve(params)
  return buildMetadata({ locale, page: '/docs/[slug]', params: docParams(id), seo: docSeo(locale, id), ogImage: docOgImageUrl(locale, id) })
}

export default async function DocPage({ params }: { params: Params }) {
  const { locale, id } = await resolve(params)
  const [{ default: Body }, t, tc] = await Promise.all([DOC_SOURCES[locale][id](), getTranslations('docs'), getTranslations('common')])
  const doc = DOCS[id]
  const c = doc[locale]
  // Mục lục đọc từ nguồn MDX lúc build. Trang sinh tĩnh hoàn toàn (không gọi getReleases): ISR ở runtime sẽ không có tệp nguồn.
  // Đường dẫn viết từ hằng 'content', 'docs' (cùng chỗ với docFile) để Turbopack chỉ trace thư mục này: đường dẫn tính hoàn toàn
  // lúc chạy làm cả repo bị đóng vào bản server. Lệch với docFile thì build dừng vì không đọc được tệp.
  const toc = extractToc(readFileSync(join(process.cwd(), 'content', 'docs', locale, `${DOC_SLUGS[id][locale]}.mdx`), 'utf8'))
  const url = absoluteUrl(locale, '/docs/[slug]', { slug: DOC_SLUGS[id][locale] })
  const group = t(`groups.${doc.group}`)
  return (
    <main id="main" className="flex-1">
      <Container className="grid grid-cols-1 gap-8 pt-10 pb-16 md:pt-14 md:pb-24 lg:grid-cols-[230px_minmax(0,1fr)_210px] lg:gap-12">
        <aside className="lg:self-start">
          <DocsNav current={id} />
        </aside>
        {/* Chữ mono không nối ký tự: "-<" và ">-" trong tên tệp mẫu không hiện thành mũi tên. */}
        <article className="flex min-w-0 flex-col gap-8 [&_code]:[font-variant-ligatures:none]">
          <header className="flex flex-col gap-3">
            <nav aria-label={t('breadcrumb')} className="flex flex-wrap items-center gap-2 text-[13.5px] text-muted">
              <Link href="/docs" className="inline-flex min-h-11 items-center hover:text-ink md:min-h-0">{t('home')}</Link>
              <Icon name="chevron-right" size={14} />
              <span>{group}</span>
              <Icon name="chevron-right" size={14} />
              <span className="text-ink2" aria-current="page">{c.title}</span>
            </nav>
            <h1 className="font-display text-[32px] leading-[1.12] font-semibold tracking-[-0.02em] text-balance md:text-[42px]">{c.title}</h1>
            <p className="text-base leading-relaxed text-ink2 text-pretty md:text-lg">{c.description}</p>
            <p className="text-sm text-muted">{t('updated', { date: formatDate(doc.updatedAt, locale) })}</p>
          </header>
          <DocsToc items={toc} variant="inline" />
          <div className="flex flex-col gap-8 md:gap-10">
            <Body />
          </div>
          {doc.topic ? (
            <aside className="flex flex-col gap-1.5 rounded-card border border-line bg-card p-5">
              <span className="text-[12.5px] font-semibold tracking-[0.5px] text-muted uppercase">{t('readMore')}</span>
              <Link href={topicPage(doc.topic)} className="font-semibold text-accent underline underline-offset-2 hover:text-ink">
                {topicCopy(locale, doc.topic).name}
              </Link>
              <span className="text-[14.5px] text-ink2">{topicCopy(locale, doc.topic).card}</span>
            </aside>
          ) : null}
          <DocsPager current={id} />
          <DocHelp />
        </article>
        <aside className="hidden lg:block lg:self-start">
          <DocsToc items={toc} variant="aside" />
        </aside>
      </Container>
      <JsonLd
        data={breadcrumb([
          { name: tc('siteName'), url: absoluteUrl(locale, '/') },
          { name: t('home'), url: absoluteUrl(locale, '/docs') },
          { name: c.title, url },
        ])}
      />
      <JsonLd data={techArticle({ url, headline: c.title, description: c.description, locale, dateModified: doc.updatedAt, section: group, image: docOgImageUrl(locale, id) })} />
    </main>
  )
}
