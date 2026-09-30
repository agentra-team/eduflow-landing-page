import { hasLocale } from 'next-intl'
import { getRequestConfig } from 'next-intl/server'
import { notFound } from 'next/navigation'
import * as rootParams from 'next/root-params'
import { routing } from './routing'

// Next 16.3: đọc locale từ root params → trang render tĩnh, không cần setRequestLocale.
export default getRequestConfig(async ({ locale }) => {
  if (!locale) {
    const value = await rootParams.locale()
    if (hasLocale(routing.locales, value)) locale = value
    else notFound()
  }
  return { locale, messages: (await import(`../messages/${locale}.json`)).default }
})
