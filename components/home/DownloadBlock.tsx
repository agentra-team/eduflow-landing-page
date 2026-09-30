import { useTranslations } from 'next-intl'
import { PlatformCard } from '@/components/download/PlatformCard'
import { PrelaunchNotice } from '@/components/download/PrelaunchNotice'
import { Callout } from '@/components/ui/Callout'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import type { Locale } from '@/i18n/routing'
import { formatDate } from '@/lib/format'
import { downloadState, hasAssetFor } from '@/lib/releases/state'
import type { ReleaseAsset } from '@/lib/releases/types'
import { SectionHead } from './SectionHead'

export function DownloadBlock({ assets, locale, latest }: { assets: ReleaseAsset[]; locale: Locale; latest: { version: string; releaseDate: string } | null }) {
  const t = useTranslations('home.download')
  const td = useTranslations('download')
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
            <div className="mt-8 flex flex-col gap-4 md:mt-12 md:gap-6">
              {/* Feed có thể phát hành lệch hai nền tảng: nói rõ bản nào sắp có, không để thẻ biến mất lặng lẽ. */}
              {(['windows', 'macos'] as const)
                .filter((os) => !hasAssetFor(assets, os))
                .map((os) => (
                  <Callout key={os} kind="info">
                    {td(`missing.${os}`)}
                  </Callout>
                ))}
              <div className="grid gap-4 md:grid-cols-3 md:gap-6">
                {assets.map((asset) => (
                  <PlatformCard key={asset.platform} asset={asset} locale={locale} location="home_block" />
                ))}
              </div>
            </div>
            {hasAssetFor(assets, 'macos') ? (
              <div className="mx-auto mt-6 max-w-[860px] md:mt-7">
                <Callout kind="info">{t('note')}</Callout>
              </div>
            ) : null}
          </>
        )}
      </Container>
    </Section>
  )
}
