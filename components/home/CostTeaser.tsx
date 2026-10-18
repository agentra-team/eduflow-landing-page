import { useTranslations } from 'next-intl'
import { ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'

export function CostTeaser() {
  const t = useTranslations('home.cost')
  return (
    <Section>
      <Container>
        <div className="flex flex-col items-start gap-5 rounded-card border border-line-faint bg-card p-6 shadow-soft md:flex-row md:items-center md:justify-between md:gap-10 md:p-10">
          <div className="flex max-w-[760px] flex-col gap-3">
            <span className="w-fit rounded-full bg-accent-soft px-3.5 py-1.5 text-[13.5px] font-semibold text-accent">{t('eyebrow')}</span>
            <h2 className="text-[26px] leading-tight font-semibold tracking-[-0.02em] md:text-[32px]">{t('h2')}</h2>
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
