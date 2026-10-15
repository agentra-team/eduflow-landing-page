import { expect, test } from '@playwright/test'
import { LEGACY_REDIRECTS } from '../../lib/next-routes'
import { PAGES } from './pages'

// Spec §4.5: mọi trang indexable có link từ trang khác và cách trang chủ ≤ 3 lần bấm; không link nội bộ nào trỏ vào
// nguồn của một chuyển hướng hay vào /vi/... (link đổi ngôn ngữ cũng vậy).
test('every indexable page is within three clicks of home, through final URLs only', async ({ request }) => {
  const redirects = new Set(LEGACY_REDIRECTS.map((r) => r.source))
  const depth = new Map<string, number>([['/', 0]])
  const bad: string[] = []
  let frontier = ['/']
  for (let d = 1; d <= 3 && frontier.length; d++) {
    const next: string[] = []
    for (const from of frontier) {
      const html = await (await request.get(from)).text()
      for (const m of html.matchAll(/<a\b[^>]*?\bhref="(\/[^"#?]*)/g)) {
        const href = m[1]
        if (href.startsWith('//') || href.startsWith('/_next') || href.startsWith('/og/') || /\.\w+$/.test(href)) continue
        if (href === '/vi' || href.startsWith('/vi/') || redirects.has(href) || (href.length > 1 && href.endsWith('/'))) bad.push(`${from} → ${href}`)
        if (!depth.has(href)) {
          depth.set(href, d)
          next.push(href)
        }
      }
    }
    frontier = next
  }
  expect(bad).toEqual([])
  expect(PAGES.map(([path]) => path).filter((p) => !depth.has(p))).toEqual([])
})
