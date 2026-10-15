import { buildInfo } from '@/lib/release'

// Sinh tĩnh lúc dựng: phiên bản và commit là của bản dựng, không đổi theo request. Đường dẫn có dấu chấm nên proxy.ts (next-intl) bỏ qua.
export const dynamic = 'force-static'

export function GET() {
  // Site cho máy tìm kiếm index mọi trang; riêng tệp này thì không (và không nằm trong sitemap).
  return Response.json(buildInfo(), { headers: { 'X-Robots-Tag': 'noindex' } })
}
