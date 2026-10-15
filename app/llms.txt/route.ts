import { getReleases, latestRelease } from '@/lib/releases'
import { llmsTxt } from '@/lib/seo/llms'

// Tái tạo cùng nhịp với feed phát hành (10 phút), để phiên bản mới nhất luôn đúng. Không đọc tệp nào lúc chạy.
export const revalidate = 600

export async function GET() {
  const { assets } = await getReleases()
  return new Response(llmsTxt({ release: latestRelease(assets) }), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
