'use client'

import { useTranslations } from 'next-intl'
import { useEffect } from 'react'

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations('error')
  const tc = useTranslations('common')
  useEffect(() => {
    console.error(error)
  }, [error])
  return (
    <main id="main" className="flex-1 mx-auto flex max-w-[1200px] flex-col items-start gap-4 px-4 py-24">
      <h1 className="text-4xl font-bold">{t('title')}</h1>
      <p className="text-ink2">{t('body')}</p>
      <button type="button" onClick={reset} className="rounded-control bg-accent px-5 py-3 font-semibold text-white">
        {tc('retry')}
      </button>
    </main>
  )
}
