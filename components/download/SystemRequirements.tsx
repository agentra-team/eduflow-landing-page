import { useTranslations } from 'next-intl'
import { Icon } from '@/components/ui/Icon'
import type { IconName } from '@/components/ui/icons'

const ROWS: Record<'windows' | 'macos', Array<{ key: string; icon: IconName }>> = {
  windows: [
    { key: 'os', icon: 'monitor' },
    { key: 'disk', icon: 'hdd' },
    { key: 'net', icon: 'wifi' },
  ],
  macos: [
    { key: 'os', icon: 'monitor' },
    { key: 'chip', icon: 'chip' },
    { key: 'disk', icon: 'hdd' },
    { key: 'net', icon: 'wifi' },
  ],
}

export function SystemRequirements() {
  const t = useTranslations('download.req')
  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-6">
      {(['windows', 'macos'] as const).map((os) => (
        <div key={os} className="flex flex-col gap-3.5 rounded-xl border border-line bg-card p-5 md:p-6">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] bg-sidebar text-ink">
              <Icon name={os === 'windows' ? 'windows' : 'apple'} size={20} />
            </span>
            <h3 className="text-lg font-semibold">{os === 'windows' ? 'Windows' : 'macOS'}</h3>
          </div>
          <ul className="flex flex-col gap-2">
            {ROWS[os].map(({ key, icon }) => (
              <li key={key} className="flex items-start gap-2.5 text-[15px] leading-relaxed text-ink2">
                <Icon name={icon} size={18} className="mt-1 shrink-0 text-accent" />
                <span>{t(`${os}.${key}` as Parameters<typeof t>[0])}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
