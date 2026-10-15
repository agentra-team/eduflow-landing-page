import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'EduFlow',
    short_name: 'EduFlow',
    description: 'Phần mềm AI cho giáo viên và giảng viên: soạn đề kiểm tra, giáo án, slide, đề cương học phần',
    start_url: '/',
    display: 'browser',
    background_color: '#FFFFFF',
    theme_color: '#567F2E',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/icon.png', sizes: '192x192', type: 'image/png' },
      { src: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  }
}
