/** Một bước đánh số của hướng dẫn; h2 mang id để mục lục trỏ tới. */
export function Step({ n, id, title, children }: { n: number; id: string; title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-4 md:gap-5">
      <span
        aria-hidden="true"
        className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-[15px] font-bold text-white"
      >
        {n}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-3.5 border-b border-line pb-8 md:pb-10">
        <h2 id={id} className="scroll-mt-24 pt-1 text-[22px] leading-snug font-bold tracking-[-0.01em] md:text-2xl">
          {title}
        </h2>
        {children}
      </div>
    </li>
  )
}

export function Steps({ children }: { children: React.ReactNode }) {
  return <ol className="flex list-none flex-col gap-8 p-0 md:gap-10">{children}</ol>
}

/** Khối con trong một bước (vd. 3a / 3b theo phiên bản macOS). */
export function SubBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-line bg-card p-4 md:p-5">
      <h3 className="text-[17px] font-semibold">{title}</h3>
      {children}
    </div>
  )
}
