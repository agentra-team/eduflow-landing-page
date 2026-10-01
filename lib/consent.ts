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

/**
 * `window.localStorage`, hoặc null khi trình duyệt chặn dữ liệu trang. Ở một số hồ sơ Chromium, chính việc đọc thuộc tính này ném SecurityError
 * (chưa tới getItem hay setItem), nên mọi chỗ chạm vào storage đều đi qua hàm này.
 */
export function safeStorage(): Storage | null {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

/** Lựa chọn của phiên này, giữ trong bộ nhớ: sống cả khi storage bị chặn hay không ghi được, nên thanh cookie vẫn tắt và GA4 vẫn theo lựa chọn (spec §12). */
let sessionChoice: Consent = 'unset'

/** Lựa chọn hiện tại: giá trị đã lưu nếu đọc được và có, nếu không thì lựa chọn của phiên, nếu không thì 'unset'. */
export function currentConsent(): Consent {
  const stored = readConsent(safeStorage())
  return stored === 'unset' ? sessionChoice : stored
}

/** Ghi nhớ lựa chọn: luôn vào bộ nhớ phiên, rồi cố ghi vào storage (lỗi bị nuốt), rồi báo cho các hook đang đăng ký. */
export function chooseConsent(value: 'granted' | 'denied'): void {
  sessionChoice = value
  writeConsent(safeStorage(), value)
  window.dispatchEvent(new Event(CONSENT_EVENT))
}

/** NEXT_PUBLIC_CONSENT_BANNER=off → không hỏi, GA4 nạp ngay (spec §10). */
export function consentBannerEnabled(flag: string | undefined = process.env.NEXT_PUBLIC_CONSENT_BANNER): boolean {
  return (flag ?? '').trim().toLowerCase() !== 'off'
}
