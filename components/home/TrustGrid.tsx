import { useTranslations } from 'next-intl'
import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import type { IconName } from '@/components/ui/icons'
import { Section } from '@/components/ui/Section'
import { Link } from '@/i18n/navigation'
import { SectionHead } from './SectionHead'

const ITEMS: Array<{ key: 't1' | 't2' | 't3' | 't4' | 't5' | 't6'; icon: IconName }> = [
  { key: 't1', icon: 'laptop' },
  { key: 't2', icon: 'layers' },
  { key: 't3', icon: 'shield' },
  { key: 't4', icon: 'lock' },
  { key: 't5', icon: 'wifi-off' },
  { key: 't6', icon: 'wallet' },
]

export function TrustGrid() {
  const t = useTranslations('home.trust')
  return (
    <Section className="bg-sidebar">
      <Container>
        <SectionHead eyebrow={t('eyebrow')} title={t('h2')} />
        <div className="mt-8 grid gap-3 md:mt-12 md:grid-cols-3 md:gap-6">
          {ITEMS.map(({ key, icon }) => (
            <div key={key} className="flex flex-col gap-2.5 rounded-card bg-card p-5 shadow-card md:gap-3.5 md:p-7">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-accent-soft text-accent">
                <Icon name={icon} size={22} />
              </span>
              <h3 className="text-[17px] leading-snug font-semibold md:text-lg">{t(`${key}.title`)}</h3>
              <p className="text-[14.5px] leading-relaxed text-ink2 md:text-[15px]">{t(`${key}.desc`)}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 flex md:mt-8 md:justify-center">
          <Link href="/ai-transparency" className="inline-flex min-h-11 items-center gap-2 text-[15.5px] font-semibold text-accent hover:text-accent-strong md:min-h-0">
            {t('link')}
            <Icon name="arrow-right" size={18} />
          </Link>
        </div>
      </Container>
    </Section>
  )
}
