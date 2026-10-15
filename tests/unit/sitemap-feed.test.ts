import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import sitemap from '@/app/sitemap'
import { DOCS } from '@/content/docs'
import { DOC_IDS, DOC_SLUGS } from '@/content/docs/slugs'
import { TOPIC_IDS, TOPIC_META, topicPage } from '@/content/topics'
import { indexablePages, pageUrl } from '@/lib/seo/pages'
import { absoluteUrl } from '@/lib/seo/urls'

// Tệp riêng: seo.test.ts đã giả fetchFeed trả null, còn ở đây feed cần đổi theo từng ca.
const feeds = vi.hoisted(() => ({ windows: null as unknown, mac: null as unknown }))
vi.mock('@/lib/releases/feed', () => ({
  fetchFeed: async (url: string) => (url.endsWith('latest-mac.yml') ? feeds.mac : feeds.windows),
}))
// Snapshot rỗng cố định, không đọc content/releases.json thật: sau lần `pnpm sync-releases` đầu tiên snapshot có bản phát hành,
// và ca "feed hỏng" sẽ lấy ngày từ snapshot nên đỏ dù code đúng.
vi.mock('@/lib/releases/snapshot', () => ({ releaseSnapshot: { baseUrl: null, windows: null, mac: null } }))

const RELEASE_URLS = ['https://eduflow.test', 'https://eduflow.test/en', 'https://eduflow.test/tai-ve', 'https://eduflow.test/en/download']
const RELEASE_DATE = '2026-10-01T02:00:00.000Z'

function publish(releaseDate: string) {
  const file = (url: string) => ({ url, sha512: 'abc', size: 1 })
  feeds.windows = { version: '1.0.0', releaseDate, path: 'EduFlow Setup 1.0.0.exe', files: [file('EduFlow Setup 1.0.0.exe')] }
  feeds.mac = { version: '1.0.0', releaseDate, files: [file('EduFlow-1.0.0-arm64.dmg'), file('EduFlow-1.0.0.dmg')] }
}

type Entries = Awaited<ReturnType<typeof sitemap>>
const lastmod = (entries: Entries) => Object.fromEntries(entries.filter((e) => 'lastModified' in e).map((e) => [e.url, e.lastModified]))

/** URL của trang có ngày nội dung thật (updatedAt): chỉ tính tập URL từ sổ trang, còn giá trị ngày ghi cứng ở test. */
const datedUrls = () =>
  indexablePages()
    .filter((p) => p.updatedAt)
    .flatMap((p) => (['vi', 'en'] as const).map((l) => pageUrl(p, l)))
    .sort()

// Chính sách bảo mật cập nhật 2026-09-30 (giờ Việt Nam, UTC+7) = 2026-09-29T17:00:00.000Z.
const PRIVACY_LASTMOD = new Date('2026-09-29T17:00:00.000Z')
const PRIVACY_URLS = ['https://eduflow.test/chinh-sach-bao-mat', 'https://eduflow.test/en/privacy']
// Bài hướng dẫn mang ngày cập nhật của sổ bài (content/docs/index.ts), cũng là nửa đêm giờ Việt Nam như ca ghi cứng ở trên.
const docDates = () =>
  Object.fromEntries(
    DOC_IDS.flatMap((id) =>
      (['vi', 'en'] as const).map((l) => [absoluteUrl(l, '/docs/[slug]', { slug: DOC_SLUGS[id][l] }), new Date(`${DOCS[id].updatedAt}T00:00:00+07:00`)]),
    ),
  )
// Trang chủ đề mang ngày cập nhật của TOPIC_META, cũng là nửa đêm giờ Việt Nam.
const topicDates = () =>
  Object.fromEntries(TOPIC_IDS.flatMap((id) => (['vi', 'en'] as const).map((l) => [absoluteUrl(l, topicPage(id)), new Date(`${TOPIC_META[id].updatedAt}T00:00:00+07:00`)])))
const datedContent = () => ({ ...Object.fromEntries(PRIVACY_URLS.map((u) => [u, PRIVACY_LASTMOD])), ...topicDates(), ...docDates() })

beforeEach(() => {
  vi.stubEnv('DOWNLOAD_FEED_URL', 'https://feed.example.test/desktop')
  vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://eduflow.test')
  feeds.windows = null
  feeds.mac = null
})
afterEach(() => {
  vi.unstubAllEnvs()
  vi.useRealTimers()
})

test('the registry marks exactly the privacy pages, the topic pages and the docs articles as dated content', () => {
  expect(datedUrls()).toEqual([...PRIVACY_URLS, ...Object.keys(topicDates()), ...Object.keys(docDates())].sort())
  expect(Object.keys(topicDates())).toHaveLength(TOPIC_IDS.length * 2)
  expect(Object.keys(docDates())).toHaveLength(DOC_IDS.length * 2)
})

test('home and Download carry the feed release date, dated content its own date, every other page none', async () => {
  publish(RELEASE_DATE)
  const release = Object.fromEntries(RELEASE_URLS.map((u) => [u, new Date(RELEASE_DATE)]))
  expect(lastmod(await sitemap())).toEqual({ ...datedContent(), ...release })
})

test('an unparseable release date gives no lastModified instead of an Invalid Date', async () => {
  publish('not a date')
  expect(lastmod(await sitemap())).toEqual(datedContent())
})

test('a feed that is down leaves only the dated content with lastModified', async () => {
  expect(lastmod(await sitemap())).toEqual(datedContent())
})

// Spec §12.1: lastmod không bao giờ là ngày build.
test('lastmod is never the build date', async () => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date('2031-05-05T05:05:05Z'))
  publish(RELEASE_DATE)
  for (const d of Object.values(lastmod(await sitemap()))) expect(String(d)).not.toContain('2031')
})
