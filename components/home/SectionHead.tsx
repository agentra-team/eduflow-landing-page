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
      <span className="w-fit rounded-full bg-accent-soft px-3.5 py-1.5 text-[13.5px] font-semibold text-accent">{eyebrow}</span>
      <Heading className="max-w-[800px] font-display text-[28px] leading-[1.18] font-semibold tracking-[-0.02em] text-balance md:text-[38px] md:leading-[1.15]">
        {title}
      </Heading>
      {lead ? <p className="max-w-[800px] text-base leading-relaxed text-muted text-pretty md:text-lg">{lead}</p> : null}
    </div>
  )
}
