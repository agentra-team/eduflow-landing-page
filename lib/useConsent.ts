'use client'

import { useCallback, useSyncExternalStore } from 'react'
import { CONSENT_EVENT, readConsent, writeConsent, type Consent } from './consent'

const subscribe = (cb: () => void) => {
  window.addEventListener(CONSENT_EVENT, cb)
  window.addEventListener('storage', cb)
  return () => {
    window.removeEventListener(CONSENT_EVENT, cb)
    window.removeEventListener('storage', cb)
  }
}
const getSnapshot = () => readConsent(typeof window === 'undefined' ? null : window.localStorage)
const getServerSnapshot = (): Consent | 'pending' => 'pending'

/** 'pending' khi chưa hydrate (server và lượt render đầu), sau đó là lựa chọn thật. */
export function useConsent(): [Consent | 'pending', (value: 'granted' | 'denied') => void] {
  const consent = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const set = useCallback((value: 'granted' | 'denied') => {
    writeConsent(window.localStorage, value)
    window.dispatchEvent(new Event(CONSENT_EVENT))
  }, [])
  return [consent, set]
}
