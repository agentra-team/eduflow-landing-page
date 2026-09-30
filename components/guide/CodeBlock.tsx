import { CopyButton } from '@/components/site/CopyButton'

/** Lệnh sao chép được (vd. xattr). */
export function CodeBlock({ code, copyLabel, copiedLabel }: { code: string; copyLabel: string; copiedLabel: string }) {
  return (
    <div className="flex items-center gap-3 rounded-control bg-ink px-3.5 py-3 text-[#e6e6e2]">
      <code className="min-w-0 flex-1 overflow-x-auto font-mono text-[13.5px] whitespace-nowrap">{code}</code>
      <CopyButton value={code} label={copyLabel} doneLabel={copiedLabel} iconOnly className="text-[#a9a8a1] hover:text-white" />
    </div>
  )
}
