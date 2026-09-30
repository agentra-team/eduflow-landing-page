'use client'

import type { ComponentProps } from 'react'
import { track, type AnalyticsEvent } from '@/lib/analytics'

type Channel = Extract<AnalyticsEvent, { name: 'contact_click' }>['channel']

/** Link ra ngoài (mailto, tel, Zalo, bản đồ) có đo sự kiện contact_click. */
export function TrackedAnchor({ channel, children, ...rest }: ComponentProps<'a'> & { channel: Channel }) {
  return (
    <a {...rest} onClick={() => track({ name: 'contact_click', channel })}>
      {children}
    </a>
  )
}
