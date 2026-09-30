import type { MdxModule } from '@/content/install'

export const PRIVACY: Record<'vi' | 'en', () => Promise<MdxModule>> = {
  vi: () => import('./vi.mdx'),
  en: () => import('./en.mdx'),
}
