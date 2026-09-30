'use client'

import { DownloadLink } from '@/components/download/DownloadLink'
import { ButtonLink, buttonClasses } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { track } from '@/lib/analytics'
import { downloadState, hasAssetFor } from '@/lib/releases/state'
import type { ReleaseAsset } from '@/lib/releases/types'
import { usePlatform } from '@/lib/usePlatform'

/**
 * Nút chính của hero. Sắp phát hành → Liên hệ để dùng sớm. Windows → tải thẳng .exe. macOS, điện thoại, máy tính bảng,
 * Linux → trang Tải về (trình duyệt không phân biệt chip Mac; điện thoại không cài được app desktop).
 */
export function HeroCta({
  assets,
  labels,
}: {
  assets: ReleaseAsset[]
  labels: { default: string; mac: string; windows: string; prelaunch: string; secondary: string }
}) {
  const os = usePlatform()
  const windows = assets.find((a) => a.platform === 'windows-x64')
  // Chỉ mời "Tải về cho macOS" khi đã có bản macOS (feed có thể phát hành lệch hai nền tảng).
  const macReady = os === 'macos' && hasAssetFor(assets, 'macos')
  let primary: React.ReactNode
  if (downloadState(assets) === 'prelaunch') {
    primary = (
      <ButtonLink href="/contact" size="lg" icon="mail" className="w-full sm:w-auto" onClick={() => track({ name: 'cta_click', id: 'hero_early_access', location: 'hero' })}>
        {labels.prelaunch}
      </ButtonLink>
    )
  } else if (os === 'windows' && windows) {
    primary = (
      <DownloadLink asset={windows} location="hero" size="lg" className="w-full sm:w-auto">
        {labels.windows}
      </DownloadLink>
    )
  } else {
    primary = (
      <ButtonLink
        href="/download"
        size="lg"
        icon="download"
        className="w-full sm:w-auto"
        onClick={() => track({ name: 'cta_click', id: macReady ? 'hero_download_mac' : 'hero_download', location: 'hero' })}
      >
        {macReady ? labels.mac : labels.default}
      </ButtonLink>
    )
  }
  return (
    <div className="mt-1.5 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
      {primary}
      <a
        href="#tro-ly"
        className={buttonClasses('secondary', 'lg', false, 'w-full sm:w-auto')}
        onClick={() => track({ name: 'cta_click', id: 'hero_assistant', location: 'hero' })}
      >
        <span>{labels.secondary}</span>
        <Icon name="arrow-right" size={20} />
      </a>
    </div>
  )
}
