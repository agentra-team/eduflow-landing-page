import { llmsFullTxt } from '@/lib/seo/llms'

// Sinh tĩnh lúc build; toàn văn chỉ đổi khi nội dung đổi (deploy mới).
export const dynamic = 'force-static'

export function GET() {
  return new Response(llmsFullTxt(), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
