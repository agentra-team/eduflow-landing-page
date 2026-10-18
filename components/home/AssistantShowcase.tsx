import { useTranslations } from 'next-intl'
import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import type { IconName } from '@/components/ui/icons'
import { Section } from '@/components/ui/Section'
import { WindowFrame } from '@/components/ui/WindowFrame'
import { Link } from '@/i18n/navigation'
import { SectionHead } from './SectionHead'

const POINTS: Array<{ key: 'p1' | 'p2' | 'p3' | 'p4'; icon: IconName }> = [
  { key: 'p1', icon: 'eye' },
  { key: 'p2', icon: 'wallet' },
  { key: 'p3', icon: 'pen' },
  { key: 'p4', icon: 'user-check' },
]

/** Neo #tro-ly là đích của nút phụ ở hero. */
export function AssistantShowcase() {
  const t = useTranslations('home.assistant')
  return (
    <Section id="tro-ly" className="scroll-mt-20 bg-sidebar">
      <Container className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-14">
        <div className="flex flex-col gap-6">
          <SectionHead align="left" eyebrow={t('eyebrow')} title={t('h2')} lead={t('lead')} />
          <ul className="flex flex-col gap-4">
            {POINTS.map(({ key, icon }) => (
              <li key={key} className="flex gap-3.5">
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-card text-accent shadow-card">
                  <Icon name={icon} size={20} />
                </span>
                <div className="flex flex-col gap-1">
                  <b className="text-base">{t(`${key}.title`)}</b>
                  <span className="text-[15px] leading-relaxed text-ink2">{t(`${key}.desc`)}</span>
                </div>
              </li>
            ))}
          </ul>
          <Link href="/assistant" className="inline-flex min-h-11 items-center gap-2 text-[15.5px] font-semibold text-accent hover:text-accent-strong md:min-h-0">
            {t('link')}
            <Icon name="arrow-right" size={18} />
          </Link>
        </div>
        <WindowFrame src="/images/product/result.webp" alt={t('imageAlt')} title={t('windowTitle')} sizes="(min-width: 1024px) 620px, 100vw" />
      </Container>
    </Section>
  )
}
