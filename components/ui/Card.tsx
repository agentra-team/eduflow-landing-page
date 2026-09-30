import { cn } from '@/lib/cn'

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('rounded-card border border-line bg-card shadow-[0_1px_2px_rgba(0,0,0,0.03)]', className)}>
      {children}
    </div>
  )
}
