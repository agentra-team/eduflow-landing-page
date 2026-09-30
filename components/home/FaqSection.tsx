import { useTranslations } from 'next-intl'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { Faq } from './Faq'
import { SectionHead } from './SectionHead'

export const FAQ_KEYS = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8'] as const

export function faqItems(t: (key: string) => string) {
  return FAQ_KEYS.map((id) => ({ id, q: t(`${id}.q`), a: t(`${id}.a`) }))
}

export function FaqSection() {
  const t = useTranslations('home.faq')
  return (
    <Section className="border-t border-line bg-card">
      <Container>
        <SectionHead eyebrow={t('eyebrow')} title={t('h2')} />
        <Faq items={faqItems((k) => t(k as Parameters<typeof t>[0]))} />
      </Container>
    </Section>
  )
}
