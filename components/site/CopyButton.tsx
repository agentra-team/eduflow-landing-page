'use client'

import { useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'

/** Sao chép một chuỗi vào clipboard, báo "đã sao chép" trong 2 giây. */
export function CopyButton({
  value,
  label,
  doneLabel,
  className,
  iconOnly = false,
}: {
  value: string
  label: string
  doneLabel: string
  className?: string
  iconOnly?: boolean
}) {
  const [done, setDone] = useState(false)
  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setDone(true)
      setTimeout(() => setDone(false), 2000)
    } catch {
      /* clipboard bị chặn: không làm gì, người dùng vẫn bôi đen chép tay được */
    }
  }
  return (
    <button
      type="button"
      onClick={copy}
      aria-label={iconOnly ? (done ? doneLabel : label) : undefined}
      className={cn('inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 text-[14.5px] font-semibold text-accent-strong hover:text-accent md:min-h-0 md:min-w-0', className)}
    >
      <Icon name={done ? 'check' : 'copy'} size={16} />
      {iconOnly ? null : <span>{done ? doneLabel : label}</span>}
    </button>
  )
}
