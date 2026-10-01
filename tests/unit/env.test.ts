import { expect, test } from 'vitest'
import { assertProductionEnv } from '@/lib/env'

const production = (url?: string) => ({ VERCEL_ENV: 'production', NEXT_PUBLIC_SITE_URL: url })

test('production builds need NEXT_PUBLIC_SITE_URL, other builds do not', () => {
  expect(() => assertProductionEnv({ VERCEL_ENV: 'production', NEXT_PUBLIC_SITE_URL: '' })).toThrow(/NEXT_PUBLIC_SITE_URL/)
  expect(() => assertProductionEnv({ VERCEL_ENV: 'production', NEXT_PUBLIC_SITE_URL: 'https://x.test' })).not.toThrow()
  expect(() => assertProductionEnv({ VERCEL_ENV: 'preview' })).not.toThrow()
  expect(() => assertProductionEnv({})).not.toThrow()
})

test('production says the variable must be set when it is missing or blank', () => {
  expect(() => assertProductionEnv(production())).toThrow(/phải được đặt/)
  expect(() => assertProductionEnv(production('   '))).toThrow(/phải được đặt/)
})

test.each(['eduflow.vn', 'http://localhost:3000', 'http://127.0.0.1:3000', 'http://[::1]:3000', 'http://app.localhost', 'ftp://x.test'])(
  'production rejects %s as the site URL',
  (url) => {
    expect(() => assertProductionEnv(production(url))).toThrow(/URL http\(s\) đầy đủ/)
  },
)

test('production accepts a real URL, even with whitespace around it; preview accepts localhost', () => {
  expect(() => assertProductionEnv(production('  https://x.test\n'))).not.toThrow()
  expect(() => assertProductionEnv(production('https://x.test'))).not.toThrow()
  expect(() => assertProductionEnv({ VERCEL_ENV: 'preview', NEXT_PUBLIC_SITE_URL: 'http://localhost:3000' })).not.toThrow()
})
