import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  // og/: ảnh chia sẻ của bài hướng dẫn (app/og/docs/[slug]) nằm ngoài [locale], không qua next-intl.
  matcher: '/((?!api|_next|_vercel|og/|.*\\..*).*)',
}
