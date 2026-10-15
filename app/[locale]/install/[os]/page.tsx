import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { DownloadLink } from '@/components/download/DownloadLink'
import { OsTabs } from '@/components/guide/OsTabs'
import { Toc } from '@/components/guide/Toc'
import { JsonLd } from '@/components/seo/JsonLd'
import { ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import { GUIDE_OS, GUIDES, isGuideOs, type GuideOs } from '@/content/install'
import { Link } from '@/i18n/navigation'
import { routing, type Locale } from '@/i18n/routing'
import { formatDate } from '@/lib/format'
import { findAsset, getReleases } from '@/lib/releases'
import { hasAssetFor } from '@/lib/releases/state'
import { breadcrumb } from '@/lib/seo/jsonld'
import { buildMetadata } from '@/lib/seo/metadata'
import { absoluteUrl } from '@/lib/seo/urls'

type Params = Promise<{ locale: string; os: string }>

export const dynamicParams = false

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => GUIDE_OS.map((os) => ({ locale, os })))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, os } = await params
  if (!isGuideOs(os)) notFound()
  const t = await getTranslations('install.meta')
  return buildMetadata({
    locale: locale as Locale,
    page: '/install/[os]',
    params: { vi: { os }, en: { os } },
    seo: { title: t(`${os}.title`), description: t(`${os}.description`) },
  })
}

export default async function GuidePage({ params }: { params: Params }) {
  const { locale: rawLocale, os } = await params
  if (!isGuideOs(os)) notFound()
  const locale = rawLocale as Locale
  const other: GuideOs = os === 'macos' ? 'windows' : 'macos'
  const [{ default: Guide, meta }, { assets }, t, tc] = await Promise.all([
    GUIDES[locale][os](),
    getReleases(),
    getTranslations('install'),
    getTranslations('common'),
  ])
  const windows = findAsset(assets, 'windows-x64')
  const toc = meta.toc ?? []
  const crumbs = [
    { name: tc('siteName'), url: absoluteUrl(locale, '/') },
    { name: t('breadcrumbDownload'), url: absoluteUrl(locale, '/download') },
    { name: meta.title, url: absoluteUrl(locale, '/install/[os]', { os }) },
  ]
  return (
    <main id="main" className="flex-1">
      <section className="bg-[radial-gradient(900px_300px_at_20%_-80px,#E8F3E7_0%,rgba(232,243,231,0)_70%)] pt-10 pb-8 md:pt-14 md:pb-10">
        <Container className="flex flex-col gap-3">
          <nav aria-label={t('breadcrumbInstall')} className="flex items-center gap-2 text-[13.5px] text-muted">
            <Link href="/download" className="inline-flex min-h-11 items-center hover:text-ink md:min-h-0">{t('breadcrumbDownload')}</Link>
            <Icon name="chevron-right" size={14} />
            <span>{t('breadcrumbInstall')}</span>
            <Icon name="chevron-right" size={14} />
            <span className="text-ink2">{t(`tabs.${os}`)}</span>
          </nav>
          <span className="text-[13px] font-bold tracking-[0.6px] text-accent-strong uppercase">{t('eyebrow')}</span>
          <h1 className="max-w-[900px] font-display text-[32px] leading-[1.12] font-bold tracking-[-0.02em] text-balance md:text-[44px] md:leading-[1.1]">
            {meta.title}
          </h1>
          <p className="text-base text-ink2 md:text-lg">
            {meta.minutes ? `${t('minutes', { n: meta.minutes })} · ` : ''}
            {meta.updated ? t('updated', { date: formatDate(meta.updated, locale) }) : ''}
          </p>
          <div className="mt-3">
            <OsTabs current={os} />
          </div>
        </Container>
      </section>
      <section className="pb-16 md:pb-24">
        {/* grid-cols-1: nút tải dài không xuống dòng được thì cột cũng không rộng hơn màn hình (360 px, bản tiếng Anh có feed). */}
        <Container className="grid grid-cols-1 gap-10 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-16">
          <aside className="lg:self-start">
            <Toc items={toc} />
          </aside>
          {/* Chữ mono không nối ký tự: "-<" và ">-" trong tên tệp mẫu không hiện thành mũi tên. */}
          <article className="flex max-w-[780px] flex-col gap-8 md:gap-10 [&_code]:[font-variant-ligatures:none]">
            <Guide />
            <div className="flex flex-col gap-4 rounded-xl border border-accent-line bg-accent-soft p-5 md:flex-row md:items-center md:justify-between md:p-6">
              <div className="flex flex-col gap-1">
                <b className="text-base">{t('bottom.title')}</b>
                <span className="text-[14.5px] text-ink2">{t('bottom.body')}</span>
              </div>
              <div className="flex flex-col gap-2.5 sm:flex-row">
                {os === 'windows' && windows ? (
                  <DownloadLink asset={windows} location="guide">{t('bottom.downloadWindows')}</DownloadLink>
                ) : (
                  <ButtonLink href="/download" icon="download">
                    {os === 'macos' && hasAssetFor(assets, 'macos') ? t('bottom.downloadMac') : tc('download')}
                  </ButtonLink>
                )}
                <ButtonLink href={{ pathname: '/install/[os]', params: { os: other } }} variant="secondary" icon="arrow-right" iconAfter>
                  {t(`bottom.other.${other}`)}
                </ButtonLink>
              </div>
            </div>
          </article>
        </Container>
      </section>
      <JsonLd data={breadcrumb(crumbs)} />
    </main>
  )
}
