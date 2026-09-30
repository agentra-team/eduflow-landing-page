export type Consent = 'granted' | 'denied' | 'unset'

export const CONSENT_KEY = 'eduflow.consent'
export const CONSENT_EVENT = 'eduflow:consent'

type ReadableStorage = Pick<Storage, 'getItem'>
type WritableStorage = Pick<Storage, 'setItem'>

/** Đọc lựa chọn cookie; storage bị chặn, thiếu hoặc hỏng đều là 'unset'. */
export function readConsent(storage: ReadableStorage | null | undefined): Consent {
  try {
    const raw = storage?.getItem(CONSENT_KEY)
    if (!raw) return 'unset'
    const parsed = JSON.parse(raw) as { value?: unknown }
    return parsed.value === 'granted' || parsed.value === 'denied' ? parsed.value : 'unset'
  } catch {
    return 'unset'
  }
}

export function writeConsent(storage: WritableStorage | null | undefined, value: 'granted' | 'denied'): void {
  try {
    storage?.setItem(CONSENT_KEY, JSON.stringify({ value, at: new Date().toISOString() }))
  } catch {
    /* localStorage bị chặn: lựa chọn chỉ sống trong phiên */
  }
}

/** NEXT_PUBLIC_CONSENT_BANNER=off → không hỏi, GA4 nạp ngay (spec §10). */
export function consentBannerEnabled(flag: string | undefined = process.env.NEXT_PUBLIC_CONSENT_BANNER): boolean {
  return (flag ?? '').trim().toLowerCase() !== 'off'
}
