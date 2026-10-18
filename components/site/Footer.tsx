import { useLocale, useTranslations } from 'next-intl'
import { Container } from '@/components/ui/Container'
import { Logo } from '@/components/ui/Logo'
import { DOCS, QUICK_START, docHref } from '@/content/docs'
import { TOPIC_IDS, topicCopy, topicPage } from '@/content/topics'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { pageName } from '@/lib/seo/pages'
import { site } from '@/lib/site'
import { LocaleSwitcher } from './LocaleSwitcher'

// Trên điện thoại mỗi link cao tối thiểu 44 px (spec §8.3).
const linkClass = 'inline-flex min-h-11 items-center text-[15px] text-ink2 transition-colors hover:text-ink md:min-h-0'

export function Footer() {
  const t = useTranslations('footer')
  const tn = useTranslations('nav')
  const locale = useLocale() as Locale
  return (
    <footer className="border-t border-line bg-sidebar pt-14 pb-8 md:pt-16">
      <Container>
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.3fr_repeat(5,minmax(0,1fr))] lg:gap-8">
          <div className="flex max-w-[340px] flex-col gap-4 sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex min-h-11 items-center md:min-h-0">
              <Logo height={30} />
            </Link>
            <p className="text-[15px] leading-relaxed text-ink2">{t('tagline')}</p>
            <p className="text-sm text-muted">
              {site.company} · {site.city[locale]}, {site.country[locale]} · {site.email}
            </p>
          </div>
          <FooterColumn title={t('product')}>
            <Link href="/k12" className={linkClass}>{pageName(locale, '/k12')}</Link>
            <Link href="/university" className={linkClass}>{pageName(locale, '/university')}</Link>
            <Link href="/program" className={linkClass}>{pageName(locale, '/program')}</Link>
            <Link href="/assistant" className={linkClass}>{pageName(locale, '/assistant')}</Link>
            <Link href="/pricing" className={linkClass}>{pageName(locale, '/pricing')}</Link>
            <Link href="/download" className={linkClass}>{pageName(locale, '/download')}</Link>
          </FooterColumn>
          <FooterColumn title={t('solutions')}>
            {TOPIC_IDS.map((id) => (
              <Link key={id} href={topicPage(id)} className={linkClass}>{topicCopy(locale, id).name}</Link>
            ))}
          </FooterColumn>
          <FooterColumn title={t('guides')}>
            {QUICK_START.map((id) => (
              <Link key={id} href={docHref(locale, id)} className={linkClass}>{DOCS[id][locale].title}</Link>
            ))}
            <Link href="/docs" className={linkClass}>{t('allDocs')}</Link>
          </FooterColumn>
          <FooterColumn title={t('trust')}>
            <Link href="/ai-transparency" className={linkClass}>{tn('transparency')}</Link>
            <Link href="/privacy" className={linkClass}>{t('privacy')}</Link>
          </FooterColumn>
          <FooterColumn title={t('company')}>
            <a href={site.companyUrl} className={linkClass} rel="noopener">{site.company}</a>
            <Link href="/contact" className={linkClass}>{tn('contact')}</Link>
            <a href={`mailto:${site.email}`} className={`${linkClass} break-all`}>{site.email}</a>
          </FooterColumn>
        </div>
        <div className="mt-12 flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-[13.5px] text-muted">{t('copyright', { year: 2026 })}</span>
          <LocaleSwitcher />
        </div>
      </Container>
    </footer>
  )
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 md:gap-3">
      <p className="text-[13px] font-semibold tracking-[0.5px] text-muted uppercase">{title}</p>
      {children}
    </div>
  )
}
