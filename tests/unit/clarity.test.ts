import { expect, test } from 'vitest'
import { CLARITY_PROJECT_ID, clarityProjectId, claritySnippet } from '@/lib/clarity'

test('only a production build uses the real Clarity project; dev and preview load nothing', () => {
  expect(clarityProjectId({ VERCEL_ENV: 'production' })).toBe(CLARITY_PROJECT_ID)
  expect(clarityProjectId({ VERCEL_ENV: 'preview' })).toBeUndefined()
  expect(clarityProjectId({})).toBeUndefined()
})

test('NEXT_PUBLIC_CLARITY_PROJECT_ID overrides the real id, so e2e never sends sessions to the real project', () => {
  expect(clarityProjectId({ NEXT_PUBLIC_CLARITY_PROJECT_ID: ' clarity-test ', VERCEL_ENV: 'production' })).toBe('clarity-test')
  expect(clarityProjectId({ NEXT_PUBLIC_CLARITY_PROJECT_ID: '  ', VERCEL_ENV: 'production' })).toBe(CLARITY_PROJECT_ID)
})

test('the snippet loads the tag of the given project and grants analytics storage only, never ad storage', () => {
  const s = claritySnippet('abc123')
  expect(s).toContain('"https://www.clarity.ms/tag/"+i')
  expect(s).toContain('"clarity","script","abc123")')
  expect(s).toContain('consentv2",{ad_Storage:"denied",analytics_Storage:"granted"}')
})
