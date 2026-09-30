import { expect, test } from 'vitest'
import { consentBannerEnabled, readConsent, writeConsent } from '@/lib/consent'

test('read/write round trip and robustness', () => {
  const store = new Map<string, string>()
  const storage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => {
      store.set(k, v)
    },
  }
  expect(readConsent(storage)).toBe('unset')
  writeConsent(storage, 'granted')
  expect(readConsent(storage)).toBe('granted')
  expect(JSON.parse(store.get('eduflow.consent')!)).toMatchObject({ value: 'granted' })
  writeConsent(storage, 'denied')
  expect(readConsent(storage)).toBe('denied')
  store.set('eduflow.consent', '{broken')
  expect(readConsent(storage)).toBe('unset')
  store.set('eduflow.consent', JSON.stringify({ value: 'maybe' }))
  expect(readConsent(storage)).toBe('unset')
  expect(readConsent(null)).toBe('unset')
  expect(() => writeConsent(null, 'denied')).not.toThrow()
  const throwing = {
    getItem: () => {
      throw new Error('blocked')
    },
    setItem: () => {
      throw new Error('blocked')
    },
  }
  expect(readConsent(throwing)).toBe('unset')
  expect(() => writeConsent(throwing, 'granted')).not.toThrow()
})

test('banner flag', () => {
  expect(consentBannerEnabled('off')).toBe(false)
  expect(consentBannerEnabled('OFF ')).toBe(false)
  expect(consentBannerEnabled('on')).toBe(true)
  expect(consentBannerEnabled(undefined)).toBe(true)
})
