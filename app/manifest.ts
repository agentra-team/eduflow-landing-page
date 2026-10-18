import type { MetadataRoute } from 'next'
import { brand } from '@/lib/seo/brand'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'EduFlow',
    short_name: 'EduFlow',
    // Câu mô tả chuẩn (lib/seo/brand.ts): chỉ nói điều app v1 có.
    description: brand.description.vi,
    start_url: '/',
    display: 'browser',
    background_color: '#FFFFFF',
    theme_color: '#0177FB',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/icon.png', sizes: '192x192', type: 'image/png' },
      { src: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  }
}
