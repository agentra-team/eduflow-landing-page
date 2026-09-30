import type { Metadata, Viewport } from 'next'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { Be_Vietnam_Pro, Fraunces, JetBrains_Mono } from 'next/font/google'
import { notFound } from 'next/navigation'
import { AnalyticsGate } from '@/components/site/AnalyticsGate'
import { ConsentBar } from '@/components/site/ConsentBar'
import { Footer } from '@/components/site/Footer'
import { Header } from '@/components/site/Header'
import { SkipLink } from '@/components/site/SkipLink'
import { routing } from '@/i18n/routing'
import { site } from '@/lib/site'
import '@/app/globals.css'

// ROOT layout (không có app/layout.tsx) để `locale` là root param, đọc được khi render tĩnh (next-intl 4, Next 16.3).
const sans = Be_Vietnam_Pro({ subsets: ['latin', 'vietnamese'], weight: ['400', '600', '700'], variable: '--font-be-vietnam', display: 'swap' })
const display = Fraunces({ subsets: ['latin', 'vietnamese'], weight: ['600', '700'], variable: '--font-fraunces', display: 'swap' })
const mono = JetBrains_Mono({ subsets: ['latin', 'vietnamese'], weight: ['400', '600'], variable: '--font-jetbrains', display: 'swap' })

export const dynamicParams = false
export const viewport: Viewport = { themeColor: '#237A31', width: 'device-width', initialScale: 1 }

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  const t = await getTranslations({ locale, namespace: 'common' })
  const verification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
  return {
    metadataBase: new URL(site.siteUrl()),
    title: { default: t('siteName'), template: `%s · ${t('siteName')}` },
    description: t('tagline'),
    applicationName: t('siteName'),
    robots: { index: true, follow: true },
    ...(verification ? { verification: { google: verification } } : {}),
  }
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  return (
    <html lang={locale} data-scroll-behavior="smooth" className={`${sans.variable} ${display.variable} ${mono.variable}`}>
      <body className="flex min-h-dvh flex-col bg-page font-sans text-ink antialiased">
        <NextIntlClientProvider>
          <SkipLink />
          <Header />
          {children}
          <Footer />
          <ConsentBar />
          <AnalyticsGate gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
