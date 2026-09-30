'use client'

import { buttonClasses } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { track, type AnalyticsEvent } from '@/lib/analytics'
import type { ReleaseAsset } from '@/lib/releases/types'

type Location = Extract<AnalyticsEvent, { name: 'download_click' }>['location']

/** Link tải thẳng tệp từ VPS, gửi sự kiện download_click. */
export function DownloadLink({
  asset,
  location,
  variant = 'primary',
  size = 'md',
  full,
  className,
  children,
}: {
  asset: ReleaseAsset
  location: Location
  variant?: 'primary' | 'secondary' | 'white'
  size?: 'sm' | 'md' | 'lg'
  full?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <a
      href={asset.url}
      download
      className={buttonClasses(variant, size, full, className)}
      onClick={() => track({ name: 'download_click', platform: asset.platform, version: asset.version, location })}
    >
      <Icon name="download" size={20} />
      <span>{children}</span>
    </a>
  )
}
