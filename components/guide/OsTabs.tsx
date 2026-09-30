import { useTranslations } from 'next-intl'
import { Icon } from '@/components/ui/Icon'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/cn'
import { GUIDE_OS, type GuideOs } from '@/content/install'

export function OsTabs({ current }: { current: GuideOs }) {
  const t = useTranslations('install')
  return (
    <div className="inline-flex gap-1 rounded-[10px] border border-line bg-sidebar p-1">
      {GUIDE_OS.map((os) => {
        const on = os === current
        return (
          <Link
            key={os}
            href={{ pathname: '/install/[os]', params: { os } }}
            aria-current={on ? 'page' : undefined}
            className={cn(
              'inline-flex h-11 items-center gap-2 rounded-[7px] px-4 text-[14.5px] font-semibold md:h-10',
              on ? 'bg-card2 text-ink shadow-[0_1px_2px_rgba(0,0,0,0.08)]' : 'text-ink2 hover:text-ink',
            )}
          >
            <Icon name={os === 'macos' ? 'apple' : 'windows'} size={18} />
            {t(`tabs.${os}`)}
          </Link>
        )
      })}
    </div>
  )
}
