import { DOCS } from '@/content/docs'
import { DOC_IDS, DOC_SLUGS, findDocSlug } from '@/content/docs/slugs'
import { ogImage } from '@/lib/seo/og'

// Ảnh chia sẻ 1200×630 của bài hướng dẫn, sinh tĩnh lúc build (spec §9.1). Ở gốc app/, ngoài [locale]: slug khác nhau giữa
// hai ngôn ngữ và duy nhất qua cả hai, nên ngôn ngữ suy ra từ slug. proxy.ts bỏ qua tiền tố og/.
export const dynamic = 'force-static'
export const dynamicParams = false

export function generateStaticParams() {
  return DOC_IDS.flatMap((id) => [{ slug: DOC_SLUGS[id].vi }, { slug: DOC_SLUGS[id].en }])
}

export async function GET(_request: Request, ctx: RouteContext<'/og/docs/[slug]'>) {
  const { slug } = await ctx.params
  const hit = findDocSlug(slug)
  if (!hit) return new Response('Not found', { status: 404 })
  const c = DOCS[hit.id][hit.locale]
  return ogImage({ title: c.title, subtitle: c.description, badge: hit.locale === 'vi' ? 'Hướng dẫn' : 'Docs' })
}
