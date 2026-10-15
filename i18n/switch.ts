import { DOC_SLUGS, docIdFromSlug } from '@/content/docs/slugs'
import { localizedPath } from '@/lib/seo/urls'
import { routing, type Locale, type PageKey } from './routing'

type Params = Record<string, string | string[] | undefined>

const KEYS = Object.keys(routing.pathnames) as PageKey[]
const isPageKey = (p: string): p is PageKey => Object.hasOwn(routing.pathnames, p)

/**
 * Khoá trang của `pathname`. Trên trình duyệt, `usePathname()` của next-intl trả khoá ('/docs/[slug]'). Lúc prerender, trang
 * tiếng Việt không biết URL đã rewrite nên nó trả đường dẫn nội bộ đã điền params ('/docs/cai-dat-macos'): tìm khoá động mà
 * params điền vào ra đúng chuỗi đó, để HTML tĩnh và trình duyệt cùng một href.
 */
function pageKeyOf(pathname: string, params: Params): PageKey | undefined {
  if (isPageKey(pathname)) return pathname
  // Thiếu param thì điền ký tự NUL, không đường dẫn nào chứa nó, nên khoá đó không khớp.
  const fill = (key: string) => key.replace(/\[(\w+)\]/g, (_, name: string) => (typeof params[name] === 'string' ? params[name] : '\0'))
  return KEYS.find((key) => key.includes('[') && fill(key) === pathname)
}

/**
 * URL của cùng trang ở ngôn ngữ `to`, tính thuần từ khoá nội bộ và params của trang. Trỏ thẳng URL cuối, không qua `/vi/...`
 * (spec §4.5). Bài hướng dẫn có slug khác nhau giữa hai ngôn ngữ nên dịch qua DOC_SLUGS; slug lạ về mục lục hướng dẫn, đường
 * dẫn lạ về trang chủ.
 */
export function localeHref(pathname: string | null, params: Params, from: Locale, to: Locale): string {
  const key = pathname ? pageKeyOf(pathname, params) : undefined
  if (!key) return localizedPath(to, '/')
  if (key === '/docs/[slug]') {
    const id = typeof params.slug === 'string' ? docIdFromSlug(from, params.slug) : undefined
    return id ? localizedPath(to, '/docs/[slug]', { slug: DOC_SLUGS[id][to] }) : localizedPath(to, '/docs')
  }
  const plain = Object.fromEntries(Object.entries(params).filter((e): e is [string, string] => e[0] !== 'locale' && typeof e[1] === 'string'))
  return localizedPath(to, key, plain)
}
