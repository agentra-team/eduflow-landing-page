'use client'

import { useSyncExternalStore } from 'react'
import { CONSENT_EVENT, chooseConsent, currentConsent, type Consent } from './consent'

const subscribe = (cb: () => void) => {
  window.addEventListener(CONSENT_EVENT, cb)
  window.addEventListener('storage', cb)
  return () => {
    window.removeEventListener(CONSENT_EVENT, cb)
    window.removeEventListener('storage', cb)
  }
}
const getServerSnapshot = (): Consent | 'pending' => 'pending'

/**
 * 'pending' khi chưa hydrate (server và lượt render đầu), sau đó là lựa chọn thật. Đọc và ghi đều qua lib/consent.ts: storage bị chặn
 * thì lựa chọn vẫn sống trong phiên, không làm sập trang (ConsentBar và AnalyticsGate nằm ở layout gốc, không có error boundary ở trên).
 */
export function useConsent(): [Consent | 'pending', (value: 'granted' | 'denied') => void] {
  const consent = useSyncExternalStore(subscribe, currentConsent, getServerSnapshot)
  return [consent, chooseConsent]
}
