import { cn } from '@/lib/cn'
import { Icon } from './Icon'

const KINDS = {
  info: 'border-info-border bg-info-soft text-info-text',
  warning: 'border-warn-border bg-warn-soft text-warn-text',
  note: 'border-accent-line bg-accent-soft text-accent-strong',
} as const

export function Callout({
  kind = 'info',
  title,
  className,
  children,
}: {
  kind?: keyof typeof KINDS
  title?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn('flex gap-3 rounded-card border px-4 py-3.5 text-[15px] leading-relaxed', KINDS[kind], className)}>
      <span className="mt-0.5 shrink-0">
        <Icon name={kind === 'warning' ? 'warning' : 'info'} size={20} />
      </span>
      <div>
        {title ? <b className="mb-1 block">{title}</b> : null}
        {children}
      </div>
    </div>
  )
}
