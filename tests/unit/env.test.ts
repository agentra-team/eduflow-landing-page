import { expect, test } from 'vitest'
import { assertProductionEnv } from '@/lib/env'

test('production builds need NEXT_PUBLIC_SITE_URL, other builds do not', () => {
  expect(() => assertProductionEnv({ VERCEL_ENV: 'production', NEXT_PUBLIC_SITE_URL: '' })).toThrow(/NEXT_PUBLIC_SITE_URL/)
  expect(() => assertProductionEnv({ VERCEL_ENV: 'production', NEXT_PUBLIC_SITE_URL: 'https://x.test' })).not.toThrow()
  expect(() => assertProductionEnv({ VERCEL_ENV: 'preview' })).not.toThrow()
  expect(() => assertProductionEnv({})).not.toThrow()
})
