import { localizedPath } from '@/lib/seo/urls'
import { routing, type Locale, type PageKey } from './routing'

const isPageKey = (p: string): p is PageKey => Object.hasOwn(routing.pathnames, p)

/**
 * URL của cùng trang ở ngôn ngữ `to`, tính thuần từ khoá nội bộ (`usePathname()` của next-intl trả khoá như '/k12'
 * hay '/install/[os]') và params của trang. Trỏ thẳng URL cuối: không qua `/vi/...` rồi chuyển hướng (spec §4.5).
 * Đường dẫn lạ (trang 404) về trang chủ của ngôn ngữ kia.
 */
export function localeHref(pathname: string | null, params: Record<string, string | string[] | undefined>, to: Locale): string {
  if (!pathname || !isPageKey(pathname)) return localizedPath(to, '/')
  const plain = Object.fromEntries(Object.entries(params).filter((e): e is [string, string] => e[0] !== 'locale' && typeof e[1] === 'string'))
  return localizedPath(to, pathname, plain)
}
