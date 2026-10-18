'use client'

import { useTranslations } from 'next-intl'
import { Callout } from '@/components/ui/Callout'
import { Icon } from '@/components/ui/Icon'
import type { Locale } from '@/i18n/routing'
import { PLATFORM_FOR_OS } from '@/lib/platform'
import { hasAssetFor } from '@/lib/releases/state'
import type { ReleaseAsset } from '@/lib/releases/types'
import { usePlatform } from '@/lib/usePlatform'
import { PlatformCard } from './PlatformCard'

/** Thẻ khớp hệ điều hành của người xem xếp đầu và được đánh dấu; chưa biết thì giữ thứ tự feed (spec §6.2). */
export function PlatformGrid({ assets, locale }: { assets: ReleaseAsset[]; locale: Locale }) {
  const t = useTranslations('download')
  const os = usePlatform()
  const preferred = os ? PLATFORM_FOR_OS[os] : []
  const ordered = [...assets].sort((a, b) => Number(preferred.includes(b.platform)) - Number(preferred.includes(a.platform)))
  return (
    <>
      {os ? (
        <p className="inline-flex items-center gap-2.5 rounded-full border border-accent-line bg-accent-soft py-2 pr-4 pl-3 text-sm font-semibold text-accent">
          <Icon name={os === 'macos' ? 'apple' : 'windows'} size={18} />
          {t(`detected.${os}`)}
        </p>
      ) : null}
      {os && !hasAssetFor(assets, os) ? (
        <div className="mt-4">
          <Callout kind="info">{t(`missing.${os}`)}</Callout>
        </div>
      ) : null}
      <div className="mt-6 grid gap-4 md:grid-cols-3 md:gap-6">
        {ordered.map((asset) => {
          const match = preferred.includes(asset.platform)
          return (
            <PlatformCard
              key={asset.platform}
              asset={asset}
              locale={locale}
              location="download_page"
              highlighted={match}
              badge={match && asset.platform === preferred[0] ? t('badge') : undefined}
              checksum
              headingLevel="h2"
              guideLabel={asset.platform === 'windows-x64' ? t('guideWindows') : t('guideMac')}
            />
          )
        })}
      </div>
    </>
  )
}
