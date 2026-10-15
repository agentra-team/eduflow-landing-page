import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import { PlatformGrid } from '@/components/download/PlatformGrid'
import { PrelaunchNotice } from '@/components/download/PrelaunchNotice'
import { SystemRequirements } from '@/components/download/SystemRequirements'
import { SectionHead } from '@/components/home/SectionHead'
import { JsonLd } from '@/components/seo/JsonLd'
import { Callout } from '@/components/ui/Callout'
import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { releaseLead } from '@/lib/format'
import { getReleases, latestRelease } from '@/lib/releases'
import { downloadState, hasAssetFor } from '@/lib/releases/state'
import { appFacts } from '@/lib/seo/app-facts'
import { breadcrumb, softwareApplication } from '@/lib/seo/jsonld'
import { buildMetadata } from '@/lib/seo/metadata'
import { absoluteUrl } from '@/lib/seo/urls'
import { site } from '@/lib/site'

// Câu về ký số đọc từ cờ của app-facts (spec §7.5): chưa có chứng thư thì nói thật là máy sẽ hỏi lại.
const SIGNING = appFacts.installerSigned ? 'signed' : 'unsigned'

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as Locale
  const t = await getTranslations('download.meta')
  return buildMetadata({ locale, page: '/download', title: t('title'), description: t('description') })
}

export default async function DownloadPage() {
  const locale = (await getLocale()) as Locale
  const [{ assets }, t, tc] = await Promise.all([getReleases(), getTranslations('download'), getTranslations('common')])
  const lead = releaseLead(latestRelease(assets), locale)
  const guide = (os: 'macos' | 'windows', label: string) => (
    <Link href={{ pathname: '/install/[os]', params: { os } }} className="font-semibold underline underline-offset-2">
      {label}
    </Link>
  )
  return (
    <main id="main" className="flex-1">
      <section className="bg-[radial-gradient(900px_300px_at_20%_-80px,#E8F3E7_0%,rgba(232,243,231,0)_70%)] pt-12 pb-10 md:pt-16 md:pb-12">
        <Container>
          <SectionHead
            as="h1"
            align="left"
            eyebrow={t('eyebrow')}
            title={t('h1')}
            lead={lead ? t(lead.key, lead.values) : undefined}
          />
        </Container>
      </section>
      <section className="pb-16 md:pb-20">
        <Container>
          {downloadState(assets) === 'prelaunch' ? (
            <PrelaunchNotice title={t('prelaunch.title')} body={t('prelaunch.body')} cta={t('prelaunch.cta')} />
          ) : (
            <>
              <PlatformGrid assets={assets} locale={locale} />
              <div className="mt-6">
                {/* Ghi chú chọn chip chỉ có nghĩa khi đã có bản macOS. */}
                {hasAssetFor(assets, 'macos') ? <Callout kind="info">{t('chipNote')}</Callout> : null}
              </div>
            </>
          )}
          <p className="mt-6 text-[14.5px] text-muted">{t('desktopOnly')}</p>
        </Container>
      </section>
      <section className="border-t border-line bg-card py-16 md:py-20">
        <Container>
          <SectionHead align="left" eyebrow={t('req.eyebrow')} title={t('req.h2')} />
          <div className="mt-8">
            <SystemRequirements />
          </div>
          <div className="mt-8 flex flex-col gap-4">
            <Callout kind={appFacts.installerSigned ? 'info' : 'warning'} title={t(`signing.${SIGNING}.title`)}>
              {t(`signing.${SIGNING}.body`)} {guide('windows', t('guideWindows'))} · {guide('macos', t('guideMac'))}
            </Callout>
            <div className="flex gap-3.5 rounded-xl border border-line bg-card2 p-5">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-accent-soft text-accent-strong">
                <Icon name="refresh" size={20} />
              </span>
              <div className="flex flex-col gap-1">
                <b className="text-base">{t('update.title')}</b>
                <span className="text-[15px] leading-relaxed text-ink2">{t('update.body')}</span>
              </div>
            </div>
          </div>
          <p className="mt-7 text-center text-[14.5px] text-muted">
            {t.rich('help', {
              email: () => (
                <a href={`mailto:${site.email}`} className="font-semibold text-accent-strong">
                  {site.email}
                </a>
              ),
            })}
          </p>
        </Container>
      </section>
      <JsonLd data={breadcrumb([{ name: tc('siteName'), url: absoluteUrl(locale, '/') }, { name: t('h1'), url: absoluteUrl(locale, '/download') }])} />
      <JsonLd data={softwareApplication(assets, locale, absoluteUrl(locale, '/download'))} />
    </main>
  )
}
