import { HOME_FAQ_KEYS } from '@/content/home'
import { TOPIC_IDS, TOPIC_META, TOPICS, topicPage, type TopicCopy, type TopicId } from '@/content/topics'
import { routing, type Locale } from '@/i18n/routing'
import { site } from '@/lib/site'
import en from '@/messages/en.json'
import vi from '@/messages/vi.json'
import { appFacts } from './app-facts'
import { brand } from './brand'
import { operatingSystems } from './jsonld'
import { indexablePages, pageUrl, type IndexablePage } from './pages'
import { absoluteUrl } from './urls'

/*
 * /llms.txt (bản đồ site cho mô hình AI, chuẩn llmstxt.org) và /llms-full.txt (toàn văn trang chủ đề và hỏi đáp trang chủ).
 * Sinh từ đúng các module mà trang dùng (sổ trang, content/topics, messages), không viết tay: trang đổi thì hai tệp đổi theo.
 */

const MESSAGES = { vi, en }
export type LlmsInput = { release: { version: string; releaseDate: string } | null }

const L = {
  vi: { pages: 'Trang sản phẩm (tiếng Việt)', topics: 'Chủ đề (tiếng Việt)', docs: 'Hướng dẫn sử dụng (tiếng Việt)', faq: 'Hỏi đáp trang chủ (tiếng Việt)', updated: 'Cập nhật', checked: 'Bảng kiểm tra ngày' },
  en: { pages: 'Product pages (English)', topics: 'Topics (English)', docs: 'User guide (English)', faq: 'Home page FAQ (English)', updated: 'Updated', checked: 'Table checked on' },
} satisfies Record<Locale, Record<string, string>>

const GROUPS: Array<['pages' | 'topics' | 'docs', (p: IndexablePage) => boolean]> = [
  ['pages', (p) => !p.id.includes(':')],
  ['topics', (p) => p.id.startsWith('topic:')],
  ['docs', (p) => p.id.startsWith('doc:')],
]

function header(release: LlmsInput['release']): string[] {
  return [
    `# ${brand.name}`,
    '',
    `> ${brand.description.vi}`,
    '',
    brand.description.en,
    '',
    brand.disambiguation.vi,
    brand.disambiguation.en,
    '',
    `- Tên khác / Also known as: ${brand.alternateName}`,
    `- Danh mục / Category: ${brand.category.vi} / ${brand.category.en}`,
    `- Nhà phát triển / Developer: ${site.company}, Đà Nẵng, Việt Nam (${site.companyUrl}) · ${site.email}`,
    `- Nền tảng / Platforms: ứng dụng desktop / desktop app, ${operatingSystems()}`,
    ...(release ? [`- Phiên bản mới nhất / Latest version: ${release.version}${release.releaseDate ? ` (${release.releaseDate.slice(0, 10)})` : ''}`] : []),
    '- Ngôn ngữ giao diện ứng dụng / App language: tiếng Việt / Vietnamese',
    `- Đối tượng / Audience: ${brand.audience.vi} / ${brand.audience.en}`,
    '- Giá / Pricing: tính theo token AI đã dùng, ngân sách tháng theo key, việc chạy tại máy không tốn tiền; liên hệ Agentra để báo giá / billed by the AI tokens used, a monthly budget per key, local work is free; contact Agentra for a quote',
    `- Bộ cài / Installers: ${appFacts.installerSigned ? 'đã ký số / code-signed' : 'chưa ký số, hệ điều hành hỏi lại ở lần mở đầu / not signed yet, the OS asks again on first launch'}`,
  ]
}

export function llmsTxt(input: LlmsInput): string {
  const lines = [...header(input.release), '', '## Tính năng / Features', '', ...brand.features.vi.map((f) => `- ${f}`), '', ...brand.features.en.map((f) => `- ${f}`)]
  const pages = indexablePages()
  for (const locale of routing.locales) {
    for (const [group, pick] of GROUPS) {
      lines.push('', `## ${L[locale][group]}`, '')
      for (const p of pages.filter(pick)) lines.push(`- [${p.seo[locale].title}](${pageUrl(p, locale)}): ${p.seo[locale].description}`)
    }
  }
  lines.push(
    '',
    '## Optional',
    '',
    `- [Toàn văn cho mô hình AI / Full text for AI models](${site.siteUrl()}/llms-full.txt): toàn văn các trang chủ đề và hỏi đáp trang chủ / full topic pages and the home FAQ`,
    `- [Sitemap](${site.siteUrl()}/sitemap.xml)`,
  )
  return `${lines.join('\n')}\n`
}

function topicMd(locale: Locale, id: TopicId, c: TopicCopy): string[] {
  const out = [`## ${c.h1}`, '', `URL: ${absoluteUrl(locale, topicPage(id))} · ${L[locale].updated}: ${TOPIC_META[id].updatedAt}`, '', c.lead, '', c.inShort, '']
  out.push(`### ${c.definition.h2}`, '', `**${c.definition.term}** ${c.definition.rest}`, '', ...(c.definition.paras ?? []).flatMap((p) => [p, '']))
  out.push(`### ${c.table.h2}`, '', `| ${c.table.head.join(' | ')} |`, `| ${c.table.head.map(() => '---').join(' | ')} |`, ...c.table.rows.map((r) => `| ${r.join(' | ')} |`), '', `${L[locale].checked} ${c.table.checkedAt}`, '')
  for (const b of c.blocks ?? []) {
    out.push(`### ${b.h2}`, '', ...(b.paras ?? []).flatMap((p) => [p, '']))
    b.items?.forEach((it, i) => out.push(`${b.ordered ? `${i + 1}.` : '-'} ${it.title ? `**${it.title}**: ` : ''}${it.text}`))
    if (b.items) out.push('')
  }
  out.push(`### ${c.howTo.h2}`, '', ...c.howTo.steps.map((s, i) => `${i + 1}. **${s.title}**: ${s.text}`), '')
  out.push(`### ${c.limits.h2}`, '', ...c.limits.items.map((it) => `- ${it}`), '')
  out.push(`### ${MESSAGES[locale].topics.faqH2}`, '')
  for (const f of c.faq) out.push(`**${f.q}**`, f.a, '')
  return out
}

export function llmsFullTxt(): string {
  const lines = [...header(null), '']
  for (const locale of routing.locales) {
    const faq = MESSAGES[locale].home.faq as unknown as Record<string, { q: string; a: string }>
    lines.push(`## ${L[locale].faq}`, '', `URL: ${absoluteUrl(locale, '/')}`, '')
    for (const k of HOME_FAQ_KEYS) lines.push(`**${faq[k].q}**`, faq[k].a, '')
    for (const id of TOPIC_IDS) lines.push(...topicMd(locale, id, TOPICS[locale][id]))
  }
  return `${lines.join('\n')}\n`
}
