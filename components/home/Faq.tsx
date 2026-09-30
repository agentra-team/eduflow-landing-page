'use client'

import { Icon } from '@/components/ui/Icon'
import { track } from '@/lib/analytics'

export function Faq({ items }: { items: Array<{ id: string; q: string; a: string }> }) {
  return (
    <div className="mx-auto mt-8 max-w-[800px] border-t border-line md:mt-10">
      {items.map(({ id, q, a }, i) => (
        <details
          key={id}
          open={i === 0}
          className="group border-b border-line"
          onToggle={(e) => e.currentTarget.open && track({ name: 'faq_open', id })}
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-[16px] leading-snug font-semibold md:py-5 md:text-[17px] [&::-webkit-details-marker]:hidden">
            {q}
            <Icon name="chevron-down" size={20} className="shrink-0 text-muted transition-transform group-open:rotate-180" />
          </summary>
          <p className="pb-5 text-[15px] leading-relaxed text-ink2 md:pr-11 md:text-[15.5px]">{a}</p>
        </details>
      ))}
    </div>
  )
}
