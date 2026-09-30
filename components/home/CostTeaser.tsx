import { useTranslations } from 'next-intl'
import { ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'

export function CostTeaser() {
  const t = useTranslations('home.cost')
  return (
    <Section>
      <Container>
        <div className="flex flex-col items-start gap-5 rounded-card border border-accent-line bg-card p-6 md:flex-row md:items-center md:justify-between md:gap-10 md:p-10">
          <div className="flex max-w-[760px] flex-col gap-3">
            <span className="text-[13px] font-bold tracking-[0.6px] text-accent-strong uppercase">{t('eyebrow')}</span>
            <h2 className="font-display text-[26px] leading-tight font-bold md:text-[32px]">{t('h2')}</h2>
            <p className="text-[15.5px] leading-relaxed text-ink2">{t('body')}</p>
          </div>
          <ButtonLink href="/pricing" variant="secondary" icon="arrow-right" iconAfter>
            {t('link')}
          </ButtonLink>
        </div>
      </Container>
    </Section>
  )
}
