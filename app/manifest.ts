import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'EduFlow',
    short_name: 'EduFlow',
    description: 'App desktop soạn đề, giáo án, đề cương và rà soát chương trình đào tạo, có trợ lý AI',
    start_url: '/',
    display: 'browser',
    background_color: '#F6F7F2',
    theme_color: '#237A31',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/icon.png', sizes: '192x192', type: 'image/png' },
      { src: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  }
}
