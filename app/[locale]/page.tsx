import { useTranslations } from 'next-intl'

export default function HomePage() {
  const t = useTranslations('home.hero')
  return (
    <main id="main" className="flex-1 p-10">
      <h1 className="font-display text-4xl font-bold">{t('h1')}</h1>
    </main>
  )
}
