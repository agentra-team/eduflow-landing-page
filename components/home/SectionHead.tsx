import { cn } from '@/lib/cn'

export function SectionHead({
  eyebrow,
  title,
  lead,
  align = 'center',
  as: Heading = 'h2',
}: {
  eyebrow: string
  title: string
  lead?: string
  align?: 'center' | 'left'
  as?: 'h1' | 'h2'
}) {
  const center = align === 'center'
  return (
    <div className={cn('flex flex-col gap-3', center && 'items-center text-center')}>
      <span className="text-[13px] font-bold tracking-[0.6px] text-accent-strong uppercase">{eyebrow}</span>
      <Heading className="max-w-[800px] font-display text-[28px] leading-[1.18] font-bold tracking-[-0.01em] text-balance md:text-[38px] md:leading-[1.15]">
        {title}
      </Heading>
      {lead ? <p className="max-w-[800px] text-base leading-relaxed text-ink2 text-pretty md:text-lg">{lead}</p> : null}
    </div>
  )
}
