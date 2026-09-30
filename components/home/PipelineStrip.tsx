import { useTranslations } from 'next-intl'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { cn } from '@/lib/cn'
import { SectionHead } from './SectionHead'

const STEPS = ['s1', 's2', 's3', 's4', 's5'] as const

export function PipelineStrip() {
  const t = useTranslations('home.pipeline')
  return (
    <Section>
      <Container>
        <SectionHead eyebrow={t('eyebrow')} title={t('h2')} lead={t('caption')} />
        <ol className="mt-8 grid gap-4 md:mt-12 md:grid-cols-5">
          {STEPS.map((s, i) => (
            <li key={s} className={cn('flex flex-col gap-2 rounded-card border bg-card p-5', i === STEPS.length - 1 ? 'border-accent' : 'border-line')}>
              <span className="font-mono text-[13px] font-semibold text-accent-strong">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="text-base leading-snug font-semibold">{t(`${s}.title`)}</h3>
              <p className="text-[14px] leading-relaxed text-ink2">{t(`${s}.desc`)}</p>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  )
}
