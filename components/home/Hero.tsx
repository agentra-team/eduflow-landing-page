import { useTranslations } from 'next-intl'
import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import { WindowFrame } from '@/components/ui/WindowFrame'
import type { ReleaseAsset } from '@/lib/releases/types'
import { HeroCta } from './HeroCta'

export function Hero({ assets }: { assets: ReleaseAsset[] }) {
  const t = useTranslations('home.hero')
  const trust = [t('trust1'), t('trust2'), t('trust3')]
  return (
    <section className="overflow-hidden bg-[radial-gradient(1000px_480px_at_50%_-60px,#E8F3E7_0%,rgba(232,243,231,0)_70%)] pt-10 md:pt-20">
      <Container className="flex flex-col items-center gap-5 text-center">
        <span className="text-[13px] font-bold tracking-[0.6px] text-accent-strong uppercase">{t('eyebrow')}</span>
        <h1 className="max-w-[980px] font-display text-[34px] leading-[1.12] font-bold tracking-[-0.02em] text-balance md:text-[56px] md:leading-[1.08]">
          {t('h1')}
        </h1>
        <p className="max-w-[780px] text-base leading-relaxed text-ink2 text-pretty md:text-[19px]">{t('sub')}</p>
        <HeroCta
          assets={assets}
          labels={{ default: t('ctaDefault'), mac: t('ctaMac'), windows: t('ctaWindows'), prelaunch: t('ctaPrelaunch'), secondary: t('cta2') }}
        />
        <p className="text-[13.5px] text-muted">{t('platformNote')}</p>
        <ul className="flex flex-col gap-2 sm:flex-row sm:gap-7">
          {trust.map((item) => (
            <li key={item} className="inline-flex items-center gap-2 text-[14.5px] text-ink2">
              <Icon name="check" size={18} strokeWidth={2} className="text-accent" />
              {item}
            </li>
          ))}
        </ul>
      </Container>
      <div className="mx-auto mt-10 w-[calc(100%-32px)] max-w-[1080px] md:mt-14">
        <WindowFrame
          src="/images/product/assistant-home.webp"
          alt={t('imageAlt')}
          title={t('windowTitle')}
          width={2000}
          height={1250}
          priority
          sizes="(min-width: 1120px) 1078px, 100vw"
          className="rounded-b-none border-b-0"
        />
      </div>
    </section>
  )
}
