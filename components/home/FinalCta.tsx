import { useTranslations } from 'next-intl'
import { CtaBand } from '@/components/ui/CtaBand'

export function FinalCta() {
  const t = useTranslations('home.cta')
  return <CtaBand title={t('h2')} sub={t('sub')} primary={{ href: '/download', label: t('b1') }} secondary={{ href: '/contact', label: t('b2') }} />
}
