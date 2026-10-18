import { getTranslations } from 'next-intl/server'
import type { TocItem } from '@/lib/docs/toc'

/** Mục lục trong bài. `inline`: đầu bài trên màn hẹp, thu trong <details>. `aside`: cột phải từ 1024 px. */
export async function DocsToc({ items, variant }: { items: TocItem[]; variant: 'inline' | 'aside' }) {
  const t = await getTranslations('docs')
  if (!items.length) return null
  const list = (
    <ol className="flex flex-col gap-0.5 border-l border-line">
      {items.map((item) => (
        <li key={item.id}>
          <a href={`#${item.id}`} className="flex min-h-11 items-center border-l-2 border-transparent py-1.5 pl-3 text-[14px] leading-snug text-ink2 hover:border-accent hover:text-ink md:min-h-0">
            {item.label}
          </a>
        </li>
      ))}
    </ol>
  )
  if (variant === 'inline') {
    return (
      <nav aria-label={t('toc')} className="lg:hidden">
        <details className="rounded-card border border-line bg-card px-4 py-2">
          <summary className="flex min-h-11 cursor-pointer items-center font-semibold">{t('toc')}</summary>
          <div className="pt-2 pb-3">{list}</div>
        </details>
      </nav>
    )
  }
  return (
    <nav aria-label={t('toc')} className="hidden lg:sticky lg:top-24 lg:flex lg:flex-col lg:gap-3">
      <span className="pl-3 text-[12.5px] font-semibold tracking-[0.5px] text-muted uppercase">{t('toc')}</span>
      {list}
    </nav>
  )
}
