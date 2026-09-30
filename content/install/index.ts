import type { ComponentType } from 'react'

export type GuideOs = 'macos' | 'windows'
export const GUIDE_OS: GuideOs[] = ['macos', 'windows']
export const isGuideOs = (x: string): x is GuideOs => (GUIDE_OS as string[]).includes(x)

export type MdxModule = { default: ComponentType<Record<string, unknown>>; meta: MdxMeta }
type Loader = () => Promise<MdxModule>

/** Bảng import tĩnh để Turbopack phân tích được (spec §5). */
export const GUIDES: Record<'vi' | 'en', Record<GuideOs, Loader>> = {
  vi: {
    macos: () => import('./vi/macos.mdx'),
    windows: () => import('./vi/windows.mdx'),
  },
  en: {
    macos: () => import('./en/macos.mdx'),
    windows: () => import('./en/windows.mdx'),
  },
}
