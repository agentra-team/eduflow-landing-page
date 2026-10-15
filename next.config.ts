import createMDX from '@next/mdx'
import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'
import { assertProductionEnv } from './lib/env'
import { headerRules, redirectRules } from './lib/next-routes'

assertProductionEnv(process.env)

const nextConfig: NextConfig = {
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
  // Next 16.3 bật optimisticRouting mặc định: nó đoán sai tuyến của slug tiếng Anh do proxy rewrite và gửi lại yêu cầu _rsc không ngừng (vercel/next.js#96893). Bỏ dòng này khi bản sửa của Next ra.
  experimental: { optimisticRouting: false },
  async redirects() {
    return redirectRules(process.env)
  },
  async headers() {
    return headerRules(process.env)
  },
}

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')
const withMDX = createMDX({ options: { remarkPlugins: ['remark-gfm'] } })

export default withNextIntl(withMDX(nextConfig))
