import { useTranslations } from 'next-intl'
import { Icon } from '@/components/ui/Icon'
import { docHref } from '@/content/docs/slugs'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { cn } from '@/lib/cn'
import { formatAssetMeta } from '@/lib/format'
import type { ReleaseAsset } from '@/lib/releases/types'
import { ChecksumField } from './ChecksumField'
import { DownloadLink } from './DownloadLink'

const OS_OF: Record<ReleaseAsset['platform'], 'windows' | 'macos'> = {
  'windows-x64': 'windows',
  'macos-arm64': 'macos',
  'macos-x64': 'macos',
}

export function PlatformCard({
  asset,
  locale,
  location,
  highlighted = false,
  badge,
  checksum = false,
  guideLabel,
  headingLevel = 'h3',
}: {
  asset: ReleaseAsset
  locale: Locale
  location: 'home_block' | 'download_page'
  highlighted?: boolean
  badge?: string
  checksum?: boolean
  guideLabel?: string
  /** h2 khi thẻ đứng ngay dưới h1 của trang (Tải về); h3 trong một khối đã có h2 (trang chủ). */
  headingLevel?: 'h2' | 'h3'
}) {
  const t = useTranslations('home.download')
  const tc = useTranslations('common')
  const os = OS_OF[asset.platform]
  const Heading = headingLevel
  return (
    <div
      className={cn(
        'relative flex flex-col gap-4 rounded-card border bg-card px-5 pt-6 pb-5 md:px-6',
        highlighted ? 'border-accent shadow-[0_0_0_3px_var(--color-accent-soft)]' : 'border-line-faint shadow-card',
      )}
    >
      {badge ? (
        <span className="absolute -top-3 left-5 rounded-full bg-accent px-2.5 py-0.5 text-[11.5px] font-semibold tracking-[0.3px] text-white">
          {badge}
        </span>
      ) : null}
      <div className="flex items-center gap-3.5">
        <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sidebar text-ink">
          <Icon name={os === 'windows' ? 'windows' : 'apple'} size={24} />
        </span>
        <div className="flex flex-col gap-0.5">
          <Heading className={cn('text-lg leading-snug font-semibold', headingLevel === 'h2' && 'font-display')}>{t(`platforms.${asset.platform}.title`)}</Heading>
          <span className="text-[13.5px] text-ink2">{t(`platforms.${asset.platform}.sub`)}</span>
        </div>
      </div>
      <div className="flex flex-col gap-1.5 rounded-control bg-sidebar px-3.5 py-3">
        <code className="truncate font-mono text-[12.5px] text-ink">{asset.fileName}</code>
        <span className="text-[13px] text-muted">{formatAssetMeta(asset, locale)}</span>
      </div>
      {checksum ? <ChecksumField sha512={asset.sha512} toggleLabel={t('checksum')} copyLabel={tc('copy')} copiedLabel={tc('copied')} /> : null}
      <DownloadLink asset={asset} location={location} full>
        {t('btn')}
      </DownloadLink>
      <Link
        href={docHref(locale, os === 'macos' ? 'install-macos' : 'install-windows')}
        className="inline-flex min-h-11 items-center gap-1.5 text-[14.5px] font-semibold text-accent hover:text-accent-strong md:min-h-0"
      >
        {guideLabel ?? t('guide')}
        <Icon name="arrow-right" size={16} />
      </Link>
    </div>
  )
}
