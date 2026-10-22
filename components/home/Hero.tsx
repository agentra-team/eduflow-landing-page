import { useTranslations } from 'next-intl'
import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import type { IconName } from '@/components/ui/icons'
import { WindowFrame } from '@/components/ui/WindowFrame'
import { HOME_FACTS } from '@/content/home'
import type { ReleaseAsset } from '@/lib/releases/types'
import { HeroCta } from './HeroCta'

/** Tách tiêu đề quanh cụm chữ tô xanh (`h1Accent`, phải nằm nguyên văn trong `h1`); không có thì in nguyên câu. */
export function splitAccent(h1: string, accent: string): [string, string, string] | null {
  const at = accent ? h1.indexOf(accent) : -1
  return at < 0 ? null : [h1.slice(0, at), accent, h1.slice(at + accent.length)]
}

/** Dải 4 dữ kiện: số lấy từ app-facts (HOME_FACTS), nhãn ở messages `home.facts`. Nền tảng không có số, hiện icon máy tính. */
const FACTS: Array<{ key: 'levels' | 'versions' | 'local' | 'platforms'; num?: number; icon?: IconName; tone: string }> = [
  { key: 'levels', num: HOME_FACTS.levels, tone: 'text-accent' },
  { key: 'versions', num: HOME_FACTS.versions, tone: 'text-teal-text' },
  { key: 'local', num: HOME_FACTS.localCost, tone: 'text-coral' },
  { key: 'platforms', icon: 'laptop', tone: 'text-ink' },
]

/** Phần đầu trang chủ theo bảng LandingHero (spec blue retheme §4.5): chip nhãn, h1 có một cụm xanh, hai nút, ba dấu tích, ảnh app có thẻ nổi, dải dữ kiện. */
export function Hero({ assets }: { assets: ReleaseAsset[] }) {
  const t = useTranslations('home.hero')
  const tf = useTranslations('home.facts')
  const tt = useTranslations('home.trust')
  const trust = [t('trust1'), t('trust2'), t('trust3')]
  const h1 = splitAccent(t('h1'), t('h1Accent'))
  return (
    <section className="overflow-hidden bg-card pt-8 pb-14 md:pt-14 md:pb-20">
      <Container className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)] lg:gap-14">
        <div className="flex min-w-0 flex-col gap-6">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-accent-soft px-4 py-2 text-[14px] font-semibold text-accent">
            <Icon name="monitor" size={16} strokeWidth={2} className="shrink-0" />
            {t('eyebrow')}
          </span>
          <h1 className="text-[34px] leading-[1.14] font-semibold tracking-[-0.025em] text-pretty md:text-[46px] xl:text-[52px] xl:leading-[1.12]">
            {h1 ? (
              <>
                {h1[0]}
                <span className="text-accent">{h1[1]}</span>
                {h1[2]}
              </>
            ) : (
              t('h1')
            )}
          </h1>
          <p className="max-w-[580px] text-base leading-relaxed text-muted text-pretty md:text-[18px] md:leading-[1.65]">{t('sub')}</p>
          <HeroCta
            assets={assets}
            labels={{ default: t('ctaDefault'), mac: t('ctaMac'), windows: t('ctaWindows'), prelaunch: t('ctaPrelaunch'), secondary: t('cta2') }}
          />
          <p className="-mt-2 text-[13.5px] text-muted">{t('platformNote')}</p>
          <ul className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-x-6">
            {trust.map((item) => (
              <li key={item} className="inline-flex items-center gap-2 text-[15px] text-muted">
                <span className="inline-flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-green-soft text-green-text">
                  <Icon name="check" size={13} strokeWidth={3.2} />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative min-w-0 pt-6 pb-8 sm:px-6">
          <div aria-hidden="true" className="absolute inset-y-0 right-0 left-10 rounded-lg bg-accent-soft" />
          <WindowFrame
            src="/images/product/assistant-home.webp"
            alt={t('imageAlt')}
            title={t('windowTitle')}
            width={2000}
            height={1250}
            priority
            sizes="(min-width: 1200px) 620px, (min-width: 1024px) 52vw, 100vw"
            className="relative sm:ml-10"
          />
          <div aria-hidden="true" className="absolute bottom-0 left-0 hidden items-center gap-3 rounded-lg bg-card px-4 py-3 shadow-float sm:flex">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-coral text-white">
              <Icon name="file" size={20} strokeWidth={1.8} />
            </span>
            <span className="flex flex-col gap-0.5">
              <span className="text-[14px] font-semibold">{HOME_FACTS.versions}</span>
              <span className="text-[12px] text-muted">{tf('versions')}</span>
            </span>
          </div>
          <div aria-hidden="true" className="absolute top-0 right-0 hidden items-center gap-2.5 rounded-lg bg-card px-3.5 py-2.5 shadow-float sm:flex">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-teal-soft text-teal-text">
              <Icon name="shield" size={18} strokeWidth={2} />
            </span>
            <span className="text-[13px] font-semibold">{tt('t1.title')}</span>
          </div>
        </div>
      </Container>

      <Container className="mt-12 md:mt-16">
        <ul className="grid gap-5 rounded-lg bg-sidebar p-6 sm:grid-cols-2 md:p-7 lg:grid-cols-4">
          {FACTS.map(({ key, num, icon, tone }) => (
            <li key={key} className="flex flex-col gap-1.5 px-1 md:px-2">
              {icon ? (
                <span className={`flex h-12 items-center ${tone}`}>
                  <Icon name={icon} size={40} strokeWidth={1.7} />
                </span>
              ) : (
                <span className={`text-[40px] leading-[1.2] font-semibold tracking-[-0.02em] ${tone}`}>{num}</span>
              )}
              <span className="text-[14px] leading-normal text-muted">{tf(key)}</span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
