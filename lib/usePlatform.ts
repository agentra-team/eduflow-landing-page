'use client'

import { useSyncExternalStore } from 'react'
import { detectPlatform, type DetectedOs } from './platform'

let cached: DetectedOs | null | undefined

const subscribe = () => () => {}
const getServerSnapshot = () => null

function getSnapshot(): DetectedOs | null {
  if (cached === undefined) {
    const nav = navigator as Navigator & { userAgentData?: { platform?: string } }
    cached = detectPlatform(nav.userAgent, nav.userAgentData?.platform)
  }
  return cached
}

/** Server và lượt hydrate đầu luôn thấy null; sau đó là hệ điều hành thật (không gây lệch hydration). */
export function usePlatform(): DetectedOs | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
