import type { MDXComponents } from 'mdx/types'
import { CodeBlock } from '@/components/guide/CodeBlock'
import { Step, Steps, SubBlock } from '@/components/guide/Step'
import { Callout } from '@/components/ui/Callout'

const components = {
  Steps,
  Step,
  SubBlock,
  Callout,
  CodeBlock,
  h2: (props) => <h2 className="scroll-mt-24 pt-2 text-2xl font-bold tracking-[-0.01em]" {...props} />,
  h3: (props) => <h3 className="text-[17px] font-semibold" {...props} />,
  p: (props) => <p className="text-base leading-relaxed text-ink2" {...props} />,
  ol: (props) => <ol className="flex list-decimal flex-col gap-2 pl-5 text-base leading-relaxed text-ink2" {...props} />,
  ul: (props) => <ul className="flex list-disc flex-col gap-2 pl-5 text-base leading-relaxed text-ink2" {...props} />,
  strong: (props) => <strong className="font-semibold text-ink" {...props} />,
  a: (props) => <a className="font-semibold text-accent-strong underline underline-offset-2 hover:text-accent" {...props} />,
  code: (props) => (
    <code className="rounded-[6px] border border-line bg-sidebar px-1.5 py-0.5 font-mono text-[13.5px] text-ink" {...props} />
  ),
  table: (props) => (
    <div className="overflow-x-auto rounded-[10px] border border-line">
      <table className="w-full border-collapse text-[15px]" {...props} />
    </div>
  ),
  th: (props) => (
    <th className="border-b border-line bg-sidebar px-3.5 py-2.5 text-left text-[13px] font-bold tracking-[0.4px] text-muted uppercase" {...props} />
  ),
  td: (props) => <td className="border-b border-line px-3.5 py-3 text-ink2 last:border-b-0" {...props} />,
} satisfies MDXComponents

export function useMDXComponents(): MDXComponents {
  return components
}
