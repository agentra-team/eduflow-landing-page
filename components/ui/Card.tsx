import { cn } from '@/lib/cn'

/** Thẻ trắng bo 20, bóng mềm thay cho viền đậm (spec blue retheme §4.3). */
export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('rounded-card border border-line-faint bg-card shadow-card', className)}>{children}</div>
}
