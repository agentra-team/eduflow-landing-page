import { getLocale, getTranslations } from 'next-intl/server'
import { Icon } from '@/components/ui/Icon'
import { DOCS, docHref, docsInOrder } from '@/content/docs'
import type { DocId } from '@/content/docs/slugs'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'

/** Bài trước, bài sau theo thứ tự đọc của sổ. */
export async function DocsPager({ current }: { current: DocId }) {
  const locale = (await getLocale()) as Locale
  const t = await getTranslations('docs')
  const order = docsInOrder()
  const i = order.indexOf(current)
  const prev = order[i - 1]
  const next = order[i + 1]
  const card = 'flex min-h-11 flex-1 flex-col gap-1 rounded-card border border-line bg-card p-4 hover:border-muted'
  return (
    <nav aria-label={`${t('prev')} · ${t('next')}`} className="flex flex-col gap-3 sm:flex-row">
      {prev ? (
        <Link href={docHref(locale, prev)} className={card}>
          <span className="inline-flex items-center gap-1 text-[13px] text-muted"><Icon name="arrow-left" size={14} />{t('prev')}</span>
          <span className="font-semibold">{DOCS[prev][locale].title}</span>
        </Link>
      ) : <span className="flex-1" />}
      {next ? (
        <Link href={docHref(locale, next)} className={`${card} sm:items-end sm:text-right`}>
          <span className="inline-flex items-center gap-1 text-[13px] text-muted">{t('next')}<Icon name="arrow-right" size={14} /></span>
          <span className="font-semibold">{DOCS[next][locale].title}</span>
        </Link>
      ) : null}
    </nav>
  )
}
