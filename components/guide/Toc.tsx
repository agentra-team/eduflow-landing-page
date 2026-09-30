import { useTranslations } from 'next-intl'

export function Toc({ items }: { items: Array<{ id: string; label: string }> }) {
  const t = useTranslations('install')
  return (
    <nav aria-label={t('tocTitle')} className="flex flex-col gap-3 lg:sticky lg:top-24">
      <span className="pl-3 text-[12.5px] font-bold tracking-[0.5px] text-muted uppercase">{t('tocTitle')}</span>
      <ol className="flex flex-col gap-0.5 border-l border-line">
        {items.map((item, i) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="flex gap-2.5 border-l-2 border-transparent py-3.5 md:py-1.5 pl-3 text-[14.5px] leading-snug font-normal text-ink2 hover:border-accent hover:text-ink"
            >
              <span className="text-muted tabular-nums">{i + 1}.</span>
              {item.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
