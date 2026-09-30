import { useTranslations } from 'next-intl'
import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import type { IconName } from '@/components/ui/icons'
import { Section } from '@/components/ui/Section'
import { Link } from '@/i18n/navigation'
import { SectionHead } from './SectionHead'

const LEVELS: Array<{ key: 'k12' | 'university' | 'program'; href: '/k12' | '/university' | '/program'; icon: IconName }> = [
  { key: 'k12', href: '/k12', icon: 'book' },
  { key: 'university', href: '/university', icon: 'graduation' },
  { key: 'program', href: '/program', icon: 'graph' },
]

export function LevelCards() {
  const t = useTranslations('home.levels')
  const tl = useTranslations('levels')
  return (
    <Section>
      <Container>
        <SectionHead eyebrow={t('eyebrow')} title={t('h2')} lead={t('lead')} />
        <div className="mt-8 grid gap-4 md:mt-12 md:grid-cols-3 md:gap-6">
          {LEVELS.map(({ key, href, icon }) => (
            <div key={key} className="flex flex-col gap-4 rounded-card border border-line bg-card p-6">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-accent-strong">
                <Icon name={icon} size={22} />
              </span>
              <h3 className="font-display text-xl font-bold">{tl(`${key}.card.title`)}</h3>
              <ul className="flex flex-col gap-2">
                {(['p1', 'p2', 'p3'] as const).map((p) => (
                  <li key={p} className="flex items-start gap-2 text-[15px] leading-relaxed text-ink2">
                    <Icon name="check" size={18} className="mt-0.5 shrink-0 text-accent" />
                    {tl(`${key}.card.${p}`)}
                  </li>
                ))}
              </ul>
              <Link href={href} className="mt-auto inline-flex min-h-11 items-center gap-1.5 text-[15px] font-semibold text-accent-strong hover:text-accent md:min-h-0">
                {tl(`${key}.card.link`)}
                <Icon name="arrow-right" size={16} />
              </Link>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  )
}
