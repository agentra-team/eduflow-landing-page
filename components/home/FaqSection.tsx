import { useTranslations } from 'next-intl'
import { HOME_FAQ_KEYS } from '@/content/home'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { Faq } from './Faq'
import { SectionHead } from './SectionHead'

export function faqItems(t: (key: string) => string) {
  return HOME_FAQ_KEYS.map((id) => ({
    id,
    q: t(`${id}.q`),
    a: t(`${id}.a`),
    // Câu 10 dẫn tới trang so sánh (spec §6.12); anchor là tên trang đó.
    ...(id === 'q10' ? { link: { href: '/vs-chatgpt' as const, label: t('q10.link') } } : {}),
  }))
}

export function FaqSection() {
  const t = useTranslations('home.faq')
  return (
    <Section className="bg-sidebar">
      <Container>
        <SectionHead eyebrow={t('eyebrow')} title={t('h2')} />
        <Faq items={faqItems((k) => t(k as Parameters<typeof t>[0]))} />
      </Container>
    </Section>
  )
}
