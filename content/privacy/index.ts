import type { ComponentType } from 'react'

type MdxModule = { default: ComponentType<Record<string, unknown>>; meta: MdxMeta }

export const PRIVACY: Record<'vi' | 'en', () => Promise<MdxModule>> = {
  vi: () => import('./vi.mdx'),
  en: () => import('./en.mdx'),
}
