// Tệp script (không import) để khai báo ambient hợp lệ cho mọi *.mdx.

/** Metadata mà tệp MDX xuất ra (`export const meta`): chỉ Chính sách bảo mật còn dùng; bài hướng dẫn để metadata ở content/docs/index.ts. */
interface MdxMeta {
  title: string
  description?: string
  /** ISO yyyy-mm-dd */
  updated?: string
}

declare module '*.mdx' {
  import type { ComponentType } from 'react'
  export const meta: MdxMeta
  const MDXContent: ComponentType<Record<string, unknown>>
  export default MDXContent
}
