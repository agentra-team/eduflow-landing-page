import { afterEach, describe, expect, test, vi } from 'vitest'
import { CONSENT_EVENT, consentBannerEnabled, readConsent, writeConsent } from '@/lib/consent'

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

// Spec §12: localStorage bị chặn thì ConsentBar vẫn chạy trong phiên. lib/consent.ts giữ lựa chọn của phiên ở một biến cấp module, nên
// mỗi ca nạp lại module (vi.resetModules) và dựng `window` giả của riêng nó; vitest chạy ở môi trường node, không có window thật.
describe('consent of the current session', () => {
  const stored = () => {
    const map = new Map<string, string>()
    return {
      map,
      getItem: (k: string) => map.get(k) ?? null,
      setItem: (k: string, v: string) => void map.set(k, v),
    }
  }

  async function session(win: object) {
    const events: string[] = []
    // Chép theo descriptor: toán tử spread sẽ gọi getter `localStorage` ném lỗi ngay lúc dựng window giả.
    const fakeWindow = Object.defineProperties({ dispatchEvent: (e: Event) => events.push(e.type) }, Object.getOwnPropertyDescriptors(win))
    vi.resetModules()
    vi.stubGlobal('window', fakeWindow)
    const consent = await import('@/lib/consent')
    return { ...consent, events }
  }

  afterEach(() => vi.unstubAllGlobals())

  test('normal storage: the choice is stored, remembered and announced', async () => {
    const localStorage = stored()
    const { currentConsent, chooseConsent, events } = await session({ localStorage })
    expect(currentConsent()).toBe('unset')
    chooseConsent('granted')
    expect(JSON.parse(localStorage.map.get('eduflow.consent')!)).toMatchObject({ value: 'granted' })
    expect(currentConsent()).toBe('granted')
    expect(events).toEqual([CONSENT_EVENT])
  })

  test('a stored choice wins over the one remembered in memory', async () => {
    const localStorage = stored()
    const { currentConsent, chooseConsent } = await session({ localStorage })
    chooseConsent('granted')
    localStorage.map.set('eduflow.consent', JSON.stringify({ value: 'denied' }))
    expect(currentConsent()).toBe('denied')
  })

  test('an unreadable stored value falls back to the session choice, then to unset', async () => {
    // Giá trị lưu hỏng và không ghi đè được: chỉ còn lựa chọn trong bộ nhớ của phiên.
    const localStorage = { getItem: () => '{broken', setItem: () => {} }
    const { currentConsent, chooseConsent } = await session({ localStorage })
    expect(currentConsent()).toBe('unset')
    chooseConsent('denied')
    expect(currentConsent()).toBe('denied')
  })

  test('a localStorage getter that throws (site data blocked) neither crashes nor loses the choice', async () => {
    const blocked = {
      get localStorage(): never {
        throw new DOMException('Access is denied for this document.', 'SecurityError')
      },
    }
    const { safeStorage, currentConsent, chooseConsent, events } = await session(blocked)
    expect(safeStorage()).toBeNull()
    expect(currentConsent()).toBe('unset')
    expect(() => chooseConsent('granted')).not.toThrow()
    expect(currentConsent()).toBe('granted')
    expect(events).toEqual([CONSENT_EVENT])
  })

  test('a setItem that throws (storage full or write-blocked) still keeps the choice for the session', async () => {
    const localStorage = {
      getItem: () => null,
      setItem: () => {
        throw new DOMException('The quota has been exceeded.', 'QuotaExceededError')
      },
    }
    const { currentConsent, chooseConsent, events } = await session({ localStorage })
    expect(() => chooseConsent('granted')).not.toThrow()
    expect(currentConsent()).toBe('granted')
    expect(events).toEqual([CONSENT_EVENT])
  })

  test('without a window at all, storage is simply absent', async () => {
    vi.resetModules()
    vi.stubGlobal('window', undefined)
    const { safeStorage, currentConsent } = await import('@/lib/consent')
    expect(safeStorage()).toBeNull()
    expect(currentConsent()).toBe('unset')
  })
})
