import createMDX from '@next/mdx'
import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'X-Frame-Options', value: 'DENY' },
]

const nextConfig: NextConfig = {
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }]
  },
}

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')
const withMDX = createMDX({ options: { remarkPlugins: ['remark-gfm'] } })

export default withNextIntl(withMDX(nextConfig))
