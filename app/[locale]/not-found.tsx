import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

export default function NotFoundPage() {
  const t = useTranslations('notFound')
  return (
    <main id="main" className="flex-1 mx-auto flex max-w-[1200px] flex-col items-start gap-4 px-4 py-24">
      <h1 className="text-4xl font-bold">{t('title')}</h1>
      <p className="text-ink2">{t('body')}</p>
      <div className="flex gap-3">
        <Link href="/" className="rounded-control bg-accent px-5 py-3 font-semibold text-white">
          {t('home')}
        </Link>
        <Link href="/download" className="rounded-control border border-line bg-card px-5 py-3 font-semibold">
          {t('download')}
        </Link>
      </div>
    </main>
  )
}
