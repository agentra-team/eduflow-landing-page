import { getLocale, getTranslations } from 'next-intl/server'
import { DOCS, docHref, docsByGroup } from '@/content/docs'
import type { DocId } from '@/content/docs/slugs'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { cn } from '@/lib/cn'

/** Thanh bên theo nhóm; bài đang đọc có aria-current. Màn hẹp: gói trong <details> (không cần JavaScript). */
export async function DocsNav({ current }: { current?: DocId }) {
  const locale = (await getLocale()) as Locale
  const t = await getTranslations('docs')
  const list = (
    <div className="flex flex-col gap-5">
      {docsByGroup().map(({ group, ids }) => (
        <div key={group} className="flex flex-col gap-1.5">
          <p className="text-[12.5px] font-semibold tracking-[0.5px] text-muted uppercase">{t(`groups.${group}`)}</p>
          <ul className="flex flex-col">
            {ids.map((id) => (
              <li key={id}>
                <Link
                  href={docHref(locale, id)}
                  aria-current={id === current ? 'page' : undefined}
                  className={cn(
                    'flex min-h-11 items-center border-l-2 py-1.5 pl-3 text-[14.5px] leading-snug md:min-h-0',
                    id === current ? 'border-accent font-semibold text-ink' : 'border-transparent text-ink2 hover:text-ink',
                  )}
                >
                  {DOCS[id][locale].title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
  return (
    <nav aria-label={t('nav')}>
      <details className="rounded-card border border-line bg-card px-4 py-2 lg:hidden">
        <summary className="flex min-h-11 cursor-pointer items-center font-semibold">{t('nav')}</summary>
        <div className="pt-2 pb-3">{list}</div>
      </details>
      <div className="hidden lg:sticky lg:top-24 lg:block">{list}</div>
    </nav>
  )
}
