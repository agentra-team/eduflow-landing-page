// Tệp script (không import) để khai báo ambient hợp lệ cho mọi *.mdx.

/** Metadata mà mỗi tệp MDX xuất ra (`export const meta`). */
interface MdxMeta {
  title: string
  description?: string
  /** ISO yyyy-mm-dd */
  updated?: string
  minutes?: number
  toc?: Array<{ id: string; label: string }>
}

declare module '*.mdx' {
  import type { ComponentType } from 'react'
  export const meta: MdxMeta
  const MDXContent: ComponentType<Record<string, unknown>>
  export default MDXContent
}
