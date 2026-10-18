import { useTranslations } from 'next-intl'
import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import type { IconName } from '@/components/ui/icons'
import { Section } from '@/components/ui/Section'
import { Link } from '@/i18n/navigation'
import { SectionHead } from './SectionHead'

// Ô icon mỗi cấp một màu nhấn của Figma: chữ đúng màu nhấn trên nền nhạt cùng màu (spec blue retheme §4.3).
const LEVELS: Array<{ key: 'k12' | 'university' | 'program'; href: '/k12' | '/university' | '/program'; icon: IconName; tile: string }> = [
  { key: 'k12', href: '/k12', icon: 'book', tile: 'bg-accent-soft text-accent' },
  { key: 'university', href: '/university', icon: 'graduation', tile: 'bg-teal-soft text-teal-text' },
  { key: 'program', href: '/program', icon: 'graph', tile: 'bg-coral-soft text-coral' },
]

export function LevelCards() {
  const t = useTranslations('home.levels')
  const tl = useTranslations('levels')
  return (
    <Section>
      <Container>
        <SectionHead eyebrow={t('eyebrow')} title={t('h2')} lead={t('lead')} />
        <div className="mt-8 grid gap-4 md:mt-12 md:grid-cols-3 md:gap-6">
          {LEVELS.map(({ key, href, icon, tile }) => (
            <div key={key} className="flex flex-col gap-4 rounded-card border border-line-faint bg-card p-6 shadow-card md:p-7">
              <span className={`inline-flex h-12 w-12 items-center justify-center rounded-[14px] ${tile}`}>
                <Icon name={icon} size={22} />
              </span>
              <h3 className="text-xl font-semibold tracking-[-0.01em]">{tl(`${key}.card.title`)}</h3>
              <ul className="flex flex-col gap-2">
                {(['p1', 'p2', 'p3'] as const).map((p) => (
                  <li key={p} className="flex items-start gap-2 text-[15px] leading-relaxed text-ink2">
                    <Icon name="check" size={18} strokeWidth={2.2} className="mt-0.5 shrink-0 text-green-text" />
                    {tl(`${key}.card.${p}`)}
                  </li>
                ))}
              </ul>
              <Link href={href} className="mt-auto inline-flex min-h-11 items-center gap-1.5 text-[15px] font-semibold text-accent hover:text-accent-strong md:min-h-0">
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
