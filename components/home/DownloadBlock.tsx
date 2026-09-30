import { useTranslations } from 'next-intl'
import { PlatformCard } from '@/components/download/PlatformCard'
import { PrelaunchNotice } from '@/components/download/PrelaunchNotice'
import { Callout } from '@/components/ui/Callout'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import type { Locale } from '@/i18n/routing'
import { formatDate } from '@/lib/format'
import { downloadState } from '@/lib/releases/state'
import type { ReleaseAsset } from '@/lib/releases/types'
import { SectionHead } from './SectionHead'

export function DownloadBlock({ assets, locale, latest }: { assets: ReleaseAsset[]; locale: Locale; latest: { version: string; releaseDate: string } | null }) {
  const t = useTranslations('home.download')
  return (
    <Section id="tai-ve">
      <Container>
        <SectionHead
          eyebrow={t('eyebrow')}
          title={t('h2')}
          lead={latest ? t('lead', { version: latest.version, date: formatDate(latest.releaseDate, locale) }) : undefined}
        />
        {downloadState(assets) === 'prelaunch' ? (
          <div className="mt-8 md:mt-12">
            <PrelaunchNotice title={t('prelaunch.title')} body={t('prelaunch.body')} cta={t('prelaunch.cta')} headingLevel="h3" />
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-4 md:mt-12 md:grid-cols-3 md:gap-6">
              {assets.map((asset) => (
                <PlatformCard key={asset.platform} asset={asset} locale={locale} location="home_block" />
              ))}
            </div>
            <div className="mx-auto mt-6 max-w-[860px] md:mt-7">
              <Callout kind="info">{t('note')}</Callout>
            </div>
          </>
        )}
      </Container>
    </Section>
  )
}
