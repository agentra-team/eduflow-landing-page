import { Icon } from '@/components/ui/Icon'
import { CopyButton } from '@/components/site/CopyButton'

/**
 * SHA-512 ẩn sau một dòng gập (details/summary) để không rối mắt người dùng phổ thông;
 * mở ra mới thấy hash thu gọn (14 ký tự đầu … 10 ký tự cuối) kèm nút sao chép toàn bộ.
 */
export function ChecksumField({
  sha512,
  toggleLabel,
  copyLabel,
  copiedLabel,
}: {
  sha512: string
  toggleLabel: string
  copyLabel: string
  copiedLabel: string
}) {
  const short = sha512.length > 30 ? `${sha512.slice(0, 14)}…${sha512.slice(-10)}` : sha512
  return (
    <details className="group text-[13px] text-muted">
      <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-1 hover:text-ink md:min-h-0 [&::-webkit-details-marker]:hidden">
        <Icon name="chevron-down" size={14} className="transition-transform group-open:rotate-180" />
        {toggleLabel}
      </summary>
      <div className="mt-2 flex items-center gap-2 rounded-control border border-dashed border-line px-2.5 py-2">
        <span className="text-[11px] font-semibold tracking-[0.5px] text-muted">SHA-512</span>
        <code className="min-w-0 flex-1 truncate font-mono text-xs text-ink2" title={sha512}>
          {short}
        </code>
        <CopyButton value={sha512} label={copyLabel} doneLabel={copiedLabel} iconOnly className="text-muted hover:text-ink" />
      </div>
    </details>
  )
}
