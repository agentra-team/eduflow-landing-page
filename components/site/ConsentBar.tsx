'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'
import { Link } from '@/i18n/navigation'
import { track } from '@/lib/analytics'
import { consentBannerEnabled } from '@/lib/consent'
import { useConsent } from '@/lib/useConsent'

/** Thanh đồng ý cookie ở đáy trang; chỉ hiện khi chưa chọn. Không chặn tương tác (spec §10). */
export function ConsentBar() {
  const t = useTranslations('consent')
  const [consent, setConsent] = useConsent()
  if (!consentBannerEnabled() || consent !== 'unset') return null
  const choose = (value: 'granted' | 'denied') => {
    setConsent(value)
    track({ name: 'consent_change', value })
  }
  return (
    <div
      role="region"
      aria-label={t('policy')}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-card/95 px-4 py-3.5 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] backdrop-blur"
    >
      <div className="mx-auto flex max-w-[1200px] flex-col gap-3 md:flex-row md:items-center md:gap-6">
        <p className="flex-1 text-[14px] leading-relaxed text-ink2">
          {t('text')}{' '}
          <Link href="/privacy" className="font-semibold text-accent-strong underline underline-offset-2">
            {t('policy')}
          </Link>
        </p>
        <div className="flex gap-2.5">
          <Button size="md" variant="secondary" onClick={() => choose('denied')} className="flex-1 md:flex-none">
            {t('decline')}
          </Button>
          <Button size="md" onClick={() => choose('granted')} className="flex-1 md:flex-none">
            {t('accept')}
          </Button>
        </div>
      </div>
    </div>
  )
}
