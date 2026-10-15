# Kế hoạch 1 của đợt thiết kế lại: nền, nội dung và SEO

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Đưa landing EduFlow lên bản đồ URL theo từ khoá, có trung tâm hướng dẫn 12 bài, sáu trang chủ đề, entity graph, robots cho bot AI, sitemap 58 URL, `llms.txt`, cổng `seo-audit` trên CI và logo mới, rồi dựng canvas Claude Design v2 để PO duyệt trước khi đổi giao diện.

**Architecture:** Giữ stack và routing (khoá nội bộ cũ, chỉ đổi đường dẫn hiển thị). Một sổ trang indexable (`lib/seo/pages.ts`) là nguồn duy nhất cho title, description, URL, từ khoá chính và lastmod; metadata, sitemap, `llms.txt` và test đều đọc từ đó. Nội dung nằm ở module có kiểu (`content/topics/*.ts`, sổ `content/docs/index.ts`) và MDX; mọi con số về app đi qua `lib/seo/app-facts.ts` và bị test quét. Trang mới dùng component và token hiện có; Kế hoạch 2 thay giao diện theo canvas đã duyệt mà không đổi URL, metadata, JSON-LD hay nội dung.

**Tech Stack:** Next.js 16.3.7 (App Router, `proxy.ts`), next-intl 4.14.5, @next/mdx 16.3.7, React 19.2.8, Tailwind CSS 4.3, Vitest 5, Playwright 1.63, sharp (dev). Python 3 với fontTools 4.56 chỉ dùng một lần để dựng wordmark, không vào phụ thuộc của repo.

**Spec:** `docs/superpowers/specs/2026-10-14-eduflow-redesign-seo-docs-design.md` (gọi tắt "spec"). Phần spec không nhắc thì theo `docs/superpowers/specs/2026-09-30-eduflow-landing-page-design.md` ("spec 30/09") và phụ lục Ruling 1 tới 62 của `docs/superpowers/plans/2026-09-30-eduflow-landing-page.md`.

## Phạm vi và cách chia kế hoạch

Spec có một cổng PO duyệt canvas trước khi code giao diện (spec §10.4), nên được chia làm ba kế hoạch:

- **Kế hoạch 1 (tệp này):** spec §14 bước 1 (trừ token màu và font), bước 2, bước 3, phần chức năng của bước 6 và 7, bước 8. Gồm: logo và icon, `brand.ts`, `app-facts.ts`, luật nội dung mới, đường dẫn mới và chuyển hướng 308, đổi ngôn ngữ trỏ thẳng URL cuối, sổ trang và chữ SEO, entity graph JSON-LD, robots cho bot AI, hệ docs với 12 bài × 2 ngôn ngữ, ảnh chia sẻ bài docs, sáu trang chủ đề, khối mới của ba trang cấp, chữ trang chủ (14 khối) và hỏi đáp 10 câu, footer năm cột, `llms.txt`, kiểm link nội bộ, cổng `seo-audit` trên CI, canvas v2 và cổng PO.
- **Kế hoạch 2 (viết sau khi PO duyệt canvas ở Task 25):** token màu và font (spec §5.1, §5.2), thành phần mới ở spec §5.4 (MegaMenu, MobileMenu, FactStrip, FeatureRow, RoleTabs, Breadcrumb, khối của TopicLayout, DocsLayout có ngăn kéo và mục lục bám, Figure theo canvas), trang chủ 14 khối, khoác giao diện mọi trang, chuyển động §5.5, ảnh chụp lại từ canvas app mới và ảnh cho bài hướng dẫn (OQ-R2), e2e cho mega menu, ngăn kéo docs và tab vai trò.
- **Kế hoạch 3:** ra mắt (spec §13).

## Quyết định lệch hoặc chi tiết hơn spec

Người thực thi đọc mục này trước; người duyệt không coi các điểm dưới đây là lệch spec.

1. **Metadata bài hướng dẫn nằm trong sổ TS `content/docs/index.ts`, không ở frontmatter MDX**, để Vitest kiểm được và build dừng khi sai: `assertDocsValid()` chạy trong `generateStaticParams` và ném lỗi nêu tên tệp MDX và tên trường. Slug ở `content/docs/slugs.ts` (component phía client import được).
2. **`buildMetadata` nhận một `Seo` từ sổ trang**, `params` theo từng ngôn ngữ (slug docs khác nhau giữa vi và en), `titleSuffix` cho docs, `ogImage` tường minh.
3. **Nút đổi ngôn ngữ là `<a href>` tính bằng hàm thuần** (`i18n/switch.ts`) từ khoá nội bộ của `usePathname()` (next-intl) và `useParams()`. `Link` của next-intl với `locale` khác sinh `/vi/...` rồi chuyển hướng (14 cảnh báo của `seo-audit` ngày 14/10).
4. **Ảnh chia sẻ bài hướng dẫn là route `app/og/docs/[slug]/route.tsx`** ở gốc `app/`; `og/` được thêm vào matcher loại trừ của `proxy.ts`. Slug docs phải duy nhất qua cả hai ngôn ngữ (có test).
5. **Trang hướng dẫn không gọi `getReleases()`** để luôn sinh tĩnh hoàn toàn: trang đọc nguồn MDX bằng `fs` lúc build để dựng mục lục, mà ISR ở runtime của Vercel không có tệp nguồn.
6. **Luật nhà cung cấp mô hình (OQ-L07):** được nhắc "ChatGPT" như tên một sản phẩm để so sánh (spec §7.2 cần trang `/eduflow-va-chatgpt` và cột ChatGPT trong bảng so sánh); vẫn cấm Anthropic, Claude, OpenAI, Gemini, Google AI và tên mô hình dạng GPT-4o, GPT-5; thêm GLM, Z.ai, Zhipu (nhà cung cấp thật của app).
7. **Bản tiếng Anh của bài hướng dẫn gọi nút của app bằng nhãn tiếng Việt** (giao diện app là tiếng Việt, AD-16) bọc trong `<Ui>`; test "no untranslated Vietnamese" bỏ qua chữ trong `<Ui>`.
8. Mô tả meta 110 tới 160 ký tự (spec mới); test cũ là 140 tới 160.
9. `featureList` của JSON-LD chỉ gồm tính năng có trong v1 của app (Phổ thông, trợ lý, đọc tài liệu, chi phí), dù site giữ ba cấp (R6).
10. `@id` của Organization là `https://agentra.io.vn/#organization`, như DocOps: một thực thể Agentra JSC cho mọi site của công ty. WebSite, SoftwareApplication, WebPage dùng gốc của site (`<site>/#website`, `<site>/#software`, `<url>#webpage`).
11. **Footer năm cột làm ngay ở kế hoạch này** vì link nội bộ là việc SEO (spec §4.5); mega menu và menu điện thoại mới sang Kế hoạch 2. Header giữ nguyên tới Kế hoạch 2.
12. `app/apple-icon.png` là ô vuông kín không bo góc: iOS tự bo, còn góc trong suốt hiện thành màu đen. `app/icon.png` (192) bo góc theo lockup.
13. Bài hướng dẫn dùng ảnh sản phẩm có sẵn ở `public/images/product/` khi ảnh khớp đúng thao tác; ảnh màn chưa có (kích hoạt, hộp xuất đề, nạp tài liệu) chờ OQ-R2 và Kế hoạch 2. Không bài nào dùng ảnh không khớp chữ.
14. Ảnh chia sẻ riêng: Tải về, sáu trang chủ đề, 12 bài hướng dẫn. Các trang khác dùng ảnh 1200×630 chung của trang chủ (vẫn đủ yêu cầu 1200×630 của spec §9.1).
15. Chuyển hướng `*.vercel.app` về domain chính bằng `redirects()` có điều kiện `has: host`, **chỉ khi `VERCEL_ENV === 'production'`**: bản preview cũng ở `*.vercel.app` và phải xem được.
16. Bước `seo-audit` trên CI dựng ở chế độ không có feed: URL tải của feed giả là `http://localhost:3300/...`, mà `seo-audit` coi `localhost` trong HTML là lỗi host không phải production.
17. Sitemap bỏ `changefreq` và `priority` (Google bỏ qua cả hai); `lastmod` của trang chủ lấy theo ngày phát hành bản app như trang Tải về (spec §9.1).
18. Trang 404 giữ đúng một thẻ `robots` là `noindex` do Next sinh (test hiện có): `follow` là mặc định nên tương đương `noindex, follow` của spec §9.1; thêm thẻ thứ hai từng gây hai thẻ đối nghịch (Ruling của kế hoạch 30/09).
19. Bố cục ba cột, ngăn kéo và mục lục bám của trang hướng dẫn, mục lục "Trong trang" của trang chủ đề, breadcrumb hiển thị trên các trang còn lại (spec §7.5) thuộc Kế hoạch 2; ở đây trang hướng dẫn dùng `<details>` cho màn hẹp và JSON-LD BreadcrumbList có trên mọi trang.

## Global Constraints

Mọi task ngầm gồm các luật sau.

- Node ≥ 22.18, pnpm 9.15.0. Không thêm phụ thuộc runtime nào. Phiên bản giữ nguyên: `next` 16.3.7, `next-intl` ^4.14.5, `react` 19.2.8.
- Domain chính thức: `https://eduflow.agentra.io.vn` (R3). Gốc canonical luôn là `site.siteUrl()` (từ `NEXT_PUBLIC_SITE_URL`); không viết cứng domain trong mã trang.
- URL: tiếng Việt không tiền tố, tiếng Anh dưới `/en`; không dấu `/` cuối; khoá nội bộ của routing giữ như cũ (`/k12`, `/university`, `/program`...), chỉ đổi đường dẫn hiển thị (spec §4.2).
- `<title>` ≤ 60 ký tự **kể cả hậu tố**; meta description 110 tới 160 ký tự; mỗi trang một giá trị riêng; "EduFlow" xuất hiện nhiều nhất một lần trong title (spec §9.2).
- Hậu tố title: `' · EduFlow'` cho trang thường, `' · Hướng dẫn EduFlow'` (vi) và `' · EduFlow Docs'` (en) cho bài hướng dẫn; trang đã có "EduFlow" trong title dùng title tuyệt đối.
- Luật nội dung spec 30/09 §15 và spec §8.3: không hứa kiểm định, không nói AI thay giáo viên, không bịa số, **không ký tự U+2014**, thuật ngữ theo glossary của app; mọi con số và khẳng định về app đi qua `lib/seo/app-facts.ts`; mỗi trang chủ đề có mục "EduFlow chưa làm gì"; bảng so sánh có ngày kiểm tra; không nhận xét tiêu cực về công cụ khác khi không có nguồn; bản tiếng Anh dịch sát, cùng cấu trúc, cùng câu hỏi hỏi đáp.
- Chi tiết thao tác trong app (tên nút, đường đi màn, giới hạn) lấy từ `main` của repo app `../eduflow-application` (đã kiểm ở `ed025cf`, 14/10/2026), không từ spec gốc 30/09 của app.
- Kế hoạch này không đổi token màu, font hay bố cục của hệ hiện tại (trừ logo, icon và ảnh chia sẻ). Trang mới dùng `Container`, `Section`, `SectionHead`, `ButtonLink`, `Callout`, `Faq`, `CtaBand`, `Icon` sẵn có và class token hiện có (`text-ink2`, `text-accent-strong`, `bg-accent-soft`, `border-line`...).
- Chú thích trong mã, tài liệu, thông điệp commit viết tiếng Việt; tên test viết tiếng Anh.
- `pnpm verify` xanh trước mỗi commit. Task đụng tới route, trang hay metadata còn chạy e2e chế độ feed (lệnh ở mục sau) trước commit.
- Commit theo kiểu của repo: `feat(seo): ...`, `feat(docs): ...`, `test(...)`, `docs(...)`, thông điệp tiếng Việt. Không `git add -A` (Next có thể tự ghi `AGENTS.md`, `CLAUDE.md`): chỉ add đúng tệp của task.

## Lệnh dùng chung

**E2E-FEED** (chạy từ gốc repo; cổng 3200 phải trống, xem README mục "Kiểm thử e2e ba chế độ"):

```bash
export NEXT_PUBLIC_GA_MEASUREMENT_ID=G-TEST
lsof -nP -iTCP:3200 -sTCP:LISTEN    # không in gì là cổng trống
node scripts/serve-fixtures.mjs & FEED_PID=$!
DOWNLOAD_FEED_URL=http://localhost:3300/ NEXT_PUBLIC_SITE_URL=https://eduflow.example.test pnpm build
E2E_MODE=feed DOWNLOAD_FEED_URL=http://localhost:3300/ pnpm e2e
kill $FEED_PID
```

Kỳ vọng: mọi test xanh. Khi chỉ cần một tệp spec: thêm đường dẫn tệp sau `pnpm e2e`, ví dụ `pnpm e2e tests/e2e/redirects.spec.ts`.

**SEO-AUDIT** (chạy từ gốc repo; script nằm ở `scripts/seo-audit.mjs` từ Task 24, trước đó ở `~/.claude/skills/seo-master/scripts/seo-audit.mjs`):

```bash
VERCEL_ENV=production NEXT_PUBLIC_SITE_URL=https://eduflow.agentra.io.vn DOWNLOAD_FEED_URL= pnpm build
pnpm start -p 3400 & SEO_PID=$!
curl --retry 20 --retry-connrefused --retry-delay 1 -fsS http://localhost:3400/ > /dev/null
node scripts/seo-audit.mjs --base http://localhost:3400 --canonical https://eduflow.agentra.io.vn --next-manifest .next/prerender-manifest.json
kill $SEO_PID
```

## Review Focus

Năm loại đầu vào spec ngầm đòi mà các test theo tính năng không chạm tới, dễ làm người dùng vấp nhất; mỗi dòng có test ở task sở hữu.

1. **URL cũ có dấu `/` cuối hoặc chuỗi truy vấn** (`/pho-thong/`, `/huong-dan-cai-dat/macos?utm_source=app`) phải tới trang mới với 200 và giữ truy vấn, không 404 hay vòng chuyển hướng. Test: Task 4 bước 1 (`redirects.spec.ts`), Task 11 bước 1.
2. **Đổi ngôn ngữ trên trang 404 hay trên slug docs lạ** (`/huong-dan/khong-co`) phải dẫn tới trang có thật (mục lục hướng dẫn hoặc trang chủ) của ngôn ngữ kia, không tới một 404 khác. Test: Task 5 bước 1, Task 11 bước 1.
3. **Tiêu đề mục trong bài hướng dẫn có định dạng** (chữ đậm, mã, link) làm id rỗng, hoặc **hai tiêu đề trùng nhau** làm mục lục trỏ nhầm chỗ. Mong đợi: luật thân bài từ chối cả hai ngay khi test, nên mục lục không bao giờ có id rỗng hay trùng. Test: Task 10 bước 1.
4. **Build chạy trên CI theo giờ UTC** trong khi `updatedAt` của bài là ngày Việt Nam: bài ghi ngày hôm nay (giờ Việt Nam, đã sang ngày mới) không được làm build đỏ là "ngày ở tương lai". Test: Task 10 bước 1.
5. **Bản preview của Vercel** (cũng ở `*.vercel.app`) không bị chuyển về domain chính và mang `X-Robots-Tag: noindex`; bản production thì ngược lại. Test: Task 4 bước 1 (`next-routes.test.ts`).

## Bản đồ tệp

| Tệp | Trách nhiệm | Task |
|---|---|---|
| `scripts/brand/build_wordmark.py`, `scripts/brand/build-icons.mjs` | Dựng SVG, PNG của logo từ hình học `Lockups.dc.html` | 1 |
| `public/brand/*.svg`, `app/icon.svg`, `app/icon.png`, `app/apple-icon.png` | Tài sản logo đã dựng | 1 |
| `components/ui/Logo.tsx` | `LogoMark` (SVG nội tuyến), `Logo` (wordmark qua `next/image`) | 1 |
| `lib/seo/app-facts.ts` | Dữ kiện app có nguồn | 2 |
| `lib/seo/brand.ts` | Định danh thương hiệu, câu mô tả chuẩn, bản đồ từ khoá (chú thích) | 2 |
| `tests/unit/app-facts.test.ts` | Quét chữ tìm con số và khẳng định lệch `app-facts` | 3 |
| `lib/next-routes.ts` | Chuyển hướng 308, header bảo mật, `X-Robots-Tag` preview, bí danh `*.vercel.app` | 4, 11 |
| `i18n/switch.ts` | URL cùng trang ở ngôn ngữ kia, hàm thuần | 5, 11 |
| `lib/seo/pages.ts` | Sổ trang indexable: SEO, URL, từ khoá, lastmod | 6, 7, 11, 18 |
| `lib/seo/metadata.ts` | `buildMetadata`, URL ảnh chia sẻ | 6, 17, 18 |
| `lib/seo/jsonld.ts` | Builder JSON-LD có `@id` | 8 |
| `app/robots.ts` | Nhóm bot AI | 9 |
| `content/docs/slugs.ts`, `content/docs/index.ts` | Sổ bài hướng dẫn, bảng import MDX | 10 tới 16 |
| `lib/docs/validate.ts`, `lib/docs/toc.ts` | Luật sổ và thân bài; mục lục và id tiêu đề | 10 |
| `app/[locale]/docs/...`, `components/docs/*` | Mục lục hướng dẫn và trang bài | 11 |
| `content/docs/{vi,en}/*.mdx` | 12 bài × 2 ngôn ngữ | 11 tới 16 |
| `app/og/docs/[slug]/route.tsx` | Ảnh chia sẻ bài hướng dẫn | 17 |
| `content/topics/*.ts`, `components/topic/TopicPage.tsx`, `app/[locale]/<chủ đề>/` | Sáu trang chủ đề | 18 tới 20 |
| `components/level/*` | Khối mới của ba trang cấp | 21 |
| `components/site/Footer.tsx`, `messages/*.json` (`home`) | Footer năm cột, chữ trang chủ | 22 |
| `lib/seo/llms.ts`, `app/llms.txt/route.ts`, `app/llms-full.txt/route.ts` | Bản đồ site cho mô hình AI | 23 |
| `tests/e2e/links.spec.ts`, `scripts/seo-audit.mjs`, `.github/workflows/ci.yml`, `lighthouserc.json` | Kiểm link nội bộ, cổng SEO trên CI | 24 |
| `docs/thiet-ke/v2/...` | Canvas Claude Design v2 | 25 |

---

### Task 1: Logo, icon và tài sản thương hiệu

Thay logo cũ (ô xanh, nét chữ E) bằng logo mới: mũ tốt nghiệp ghép chữ E, olive `#567F2E` và cam `#F2A541` (spec §5.3, giả định AS-R1). Màu và bố cục của site giữ nguyên tới Kế hoạch 2.

**Files:**
- Modify: `.gitignore` (thêm `.superpowers/`, người dùng đã đồng ý ngày 14/10)
- Create: `scripts/brand/build_wordmark.py`, `scripts/brand/build-icons.mjs`
- Create (sinh bằng script): `public/brand/eduflow-mark.svg`, `public/brand/eduflow-mark-white.svg`, `public/brand/eduflow-wordmark.svg`, `public/brand/eduflow-wordmark-white.svg`
- Modify (sinh bằng script): `app/icon.svg`, `app/icon.png`, `app/apple-icon.png`
- Modify: `components/ui/Logo.tsx`, `components/site/Header.tsx`, `components/site/Footer.tsx`, `lib/seo/og.tsx`, `app/manifest.ts`, `app/[locale]/layout.tsx` (chỉ `themeColor`)
- Test: `tests/unit/brand-assets.test.ts`

**Interfaces:**
- Consumes: không.
- Produces: `LogoMark({ size?: number; title?: string; tone?: 'color' | 'white'; small?: boolean }): JSX.Element`; `Logo({ height?: number; tone?: 'color' | 'white'; priority?: boolean }): JSX.Element` (wordmark, `alt="EduFlow"`); hằng `BRAND_COLORS = { olive: '#567F2E', orange: '#F2A541' }` trong `components/ui/Logo.tsx`.

- [ ] **Step 1: Thêm `.superpowers/` vào `.gitignore`**

Thêm vào cuối `.gitignore`:

```gitignore

# công cụ lập kế hoạch cục bộ (superpowers): không commit
.superpowers/
```

Chạy: `git status --short`
Kỳ vọng: dòng `?? .superpowers/` biến mất, chỉ còn ` M .gitignore`.

- [ ] **Step 2: Viết test hỏng**

`tests/unit/brand-assets.test.ts`:

```ts
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { expect, test } from 'vitest'
import manifest from '@/app/manifest'

const path = (p: string) => fileURLToPath(new URL(`../../${p}`, import.meta.url))
const read = (p: string) => readFileSync(path(p), 'utf8')

test('brand marks use the logo colours on the 120 grid of the lockups', () => {
  for (const f of ['public/brand/eduflow-mark.svg', 'public/brand/eduflow-mark-white.svg']) {
    expect(read(f), f).toContain('viewBox="0 0 120 120"')
    expect(read(f), f).toContain('#F2A541')
  }
  expect(read('public/brand/eduflow-mark.svg')).toContain('#567F2E')
  expect(read('public/brand/eduflow-mark-white.svg')).toContain('#FFFFFF')
})

test('wordmarks carry the lettering as paths, never as text or a font', () => {
  for (const f of ['public/brand/eduflow-wordmark.svg', 'public/brand/eduflow-wordmark-white.svg']) {
    const svg = read(f)
    expect(svg, f).toMatch(/viewBox="0 0 \d+ 104"/)
    expect(svg, f).toMatch(/<path d="M/)
    expect(svg, f).not.toMatch(/<text|font-family|Sora/i)
  }
})

test('the favicon is the small mark (no tassel cord) on an olive tile', () => {
  const svg = read('app/icon.svg')
  expect(svg).toContain('fill="#567F2E"')
  expect(svg).not.toContain('<path')
})

test('PNG icons have the declared sizes and the Apple icon is opaque', async () => {
  const meta = async (p: string) => sharp(path(p)).metadata()
  expect(await meta('app/apple-icon.png')).toMatchObject({ width: 180, height: 180 })
  expect(await meta('app/icon.png')).toMatchObject({ width: 192, height: 192 })
  expect((await sharp(path('app/apple-icon.png')).stats()).isOpaque).toBe(true)
  expect(manifest().theme_color).toBe('#567F2E')
})
```

- [ ] **Step 3: Chạy test để thấy hỏng**

Chạy: `pnpm vitest run tests/unit/brand-assets.test.ts`
Kỳ vọng: FAIL, `ENOENT ... public/brand/eduflow-mark.svg` và `theme_color` là `#237A31`.

- [ ] **Step 4: Viết script dựng wordmark**

`scripts/brand/build_wordmark.py` (đã chạy thử với Sora bản Google Fonts ngày 15/10/2026: ra `viewBox 0 0 421 104`, khớp PNG wordmark gốc):

```python
"""Dựng public/brand/eduflow-wordmark*.svg: dấu hiệu + chữ "EduFlow" (Sora 700 "Edu", Sora 400 "Flow") đã chuyển thành path.

Chạy từ gốc repo: python3 scripts/brand/build_wordmark.py <đường dẫn Sora[wght].ttf> public/brand
Font: https://github.com/google/fonts/raw/main/ofl/sora/Sora%5Bwght%5D.ttf (OFL). Không commit font, chỉ commit SVG.
Hình học theo lockup thứ nhất của Lockups.dc.html: dấu hiệu 104, cách 20, chữ 72 px, letter-spacing -0.03em.
Sora không có chữ tiếng Việt có dấu thanh, nên site không nạp font này; chữ trong logo là path (spec §5.2, §5.3).
"""
import sys
from pathlib import Path

from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

MARK = 104
GAP = 20
SIZE = 72
TRACKING = -0.03  # em
OLIVE, ORANGE, WHITE = '#567F2E', '#F2A541', '#FFFFFF'

# Dấu hiệu trên lưới 120: thân một màu, tua (dây, nút, quả tua) một màu.
MARK_BODY = (
    '<polygon points="60,12 112,34 60,56 8,34"/>'
    '<polygon points="22,45 36,51 36,108 22,108"/>'
    '<rect x="22" y="72" width="52" height="13" rx="2"/>'
    '<rect x="22" y="95" width="70" height="13" rx="2"/>'
)
MARK_TASSEL = (
    '<path d="M60 34 L98 40 V64" fill="none" stroke="{c}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>'
    '<circle cx="60" cy="34" r="4.5" fill="{c}"/>'
    '<rect x="93" y="62" width="10" height="17" rx="3" fill="{c}"/>'
)


def instance(path: str, weight: int) -> TTFont:
    return instantiateVariableFont(TTFont(path), {'wght': weight})


def run(font: TTFont, text: str, x0: float, scale: float):
    """Path SVG của một đoạn chữ, gốc toạ độ ở đường cơ sở (trục y của font hướng lên, của SVG hướng xuống)."""
    glyphs = font.getGlyphSet()
    cmap = font.getBestCmap()
    hmtx = font['hmtx']
    track = TRACKING * font['head'].unitsPerEm
    parts, x, bounds = [], x0, None
    for ch in text:
        name = cmap[ord(ch)]
        transform = (scale, 0, 0, -scale, x, 0)
        pen = SVGPathPen(glyphs)
        glyphs[name].draw(TransformPen(pen, transform))
        parts.append(pen.getCommands())
        bp = BoundsPen(glyphs)
        glyphs[name].draw(TransformPen(bp, transform))
        if bp.bounds:
            b = bp.bounds
            bounds = b if bounds is None else (min(bounds[0], b[0]), min(bounds[1], b[1]), max(bounds[2], b[2]), max(bounds[3], b[3]))
        x += (hmtx[name][0] + track) * scale
    return ' '.join(parts), x, bounds


def main(font_path: str, out_dir: str) -> None:
    bold, regular = instance(font_path, 700), instance(font_path, 400)
    scale = SIZE / bold['head'].unitsPerEm
    edu, x1, b1 = run(bold, 'Edu', MARK + GAP, scale)
    flow, _, b2 = run(regular, 'Flow', x1, scale)
    top, bottom = min(b1[1], b2[1]), max(b1[3], b2[3])
    # Căn giữa khối chữ (đỉnh chữ cao nhất tới đáy chữ thấp nhất) theo tâm dấu hiệu.
    dy = MARK / 2 - (top + bottom) / 2
    width = round(max(b1[2], b2[2]) + 2)
    variants = (('eduflow-wordmark.svg', OLIVE, OLIVE), ('eduflow-wordmark-white.svg', WHITE, WHITE))
    for name, body, text in variants:
        svg = (
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {MARK}" role="img" aria-label="EduFlow">'
            f'<g transform="scale({MARK / 120:.4f})"><g fill="{body}">{MARK_BODY}</g>{MARK_TASSEL.format(c=ORANGE)}</g>'
            f'<g fill="{text}" transform="translate(0 {dy:.2f})"><path d="{edu}"/><path d="{flow}"/></g>'
            '</svg>\n'
        )
        Path(out_dir, name).write_text(svg, encoding='utf-8')
        print(f'{name}: viewBox 0 0 {width} {MARK}')


if __name__ == '__main__':
    if len(sys.argv) != 3:
        sys.exit('Cách dùng: python3 scripts/brand/build_wordmark.py <Sora[wght].ttf> <thư mục ra>')
    main(sys.argv[1], sys.argv[2])
```

- [ ] **Step 5: Viết script dựng icon**

`scripts/brand/build-icons.mjs`:

```js
// Dựng icon của site từ hình học dấu hiệu EduFlow (Lockups.dc.html, lưới 120): app/icon.svg (favicon), app/icon.png (192),
// app/apple-icon.png (180, cũng là logo JSON-LD) và public/brand/eduflow-mark*.svg. Chạy từ gốc repo: node scripts/brand/build-icons.mjs
import { writeFile } from 'node:fs/promises'
import sharp from 'sharp'

const OLIVE = '#567F2E'
const ORANGE = '#F2A541'
const WHITE = '#FFFFFF'

/** Dấu hiệu đầy đủ: thân một màu, tua (dây, nút, quả tua) màu khác. */
const markFull = (body, tassel) =>
  `<g fill="${body}"><polygon points="60,12 112,34 60,56 8,34"/><polygon points="22,45 36,51 36,108 22,108"/>` +
  `<rect x="22" y="72" width="52" height="13" rx="2"/><rect x="22" y="95" width="70" height="13" rx="2"/></g>` +
  `<path d="M60 34 L98 40 V64" fill="none" stroke="${tassel}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>` +
  `<circle cx="60" cy="34" r="4.5" fill="${tassel}"/><rect x="93" y="62" width="10" height="17" rx="3" fill="${tassel}"/>`

/** Bản rút gọn cho cỡ 48 px trở xuống: bỏ dây tua, hai thanh dày hơn (ô 48 px trong lockup app icon). */
const markSmall = (body, tassel) =>
  `<g fill="${body}"><polygon points="60,12 112,34 60,56 8,34"/><polygon points="22,45 36,51 36,108 22,108"/>` +
  `<rect x="22" y="70" width="54" height="16" rx="2"/><rect x="22" y="92" width="72" height="16" rx="2"/></g>` +
  `<rect x="93" y="58" width="12" height="20" rx="3" fill="${tassel}"/>`

/** Ô vuông nền olive, dấu hiệu trắng, tua cam. radius 0: ô kín (Apple tự bo góc). */
const tile = (size, radius, markSize, mark) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">` +
  `<rect width="${size}" height="${size}" rx="${radius}" fill="${OLIVE}"/>` +
  `<g transform="translate(${(size - markSize) / 2} ${(size - markSize) / 2}) scale(${markSize / 120})">${mark}</g></svg>\n`

const svgFiles = {
  // Favicon hiện ở 16 tới 32 px: bản rút gọn trong ô 48 px của lockup (bo 12, dấu hiệu 36).
  'app/icon.svg': tile(48, 12, 36, markSmall(WHITE, ORANGE)),
  'public/brand/eduflow-mark.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" role="img" aria-label="EduFlow">${markFull(OLIVE, ORANGE)}</svg>\n`,
  'public/brand/eduflow-mark-white.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" role="img" aria-label="EduFlow">${markFull(WHITE, ORANGE)}</svg>\n`,
}
for (const [path, svg] of Object.entries(svgFiles)) await writeFile(path, svg)

// PNG theo lockup app icon 180 px (bo 40, dấu hiệu 128), co giãn theo cạnh.
await sharp(Buffer.from(tile(180, 0, 128, markFull(WHITE, ORANGE)))).png().toFile('app/apple-icon.png')
await sharp(Buffer.from(tile(192, (40 / 180) * 192, (128 / 180) * 192, markFull(WHITE, ORANGE)))).png().toFile('app/icon.png')
console.log('Đã ghi', [...Object.keys(svgFiles), 'app/apple-icon.png', 'app/icon.png'].join(', '))
```

- [ ] **Step 6: Chạy hai script**

```bash
FONT_DIR=$(mktemp -d)
curl -fsSL -o "$FONT_DIR/Sora.ttf" "https://github.com/google/fonts/raw/main/ofl/sora/Sora%5Bwght%5D.ttf"
mkdir -p public/brand
python3 scripts/brand/build_wordmark.py "$FONT_DIR/Sora.ttf" public/brand
node scripts/brand/build-icons.mjs
rm -r "$FONT_DIR"
```

Kỳ vọng: in `eduflow-wordmark.svg: viewBox 0 0 421 104` (con số chiều rộng có thể lệch 1 tới 2 nếu Google cập nhật font), `eduflow-wordmark-white.svg: ...` và `Đã ghi app/icon.svg, ...`. Mở `public/brand/eduflow-wordmark.svg` trong trình duyệt, so với `~/Downloads/agentra-test/eduflow-logo/eduflow-logo-wordmark.png`: cùng hình, cùng tỷ lệ.

- [ ] **Step 7: Viết lại `components/ui/Logo.tsx`**

```tsx
import Image from 'next/image'

/** Màu logo (Lockups.dc.html, AS-R1). Kế hoạch 2 đưa hai màu này vào token của site. */
export const BRAND_COLORS = { olive: '#567F2E', orange: '#F2A541' } as const

/**
 * Dấu hiệu EduFlow: mũ tốt nghiệp ghép chữ E, lưới 120 của Lockups.dc.html. `small` (mặc định khi ≤ 32 px) là bản rút gọn
 * của lockup: bỏ dây tua, hai thanh dày hơn, để còn đọc được ở cỡ nhỏ. `tone="white"` cho nền đậm (tua vẫn cam).
 */
export function LogoMark({ size = 32, title, tone = 'color', small = size <= 32 }: { size?: number; title?: string; tone?: 'color' | 'white'; small?: boolean }) {
  const body = tone === 'white' ? '#FFFFFF' : BRAND_COLORS.olive
  const tassel = BRAND_COLORS.orange
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" {...(title ? { role: 'img', 'aria-label': title } : { 'aria-hidden': true })}>
      {title ? <title>{title}</title> : null}
      <g fill={body}>
        <polygon points="60,12 112,34 60,56 8,34" />
        <polygon points="22,45 36,51 36,108 22,108" />
        {small ? (
          <>
            <rect x="22" y="70" width="54" height="16" rx="2" />
            <rect x="22" y="92" width="72" height="16" rx="2" />
          </>
        ) : (
          <>
            <rect x="22" y="72" width="52" height="13" rx="2" />
            <rect x="22" y="95" width="70" height="13" rx="2" />
          </>
        )}
      </g>
      {small ? (
        <rect x="93" y="58" width="12" height="20" rx="3" fill={tassel} />
      ) : (
        <>
          <path d="M60 34 L98 40 V64" fill="none" stroke={tassel} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="60" cy="34" r="4.5" fill={tassel} />
          <rect x="93" y="62" width="10" height="17" rx="3" fill={tassel} />
        </>
      )}
    </svg>
  )
}

/** Logo đủ (dấu hiệu và chữ EduFlow dạng path, không nạp font Sora). Tỷ lệ theo viewBox của tệp SVG (421 × 104). */
export function Logo({ height = 30, tone = 'color', priority = false }: { height?: number; tone?: 'color' | 'white'; priority?: boolean }) {
  const src = tone === 'white' ? '/brand/eduflow-wordmark-white.svg' : '/brand/eduflow-wordmark.svg'
  return <Image src={src} alt="EduFlow" width={Math.round((height * 421) / 104)} height={height} priority={priority} unoptimized />
}
```

Nếu Step 6 in chiều rộng khác 421, sửa số `421` ở hai chỗ trong `Logo` theo đúng con số đã in.

- [ ] **Step 8: Dùng logo mới ở Header và Footer**

`components/site/Header.tsx`: đổi import `import { LogoMark, Wordmark } from '@/components/ui/Logo'` thành `import { Logo } from '@/components/ui/Logo'`, và thay khối

```tsx
        <Link href="/" className="flex min-h-11 items-center gap-2.5">
          <LogoMark size={30} />
          <Wordmark />
        </Link>
```

bằng

```tsx
        <Link href="/" className="flex min-h-11 items-center">
          <Logo height={30} priority />
        </Link>
```

`components/site/Footer.tsx`: cùng đổi import, và thay

```tsx
            <Link href="/" className="flex min-h-11 items-center gap-2.5 md:min-h-0">
              <LogoMark size={30} />
              <Wordmark />
            </Link>
```

bằng

```tsx
            <Link href="/" className="flex min-h-11 items-center md:min-h-0">
              <Logo height={30} />
            </Link>
```

Tên truy cập của link logo vẫn là "EduFlow" (từ `alt`), nên test `mobile.spec.ts` bấm logo theo tên vẫn chạy.

- [ ] **Step 9: Logo mới trên ảnh chia sẻ, manifest và theme color**

`lib/seo/og.tsx`: thêm `import { LogoMark } from '@/components/ui/Logo'`; thay khối `<svg width="56" ...>...</svg>` bằng `<LogoMark size={56} tone="white" small={false} />`; đổi nền thành `background: 'linear-gradient(135deg, #1E2A14 0%, #567F2E 100%)'` (ink và olive của spec §5.1); đổi khung nhãn phiên bản thành `background: 'rgba(242,165,65,0.22)'`, `border: '1px solid rgba(242,165,65,0.6)'`, `color: '#FDF1DE'`. Sửa chú thích đầu hàm thành `/** Ảnh Open Graph 1200×630: nền ink tới olive, logo, tiêu đề và dòng phụ (spec §9.1). */`.

`app/manifest.ts`: `description: 'Phần mềm AI cho giáo viên và giảng viên: soạn đề kiểm tra, giáo án, slide, đề cương học phần'`, `background_color: '#FFFFFF'`, `theme_color: '#567F2E'`.

`app/[locale]/layout.tsx`: `export const viewport: Viewport = { themeColor: '#567F2E', width: 'device-width', initialScale: 1 }`.

- [ ] **Step 10: Chạy test và verify**

Chạy: `pnpm vitest run tests/unit/brand-assets.test.ts && pnpm verify`
Kỳ vọng: PASS; `pnpm verify` xanh (test icon cũ `tests/unit/icon.test.ts` là bộ icon nét, không đổi).

- [ ] **Step 11: Xem bằng mắt**

Chạy `pnpm dev`, mở http://localhost:3000 và http://localhost:3000/opengraph-image. Kỳ vọng: header và footer có logo olive cam, không vỡ chiều cao header (64 px điện thoại, 72 px desktop); ảnh chia sẻ có dấu hiệu trắng tua cam trên nền ink tới olive. Tab trình duyệt hiện favicon mới. Dừng `pnpm dev`.

- [ ] **Step 12: Commit**

```bash
git add .gitignore scripts/brand public/brand app/icon.svg app/icon.png app/apple-icon.png components/ui/Logo.tsx components/site/Header.tsx components/site/Footer.tsx lib/seo/og.tsx app/manifest.ts "app/[locale]/layout.tsx" tests/unit/brand-assets.test.ts
git commit -m "feat(brand): logo mũ tốt nghiệp ghép chữ E, icon và ảnh chia sẻ theo lockup mới"
```

---

### Task 2: Định danh thương hiệu và dữ kiện app

Chép khuôn `lib/seo/brand.ts` của DocOps (spec §8.1) và tạo `lib/seo/app-facts.ts` (spec §8.2). Các dữ kiện dưới đây đã kiểm với `eduflow-application@ed025cf`; repo app chưa đổi từ lúc kiểm (đầu `main` vẫn là `ed025cf` ngày 15/10).

**Files:**
- Create: `lib/seo/app-facts.ts`, `lib/seo/brand.ts`
- Test: `tests/unit/brand.test.ts`

**Interfaces:**
- Consumes: `Locale` từ `@/i18n/routing`.
- Produces:
  - `appFacts` (hằng `as const`): `maxTestVersions: 24`, `matrixLevels: 4`, `cv7991Levels: 3`, `k12Gates: 12`, `testGates: 8`, `courseGates: 12`, `programGates: 12`, `levels: 3`, `testQuestionTypes: readonly ['multiple-choice']`, `localWorkCostVnd: 0`, `budgetWarnPercent: 80`, `trialDevices: 1`, `platforms`, `minOs: { macos: '12'; windows: '10 22H2' }`, `installerSigned: false`.
  - `brand`: `name`, `alternateName`, `category: Record<Locale, string>`, `description: Record<Locale, string>`, `disambiguation`, `organization`, `audience: Record<Locale, string>`, `features: Record<Locale, string[]>`, `sameAs: string[]`.

- [ ] **Step 1: Viết test hỏng**

`tests/unit/brand.test.ts`:

```ts
import { expect, test } from 'vitest'
import { appFacts } from '@/lib/seo/app-facts'
import { brand } from '@/lib/seo/brand'

test('the canonical description is 110 to 160 characters and starts with the definition', () => {
  expect(brand.description.vi.startsWith('EduFlow là phần mềm AI cho giáo viên và giảng viên')).toBe(true)
  expect(brand.description.en.startsWith('EduFlow is AI software for teachers and lecturers')).toBe(true)
  for (const d of Object.values(brand.description)) {
    expect([...d].length).toBeGreaterThanOrEqual(110)
    expect([...d].length).toBeLessThanOrEqual(160)
  }
})

test('the disambiguation names the other Eduflow so assistants do not mix them up', () => {
  expect(brand.disambiguation.vi).toContain('eduflow.com')
  expect(brand.disambiguation.en).toContain('eduflow.com')
  expect(brand.alternateName).toBe('Agentra EduFlow')
})

test('features list only what the first release ships, the same in both languages', () => {
  expect(brand.features.vi).toHaveLength(brand.features.en.length)
  // R6: site nói ba cấp, nhưng featureList chỉ gồm tính năng v1 (Phổ thông, trợ lý, đọc tài liệu, chi phí).
  for (const f of [...brand.features.vi, ...brand.features.en]) expect(f).not.toMatch(/CLO|đề cương|syllab|curriculum|chương trình đào tạo/i)
  expect(brand.features.vi.join(' ')).toContain(`${appFacts.maxTestVersions} mã đề`)
  expect(brand.features.en.join(' ')).toContain(`${appFacts.maxTestVersions} test versions`)
})

test('no external profile is listed until the product owner confirms it (OQ-R3)', () => {
  expect(brand.sameAs).toEqual([])
})
```

- [ ] **Step 2: Chạy test để thấy hỏng**

Chạy: `pnpm vitest run tests/unit/brand.test.ts`
Kỳ vọng: FAIL, `Failed to resolve import "@/lib/seo/app-facts"`.

- [ ] **Step 3: Viết `lib/seo/app-facts.ts`**

```ts
/*
 * Dữ kiện sản phẩm: nguồn duy nhất cho mọi con số và khẳng định về app EduFlow trên site (spec §8.2). Đã kiểm với
 * eduflow-application@ed025cf (main, 14/10/2026). Giữ cho đúng sự thật: app đổi thì sửa ở đây trước, rồi chạy
 * `pnpm test`: tests/unit/app-facts.test.ts quét messages, content/topics và content/docs, báo mọi câu lệch.
 */
export const appFacts = {
  /** Số mã đề tối đa mỗi đề. Nguồn: E1 (v2-scope §2, "số mã đề đến 24"), OQ-213 chốt 10/10/2026, BR-212, AS-220. */
  maxTestVersions: 24,
  /** Số mức của ma trận đề: nhận biết, thông hiểu, vận dụng, vận dụng cao. Nguồn: M2b ("ma trận chủ đề × bốn mức"). */
  matrixLevels: 4,
  /** Ba mức Biết, Hiểu, Vận dụng của Công văn 7991: app CHƯA có, chỉ được nêu là lộ trình. Nguồn: OQ-218 (còn mở). */
  cv7991Levels: 3,
  /** Bảng cổng chất lượng P1..P12 của cấp Phổ thông. Nguồn: PT-DUYET-XUAT. */
  k12Gates: 12,
  /** Số cổng đề kiểm tra chạy thật: mỗi loại hiện vật chỉ chạy cổng áp dụng. Nguồn: TC-230-01. */
  testGates: 8,
  /** Cổng G1..G12 của Học phần và K1..K12 của Chương trình: thuộc v2 của app (V2-12, V2-14); site vẫn nêu theo R6. */
  courseGates: 12,
  programGates: 12,
  /** Ba cấp trên site (Phổ thông, Học phần, Chương trình), theo R6; v1 của app chỉ có Phổ thông (rủi ro K1). */
  levels: 3,
  /** Dạng câu của đề ở v1: chỉ nhiều lựa chọn. Đúng sai, trả lời ngắn, tự luận có ý là E2a (V2-05). */
  testQuestionTypes: ['multiple-choice'],
  /** Việc chạy tại máy (cổng, trộn mã đề, biên dịch, đọc và OCR tại máy) tốn 0 đồng. Nguồn: spec app §8, DR2a. */
  localWorkCostVnd: 0,
  /** Ngân sách tháng của key cảnh báo khi dùng tới 80%. Nguồn: M1f, spec 30/09. */
  budgetWarnPercent: 80,
  /** Key dùng thử chạy trên 1 máy, có ngân sách và ngày hết hạn. Nguồn: RK1, US-101 tới US-108. */
  trialDevices: 1,
  /** Bộ cài có cho: dmg arm64 và x64, nsis x64. Nguồn: packages/desktop/package.json, R1. */
  platforms: { macos: ['Apple Silicon', 'Intel'], windows: ['x64'] },
  /** Hệ điều hành tối thiểu, như trang Tải về đã công bố (spec 30/09). */
  minOs: { macos: '12', windows: '10 22H2' },
  /**
   * Bộ cài đã ký số và notarize chưa. false: mac `identity: "-"` (ký ad-hoc), Windows NSIS không chứng thư (R1; ký thật
   * thuộc M1c2, V2-07). Đổi thành true khi có chứng thư: test buộc sửa mọi câu "chưa ký" theo.
   */
  installerSigned: false,
} as const
```

- [ ] **Step 4: Viết `lib/seo/brand.ts`**

```ts
import type { Locale } from '@/i18n/routing'
import { appFacts } from './app-facts'

/*
 * Nguồn duy nhất cho định danh thương hiệu mà công cụ tìm kiếm và trợ lý AI đọc (spec §8.1).
 *
 * `description` là CÂU MÔ TẢ CHUẨN: dùng nguyên văn cho meta description trang chủ, JSON-LD (WebSite, SoftwareApplication),
 * câu trả lời "EduFlow là gì?" ở hỏi đáp trang chủ, llms.txt và mọi hồ sơ bên ngoài. Mô tả khác nhau trên mạng thì câu
 * trả lời của AI cũng khác nhau: sửa ở đây, đừng viết lại ở chỗ khác. PO duyệt ở OQ-R1.
 *
 * Bản đồ từ khoá (spec §4.2; mỗi URL một từ khoá chính, đứng đầu; slug là từ khoá chính; khoá nội bộ của routing giữ như cũ):
 *   / · /en                                    phần mềm AI cho giáo viên; EduFlow, Agentra EduFlow
 *   /ai-cho-giao-vien                          AI cho giáo viên; phần mềm soạn đề kiểm tra, AI soạn giáo án
 *   /ai-cho-giang-vien                         AI cho giảng viên; chuẩn đầu ra học phần (CLO), kế hoạch tuần
 *   /ra-soat-chuong-trinh-dao-tao              rà soát chương trình đào tạo; ma trận chuẩn đầu ra của CTĐT, curriculum map
 *   /ai-tao-de-kiem-tra-theo-ma-tran           AI tạo đề kiểm tra; ma trận đề kiểm tra, bản đặc tả đề kiểm tra, AI tạo đề theo ma trận
 *   /tron-de-trac-nghiem                       trộn đề trắc nghiệm; tạo nhiều mã đề, phần mềm trộn đề
 *   /ai-soan-giao-an                           AI soạn giáo án; giáo án 5512, kế hoạch bài dạy 5512
 *   /tao-slide-bai-giang-bang-ai               tạo slide bài giảng bằng AI; AI tạo slide bài giảng
 *   /de-cuong-chi-tiet-hoc-phan                đề cương chi tiết học phần; mẫu đề cương, cấu trúc đề cương
 *   /eduflow-va-chatgpt                        ChatGPT soạn giáo án; EduFlow và ChatGPT, câu lệnh ChatGPT soạn giáo án
 *   /tro-ly-ai                                 trợ lý AI cho giáo viên
 *   /cach-tinh-phi                             chi phí EduFlow, tính phí theo token
 *   /tai-ve                                    tải EduFlow cho macOS, Windows
 *   /minh-bach-ai                              minh bạch AI, dữ liệu của trường
 *   /lien-he                                   liên hệ Agentra EduFlow
 *   /chinh-sach-bao-mat                        (không nhắm từ khoá)
 *   /huong-dan                                 hướng dẫn sử dụng EduFlow
 *   /huong-dan/<slug>                          mỗi bài một tác vụ ("cách soạn đề kiểm tra trên EduFlow")
 * Luật:
 * - Không hai URL cùng từ khoá chính (tests/unit/seo-pages.test.ts). Dữ liệu từ khoá ở lib/seo/pages.ts, content/topics, content/docs.
 * - Anchor text của link nội bộ tới một trang là từ khoá chính của trang đó, và chỉ dùng cho trang đó.
 * - Bài hướng dẫn nhắm từ khoá dạng tác vụ, không lấy từ khoá chính của trang chủ đề.
 * - <title> ≤ 60 ký tự kể cả hậu tố; meta description 110 tới 160 ký tự.
 */
export const brand = {
  name: 'EduFlow',
  alternateName: 'Agentra EduFlow',
  /** Danh mục, đúng cách người tìm gọi tên loại sản phẩm này. */
  category: {
    vi: 'Phần mềm AI cho giáo viên và giảng viên',
    en: 'AI software for teachers and lecturers',
  },
  description: {
    vi: 'EduFlow là phần mềm AI cho giáo viên và giảng viên: soạn đề kiểm tra theo ma trận, giáo án, slide, đề cương học phần, có trợ lý AI và người duyệt.',
    en: 'EduFlow is AI software for teachers and lecturers: matrix-based tests, lesson plans, slides and course syllabi, with an AI assistant and human review.',
  },
  /** Tên "Eduflow" đã có chủ trên mạng (eduflow.com): thiếu câu này, trợ lý AI và Google dễ nhầm hai sản phẩm (rủi ro K2). */
  disambiguation: {
    vi: 'EduFlow của Agentra JSC (Đà Nẵng, Việt Nam) là ứng dụng desktop cho giáo viên và giảng viên, không phải nền tảng học tập cộng tác Eduflow (eduflow.com, nay thuộc Multiverse).',
    en: 'EduFlow by Agentra JSC (Da Nang, Vietnam) is a desktop app for teachers and lecturers, not the Eduflow collaborative learning platform (eduflow.com, now part of Multiverse).',
  },
  /** Mô tả công ty, theo trang agentra.io.vn (cùng câu với DocOps). */
  organization: {
    vi: 'Agentra JSC là công ty phát triển workflow AI cho giáo dục Việt Nam, trụ sở tại Đà Nẵng.',
    en: 'Agentra JSC builds AI workflows for Vietnamese education and is based in Da Nang, Vietnam.',
  },
  audience: {
    vi: 'Giáo viên phổ thông, tổ trưởng chuyên môn, giảng viên đại học, trưởng bộ môn và Phòng Đảm bảo chất lượng',
    en: 'K-12 teachers, heads of subject groups, university lecturers, heads of department and quality assurance offices',
  },
  /** Chỉ tính năng có trong bản phát hành đầu của app (v1); JSON-LD featureList và llms.txt dùng danh sách này. */
  features: {
    vi: [
      `Soạn đề kiểm tra trắc nghiệm nhiều lựa chọn theo ma trận chủ đề × ${appFacts.matrixLevels} mức (nhận biết, thông hiểu, vận dụng, vận dụng cao); AI viết câu, thầy cô duyệt từng câu`,
      `Xuất đề tối đa ${appFacts.maxTestVersions} mã đề, xáo trộn câu hỏi và phương án theo khoá cố định, kèm đáp án và hướng dẫn chấm ở tệp riêng`,
      'Giáo án theo Công văn 5512 và slide bài giảng 16:9 có quiz, từ khung chương trình GDPT 2018 có sẵn trong app',
      'Cổng chất lượng chạy tại máy, mỗi cổng in số đơn vị đã kiểm; thầy cô duyệt và ký trước khi xuất',
      'Trợ lý AI ở trang chủ và cạnh mọi màn làm việc, đề xuất vào bản nháp, không duyệt và không ký thay người',
      'Đọc tài liệu và nhận dạng chữ (OCR) ngay tại máy, không tốn tiền',
      'Chi phí AI hiện trước khi chạy, ngân sách tháng theo key; việc chạy tại máy không tốn tiền',
      'Ứng dụng desktop cho macOS (Apple Silicon, Intel) và Windows 64-bit; dữ liệu dự án nằm ở máy thầy cô',
    ],
    en: [
      `Multiple-choice tests built from a topic × ${appFacts.matrixLevels}-level matrix (recognition, comprehension, application, advanced application); AI writes the items, you review each one`,
      `Export up to ${appFacts.maxTestVersions} test versions, with questions and options shuffled by a fixed key, and the answer key and marking guide in separate files`,
      'Official Letter 5512 lesson plans and 16:9 lesson slides with quizzes, from the 2018 general education curriculum built into the app',
      'Quality gates run on your computer and each gate reports how many units it checked; you review and sign before exporting',
      'An AI assistant on the home screen and beside every work screen, suggesting changes to a draft, never approving or signing for you',
      'Document reading and text recognition (OCR) on your computer, at no cost',
      'AI costs shown before anything runs, a monthly budget per key; local work is free',
      'A desktop app for macOS (Apple Silicon, Intel) and 64-bit Windows; project data stays on your computer',
    ],
  },
  /** Hồ sơ ngoài có thật (OQ-R3). Rỗng tới khi PO xác nhận; thêm hồ sơ thì dán nguyên văn `description` vào hồ sơ đó trước. */
  sameAs: [] as string[],
} satisfies {
  name: string
  alternateName: string
  category: Record<Locale, string>
  description: Record<Locale, string>
  disambiguation: Record<Locale, string>
  organization: Record<Locale, string>
  audience: Record<Locale, string>
  features: Record<Locale, string[]>
  sameAs: string[]
}
```

- [ ] **Step 5: Chạy test**

Chạy: `pnpm vitest run tests/unit/brand.test.ts`
Kỳ vọng: PASS (4 test). Nếu test thứ ba báo thiếu "24 test versions": câu tiếng Anh thứ hai phải chứa đúng chuỗi `24 test versions`.

- [ ] **Step 6: Verify và commit**

```bash
pnpm verify
git add lib/seo/app-facts.ts lib/seo/brand.ts tests/unit/brand.test.ts
git commit -m "feat(seo): định danh thương hiệu, câu mô tả chuẩn và dữ kiện app có nguồn"
```

---

### Task 3: Luật nội dung mới: dữ kiện app, ký số theo cờ, nhà cung cấp mô hình

Test quét mọi chữ về app tìm con số lệch `app-facts` và khẳng định ký số lệch cờ `installerSigned` (spec §12.1). Sửa các câu hiện có còn khẳng định bộ cài đã ký (spec §7.5): `download.signed`, `download.lead`, `download.leadNoDate`, `download.meta.description`, `install.meta.windows.description`, bốn MDX cài đặt. Nới luật nhà cung cấp cho "ChatGPT" (quyết định 6).

**Files:**
- Create: `tests/unit/app-facts.test.ts`
- Modify: `messages/vi.json`, `messages/en.json` (namespace `download`, `install.meta`), `app/[locale]/download/page.tsx`, `content/install/vi/macos.mdx`, `content/install/en/macos.mdx`, `content/install/vi/windows.mdx`, `content/install/en/windows.mdx`, `tests/unit/content.test.ts`, `tests/unit/guides.test.ts`

**Interfaces:**
- Consumes: `appFacts` (Task 2).
- Produces: khoá messages `download.signing.signed.{title,body}`, `download.signing.unsigned.{title,body}`; bỏ `download.signed`. Không đổi kiểu dữ liệu nào.

- [ ] **Step 1: Viết test hỏng**

`tests/unit/app-facts.test.ts`:

```ts
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'
import { appFacts } from '@/lib/seo/app-facts'
import en from '@/messages/en.json'
import vi from '@/messages/vi.json'

// Spec §8.3, §12.1: mọi con số và khẳng định về app phải khớp lib/seo/app-facts.ts. Cách quét như test giá hiện có.
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const rel = (f: string) => relative(ROOT, f).split(sep).join('/')
const walk = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(dir, e.name)) : e.isFile() ? [join(dir, e.name)] : []))
const values = (o: unknown, p = ''): Array<[string, string]> =>
  typeof o === 'object' && o !== null ? Object.entries(o).flatMap(([k, v]) => values(v, p ? `${p}.${k}` : k)) : [[p, String(o)]]

// Biến thể câu ký số đang không dùng (theo cờ) không bị quét: nó chỉ hiện khi cờ đổi.
const INACTIVE = `download.signing.${appFacts.installerSigned ? 'unsigned' : 'signed'}.`

/** Mọi chữ nói về app: bộ chữ hai ngôn ngữ, module nội dung (.ts) và MDX trong content/. */
const texts = (): Array<[string, string]> => [
  ...values(vi).filter(([k]) => !k.startsWith(INACTIVE)).map(([k, v]) => [`vi:${k}`, v] as [string, string]),
  ...values(en).filter(([k]) => !k.startsWith(INACTIVE)).map(([k, v]) => [`en:${k}`, v] as [string, string]),
  ...walk(join(ROOT, 'content'))
    .filter((f) => /\.(ts|mdx)$/.test(f))
    .map((f) => [rel(f), readFileSync(f, 'utf8')] as [string, string]),
]

// Số viết bằng chữ. Không có "tư" ("đầu tư mức...") để khỏi bắt nhầm.
const WORDS: Record<string, number> = {
  một: 1, hai: 2, ba: 3, bốn: 4, năm: 5, sáu: 6, bảy: 7, tám: 8, chín: 9, mười: 10, 'mười một': 11, 'mười hai': 12,
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12,
}
const NUM = `(\\d+|${Object.keys(WORDS).sort((a, b) => b.length - a.length).join('|')})`
// Trước số không được là chữ, số hay gạch nối: "K-12 level" không phải "12 mức".
const rx = (body: string) => new RegExp(`(?<![\\p{L}\\d-])${NUM}${body}`, 'giu')
const toNumber = (s: string) => (/^\d+$/.test(s) ? Number(s) : WORDS[s.toLowerCase()])

const GATES = new Set<number>([appFacts.k12Gates, appFacts.testGates, appFacts.courseGates, appFacts.programGates])
const LEVELS = new Set<number>([appFacts.matrixLevels, appFacts.cv7991Levels])

const RULES: Array<{ name: string; re: RegExp; ok: (n: number) => boolean }> = [
  { name: 'test versions (vi)', re: rx(' mã(?![\\p{L}])'), ok: (n) => n >= 1 && n <= appFacts.maxTestVersions },
  { name: 'test versions (en)', re: rx(' (?:test )?versions?\\b'), ok: (n) => n >= 1 && n <= appFacts.maxTestVersions },
  { name: 'gates (vi)', re: rx(' cổng(?![\\p{L}])'), ok: (n) => GATES.has(n) },
  { name: 'gates (en)', re: rx(' (?:quality )?gates?\\b'), ok: (n) => GATES.has(n) },
  { name: 'matrix levels (vi)', re: rx(' mức(?![\\p{L}])'), ok: (n) => LEVELS.has(n) },
  { name: 'matrix levels (en)', re: rx('[- ]levels?\\b'), ok: (n) => LEVELS.has(n) },
  { name: 'money (vi)', re: rx(' đồng(?![\\p{L}])'), ok: (n) => n === appFacts.localWorkCostVnd },
]

// Khẳng định bộ cài ĐÃ ký: cấm khi installerSigned = false.
const SIGNED_CLAIMS = [
  /đã ký số/i,
  /bộ cài[^.]{0,40}?đã (?:được )?ký/i,
  /Developer ID/i,
  // Chỉ notarize của Apple: "công chứng mã băm" (hash notarization) của máy chủ EduFlow là tính năng khác, được nêu.
  /(?<!(?:chưa|not)[^.]{0,20})(?:Apple notariz|notariz\w* by Apple)/i,
  /\bsigned (?:EduFlow )?installers?\b/i,
  /\binstallers? (?:is|are) (?:digitally |code[- ])?signed\b/i,
  /\bdigitally signed\b/i,
  /(?<!not )\bcode[- ]signed\b/i,
]
// Khẳng định bộ cài CHƯA ký: cấm khi installerSigned = true.
const UNSIGNED_CLAIMS = [/chưa (?:được )?ký số/i, /\bunsigned\b/i, /\bnot (?:yet )?(?:code[- ])?signed\b/i, /Unknown publisher/i, /nhà phát hành không xác định/i]

const numberHits = (text: string) =>
  RULES.flatMap((r) => [...text.normalize('NFC').matchAll(r.re)].filter((m) => !r.ok(toNumber(m[1]))).map((m) => `${r.name}: "${m[0]}"`))

test('every number about the app matches lib/seo/app-facts.ts', () => {
  expect(texts().flatMap(([where, text]) => numberHits(text).map((h) => `${where} ${h}`))).toEqual([])
})

test('copy about installer signing follows appFacts.installerSigned', () => {
  const forbidden = appFacts.installerSigned ? UNSIGNED_CLAIMS : SIGNED_CLAIMS
  const bad = texts().flatMap(([where, text]) => forbidden.filter((r) => r.test(text.normalize('NFC'))).map((r) => `${where} ${r}`))
  expect(bad).toEqual([])
})

// Một bộ chặn không bao giờ khớp thì vô dụng mà vẫn xanh: ghim cả câu nó phải bắt lẫn câu nó phải để yên.
test('the fact guards catch what they target and spare neutral wording', () => {
  for (const bad of ['Tối đa 30 mã đề', 'up to 32 test versions', '10 cổng chất lượng', '9 quality gates', 'ma trận năm mức', 'a five-level matrix', '500 đồng mỗi đề']) {
    expect(numberHits(bad), bad).not.toEqual([])
  }
  for (const fine of ['Tối đa 24 mã đề', 'Soạn đề 45 phút Toán 10, 4 mã đề', '12 cổng P1..P12', 'đề chạy 8 cổng', 'ma trận bốn mức', 'Four-level test blueprints', 'K-12 level', '0 đồng', 'ba tầng kết luận']) {
    expect(numberHits(fine), fine).toEqual([])
  }
  const caught = (patterns: RegExp[], text: string) => patterns.some((r) => r.test(text.normalize('NFC')))
  for (const bad of ['Bộ cài đã ký số', 'Tải bộ cài EduFlow đã ký cho Windows', 'ký Developer ID và được Apple notarize', 'The installer is signed with Developer ID', 'notarized by Apple', 'Digitally signed installers', 'Download the signed EduFlow installer', 'the Windows build is code-signed']) {
    expect(caught(SIGNED_CLAIMS, bad), bad).toBe(true)
  }
  for (const fine of ['Bộ cài hiện chưa ký số', 'chưa được Apple notarize', 'not notarized by Apple', 'The installer is not signed yet', 'gói đã ký của trưởng bộ môn', 'Signing locks the version, and its hash is notarized', 'The server notarizes the hash']) {
    expect(caught(SIGNED_CLAIMS, fine), fine).toBe(false)
  }
  for (const bad of ['Bộ cài hiện chưa ký số', 'an unsigned build', 'Unknown publisher']) expect(caught(UNSIGNED_CLAIMS, bad), bad).toBe(true)
})
```

- [ ] **Step 2: Chạy test để thấy hỏng**

Chạy: `pnpm vitest run tests/unit/app-facts.test.ts`
Kỳ vọng: test 1 và 3 PASS; test 2 FAIL, liệt kê ít nhất `vi:download.meta.description`, `vi:download.lead`, `vi:download.leadNoDate`, `vi:download.signed.title`, `vi:download.signed.body`, `en:download.signed.title`, `en:download.signed.body`, `vi:install.meta.windows.description`, `en:install.meta.windows.description` và bốn tệp `content/install/*/*.mdx`. Nếu test 1 cũng đỏ, đọc từng câu nó báo: hoặc câu sai sự thật (sửa câu), hoặc bộ quét bắt nhầm (thêm câu đó vào danh sách `fine` của test 3 và sửa quy tắc cho tới khi cả hai test xanh).

- [ ] **Step 3: Sửa chữ ở `messages/vi.json`**

Trong namespace `download`:
- `meta.description`: `"Tải EduFlow cho macOS (Apple Silicon, Intel) và Windows 64-bit, kèm mã SHA-512, yêu cầu hệ thống, hướng dẫn cài đặt và cách nhận bản cập nhật trong app."`
- `lead`: `"Phiên bản {version}, phát hành {date}."`
- `leadNoDate`: `"Phiên bản {version}."`
- Xoá khoá `signed`, thêm:

```json
"signing": {
  "signed": {
    "title": "Bộ cài đã ký số",
    "body": "Bản macOS ký Developer ID và được Apple notarize; bản Windows ký mã của Agentra JSC. Windows SmartScreen có thể vẫn hỏi lại với bản vừa phát hành; hướng dẫn cài có cách xử lý."
  },
  "unsigned": {
    "title": "Lần mở đầu, máy sẽ hỏi lại",
    "body": "Bộ cài hiện chưa ký số bằng chứng thư của Apple và Microsoft, nên lần mở đầu tiên macOS và Windows SmartScreen sẽ chặn và hỏi lại. Hướng dẫn cài chỉ từng bước mở; chỉ dùng tệp tải từ trang này."
  }
}
```

Trong `install.meta.windows.description`: `"Tải bộ cài EduFlow cho Windows 64-bit, chạy trình cài, mở qua cảnh báo SmartScreen, kích hoạt bằng key hoặc dùng thử và nhận bản mới trong app."`

- [ ] **Step 4: Sửa chữ ở `messages/en.json`**

Trong `download`:
- `meta.description`: `"Download EduFlow for macOS (Apple Silicon, Intel) and 64-bit Windows, with SHA-512 checksums, system requirements, installation guides and in-app updates."`
- `lead`: `"Version {version}, released {date}."`, `leadNoDate`: `"Version {version}."` (bỏ câu về ký số nếu có).
- Xoá `signed`, thêm:

```json
"signing": {
  "signed": {
    "title": "Digitally signed installers",
    "body": "The macOS build is signed with a Developer ID and notarized by Apple; the Windows build is code-signed by Agentra JSC. Windows SmartScreen may still ask for confirmation on a newly released version; the installation guide explains what to do."
  },
  "unsigned": {
    "title": "Your computer asks again the first time",
    "body": "The installers are not signed yet with Apple and Microsoft certificates, so macOS and Windows SmartScreen block the first launch and ask again. The installation guide shows each step; only use files downloaded from this page."
  }
}
```

`install.meta.windows.description`: `"Download the EduFlow installer for 64-bit Windows, run it, get past the SmartScreen warning, activate with a key or a trial, and get new versions in the app."`

- [ ] **Step 5: Trang Tải về đọc câu ký số theo cờ**

`app/[locale]/download/page.tsx`: thêm `import { appFacts } from '@/lib/seo/app-facts'`, rồi thay

```tsx
            <Callout kind="info" title={t('signed.title')}>
              {t('signed.body')} {guide('windows', t('guideWindows'))} · {guide('macos', t('guideMac'))}
```

bằng

```tsx
            <Callout kind={appFacts.installerSigned ? 'info' : 'warning'} title={t(`signing.${SIGNING}.title`)}>
              {t(`signing.${SIGNING}.body`)} {guide('windows', t('guideWindows'))} · {guide('macos', t('guideMac'))}
```

và thêm ngay dưới các import:

```tsx
// Câu về ký số đọc từ cờ của app-facts (spec §7.5): chưa có chứng thư thì nói thật là máy sẽ hỏi lại.
const SIGNING = appFacts.installerSigned ? 'signed' : 'unsigned'
```

- [ ] **Step 6: Viết lại bước "Mở lần đầu" của hai bài macOS**

`content/install/vi/macos.mdx`: thay toàn bộ khối `<Step n={3} id="mo-lan-dau" ...>...</Step>` bằng

```mdx
<Step n={3} id="mo-lan-dau" title="Mở lần đầu">

Bộ cài hiện chưa ký số bằng chứng thư Apple, nên lần mở đầu tiên macOS chặn và báo không kiểm được ứng dụng. Chỉ cần làm một lần:

1. Mở EduFlow từ **Applications**. macOS báo không mở được ứng dụng; bấm **Xong**.
2. Mở **Cài đặt hệ thống** › **Quyền riêng tư & Bảo mật**, kéo xuống mục **Bảo mật**, bấm **Vẫn mở** ở dòng nói về EduFlow, rồi nhập mật khẩu máy.
3. Bấm **Mở** ở hộp thoại hỏi lại.

Trên macOS 14 trở về trước có cách nhanh hơn: giữ phím Control, bấm vào EduFlow trong **Applications**, chọn **Mở**, rồi bấm **Mở** lần nữa.

<Callout kind="info">Chỉ mở tệp tải từ trang Tải về của EduFlow. Muốn chắc tệp không bị sửa, so mã SHA-512 trên trang đó với tệp đã tải.</Callout>

</Step>
```

Trong `export const meta` của tệp này giữ nguyên `description` (không có khẳng định ký số).

`content/install/en/macos.mdx`: thay khối tương ứng bằng

```mdx
<Step n={3} id="mo-lan-dau" title="Open it the first time">

The installer is not signed yet with an Apple certificate, so the first time you open it macOS blocks it and says it cannot check the app. You only do this once:

1. Open EduFlow from **Applications**. macOS says the app cannot be opened; click **Done**.
2. Open **System Settings** › **Privacy & Security**, scroll down to **Security**, click **Open Anyway** next to the line about EduFlow, then enter your Mac password.
3. Click **Open** in the dialog that asks again.

On macOS 14 and earlier there is a shorter way: hold the Control key, click EduFlow in **Applications**, choose **Open**, then click **Open** again.

<Callout kind="info">Only open files downloaded from the EduFlow Download page. To make sure a file was not altered, compare its SHA-512 checksum with the one on that page.</Callout>

</Step>
```

Nếu tiêu đề bước 3 ở tệp tiếng Anh hiện khác `Open it the first time`, giữ tiêu đề cũ và chỉ thay thân bước; sửa mục `toc` cho khớp tiêu đề.

- [ ] **Step 7: Viết lại bước 2 và 3 của hai bài Windows**

`content/install/vi/windows.mdx`:
- `meta.description`: `'Tải bộ cài cho Windows 64-bit, chạy trình cài, mở qua cảnh báo SmartScreen, kích hoạt bằng key hoặc dùng thử và nhận bản mới trong app.'`
- Mục `toc` thứ ba: `{ id: 'smartscreen', label: 'Mở qua cảnh báo SmartScreen' }`.
- Thay hai khối `<Step n={2} ...>` và `<Step n={3} ...>` bằng

```mdx
<Step n={2} id="trinh-cai" title="Chạy trình cài">

Bấm đúp tệp **.exe**. Nếu SmartScreen hiện cảnh báo, làm theo bước 3 rồi quay lại đây. Giữ thư mục cài mặc định hoặc chọn thư mục khác, bấm **Cài đặt**, rồi mở EduFlow từ menu Start.

</Step>

<Step n={3} id="smartscreen" title="Mở qua cảnh báo SmartScreen">

Bộ cài hiện chưa ký số bằng chứng thư Microsoft, nên Windows Defender SmartScreen hiện hộp thoại **"Windows đã bảo vệ PC của bạn"** (Windows protected your PC), và dòng nhà phát hành ghi **Nhà phát hành không xác định** (Unknown publisher).

1. Bấm **Thông tin thêm** (More info).
2. Kiểm tên tệp đúng là tệp vừa tải từ trang Tải về của EduFlow.
3. Bấm **Vẫn chạy** (Run anyway).

Muốn chắc tệp không bị sửa, so mã SHA-512 trên trang Tải về với kết quả của lệnh sau (mở PowerShell trong thư mục chứa tệp):

<CodeBlock code={'certutil -hashfile "EduFlow Setup <phiên bản>.exe" SHA512'} copyLabel="Sao chép" copiedLabel="Đã sao chép" />

</Step>
```

`content/install/en/windows.mdx`:
- `meta.description`: `'Download the installer for 64-bit Windows, run it, get past the SmartScreen warning, activate with a license key or a trial and get new versions in the app.'`
- Mục `toc` thứ ba: `{ id: 'smartscreen', label: 'Get past the SmartScreen warning' }`.
- Thay hai khối tương ứng bằng

```mdx
<Step n={2} id="trinh-cai" title="Run the installer">

Double-click the **.exe** file. If SmartScreen shows a warning, follow step 3 and come back here. Keep the default install folder or choose another one, click **Install**, then open EduFlow from the Start menu.

</Step>

<Step n={3} id="smartscreen" title="Get past the SmartScreen warning">

The installer is not signed yet with a Microsoft certificate, so Windows Defender SmartScreen shows **"Windows protected your PC"** and the publisher line reads **Unknown publisher**.

1. Click **More info**.
2. Check that the file name is the file you just downloaded from the EduFlow Download page.
3. Click **Run anyway**.

To make sure the file was not altered, compare the SHA-512 checksum on the Download page with the output of this command (open PowerShell in the folder that holds the file):

<CodeBlock code={'certutil -hashfile "EduFlow Setup <version>.exe" SHA512'} copyLabel="Copy" copiedLabel="Copied" />

</Step>
```

Giữ nguyên tiêu đề bước 2 nếu tệp hiện dùng tiêu đề khác `Run the installer` (đọc tệp trước khi thay).

- [ ] **Step 8: Cập nhật `tests/unit/guides.test.ts` theo bản chưa ký**

Thay phần thân vòng lặp bằng:

```ts
    test(`${locale}/${os} guide exports meta and carries the key facts`, () => {
      const src = readFileSync(`content/install/${locale}/${os}.mdx`, 'utf8')
      expect(src).toMatch(/export const meta = \{/)
      expect(src).toMatch(/toc: \[/)
      expect(src).not.toMatch(/nội bộ|internal note|người gửi|DocOps/i)
      expect(src).toContain('EDU-')
      if (os === 'macos') {
        expect(src).toContain('Applications')
        expect(src).toContain('Apple Silicon')
        expect(src).not.toContain('xattr')
        // Bộ cài chưa ký (app-facts.installerSigned): bài phải chỉ đường mở qua Gatekeeper.
        expect(src).toContain(locale === 'vi' ? 'Quyền riêng tư & Bảo mật' : 'Privacy & Security')
        expect(src).toContain(locale === 'vi' ? 'Vẫn mở' : 'Open Anyway')
      }
      if (os === 'windows') {
        expect(src).toContain('SmartScreen')
        expect(src).toContain('More info')
        expect(src).toContain('Run anyway')
        expect(src).toContain('Unknown publisher')
        expect(src).toContain('certutil -hashfile')
      }
    })
```

- [ ] **Step 9: Nới luật nhà cung cấp mô hình ở `tests/unit/content.test.ts`**

Thay dòng `const PROVIDERS = [...]` và chú thích ngay trên nó bằng:

```ts
// OQ-L07: chưa nêu tên nhà cung cấp mô hình mà EduFlow dùng (spec 30/09 §15). "ChatGPT" là tên một sản phẩm được phép nhắc để so sánh
// (spec §7.2: trang /eduflow-va-chatgpt và cột ChatGPT trong bảng so sánh); tên mô hình dạng GPT-4o, GPT-5 thì vẫn cấm.
// GLM, Z.ai, Zhipu là nhà cung cấp thật của app. Google Analytics và Google Maps vẫn được nêu.
const PROVIDERS = [/anthropic/i, /claude/i, /openai/i, /(?<!\p{L})gpt-?\d/iu, /gemini/i, /google ai/i, /\bglm\b/i, /\bz\.ai\b/i, /zhipu/i]
```

Trong test `the copy guards catch the phrasings they target and spare neutral wording`, thay danh sách `for (const bad of ['Powered by Claude', ...])` của PROVIDERS bằng

```ts
  for (const bad of ['Powered by Claude', 'Dùng Anthropic', 'OpenAI API', 'GPT-5', 'GPT4o', 'Google Gemini', 'Google AI Studio', 'GLM-4.6', 'Z.ai', 'Zhipu AI']) {
```

và thêm vào danh sách `fine` ba câu: `'EduFlow và ChatGPT: soạn đề, giáo án khác gì?'`, `'ChatGPT soạn giáo án'`, `'EduFlow vs ChatGPT'`.

- [ ] **Step 10: Chạy test**

Chạy: `pnpm vitest run tests/unit/app-facts.test.ts tests/unit/guides.test.ts tests/unit/content.test.ts`
Kỳ vọng: PASS. Rồi `pnpm verify`: xanh.

- [ ] **Step 11: E2E trang Tải về**

Chạy lệnh E2E-FEED với `pnpm e2e tests/e2e/download.spec.ts tests/e2e/pages.spec.ts`.
Kỳ vọng: PASS. Nếu `download.spec.ts` có kiểm chữ "Bộ cài đã ký số" hay "Digitally signed", đổi sang tiêu đề mới của `download.signing.unsigned.title` và ghi lý do trong chú thích test.

- [ ] **Step 12: Commit**

```bash
git add tests/unit/app-facts.test.ts tests/unit/content.test.ts tests/unit/guides.test.ts messages/vi.json messages/en.json "app/[locale]/download/page.tsx" content/install
git commit -m "feat(content): quét dữ kiện app, câu ký số theo cờ app-facts, hướng dẫn mở bộ cài chưa ký"
```

---

### Task 4: Đường dẫn theo từ khoá và chuyển hướng 308

Đổi đường dẫn hiển thị của ba trang cấp, thêm khoá sáu trang chủ đề vào routing (trang dựng ở Task 18 tới 20), đặt 308 cho URL cũ, header `X-Robots-Tag` cho preview và chuyển bí danh `*.vercel.app` về domain chính (spec §4.2, §4.3, §9.1).

**Files:**
- Create: `lib/next-routes.ts`, `tests/unit/next-routes.test.ts`, `tests/e2e/redirects.spec.ts`
- Modify: `i18n/routing.ts`, `next.config.ts`, `tests/unit/i18n.test.ts`, `tests/unit/seo.test.ts`, `tests/e2e/pages.spec.ts`, `tests/e2e/mobile.spec.ts`, `lighthouserc.json`, `tests/unit/ci-config.test.ts`, `README.md`, `docs/van-hanh.md`

**Interfaces:**
- Consumes: không.
- Produces:
  - `routing.pathnames` với khoá mới `'/test-generator'`, `'/test-versions'`, `'/lesson-plans'`, `'/lesson-slides'`, `'/course-syllabus'`, `'/vs-chatgpt'`.
  - `lib/next-routes.ts`: `LEGACY_REDIRECTS: ReadonlyArray<{ source: string; destination: string }>`; `redirectRules(env: Env): RedirectRule[]`; `headerRules(env: Env): HeaderRule[]`; `type Env = Record<string, string | undefined>`. Tệp này không import gì có tiền tố `@/` (Playwright import trực tiếp).

- [ ] **Step 1: Viết test hỏng**

`tests/unit/next-routes.test.ts`:

```ts
import { expect, test } from 'vitest'
import { routing, type PageKey } from '@/i18n/routing'
import { headerRules, LEGACY_REDIRECTS, redirectRules } from '@/lib/next-routes'
import { localizedPath } from '@/lib/seo/urls'

// Đường dẫn công khai hiện tại của mọi trang tĩnh, hai ngôn ngữ.
const current = () =>
  new Set(
    (Object.keys(routing.pathnames) as PageKey[])
      .filter((k) => !k.includes('['))
      .flatMap((k) => routing.locales.map((l) => localizedPath(l, k))),
  )

test('legacy redirects point at live paths and never at another redirect', () => {
  const live = current()
  const sources = new Set(LEGACY_REDIRECTS.map((r) => r.source))
  for (const { source, destination } of LEGACY_REDIRECTS) {
    expect(live.has(source), `${source} vẫn là đường dẫn sống`).toBe(false)
    expect(sources.has(destination), `${destination} lại là nguồn chuyển hướng`).toBe(false)
  }
  for (const r of LEGACY_REDIRECTS.filter((r) => !r.destination.includes('/huong-dan/') && !r.destination.includes('/docs/'))) {
    expect(live.has(r.destination), r.destination).toBe(true)
  }
})

test('legacy redirects are permanent (308)', () => {
  for (const rule of redirectRules({})) expect(rule.permanent).toBe(true)
})

test('only a production build sends *.vercel.app to the canonical domain', () => {
  const env = { NEXT_PUBLIC_SITE_URL: 'https://eduflow.agentra.io.vn/' }
  const host = (rules: ReturnType<typeof redirectRules>) => rules.filter((r) => r.has?.some((h) => h.type === 'host'))
  expect(host(redirectRules({ ...env, VERCEL_ENV: 'production' }))).toEqual([
    { source: '/:path*', has: [{ type: 'host', value: '(?<host>.+)\\.vercel\\.app' }], destination: 'https://eduflow.agentra.io.vn/:path*', permanent: true },
  ])
  expect(host(redirectRules({ ...env, VERCEL_ENV: 'preview' }))).toEqual([])
  expect(host(redirectRules(env))).toEqual([])
})

test('previews carry X-Robots-Tag noindex, production does not', () => {
  const robots = (env: Record<string, string>) => headerRules(env).flatMap((r) => r.headers).filter((h) => h.key === 'X-Robots-Tag')
  expect(robots({ VERCEL_ENV: 'preview' })).toEqual([{ key: 'X-Robots-Tag', value: 'noindex' }])
  expect(robots({ VERCEL_ENV: 'production' })).toEqual([])
  expect(headerRules({}).flatMap((r) => r.headers).map((h) => h.key)).toContain('Strict-Transport-Security')
})
```

`tests/e2e/redirects.spec.ts`:

```ts
import { expect, test } from '@playwright/test'
import { LEGACY_REDIRECTS } from '../../lib/next-routes'

// Spec §4.3: URL cũ chuyển 308 thẳng tới URL mới, không qua bước trung gian.
for (const { source, destination } of LEGACY_REDIRECTS) {
  test(`${source} redirects permanently to ${destination}`, async ({ request }) => {
    const res = await request.get(source, { maxRedirects: 0 })
    expect(res.status()).toBe(308)
    expect(new URL(res.headers()['location'], 'http://localhost').pathname).toBe(destination)
  })
}

// Review Focus 1: dấu "/" cuối và chuỗi truy vấn của link cũ (ví dụ trong app hay tin nhắn) vẫn tới trang mới.
test('an old URL with a trailing slash and a query still lands on the new page', async ({ page }) => {
  const res = await page.goto('/pho-thong/?utm_source=app')
  expect(res?.status()).toBe(200)
  await expect(page).toHaveURL(/\/ai-cho-giao-vien\?utm_source=app$/)
})
```

- [ ] **Step 2: Chạy test để thấy hỏng**

Chạy: `pnpm vitest run tests/unit/next-routes.test.ts`
Kỳ vọng: FAIL, `Failed to resolve import "@/lib/next-routes"`.

- [ ] **Step 3: Viết `lib/next-routes.ts`**

```ts
/*
 * Chuyển hướng và header của next.config.ts, tách ra để test được (tests/unit/next-routes.test.ts) và để e2e lặp qua đúng
 * danh sách này. Không import gì có tiền tố @/: next.config.ts và Playwright đều nạp tệp này trực tiếp.
 */
export type Env = Record<string, string | undefined>
export type RedirectRule = { source: string; destination: string; permanent: boolean; has?: Array<{ type: 'host'; value: string }> }
export type HeaderRule = { source: string; headers: Array<{ key: string; value: string }> }

/**
 * URL cũ → URL mới (spec §4.3). Site chưa lên domain nên không có thứ hạng để mất; vẫn đặt 308 phòng khi app, tài liệu
 * hay tin nhắn đã trỏ tới. Đích phải là đường dẫn đang sống, không được là nguồn của một chuyển hướng khác.
 */
export const LEGACY_REDIRECTS: ReadonlyArray<{ source: string; destination: string }> = [
  { source: '/pho-thong', destination: '/ai-cho-giao-vien' },
  { source: '/en/k12', destination: '/en/ai-for-teachers' },
  { source: '/hoc-phan', destination: '/ai-cho-giang-vien' },
  { source: '/en/university-courses', destination: '/en/ai-for-lecturers' },
  { source: '/chuong-trinh', destination: '/ra-soat-chuong-trinh-dao-tao' },
  { source: '/en/program-review', destination: '/en/curriculum-review' },
]

const SECURITY_HEADERS = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'X-Frame-Options', value: 'DENY' },
]

export function redirectRules(env: Env): RedirectRule[] {
  const rules: RedirectRule[] = LEGACY_REDIRECTS.map((r) => ({ ...r, permanent: true }))
  // Bí danh *.vercel.app của bản production chuyển 308 về domain chính (spec §4.3, §9.1). Chỉ ở production: bản preview cũng
  // nằm ở *.vercel.app và phải xem được. Domain chính không khớp mẫu host này nên không vòng lặp.
  if (env.VERCEL_ENV === 'production') {
    const site = (env.NEXT_PUBLIC_SITE_URL ?? '').trim().replace(/\/+$/, '')
    rules.push({ source: '/:path*', has: [{ type: 'host', value: '(?<host>.+)\\.vercel\\.app' }], destination: `${site}/:path*`, permanent: true })
  }
  return rules
}

export function headerRules(env: Env): HeaderRule[] {
  // Vercel tự gửi X-Robots-Tag cho preview; đặt tường minh để không phụ thuộc cấu hình của dự án (spec §9.1).
  const extra = env.VERCEL_ENV === 'preview' ? [{ key: 'X-Robots-Tag', value: 'noindex' }] : []
  return [{ source: '/(.*)', headers: [...SECURITY_HEADERS, ...extra] }]
}
```

- [ ] **Step 4: Dùng ở `next.config.ts`**

Thay khối `const securityHeaders = [...]` và `nextConfig` bằng:

```ts
const nextConfig: NextConfig = {
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
  // Next 16.3 bật optimisticRouting mặc định: nó đoán sai tuyến của slug tiếng Anh do proxy rewrite và gửi lại yêu cầu _rsc không ngừng (vercel/next.js#96893). Bỏ dòng này khi bản sửa của Next ra.
  experimental: { optimisticRouting: false },
  async redirects() {
    return redirectRules(process.env)
  },
  async headers() {
    return headerRules(process.env)
  },
}
```

và thêm `import { headerRules, redirectRules } from './lib/next-routes'` cạnh import `assertProductionEnv`.

- [ ] **Step 5: Đường dẫn mới ở `i18n/routing.ts`**

Thay khối `pathnames` bằng:

```ts
  // Slug là từ khoá chính của trang (bản đồ ở lib/seo/brand.ts). Khoá nội bộ giữ như cũ để ít đổi mã (spec §4.2).
  pathnames: {
    '/': '/',
    '/k12': { vi: '/ai-cho-giao-vien', en: '/ai-for-teachers' },
    '/university': { vi: '/ai-cho-giang-vien', en: '/ai-for-lecturers' },
    '/program': { vi: '/ra-soat-chuong-trinh-dao-tao', en: '/curriculum-review' },
    // Trang chủ đề (spoke), dựng ở content/topics
    '/test-generator': { vi: '/ai-tao-de-kiem-tra-theo-ma-tran', en: '/ai-test-generator' },
    '/test-versions': { vi: '/tron-de-trac-nghiem', en: '/shuffle-test-versions' },
    '/lesson-plans': { vi: '/ai-soan-giao-an', en: '/ai-lesson-plan-generator' },
    '/lesson-slides': { vi: '/tao-slide-bai-giang-bang-ai', en: '/ai-slide-generator' },
    '/course-syllabus': { vi: '/de-cuong-chi-tiet-hoc-phan', en: '/course-syllabus' },
    '/vs-chatgpt': { vi: '/eduflow-va-chatgpt', en: '/eduflow-vs-chatgpt' },
    '/assistant': { vi: '/tro-ly-ai', en: '/ai-assistant' },
    '/pricing': { vi: '/cach-tinh-phi', en: '/pricing' },
    '/ai-transparency': { vi: '/minh-bach-ai', en: '/ai-transparency' },
    '/download': { vi: '/tai-ve', en: '/download' },
    '/install/[os]': { vi: '/huong-dan-cai-dat/[os]', en: '/install/[os]' },
    '/contact': { vi: '/lien-he', en: '/contact' },
    '/privacy': { vi: '/chinh-sach-bao-mat', en: '/privacy' },
  },
```

Sáu khoá chủ đề chưa có trang: URL của chúng trả 404 tới Task 18 tới 20, và chưa có link nào trỏ tới.

- [ ] **Step 6: Sửa các test và cấu hình theo đường dẫn mới**

- `tests/unit/i18n.test.ts`: đổi tên test thành `'pathnames cover every page with the keyword slugs of spec §4.2'` và object kỳ vọng thành đúng khối `pathnames` ở Step 5.
- `tests/unit/seo.test.ts`, test `absoluteUrl ...`: `absoluteUrl('vi', '/k12')` → `'https://eduflow.test/ai-cho-giao-vien'`; `absoluteUrl('en', '/university')` → `'https://eduflow.test/en/ai-for-lecturers'`. Test sitemap: thay `'https://eduflow.test/pho-thong'` bằng `'https://eduflow.test/ai-cho-giao-vien'`, `'https://eduflow.test/en/program-review'` bằng `'https://eduflow.test/en/curriculum-review'`.
- `tests/e2e/pages.spec.ts`, mảng `PAGES`: `['/pho-thong','vi']` → `['/ai-cho-giao-vien','vi']`, `['/en/k12','en']` → `['/en/ai-for-teachers','en']`, `['/hoc-phan','vi']` → `['/ai-cho-giang-vien','vi']`, `['/en/university-courses','en']` → `['/en/ai-for-lecturers','en']`, `['/chuong-trinh','vi']` → `['/ra-soat-chuong-trinh-dao-tao','vi']`, `['/en/program-review','en']` → `['/en/curriculum-review','en']`.
- `tests/e2e/mobile.spec.ts`: trong `VI_PAGES` thay `'/pho-thong', '/hoc-phan', '/chuong-trinh'` bằng `'/ai-cho-giao-vien', '/ai-cho-giang-vien', '/ra-soat-chuong-trinh-dao-tao'`; trong test logo đổi `page.goto('/pho-thong')` thành `page.goto('/ai-cho-giao-vien')`.
- `lighthouserc.json`: `/pho-thong` → `/ai-cho-giao-vien`, `/en/k12` → `/en/ai-for-teachers`.
- `tests/unit/ci-config.test.ts`: danh sách đường dẫn đổi theo đúng hai chỗ trên.
- `README.md` và `docs/van-hanh.md`: chạy `grep -n "pho-thong\|hoc-phan\|chuong-trinh\|/en/k12\|university-courses\|program-review" README.md docs/van-hanh.md` và đổi từng chỗ sang đường dẫn mới (cây thư mục trong README: `app/[locale]/k12/page.tsx  # /ai-cho-giao-vien`, tương tự cho `university`, `program`).

- [ ] **Step 7: Chạy unit test**

Chạy: `pnpm vitest run tests/unit/next-routes.test.ts tests/unit/i18n.test.ts tests/unit/seo.test.ts tests/unit/ci-config.test.ts && pnpm verify`
Kỳ vọng: PASS, xanh.

- [ ] **Step 8: E2E**

Chạy lệnh E2E-FEED (toàn bộ).
Kỳ vọng: PASS, gồm 6 test 308 và test dấu "/" cuối của `redirects.spec.ts`, và 24 trang của `pages.spec.ts` ở đường dẫn mới. Nếu `/en/ai-for-teachers` trả về vòng chuyển hướng (nguồn `/en/k12` trùng đường dẫn nội bộ): dừng và báo lại, vì thứ tự của Next là `redirects` trước `proxy.ts`, và rewrite của proxy không chạy lại `redirects`; vòng lặp nghĩa là giả định này sai.

- [ ] **Step 9: Commit**

```bash
git add lib/next-routes.ts next.config.ts i18n/routing.ts tests/unit/next-routes.test.ts tests/unit/i18n.test.ts tests/unit/seo.test.ts tests/unit/ci-config.test.ts tests/e2e/redirects.spec.ts tests/e2e/pages.spec.ts tests/e2e/mobile.spec.ts lighthouserc.json README.md docs/van-hanh.md
git commit -m "feat(seo): đường dẫn theo từ khoá cho ba trang cấp, chuyển hướng 308, noindex cho preview"
```

---

### Task 5: Link đổi ngôn ngữ trỏ thẳng URL cuối

`Link` của next-intl với `locale` khác sinh `/vi/...`, rồi proxy chuyển hướng về `/...`: 14 cảnh báo "link trỏ vào URL bị chuyển hướng" của `seo-audit` (spec §2, §4.5). Thay bằng `<a href>` tính từ khoá nội bộ (quyết định 3).

**Files:**
- Create: `i18n/switch.ts`, `tests/unit/locale-switch.test.ts`
- Modify: `components/site/LocaleSwitcher.tsx`, `tests/e2e/pages.spec.ts`

**Interfaces:**
- Consumes: `routing`, `PageKey` (`@/i18n/routing`), `localizedPath` (`@/lib/seo/urls`).
- Produces: `localeHref(pathname: string | null, params: Record<string, string | string[] | undefined>, to: Locale): string`. Task 11 thêm tham số `from: Locale` đứng trước `to` để dịch slug docs.

- [ ] **Step 1: Viết test hỏng**

`tests/unit/locale-switch.test.ts`:

```ts
import { expect, test } from 'vitest'
import { localeHref } from '@/i18n/switch'
import { routing, type PageKey } from '@/i18n/routing'

test('the switch gives the final URL of the same page in the other language', () => {
  expect(localeHref('/pricing', {}, 'en')).toBe('/en/pricing')
  expect(localeHref('/pricing', { locale: 'en' }, 'vi')).toBe('/cach-tinh-phi')
  expect(localeHref('/k12', {}, 'en')).toBe('/en/ai-for-teachers')
  expect(localeHref('/', {}, 'en')).toBe('/en')
  expect(localeHref('/', {}, 'vi')).toBe('/')
})

// Review Focus 2: trên trang 404 (đường dẫn không phải khoá nào), nút đổi ngôn ngữ về trang chủ của ngôn ngữ kia.
test('an unknown path switches to the home page of the other language', () => {
  expect(localeHref('/khong-co-trang-nay', {}, 'en')).toBe('/en')
  expect(localeHref(null, {}, 'vi')).toBe('/')
})

test('no switch link ever goes through /vi or ends with a slash', () => {
  for (const key of Object.keys(routing.pathnames) as PageKey[]) {
    if (key.includes('[')) continue
    for (const to of routing.locales) {
      const href = localeHref(key, {}, to)
      expect(href.startsWith('/vi'), href).toBe(false)
      expect(href === '/' || !href.endsWith('/'), href).toBe(true)
    }
  }
})
```

- [ ] **Step 2: Chạy test để thấy hỏng**

Chạy: `pnpm vitest run tests/unit/locale-switch.test.ts`
Kỳ vọng: FAIL, `Failed to resolve import "@/i18n/switch"`.

- [ ] **Step 3: Viết `i18n/switch.ts`**

```ts
import { localizedPath } from '@/lib/seo/urls'
import { routing, type Locale, type PageKey } from './routing'

const isPageKey = (p: string): p is PageKey => Object.hasOwn(routing.pathnames, p)

/**
 * URL của cùng trang ở ngôn ngữ `to`, tính thuần từ khoá nội bộ (`usePathname()` của next-intl trả khoá như '/k12'
 * hay '/install/[os]') và params của trang. Trỏ thẳng URL cuối: không qua `/vi/...` rồi chuyển hướng (spec §4.5).
 * Đường dẫn lạ (trang 404) về trang chủ của ngôn ngữ kia.
 */
export function localeHref(pathname: string | null, params: Record<string, string | string[] | undefined>, to: Locale): string {
  if (!pathname || !isPageKey(pathname)) return localizedPath(to, '/')
  const plain = Object.fromEntries(Object.entries(params).filter((e): e is [string, string] => e[0] !== 'locale' && typeof e[1] === 'string'))
  return localizedPath(to, pathname, plain)
}
```

- [ ] **Step 4: Viết lại `components/site/LocaleSwitcher.tsx`**

```tsx
'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { usePathname } from '@/i18n/navigation'
import { routing, type Locale } from '@/i18n/routing'
import { localeHref } from '@/i18n/switch'
import { track } from '@/lib/analytics'
import { cn } from '@/lib/cn'

/**
 * Chuyển VI/EN bằng link thật (bot theo được), giữ nguyên trang hiện tại (slug dịch theo locale). Dùng `<a>` thường:
 * `Link` của next-intl với locale khác sinh `/vi/...` rồi chuyển hướng, và đổi locale đằng nào cũng nạp lại root layout.
 */
export function LocaleSwitcher({ className }: { className?: string }) {
  const locale = useLocale() as Locale
  const t = useTranslations('common')
  const pathname = usePathname()
  const params = useParams()
  return (
    <div
      role="group"
      aria-label={t('language')}
      className={cn('inline-flex items-center gap-0.5 rounded-full border border-line bg-sidebar p-[3px]', className)}
    >
      {routing.locales.map((code) => {
        const on = code === locale
        return (
          <a
            key={code}
            href={localeHref(pathname, params, code)}
            hrefLang={code}
            aria-current={on ? 'true' : undefined}
            onClick={() => !on && track({ name: 'locale_switch', from: locale, to: code })}
            className={cn(
              'inline-flex h-11 items-center rounded-full px-3.5 md:h-[30px] md:px-2.5 text-[12.5px] font-bold tracking-[0.4px] transition-colors',
              on ? 'bg-card2 text-ink shadow-[0_1px_2px_rgba(0,0,0,0.08)]' : 'text-muted hover:text-ink',
            )}
          >
            {code.toUpperCase()}
          </a>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 5: Thêm e2e**

Cuối `tests/e2e/pages.spec.ts`:

```ts
// Spec §4.5: link đổi ngôn ngữ trỏ thẳng URL cuối, không qua /vi/... rồi chuyển hướng.
test('language links point straight at the final URL', async ({ page }) => {
  await page.goto('/ai-cho-giao-vien')
  const hrefs = await page.locator('a[hreflang]').evaluateAll((as) => as.map((a) => a.getAttribute('href')))
  expect(hrefs.length).toBeGreaterThanOrEqual(4)
  expect(hrefs.filter((h) => h?.startsWith('/vi'))).toEqual([])
  expect(hrefs).toContain('/en/ai-for-teachers')
})
```

- [ ] **Step 6: Chạy test**

Chạy: `pnpm vitest run tests/unit/locale-switch.test.ts && pnpm verify`
Kỳ vọng: PASS, xanh.
Chạy E2E-FEED với `pnpm e2e tests/e2e/pages.spec.ts`. Kỳ vọng: PASS, gồm `locale switch keeps the current page` và test mới.

- [ ] **Step 7: Commit**

```bash
git add i18n/switch.ts components/site/LocaleSwitcher.tsx tests/unit/locale-switch.test.ts tests/e2e/pages.spec.ts
git commit -m "fix(i18n): link đổi ngôn ngữ trỏ thẳng URL cuối, không qua /vi rồi chuyển hướng"
```

---
### Task 6: Sổ trang indexable và `buildMetadata` mới

Một sổ trang làm nguồn duy nhất cho chữ SEO, URL, từ khoá chính và lastmod (spec §9.1 "Module chữ SEO"). Mọi trang lấy metadata từ sổ; sitemap dựng từ sổ; test đo đúng cái trang in ra. Task này giữ nguyên chữ hiện có (Task 7 viết lại chữ).

**Files:**
- Create: `lib/seo/pages.ts`, `content/privacy/meta.ts`, `tests/e2e/pages.ts`, `tests/unit/e2e-pages.test.ts`
- Modify: `lib/seo/metadata.ts`, `app/sitemap.ts`, `app/[locale]/page.tsx`, `app/[locale]/assistant/page.tsx`, `app/[locale]/pricing/page.tsx`, `app/[locale]/ai-transparency/page.tsx`, `app/[locale]/download/page.tsx`, `app/[locale]/contact/page.tsx`, `app/[locale]/privacy/page.tsx`, `app/[locale]/install/[os]/page.tsx`, `components/level/LevelPage.tsx`, `components/level/levels.ts`, `content/privacy/vi.mdx`, `content/privacy/en.mdx`, `tests/unit/seo.test.ts`, `tests/unit/sitemap-feed.test.ts`, `tests/unit/content.test.ts`, `tests/e2e/pages.spec.ts`

**Interfaces:**
- Consumes: `routing`, `Locale`, `PageKey`; `absoluteUrl`, `localizedPath` (`lib/seo/urls.ts`); `GUIDE_OS` (`content/install`, tới Task 11).
- Produces (`lib/seo/pages.ts`):
  - `BRAND_SUFFIX = ' · EduFlow'`
  - `type Seo = { title: string; description: string; absoluteTitle?: boolean; titleSuffix?: string }`
  - `STATIC_PAGES` (khoá: `'/' | '/k12' | '/university' | '/program' | '/assistant' | '/pricing' | '/download' | '/ai-transparency' | '/contact' | '/privacy'`), `type StaticPageKey = keyof typeof STATIC_PAGES`
  - `staticSeo(locale: Locale, key: StaticPageKey): Seo`
  - `type IndexablePage = { id: string; key: PageKey; params?: Record<Locale, Record<string, string>>; seo: Record<Locale, Seo>; keyword: Record<Locale, string> | null; updatedAt?: string }`
  - `indexablePages(): IndexablePage[]`, `pageUrl(p: IndexablePage, locale: Locale): string`, `finalTitle(seo: Seo): string`
- Produces (`lib/seo/metadata.ts`): `buildMetadata(opts: { locale: Locale; page: PageKey; params?: Record<Locale, Record<string, string>>; seo: Seo; ogImage?: string }): Metadata`; `ogImageUrl(locale: Locale, page: PageKey): string`.
- Produces: `PRIVACY_META: Record<Locale, { title: string; description: string; updated: string }>` (`content/privacy/meta.ts`); `PAGES: Array<[string, 'vi' | 'en']>` (`tests/e2e/pages.ts`).

- [ ] **Step 1: Viết test hỏng**

Thay hai test cuối của `tests/unit/seo.test.ts` (giữ test `absoluteUrl`):

```ts
test('buildMetadata takes the SEO copy from the page registry, with per-language params', async () => {
  const { buildMetadata } = await import('@/lib/seo/metadata')
  const m = buildMetadata({ locale: 'en', page: '/pricing', seo: { title: 'Pricing', description: 'd' } })
  expect(m.title).toBe('Pricing')
  expect(m.alternates?.canonical).toBe('https://eduflow.test/en/pricing')
  expect(m.alternates?.languages).toEqual({
    vi: 'https://eduflow.test/cach-tinh-phi',
    en: 'https://eduflow.test/en/pricing',
    'x-default': 'https://eduflow.test/cach-tinh-phi',
  })
  expect(m.openGraph).toMatchObject({ locale: 'en_US', siteName: 'EduFlow', url: 'https://eduflow.test/en/pricing' })
  expect(m.openGraph?.images).toEqual([{ url: 'https://eduflow.test/en/opengraph-image', width: 1200, height: 630, alt: 'Pricing' }])
  expect(buildMetadata({ locale: 'vi', page: '/', seo: { title: 'T', description: 'd', absoluteTitle: true } }).title).toEqual({ absolute: 'T' })
  expect(buildMetadata({ locale: 'en', page: '/pricing', seo: { title: 'Install', description: 'd', titleSuffix: ' · EduFlow Docs' } }).title).toEqual({
    absolute: 'Install · EduFlow Docs',
  })
  // Slug khác nhau giữa hai ngôn ngữ (bài hướng dẫn): canonical và hreflang dùng đúng params của từng ngôn ngữ.
  const d = buildMetadata({ locale: 'vi', page: '/install/[os]', params: { vi: { os: 'macos' }, en: { os: 'windows' } }, seo: { title: 'X', description: 'd' } })
  expect(d.alternates?.canonical).toBe('https://eduflow.test/huong-dan-cai-dat/macos')
  expect(d.alternates?.languages).toMatchObject({ en: 'https://eduflow.test/en/install/windows' })
  expect(buildMetadata({ locale: 'vi', page: '/download', seo: { title: 'T', description: 'd' } }).openGraph?.images).toEqual([
    { url: 'https://eduflow.test/download/opengraph-image', width: 1200, height: 630, alt: 'T' },
  ])
})

test('the sitemap lists every indexable page in both languages, with hreflang', async () => {
  const { default: sitemap } = await import('@/app/sitemap')
  const { indexablePages, pageUrl } = await import('@/lib/seo/pages')
  const entries = await sitemap()
  const expected = indexablePages().flatMap((p) => [pageUrl(p, 'vi'), pageUrl(p, 'en')])
  expect(entries.map((e) => e.url).sort()).toEqual([...expected].sort())
  expect(new Set(expected).size).toBe(expected.length)
  const dl = entries.find((e) => e.url.endsWith('/tai-ve'))!
  expect(dl.alternates?.languages).toEqual({ vi: 'https://eduflow.test/tai-ve', en: 'https://eduflow.test/en/download', 'x-default': 'https://eduflow.test/tai-ve' })
})
```

Viết lại `tests/unit/sitemap-feed.test.ts` từ dòng `const DOWNLOAD_URLS` trở xuống (giữ phần `vi.hoisted`, hai `vi.mock` và hàm `publish`):

```ts
const RELEASE_URLS = ['https://eduflow.test', 'https://eduflow.test/en', 'https://eduflow.test/tai-ve', 'https://eduflow.test/en/download']
const RELEASE_DATE = '2026-10-01T02:00:00.000Z'

type Entries = Awaited<ReturnType<typeof sitemap>>
const lastmod = (entries: Entries) => Object.fromEntries(entries.filter((e) => 'lastModified' in e).map((e) => [e.url, e.lastModified]))

/** URL của trang có ngày nội dung thật (updatedAt), kèm ngày theo giờ Việt Nam. */
const datedContent = () =>
  Object.fromEntries(
    indexablePages()
      .filter((p) => p.updatedAt)
      .flatMap((p) => (['vi', 'en'] as const).map((l) => [pageUrl(p, l), new Date(`${p.updatedAt}T00:00:00+07:00`)])),
  )

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
```

và đổi dòng import đầu tệp thành:

```ts
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import sitemap from '@/app/sitemap'
import { indexablePages, pageUrl } from '@/lib/seo/pages'
```

`tests/unit/e2e-pages.test.ts`:

```ts
import { beforeAll, expect, test } from 'vitest'
import { indexablePages, pageUrl } from '@/lib/seo/pages'
import { PAGES } from '../e2e/pages'

beforeAll(() => {
  process.env.NEXT_PUBLIC_SITE_URL = 'https://eduflow.test'
})

// Danh sách trang của e2e phải đúng bằng sổ trang: thêm trang mà quên e2e thì test này đỏ.
test('the e2e page list is exactly the indexable pages', () => {
  const expected = indexablePages().flatMap((p) => (['vi', 'en'] as const).map((l) => `${new URL(pageUrl(p, l)).pathname} ${l}`))
  expect(PAGES.map(([path, lang]) => `${path} ${lang}`).sort()).toEqual(expected.sort())
})
```

- [ ] **Step 2: Chạy test để thấy hỏng**

Chạy: `pnpm vitest run tests/unit/seo.test.ts tests/unit/sitemap-feed.test.ts tests/unit/e2e-pages.test.ts`
Kỳ vọng: FAIL, `Failed to resolve import "@/lib/seo/pages"` và `"../e2e/pages"`.

- [ ] **Step 3: Tách chữ meta của Chính sách bảo mật ra TS**

`content/privacy/meta.ts`:

```ts
import type { Locale } from '@/i18n/routing'

/** Chữ meta và ngày cập nhật của Chính sách bảo mật. Hai tệp MDX xuất lại `meta` từ đây; sổ trang (lib/seo/pages.ts) đọc trực tiếp. */
export const PRIVACY_META: Record<Locale, { title: string; description: string; updated: string }> = {
  vi: {
    title: 'Chính sách bảo mật',
    description: 'Trang web EduFlow thu thập gì, dùng cookie phân tích ra sao, cách rút lại đồng ý, liên kết ngoài và quyền của thầy cô theo Nghị định 13/2023/NĐ-CP.',
    updated: '2026-09-30',
  },
  en: {
    title: 'Privacy policy',
    description: 'What the EduFlow website collects, how it uses analytics cookies, how to withdraw consent, external links and your rights under Decree 13/2023/ND-CP.',
    updated: '2026-09-30',
  },
}
```

Ở `content/privacy/vi.mdx`, thay khối `export const meta = { ... }` (năm dòng đầu) bằng:

```mdx
import { PRIVACY_META } from './meta'

export const meta = PRIVACY_META.vi
```

Ở `content/privacy/en.mdx` làm như vậy với `PRIVACY_META.en`. Trước khi thay, đối chiếu `title`, `description`, `updated` trong hai tệp với `meta.ts` ở trên; khác thì chép giá trị đang có trong MDX sang `meta.ts`.

- [ ] **Step 4: Viết `lib/seo/pages.ts`**

```ts
import { GUIDE_OS } from '@/content/install'
import { PRIVACY_META } from '@/content/privacy/meta'
import type { Locale, PageKey } from '@/i18n/routing'
import en from '@/messages/en.json'
import vi from '@/messages/vi.json'
import { absoluteUrl } from './urls'

/*
 * Sổ trang indexable (spec §9.1): nguồn duy nhất cho title, description, URL, từ khoá chính và lastmod của mọi trang được
 * index. generateMetadata của từng trang, sitemap, llms.txt và test đều đọc ở đây, nên test đo đúng cái trang in ra.
 * Thêm trang: trang tĩnh thêm vào STATIC_PAGES; trang chủ đề thêm ở content/topics; bài hướng dẫn thêm ở content/docs.
 */

/** Hậu tố mà template title của app/[locale]/layout.tsx nối vào (`%s · ${common.siteName}`). */
export const BRAND_SUFFIX = ' · EduFlow'

/** Chữ SEO của một trang ở một ngôn ngữ. `absoluteTitle`: không nối hậu tố; `titleSuffix`: hậu tố riêng thay BRAND_SUFFIX. */
export type Seo = { title: string; description: string; absoluteTitle?: boolean; titleSuffix?: string }

type Messages = typeof vi
type Meta = { title: string; description: string }
type StaticEntry = {
  meta: (m: Messages, locale: Locale) => Meta
  absoluteTitle?: boolean
  /** Từ khoá chính theo bản đồ ở lib/seo/brand.ts; null là trang không nhắm từ khoá. */
  keyword: Record<Locale, string> | null
  updatedAt?: string
}

const MESSAGES: Record<Locale, Messages> = { vi, en }
const both = <T>(f: (locale: Locale) => T): Record<Locale, T> => ({ vi: f('vi'), en: f('en') })

export const STATIC_PAGES = {
  '/': { meta: (m) => m.home.meta, absoluteTitle: true, keyword: { vi: 'phần mềm AI cho giáo viên', en: 'AI software for teachers' } },
  '/k12': { meta: (m) => m.levels.k12.meta, keyword: { vi: 'AI cho giáo viên', en: 'AI for teachers' } },
  '/university': { meta: (m) => m.levels.university.meta, keyword: { vi: 'AI cho giảng viên', en: 'AI for lecturers' } },
  '/program': { meta: (m) => m.levels.program.meta, keyword: { vi: 'rà soát chương trình đào tạo', en: 'curriculum review' } },
  '/assistant': { meta: (m) => m.assistant.meta, keyword: { vi: 'trợ lý AI cho giáo viên', en: 'AI assistant for teachers' } },
  '/pricing': { meta: (m) => m.pricing.meta, keyword: { vi: 'chi phí EduFlow', en: 'EduFlow pricing' } },
  '/download': { meta: (m) => m.download.meta, keyword: { vi: 'tải EduFlow', en: 'download EduFlow' } },
  '/ai-transparency': { meta: (m) => m.transparency.meta, keyword: { vi: 'minh bạch AI', en: 'AI and data transparency' } },
  '/contact': { meta: (m) => m.contact.meta, keyword: { vi: 'liên hệ Agentra EduFlow', en: 'contact Agentra EduFlow' } },
  '/privacy': { meta: (_, locale) => PRIVACY_META[locale], keyword: null, updatedAt: PRIVACY_META.vi.updated },
} satisfies Partial<Record<PageKey, StaticEntry>>

export type StaticPageKey = keyof typeof STATIC_PAGES

export function staticSeo(locale: Locale, key: StaticPageKey): Seo {
  const entry: StaticEntry = STATIC_PAGES[key]
  const { title, description } = entry.meta(MESSAGES[locale], locale)
  return { title, description, ...(entry.absoluteTitle ? { absoluteTitle: true } : {}) }
}

export type IndexablePage = {
  /** Mã ổn định: khoá trang tĩnh, `topic:<id>` hoặc `doc:<id>`. */
  id: string
  key: PageKey
  params?: Record<Locale, Record<string, string>>
  seo: Record<Locale, Seo>
  keyword: Record<Locale, string> | null
  /** Ngày nội dung đổi thật, YYYY-MM-DD. Không có thì sitemap bỏ lastmod (trang chủ và Tải về lấy ngày phát hành bản app). */
  updatedAt?: string
}

export function indexablePages(): IndexablePage[] {
  const statics = (Object.keys(STATIC_PAGES) as StaticPageKey[]).map((key): IndexablePage => {
    const entry: StaticEntry = STATIC_PAGES[key]
    return { id: key, key, seo: both((l) => staticSeo(l, key)), keyword: entry.keyword, ...(entry.updatedAt ? { updatedAt: entry.updatedAt } : {}) }
  })
  // Hai trang cài đặt cũ, tới khi hai bài này chuyển vào trung tâm hướng dẫn.
  const install = GUIDE_OS.map(
    (os): IndexablePage => ({
      id: `install:${os}`,
      key: '/install/[os]',
      params: both(() => ({ os })),
      seo: both((l) => MESSAGES[l].install.meta[os]),
      keyword: null,
    }),
  )
  return [...statics, ...install]
}

export function pageUrl(p: IndexablePage, locale: Locale): string {
  return absoluteUrl(locale, p.key, p.params?.[locale])
}

/** Đúng chuỗi trong thẻ <title> của trang. */
export function finalTitle(seo: Seo): string {
  return seo.absoluteTitle ? seo.title : `${seo.title}${seo.titleSuffix ?? BRAND_SUFFIX}`
}
```

- [ ] **Step 5: Viết lại `lib/seo/metadata.ts`**

```ts
import type { Metadata } from 'next'
import type { Locale, PageKey } from '@/i18n/routing'
import { site } from '@/lib/site'
import type { Seo } from './pages'
import { absoluteUrl } from './urls'

/** Trang có ảnh chia sẻ riêng theo file convention `opengraph-image.tsx` trong thư mục của trang; còn lại dùng ảnh của trang chủ. */
const OWN_OG_IMAGE = new Set<PageKey>(['/download'])

/** URL tuyệt đối của ảnh chia sẻ 1200×630 theo file convention: đường dẫn theo khoá nội bộ, không tiền tố với vi, /en với en. */
export function ogImageUrl(locale: Locale, page: PageKey): string {
  const prefix = locale === 'vi' ? '' : `/${locale}`
  return `${site.siteUrl()}${prefix}${OWN_OG_IMAGE.has(page) ? page : ''}/opengraph-image`
}

/** Metadata chuẩn của một trang: title từ sổ trang, canonical, hreflang (x-default = vi), Open Graph, Twitter (spec §9). */
export function buildMetadata(opts: { locale: Locale; page: PageKey; params?: Record<Locale, Record<string, string>>; seo: Seo; ogImage?: string }): Metadata {
  const { locale, page, params, seo } = opts
  const url = absoluteUrl(locale, page, params?.[locale])
  const vi = absoluteUrl('vi', page, params?.vi)
  const en = absoluteUrl('en', page, params?.en)
  const image = { url: opts.ogImage ?? ogImageUrl(locale, page), width: 1200, height: 630, alt: seo.title }
  const title = seo.absoluteTitle ? { absolute: seo.title } : seo.titleSuffix ? { absolute: `${seo.title}${seo.titleSuffix}` } : seo.title
  return {
    title,
    description: seo.description,
    alternates: { canonical: url, languages: { vi, en, 'x-default': vi } },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url,
      siteName: site.name,
      locale: locale === 'vi' ? 'vi_VN' : 'en_US',
      alternateLocale: locale === 'vi' ? 'en_US' : 'vi_VN',
      type: 'website',
      images: [image],
    },
    twitter: { card: 'summary_large_image', title: seo.title, description: seo.description, images: [image.url] },
  }
}
```

- [ ] **Step 6: Mọi trang lấy metadata từ sổ**

Trong mỗi tệp dưới đây, `generateMetadata` gọi `staticSeo` thay cho `getTranslations('<ns>.meta')`; bỏ import `getTranslations` nếu không còn dùng; thêm `import { staticSeo } from '@/lib/seo/pages'`:

| Tệp | Thân mới của `generateMetadata` |
|---|---|
| `app/[locale]/page.tsx` | `return buildMetadata({ locale, page: '/', seo: staticSeo(locale, '/') })` |
| `app/[locale]/assistant/page.tsx` | `return buildMetadata({ locale, page: '/assistant', seo: staticSeo(locale, '/assistant') })` |
| `app/[locale]/pricing/page.tsx` | `return buildMetadata({ locale, page: '/pricing', seo: staticSeo(locale, '/pricing') })` |
| `app/[locale]/ai-transparency/page.tsx` | `return buildMetadata({ locale, page: '/ai-transparency', seo: staticSeo(locale, '/ai-transparency') })` |
| `app/[locale]/download/page.tsx` | `return buildMetadata({ locale, page: '/download', seo: staticSeo(locale, '/download') })` |
| `app/[locale]/contact/page.tsx` | `return buildMetadata({ locale, page: '/contact', seo: staticSeo(locale, '/contact') })` |
| `app/[locale]/privacy/page.tsx` | `return buildMetadata({ locale, page: '/privacy', seo: staticSeo(locale, '/privacy') })` |

Mỗi hàm vẫn mở đầu bằng `const locale = (await getLocale()) as Locale` (trang nào đang đọc locale từ params thì giữ cách đó).

`components/level/levels.ts`: đổi kiểu `page: PageKey` thành `page: '/k12' | '/university' | '/program'` và bỏ import `PageKey` nếu không còn dùng. `components/level/LevelPage.tsx`: thân `levelMetadata` thành

```ts
  const locale = (await getLocale()) as Locale
  return buildMetadata({ locale, page: LEVELS[level].page, seo: staticSeo(locale, LEVELS[level].page) })
```

(bỏ `const t = await getTranslations(ns(level))` trong hàm này).

`app/[locale]/install/[os]/page.tsx`: thân `generateMetadata` thành

```ts
  const { locale, os } = await params
  if (!isGuideOs(os)) notFound()
  const t = await getTranslations('install.meta')
  return buildMetadata({
    locale: locale as Locale,
    page: '/install/[os]',
    params: { vi: { os }, en: { os } },
    seo: { title: t(`${os}.title`), description: t(`${os}.description`) },
  })
```

- [ ] **Step 7: Sitemap dựng từ sổ**

`app/sitemap.ts`:

```ts
import type { MetadataRoute } from 'next'
import { routing } from '@/i18n/routing'
import { getReleases, latestRelease } from '@/lib/releases'
import { indexablePages, pageUrl } from '@/lib/seo/pages'

/**
 * Mọi trang indexable × 2 ngôn ngữ, kèm hreflang (spec §9.1). lastmod chỉ từ ngày thật: ngày đổi nội dung (updatedAt), hoặc
 * ngày phát hành bản app cho trang chủ và Tải về khi feed có. Không bao giờ là ngày build. Không changefreq, không priority:
 * Google bỏ qua cả hai.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { assets } = await getReleases()
  const release = validDate(latestRelease(assets)?.releaseDate)
  return indexablePages().flatMap((p) => {
    const vi = pageUrl(p, 'vi')
    const en = pageUrl(p, 'en')
    const date = p.key === '/' || p.key === '/download' ? release : p.updatedAt ? new Date(`${p.updatedAt}T00:00:00+07:00`) : undefined
    return routing.locales.map((locale) => ({
      url: locale === 'vi' ? vi : en,
      ...(date ? { lastModified: date } : {}),
      alternates: { languages: { vi, en, 'x-default': vi } },
    }))
  })
}

// Ngày feed hỏng thì bỏ lastmod: Invalid Date làm serializer của Next ném RangeError và hỏng build.
function validDate(iso: string | undefined): Date | undefined {
  if (!iso) return undefined
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? undefined : d
}
```

- [ ] **Step 8: Danh sách trang của e2e thành tệp dữ liệu**

`tests/e2e/pages.ts` (chuyển mảng `PAGES` hiện có ra đây, đúng 24 mục sau Task 4):

```ts
/** Mọi trang indexable × ngôn ngữ, để e2e đi qua. tests/unit/e2e-pages.test.ts buộc danh sách này bằng sổ trang (lib/seo/pages.ts). */
export const PAGES: Array<[string, 'vi' | 'en']> = [
  ['/', 'vi'], ['/en', 'en'],
  ['/ai-cho-giao-vien', 'vi'], ['/en/ai-for-teachers', 'en'],
  ['/ai-cho-giang-vien', 'vi'], ['/en/ai-for-lecturers', 'en'],
  ['/ra-soat-chuong-trinh-dao-tao', 'vi'], ['/en/curriculum-review', 'en'],
  ['/tro-ly-ai', 'vi'], ['/en/ai-assistant', 'en'],
  ['/cach-tinh-phi', 'vi'], ['/en/pricing', 'en'],
  ['/minh-bach-ai', 'vi'], ['/en/ai-transparency', 'en'],
  ['/tai-ve', 'vi'], ['/en/download', 'en'],
  ['/huong-dan-cai-dat/macos', 'vi'], ['/huong-dan-cai-dat/windows', 'vi'],
  ['/en/install/macos', 'en'], ['/en/install/windows', 'en'],
  ['/lien-he', 'vi'], ['/en/contact', 'en'],
  ['/chinh-sach-bao-mat', 'vi'], ['/en/privacy', 'en'],
]
```

Ở `tests/e2e/pages.spec.ts`: xoá khai báo `export const PAGES = [...]`, thêm `import { PAGES } from './pages'`.

- [ ] **Step 9: Bỏ test mô tả cũ ở `tests/unit/content.test.ts`**

Xoá hai test `every meta description is 140 to 160 characters (spec §9)` và `page titles do not repeat the brand the title template adds`: Task 7 thay bằng test trên sổ trang (110 tới 160 ký tự, đếm cả hậu tố).

- [ ] **Step 10: Chạy test**

Chạy: `pnpm vitest run tests/unit/seo.test.ts tests/unit/sitemap-feed.test.ts tests/unit/e2e-pages.test.ts && pnpm verify`
Kỳ vọng: PASS, xanh.

- [ ] **Step 11: E2E**

Chạy lệnh E2E-FEED (toàn bộ). Kỳ vọng: PASS. Mở `http://localhost:3200/sitemap.xml` (sau `pnpm start -p 3200`) nếu muốn xem: 24 URL, có `xhtml:link` hreflang.

- [ ] **Step 12: Commit**

```bash
git add lib/seo/pages.ts lib/seo/metadata.ts content/privacy app/sitemap.ts "app/[locale]" components/level tests/unit/seo.test.ts tests/unit/sitemap-feed.test.ts tests/unit/e2e-pages.test.ts tests/unit/content.test.ts tests/e2e/pages.ts tests/e2e/pages.spec.ts
git commit -m "feat(seo): sổ trang indexable làm nguồn cho metadata và sitemap"
```

---

### Task 7: Chữ SEO mới cho các trang tĩnh

Viết lại title và description theo spec §9.2 (đã đếm ký tự, kể cả hậu tố) và thêm test độ dài, trùng lặp và từ khoá trên sổ trang (spec §12.1).

**Files:**
- Modify: `messages/vi.json`, `messages/en.json` (các khoá `*.meta.title`, `*.meta.description`), `lib/seo/pages.ts` (`absoluteTitle` cho ba trang)
- Test: `tests/unit/seo-pages.test.ts`

**Interfaces:**
- Consumes: `indexablePages`, `finalTitle`, `BRAND_SUFFIX`, `STATIC_PAGES` (Task 6); `brand` (Task 2).
- Produces: không có hàm mới.

- [ ] **Step 1: Viết test hỏng**

`tests/unit/seo-pages.test.ts`:

```ts
import { beforeAll, expect, test } from 'vitest'
import { routing } from '@/i18n/routing'
import { brand } from '@/lib/seo/brand'
import { BRAND_SUFFIX, finalTitle, indexablePages } from '@/lib/seo/pages'
import vi from '@/messages/vi.json'

beforeAll(() => {
  process.env.NEXT_PUBLIC_SITE_URL = 'https://eduflow.test'
})

const each = () => indexablePages().flatMap((p) => routing.locales.map((locale) => ({ p, locale, seo: p.seo[locale] })))
const len = (s: string) => [...s].length

test('the brand suffix is the one the layout title template adds', () => {
  expect(BRAND_SUFFIX).toBe(` · ${vi.common.siteName}`)
})

test('every title is at most 60 characters with its suffix and names EduFlow at most once (spec §9.2)', () => {
  const bad = each()
    .map(({ p, locale, seo }) => ({ where: `${p.id} ${locale}`, title: finalTitle(seo) }))
    .filter(({ title }) => len(title) > 60 || (title.match(/EduFlow/g) ?? []).length > 1)
    .map(({ where, title }) => `${where}: ${title} (${len(title)})`)
  expect(bad).toEqual([])
})

test('every meta description is 110 to 160 characters (spec §9.2)', () => {
  const bad = each()
    .filter(({ seo }) => len(seo.description) < 110 || len(seo.description) > 160)
    .map(({ p, locale, seo }) => `${p.id} ${locale} (${len(seo.description)})`)
  expect(bad).toEqual([])
})

test('titles and descriptions are unique within each language', () => {
  for (const locale of routing.locales) {
    const pages = indexablePages().map((p) => p.seo[locale])
    expect(new Set(pages.map(finalTitle)).size, locale).toBe(pages.length)
    expect(new Set(pages.map((s) => s.description)).size, locale).toBe(pages.length)
  }
})

test('no two pages share a primary keyword (spec §4.2)', () => {
  for (const locale of routing.locales) {
    const keywords = indexablePages().flatMap((p) => (p.keyword ? [p.keyword[locale].toLowerCase()] : []))
    const dupes = keywords.filter((k, i) => keywords.indexOf(k) !== i)
    expect(dupes, locale).toEqual([])
  }
})

test('the title of every product page carries its primary keyword', () => {
  const bad = indexablePages()
    .filter((p) => p.keyword && !p.id.includes(':'))
    .flatMap((p) => routing.locales.filter((l) => !finalTitle(p.seo[l]).toLowerCase().includes(p.keyword![l].toLowerCase())).map((l) => `${p.id} ${l}`))
  expect(bad).toEqual([])
})

test('the home page uses the canonical description word for word', () => {
  const home = indexablePages().find((p) => p.id === '/')!
  expect(home.seo.vi.description).toBe(brand.description.vi)
  expect(home.seo.en.description).toBe(brand.description.en)
})
```

- [ ] **Step 2: Chạy test để thấy hỏng**

Chạy: `pnpm vitest run tests/unit/seo-pages.test.ts`
Kỳ vọng: FAIL ở test title (ví dụ `/university en: University courses level: CLOs, weekly plans, course syllabi · EduFlow (70)`), test từ khoá trong title và test mô tả trang chủ.

- [ ] **Step 3: Viết chữ mới**

Đặt đúng các giá trị sau (đã đếm: cột "title" là chuỗi cuối trong thẻ `<title>`, gồm hậu tố nếu có):

| Khoá messages | vi `title` → `<title>` (ký tự) | vi `description` |
|---|---|---|
| `home.meta` | `EduFlow · Phần mềm AI cho giáo viên soạn đề, giáo án` (52) | `EduFlow là phần mềm AI cho giáo viên và giảng viên: soạn đề kiểm tra theo ma trận, giáo án, slide, đề cương học phần, có trợ lý AI và người duyệt.` |
| `levels.k12.meta` | `AI cho giáo viên phổ thông: đề kiểm tra, giáo án` (58) | `AI cho giáo viên phổ thông: soạn đề kiểm tra theo ma trận, trộn nhiều mã đề, giáo án 5512 và slide có quiz; máy kiểm cổng chất lượng, thầy cô duyệt và ký.` |
| `levels.university.meta` | `AI cho giảng viên: CLO, kế hoạch tuần, đề cương` (57) | `AI cho giảng viên đại học: từ bài giảng tới chuẩn đầu ra học phần (CLO), kế hoạch tuần, giáo án buổi, đánh giá và đề cương, có cổng kiểm và chữ ký duyệt.` |
| `levels.program.meta` | `Rà soát chương trình đào tạo tại một ngày xét` (55) | `Rà soát chương trình đào tạo trên bản sao số: ma trận chuẩn đầu ra, curriculum map, hiệu lực văn bản tại ngày xét và kịch bản “nếu” trước khi sửa.` |
| `assistant.meta` | `Trợ lý AI cho giáo viên ngay trong ứng dụng` (53) | `Trợ lý AI cho giáo viên luôn có mặt trong EduFlow: hiểu màn đang mở, trả lời theo ba tầng kết luận, đề xuất sửa vào bản nháp và không ký thay thầy cô.` |
| `pricing.meta` | `Chi phí EduFlow: tính phí theo token AI đã dùng` (47, tuyệt đối) | `Chi phí EduFlow tính theo token AI đã dùng, có ngân sách tháng theo key và hiện trước khi chạy; phần chạy tại máy không tốn tiền. Liên hệ Agentra để báo giá.` |
| `transparency.meta` | `Minh bạch AI và dữ liệu của trường` (44) | `Minh bạch AI ở EduFlow: AI dùng ở đâu, gửi dữ liệu gì, dữ liệu nào ở lại máy thầy cô, máy chủ ghi gì, và nguyên tắc máy đề xuất, người quyết định.` |
| `download.meta` | `Tải EduFlow cho macOS và Windows` (32, tuyệt đối) | (giữ giá trị của Task 3) |
| `contact.meta` | `Liên hệ Agentra EduFlow: báo giá, key, dùng thử` (47, tuyệt đối) | (giữ nguyên) |

| Khoá messages | en `title` → `<title>` (ký tự) | en `description` |
|---|---|---|
| `home.meta` | `EduFlow · AI software for teachers: tests, lesson plans` (55) | `EduFlow is AI software for teachers and lecturers: matrix-based tests, lesson plans, slides and course syllabi, with an AI assistant and human review.` |
| `levels.k12.meta` | `AI for teachers: test papers, lesson plans, slides` (60) | `AI for K-12 teachers: tests built from a blueprint, shuffled test versions, Official Letter 5512 lesson plans and quiz slides, checked by gates, signed by you.` |
| `levels.university.meta` | `AI for lecturers: CLOs, weekly plans, syllabi` (55) | `AI for university lecturers: from lecture materials to course learning outcomes (CLOs), weekly plans, session plans, assessments and a signed course syllabus.` |
| `levels.program.meta` | `Curriculum review on a digital twin of the program` (60) | `Curriculum review on a digital twin of your degree program: learning outcome matrix, curriculum map checks, legal validity at a review date and what-if runs.` |
| `assistant.meta` | `AI assistant for teachers, built into the app` (55) | `An AI assistant for teachers, always present in EduFlow: it reads the open screen, answers in three tiers, suggests edits to a draft and never signs for you.` |
| `pricing.meta` | `EduFlow pricing: billed by the AI tokens you use` (48, tuyệt đối) | `EduFlow pricing is based on the AI tokens used, with a monthly budget per key and costs shown before anything runs; local work is free. Ask Agentra for a quote.` |
| `transparency.meta` | `AI and data transparency for schools` (46) | `AI transparency at EduFlow: where AI is used, what data it sends, which data stays on your computer, what the server logs, and why people make the decisions.` |
| `download.meta` | `Download EduFlow for macOS and Windows` (38, tuyệt đối) | (giữ giá trị của Task 3) |
| `contact.meta` | `Contact Agentra EduFlow: quotes, keys, trials` (45, tuyệt đối) | (giữ nguyên) |

Cột title của bảng ghi chuỗi đặt vào `messages`; hậu tố ` · EduFlow` do layout thêm cho trang không tuyệt đối. Trang chủ đã có `absoluteTitle`.

Ở `lib/seo/pages.ts`, thêm `absoluteTitle: true` cho `'/pricing'`, `'/download'`, `'/contact'` (ba title đã chứa "EduFlow").

- [ ] **Step 4: Chạy test**

Chạy: `pnpm vitest run tests/unit/seo-pages.test.ts tests/unit/content.test.ts tests/unit/app-facts.test.ts && pnpm verify`
Kỳ vọng: PASS, xanh.

- [ ] **Step 5: Kiểm bằng seo-audit**

Chạy lệnh SEO-AUDIT (script ở `~/.claude/skills/seo-master/scripts/seo-audit.mjs` vì Task 24 mới chép vào repo).
Kỳ vọng: 0 lỗi; không còn cảnh báo title dài; không còn cảnh báo link trỏ vào chuyển hướng (Task 5). Ghi số cảnh báo còn lại vào mô tả commit.

- [ ] **Step 6: Commit**

```bash
git add messages/vi.json messages/en.json lib/seo/pages.ts tests/unit/seo-pages.test.ts
git commit -m "feat(seo): title và description theo từ khoá, đúng độ dài kể cả hậu tố"
```

---

### Task 8: Entity graph JSON-LD

Mọi builder JSON-LD có `@id` ổn định để các trang nối thành một đồ thị; thêm WebSite, WebPage, TechArticle, CollectionPage; bỏ HowTo (Google ngừng rich result HowTo từ 2023) (spec §9.1).

**Files:**
- Modify: `lib/seo/jsonld.ts`, `app/[locale]/layout.tsx`, `app/[locale]/page.tsx`, `app/[locale]/download/page.tsx`, `app/[locale]/install/[os]/page.tsx`, `tests/unit/jsonld.test.ts`, `tests/e2e/pages.spec.ts`

**Interfaces:**
- Consumes: `brand`, `appFacts` (Task 2); `absoluteUrl`; `latestRelease`; `site`.
- Produces (`lib/seo/jsonld.ts`):
  - `ids = { organization(): string; website(): string; software(): string; webpage(url: string): string; article(url: string): string }`
  - `operatingSystems(): string`
  - `organization(locale)`, `website(locale)`, `softwareApplication(assets: ReleaseAsset[], locale)` (bỏ tham số thứ ba)
  - `webPage(input: { url: string; name: string; description: string; locale: Locale; about?: string; keywords?: string[]; image?: string; dateModified?: string })`
  - `techArticle(input: { url: string; headline: string; description: string; locale: Locale; dateModified: string; section: string; image: string })`
  - `collectionPage(input: { url: string; name: string; description: string; locale: Locale; items: Array<{ name: string; url: string }> })`
  - `faqPage(items)`, `breadcrumb(items)` giữ nguyên; xoá `howTo`.

- [ ] **Step 1: Viết test hỏng**

Viết lại `tests/unit/jsonld.test.ts`:

```ts
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { breadcrumb, collectionPage, faqPage, ids, organization, softwareApplication, techArticle, webPage, website } from '@/lib/seo/jsonld'
import { brand } from '@/lib/seo/brand'

const asset = {
  platform: 'windows-x64' as const,
  version: '1.0.0',
  fileName: 'EduFlow Setup 1.0.0.exe',
  url: 'https://feed.example.test/desktop/EduFlow%20Setup%201.0.0.exe',
  sizeBytes: 157058273,
  sha512: 'abc',
  releaseDate: '2026-10-01T02:00:00.000Z',
}

beforeEach(() => vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://eduflow.test'))
afterEach(() => vi.unstubAllEnvs())

const LOGO = { '@type': 'ImageObject', url: 'https://eduflow.test/apple-icon.png', width: 180, height: 180 }
const PUBLISHER = { '@type': 'Organization', '@id': 'https://agentra.io.vn/#organization', name: 'Agentra JSC', url: 'https://agentra.io.vn', logo: LOGO }
const IS_PART_OF = { '@type': 'WebSite', '@id': 'https://eduflow.test/#website', name: 'EduFlow', url: 'https://eduflow.test' }

test('stable @ids tie every page into one graph', () => {
  expect(ids.organization()).toBe('https://agentra.io.vn/#organization')
  expect(ids.website()).toBe('https://eduflow.test/#website')
  expect(ids.software()).toBe('https://eduflow.test/#software')
  expect(ids.webpage('https://eduflow.test/tai-ve')).toBe('https://eduflow.test/tai-ve#webpage')
  expect(ids.article('https://eduflow.test/huong-dan/x')).toBe('https://eduflow.test/huong-dan/x#article')
})

test('organization', () => {
  expect(organization('vi')).toEqual({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://agentra.io.vn/#organization',
    name: 'Agentra JSC',
    alternateName: 'Agentra',
    url: 'https://agentra.io.vn',
    logo: LOGO,
    description: brand.organization.vi,
    email: 'info@agentra.io.vn',
    address: { '@type': 'PostalAddress', addressLocality: 'Đà Nẵng', addressCountry: 'VN' },
    contactPoint: [{ '@type': 'ContactPoint', email: 'info@agentra.io.vn', contactType: 'customer support', availableLanguage: ['vi', 'en'] }],
  })
})

test('website', () => {
  expect(website('en')).toEqual({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': 'https://eduflow.test/#website',
    url: 'https://eduflow.test',
    name: 'EduFlow',
    alternateName: 'Agentra EduFlow',
    description: brand.description.en,
    inLanguage: ['vi', 'en'],
    publisher: { '@id': 'https://agentra.io.vn/#organization' },
  })
})

test('softwareApplication describes the v1 app without offers or ratings', () => {
  expect(softwareApplication([asset], 'vi')).toEqual({
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': 'https://eduflow.test/#software',
    name: 'EduFlow',
    alternateName: 'Agentra EduFlow',
    url: 'https://eduflow.test',
    description: brand.description.vi,
    disambiguatingDescription: brand.disambiguation.vi,
    applicationCategory: 'EducationalApplication',
    applicationSubCategory: brand.category.vi,
    operatingSystem: 'macOS 12+ (Apple Silicon, Intel), Windows 10 22H2+ (x64)',
    inLanguage: 'vi',
    featureList: brand.features.vi,
    audience: { '@type': 'Audience', audienceType: brand.audience.vi },
    downloadUrl: 'https://eduflow.test/tai-ve',
    softwareHelp: { '@type': 'CreativeWork', url: 'https://eduflow.test/huong-dan-cai-dat/macos' },
    publisher: PUBLISHER,
    softwareVersion: '1.0.0',
    datePublished: '2026-10-01',
  })
  expect(softwareApplication([], 'en')).not.toHaveProperty('softwareVersion')
})

test('softwareApplication takes the newest of two assets, whatever the order, and skips a missing date', () => {
  const newer = { ...asset, platform: 'macos-arm64' as const, version: '1.0.1', releaseDate: '2026-10-03T02:00:00.000Z' }
  for (const assets of [[asset, newer], [newer, asset]]) expect(softwareApplication(assets, 'vi')).toMatchObject({ softwareVersion: '1.0.1', datePublished: '2026-10-03' })
  expect(softwareApplication([{ ...asset, releaseDate: '' }], 'vi')).not.toHaveProperty('datePublished')
})

test('webPage, techArticle and collectionPage point back to the site and the app', () => {
  expect(webPage({ url: 'https://eduflow.test/ai-cho-giao-vien', name: 'N', description: 'D', locale: 'vi', about: 'AI cho giáo viên' })).toEqual({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': 'https://eduflow.test/ai-cho-giao-vien#webpage',
    url: 'https://eduflow.test/ai-cho-giao-vien',
    name: 'N',
    description: 'D',
    inLanguage: 'vi',
    about: { '@type': 'Thing', name: 'AI cho giáo viên' },
    isPartOf: IS_PART_OF,
    mentions: { '@type': 'SoftwareApplication', '@id': 'https://eduflow.test/#software', name: 'EduFlow', url: 'https://eduflow.test' },
    publisher: PUBLISHER,
  })
  expect(
    techArticle({ url: 'https://eduflow.test/huong-dan/x', headline: 'H', description: 'D', locale: 'vi', dateModified: '2026-10-15', section: 'Bắt đầu', image: 'https://eduflow.test/og/docs/x' }),
  ).toEqual({
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    '@id': 'https://eduflow.test/huong-dan/x#article',
    url: 'https://eduflow.test/huong-dan/x',
    mainEntityOfPage: 'https://eduflow.test/huong-dan/x',
    headline: 'H',
    description: 'D',
    inLanguage: 'vi',
    dateModified: '2026-10-15',
    articleSection: 'Bắt đầu',
    image: 'https://eduflow.test/og/docs/x',
    isPartOf: IS_PART_OF,
    about: { '@type': 'SoftwareApplication', '@id': 'https://eduflow.test/#software', name: 'EduFlow' },
    author: PUBLISHER,
    publisher: PUBLISHER,
  })
  expect(collectionPage({ url: 'https://eduflow.test/huong-dan', name: 'N', description: 'D', locale: 'vi', items: [{ name: 'A', url: 'https://eduflow.test/huong-dan/a' }] })).toEqual({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': 'https://eduflow.test/huong-dan#webpage',
    url: 'https://eduflow.test/huong-dan',
    name: 'N',
    description: 'D',
    inLanguage: 'vi',
    isPartOf: IS_PART_OF,
    mainEntity: { '@type': 'ItemList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'A', url: 'https://eduflow.test/huong-dan/a' }] },
  })
})

test('faqPage and breadcrumb', () => {
  expect(faqPage([{ q: 'A?', a: 'B' }])).toEqual({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [{ '@type': 'Question', name: 'A?', acceptedAnswer: { '@type': 'Answer', text: 'B' } }],
  })
  expect(breadcrumb([{ name: 'Home', url: 'https://x' }, { name: 'Download', url: 'https://x/tai-ve' }])).toEqual({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://x' },
      { '@type': 'ListItem', position: 2, name: 'Download', item: 'https://x/tai-ve' },
    ],
  })
})
```

- [ ] **Step 2: Chạy test để thấy hỏng**

Chạy: `pnpm vitest run tests/unit/jsonld.test.ts`
Kỳ vọng: FAIL, `ids`, `website`, `webPage`, `techArticle`, `collectionPage` không được export.

- [ ] **Step 3: Viết lại `lib/seo/jsonld.ts`**

```ts
import type { Locale } from '@/i18n/routing'
import { latestRelease } from '@/lib/releases'
import type { ReleaseAsset } from '@/lib/releases/types'
import { site } from '@/lib/site'
import { appFacts } from './app-facts'
import { brand } from './brand'
import { absoluteUrl } from './urls'

type JsonLd = Record<string, unknown>
const CONTEXT = 'https://schema.org'

/**
 * `@id` ổn định nối thực thể của mọi trang thành một đồ thị (spec §9.1). Tổ chức lấy id trên site của công ty, như DocOps:
 * agentra.io.vn là trang chính thức của Agentra JSC, nên mọi sản phẩm của công ty trỏ về cùng một thực thể.
 */
export const ids = {
  organization: () => `${site.companyUrl}/#organization`,
  website: () => `${site.siteUrl()}/#website`,
  software: () => `${site.siteUrl()}/#software`,
  webpage: (url: string) => `${url}#webpage`,
  article: (url: string) => `${url}#article`,
}

/** Logo vuông PNG 180×180 (Google không nhận SVG làm logo): file convention app/apple-icon.png. */
const logo = () => ({ '@type': 'ImageObject', url: `${site.siteUrl()}/apple-icon.png`, width: 180, height: 180 })

/** Tổ chức ghi đủ tên và logo: validator chỉ đọc một trang, không theo `@id` sang trang khác. */
function publisher(): JsonLd {
  return { '@type': 'Organization', '@id': ids.organization(), name: site.company, url: site.companyUrl, logo: logo() }
}

const isPartOf = () => ({ '@type': 'WebSite', '@id': ids.website(), name: brand.name, url: absoluteUrl('vi', '/') })

/** Hệ điều hành theo app-facts, ví dụ "macOS 12+ (Apple Silicon, Intel), Windows 10 22H2+ (x64)". */
export function operatingSystems(): string {
  const { macos, windows } = appFacts.platforms
  return `macOS ${appFacts.minOs.macos}+ (${macos.join(', ')}), Windows ${appFacts.minOs.windows}+ (${windows.join(', ')})`
}

export function organization(locale: Locale): JsonLd {
  return {
    '@context': CONTEXT,
    '@type': 'Organization',
    '@id': ids.organization(),
    name: site.company,
    alternateName: 'Agentra',
    url: site.companyUrl,
    logo: logo(),
    description: brand.organization[locale],
    email: site.email,
    address: { '@type': 'PostalAddress', addressLocality: site.city[locale], addressCountry: 'VN' },
    contactPoint: [{ '@type': 'ContactPoint', email: site.email, contactType: 'customer support', availableLanguage: ['vi', 'en'] }],
    // Chỉ hồ sơ có thật (OQ-R3); rỗng thì bỏ hẳn khoá.
    ...(brand.sameAs.length ? { sameAs: brand.sameAs } : {}),
  }
}

export function website(locale: Locale): JsonLd {
  return {
    '@context': CONTEXT,
    '@type': 'WebSite',
    '@id': ids.website(),
    url: absoluteUrl('vi', '/'),
    name: brand.name,
    alternateName: brand.alternateName,
    description: brand.description[locale],
    inLanguage: ['vi', 'en'],
    publisher: { '@id': ids.organization() },
  }
}

/**
 * Ứng dụng: phiên bản và ngày từ feed. Không `offers`, không `aggregateRating`: giá theo báo giá, chưa có đánh giá thật.
 * Giao diện app là tiếng Việt nên `inLanguage` luôn 'vi'. `featureList` chỉ gồm tính năng v1 (brand.features).
 */
export function softwareApplication(assets: ReleaseAsset[], locale: Locale): JsonLd {
  const latest = latestRelease(assets)
  return {
    '@context': CONTEXT,
    '@type': 'SoftwareApplication',
    '@id': ids.software(),
    name: brand.name,
    alternateName: brand.alternateName,
    url: absoluteUrl(locale, '/'),
    description: brand.description[locale],
    disambiguatingDescription: brand.disambiguation[locale],
    applicationCategory: 'EducationalApplication',
    applicationSubCategory: brand.category[locale],
    operatingSystem: operatingSystems(),
    inLanguage: 'vi',
    featureList: brand.features[locale],
    audience: { '@type': 'Audience', audienceType: brand.audience[locale] },
    downloadUrl: absoluteUrl(locale, '/download'),
    // Trỏ trung tâm hướng dẫn khi có; tạm thời là bài cài đặt.
    softwareHelp: { '@type': 'CreativeWork', url: absoluteUrl(locale, '/install/[os]', { os: 'macos' }) },
    publisher: publisher(),
    // Không rõ ngày phát hành ('') thì bỏ datePublished thay vì khai chuỗi rỗng.
    ...(latest ? { softwareVersion: latest.version, ...(latest.releaseDate ? { datePublished: latest.releaseDate.slice(0, 10) } : {}) } : {}),
  }
}

/** Trang cấp và trang chủ đề: nói rõ chủ đề (`about`), sản phẩm được nhắc tới (`mentions`) và thuộc site nào. */
export function webPage(input: {
  url: string
  name: string
  description: string
  locale: Locale
  about?: string
  keywords?: string[]
  image?: string
  dateModified?: string
}): JsonLd {
  return {
    '@context': CONTEXT,
    '@type': 'WebPage',
    '@id': ids.webpage(input.url),
    url: input.url,
    name: input.name,
    description: input.description,
    inLanguage: input.locale,
    ...(input.about ? { about: { '@type': 'Thing', name: input.about } } : {}),
    ...(input.keywords?.length ? { keywords: input.keywords.join(', ') } : {}),
    ...(input.image ? { primaryImageOfPage: { '@type': 'ImageObject', url: input.image } } : {}),
    ...(input.dateModified ? { dateModified: input.dateModified } : {}),
    isPartOf: isPartOf(),
    mentions: { '@type': 'SoftwareApplication', '@id': ids.software(), name: brand.name, url: absoluteUrl(input.locale, '/') },
    publisher: publisher(),
  }
}

/** Bài hướng dẫn. Thay HowTo: Google ngừng rich result HowTo từ 2023 (spec §7.4). */
export function techArticle(input: { url: string; headline: string; description: string; locale: Locale; dateModified: string; section: string; image: string }): JsonLd {
  return {
    '@context': CONTEXT,
    '@type': 'TechArticle',
    '@id': ids.article(input.url),
    url: input.url,
    mainEntityOfPage: input.url,
    headline: input.headline,
    description: input.description,
    inLanguage: input.locale,
    dateModified: input.dateModified,
    articleSection: input.section,
    image: input.image,
    isPartOf: isPartOf(),
    about: { '@type': 'SoftwareApplication', '@id': ids.software(), name: brand.name },
    author: publisher(),
    publisher: publisher(),
  }
}

/** Mục lục hướng dẫn. */
export function collectionPage(input: { url: string; name: string; description: string; locale: Locale; items: Array<{ name: string; url: string }> }): JsonLd {
  return {
    '@context': CONTEXT,
    '@type': 'CollectionPage',
    '@id': ids.webpage(input.url),
    url: input.url,
    name: input.name,
    description: input.description,
    inLanguage: input.locale,
    isPartOf: isPartOf(),
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: input.items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, url: it.url })),
    },
  }
}

export function faqPage(items: Array<{ q: string; a: string }>): JsonLd {
  return {
    '@context': CONTEXT,
    '@type': 'FAQPage',
    mainEntity: items.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
  }
}

export function breadcrumb(items: Array<{ name: string; url: string }>): JsonLd & { itemListElement: unknown[] } {
  return {
    '@context': CONTEXT,
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: it.url })),
  }
}
```

- [ ] **Step 4: Dùng builder mới**

- `app/[locale]/layout.tsx`: import `organization, website`; ngay sau `<JsonLd data={organization(locale)} />` thêm `<JsonLd data={website(locale)} />`.
- `app/[locale]/page.tsx`: đổi `softwareApplication(assets, locale, absoluteUrl(locale, '/download'))` thành `softwareApplication(assets, locale)`, và thêm trước dòng đó

```tsx
      <JsonLd data={webPage({ url: absoluteUrl(locale, '/'), name: finalTitle(seo), description: seo.description, locale })} />
```

với `const seo = staticSeo(locale, '/')` ở đầu thân `HomePage`, import `webPage` từ `@/lib/seo/jsonld` và `finalTitle, staticSeo` từ `@/lib/seo/pages`.
- `app/[locale]/download/page.tsx`: `softwareApplication(assets, locale)`.
- `app/[locale]/install/[os]/page.tsx`: xoá dòng `<JsonLd data={howTo(...)} />` và bỏ `howTo` khỏi import.

- [ ] **Step 5: E2E kiểm đồ thị**

Trong `tests/e2e/pages.spec.ts`, trong test `${path} renders with SEO basics`, thay dòng kiểm Organization bằng:

```ts
    // Spec §9.1: một Organization và một WebSite trên mọi trang, nối bằng @id ổn định.
    expect(ld.filter((d) => d['@type'] === 'Organization').map((d) => d['@id'])).toEqual(['https://agentra.io.vn/#organization'])
    expect(ld.filter((d) => d['@type'] === 'WebSite')).toHaveLength(1)
    expect(ld.filter((d) => d['@type'] === 'HowTo')).toEqual([])
```

- [ ] **Step 6: Chạy test**

Chạy: `pnpm vitest run tests/unit/jsonld.test.ts && pnpm verify`
Kỳ vọng: PASS, xanh.
Chạy E2E-FEED với `pnpm e2e tests/e2e/pages.spec.ts`. Kỳ vọng: PASS.

- [ ] **Step 7: Commit**

```bash
git add lib/seo/jsonld.ts "app/[locale]/layout.tsx" "app/[locale]/page.tsx" "app/[locale]/download/page.tsx" "app/[locale]/install/[os]/page.tsx" tests/unit/jsonld.test.ts tests/e2e/pages.spec.ts
git commit -m "feat(seo): entity graph JSON-LD có @id, thêm WebSite, WebPage, TechArticle, CollectionPage, bỏ HowTo"
```

---

### Task 9: robots.txt cho bot AI

Cho phép mọi bot và nêu tên từng bot AI trong nhóm riêng (spec §9.1, giả định AS-R2).

**Files:**
- Modify: `app/robots.ts`
- Test: `tests/unit/robots.test.ts`

**Interfaces:**
- Produces: `AI_BOTS: string[]` (`app/robots.ts`).

- [ ] **Step 1: Viết test hỏng**

`tests/unit/robots.test.ts`:

```ts
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import robots, { AI_BOTS } from '@/app/robots'

beforeEach(() => vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://eduflow.test'))
afterEach(() => vi.unstubAllEnvs())

const REQUIRED = ['OAI-SearchBot', 'ChatGPT-User', 'GPTBot', 'Claude-SearchBot', 'Claude-User', 'ClaudeBot', 'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot-Extended', 'CCBot']

test('robots allows everyone and names every AI bot in its own group (spec §9.1)', () => {
  expect([...AI_BOTS].sort()).toEqual([...REQUIRED].sort())
  expect(robots()).toEqual({
    rules: [
      { userAgent: '*', allow: '/' },
      { userAgent: AI_BOTS, allow: '/' },
    ],
    sitemap: 'https://eduflow.test/sitemap.xml',
  })
})
```

- [ ] **Step 2: Chạy test để thấy hỏng**

Chạy: `pnpm vitest run tests/unit/robots.test.ts`
Kỳ vọng: FAIL, `AI_BOTS` không được export.

- [ ] **Step 3: Viết `app/robots.ts`**

```ts
import type { MetadataRoute } from 'next'
import { site } from '@/lib/site'

/**
 * Bot tìm kiếm AI, bot người dùng gọi tới và bot huấn luyện đều được đọc toàn site (spec AS-R2: mặc định của seo-master cho
 * thương hiệu mới, để trợ lý AI biết tới EduFlow). Mỗi bot có nhóm riêng để chủ ý hiện rõ trong robots.txt.
 *
 * LƯU Ý: bot có nhóm riêng BỎ QUA nhóm `*`. Thêm `Disallow` vào `*` thì phải lặp lại nó ở nhóm AI_BOTS.
 */
export const AI_BOTS = [
  // OpenAI: chỉ mục ChatGPT search, lượt đọc do người dùng gọi, huấn luyện
  'OAI-SearchBot',
  'ChatGPT-User',
  'GPTBot',
  // Anthropic
  'Claude-SearchBot',
  'Claude-User',
  'ClaudeBot',
  // Perplexity
  'PerplexityBot',
  'Perplexity-User',
  // Google Gemini (huấn luyện và grounding; không ảnh hưởng Google Search), Apple, Common Crawl
  'Google-Extended',
  'Applebot-Extended',
  'CCBot',
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/' },
      { userAgent: AI_BOTS, allow: '/' },
    ],
    sitemap: `${site.siteUrl()}/sitemap.xml`,
  }
}
```

- [ ] **Step 4: Chạy test, verify, commit**

```bash
pnpm vitest run tests/unit/robots.test.ts && pnpm verify
git add app/robots.ts tests/unit/robots.test.ts
git commit -m "feat(seo): robots.txt nêu tên từng bot AI trong nhóm riêng"
```

Kỳ vọng: PASS, xanh.

---
### Task 10: Sổ bài hướng dẫn, luật kiểm và mục lục (mô-đun thuần)

Sổ đăng ký bài hướng dẫn và các luật của spec §7.4 dưới dạng hàm thuần, kiểm được bằng Vitest. Chưa có route (Task 11). Hai mục đầu của sổ là hai bài cài đặt sẽ chuyển sang ở Task 11.

**Files:**
- Create: `content/docs/slugs.ts`, `content/docs/index.ts`, `lib/docs/validate.ts`, `lib/docs/toc.ts`
- Test: `tests/unit/docs-registry.test.ts`

**Interfaces:**
- Consumes: `Locale` (`@/i18n/routing`).
- Produces:
  - `content/docs/slugs.ts`: `DOC_IDS` (tuple `as const`, lớn dần ở Task 12 tới 16), `type DocId`, `DOC_SLUGS: Record<DocId, Record<Locale, string>>`, `docIdFromSlug(locale: Locale, slug: string): DocId | undefined`, `findDocSlug(slug: string): { id: DocId; locale: Locale } | undefined`.
  - `content/docs/index.ts`: `DOC_GROUPS = ['start', 'k12', 'assistant', 'operations'] as const`, `type DocGroup`, `type DocCopy = { title: string; metaTitle?: string; description: string; keyword: string }`, `type DocEntry = { group: DocGroup; order: number; updatedAt: string; vi: DocCopy; en: DocCopy }`, `DOC_TITLE_SUFFIX: Record<Locale, string>`, `DOCS: Record<DocId, DocEntry>`, `QUICK_START: DocId[]`, `docsInOrder(): DocId[]`, `docFile(locale: Locale, id: DocId): string`, `assertDocsValid(today?: string): void`.
  - `lib/docs/validate.ts`: `todayInVietnam(now?: Date): string`, `validateDocs(input: { docs: Record<string, DocEntryLike>; slugs: Record<string, Record<Locale, string>>; groups: readonly string[]; suffix: Record<Locale, string>; today: string }): string[]`, `checkDocBody(file: string, source: string): string[]`.
  - `lib/docs/toc.ts`: `type TocItem = { id: string; label: string }`, `slugifyHeading(text: string): string`, `headingId(children: ReactNode): string | undefined`, `extractToc(source: string): TocItem[]`.

- [ ] **Step 1: Viết test hỏng**

`tests/unit/docs-registry.test.ts`:

```ts
import { expect, test } from 'vitest'
import { DOC_GROUPS, DOC_TITLE_SUFFIX, DOCS, docsInOrder, QUICK_START } from '@/content/docs'
import { DOC_IDS, DOC_SLUGS, docIdFromSlug, findDocSlug } from '@/content/docs/slugs'
import { extractToc, slugifyHeading } from '@/lib/docs/toc'
import { checkDocBody, todayInVietnam, validateDocs } from '@/lib/docs/validate'

const base = { slugs: DOC_SLUGS, groups: DOC_GROUPS, suffix: DOC_TITLE_SUFFIX, today: '2026-10-15' }
const copy = (title: string) => ({ title, description: 'd'.repeat(120), keyword: 'k' })
const entry = (over: Record<string, unknown> = {}) => ({ group: 'start', order: 1, updatedAt: '2026-10-01', vi: copy('Bài'), en: copy('Article'), ...over })

test('the real registry passes every rule', () => {
  expect(validateDocs({ ...base, docs: DOCS, today: todayInVietnam() })).toEqual([])
})

test('slugs are kebab-case, both languages exist and no slug repeats across languages', () => {
  const all = DOC_IDS.flatMap((id) => [DOC_SLUGS[id].vi, DOC_SLUGS[id].en])
  for (const s of all) expect(s).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  expect(new Set(all).size).toBe(all.length)
  for (const id of DOC_IDS) {
    expect(docIdFromSlug('vi', DOC_SLUGS[id].vi)).toBe(id)
    expect(docIdFromSlug('en', DOC_SLUGS[id].vi)).toBeUndefined()
    expect(findDocSlug(DOC_SLUGS[id].en)).toEqual({ id, locale: 'en' })
  }
})

test('the reading order walks the groups in order and every quick-start article exists', () => {
  const order = docsInOrder()
  expect([...order].sort()).toEqual([...DOC_IDS].sort())
  const groups = order.map((id) => DOC_GROUPS.indexOf(DOCS[id].group))
  expect(groups).toEqual([...groups].sort((a, b) => a - b))
  for (const id of QUICK_START) expect(DOC_IDS).toContain(id)
})

test('each broken field is reported with its file and field name', () => {
  const run = (docs: Record<string, ReturnType<typeof entry>>, slugs: Record<string, { vi: string; en: string }>) =>
    validateDocs({ ...base, docs, slugs }).join('\n')
  const slugs = { a: { vi: 'bai-a', en: 'article-a' } }
  expect(run({ a: entry({ group: 'misc' }) }, slugs)).toMatch(/content\/docs\/index\.ts \(a\): group "misc"/)
  expect(run({ a: entry({ updatedAt: '2026-10-16' }) }, slugs)).toMatch(/updatedAt 2026-10-16 ở tương lai/)
  expect(run({ a: entry({ updatedAt: '2026-02-30' }) }, slugs)).toMatch(/updatedAt "2026-02-30" không phải ngày/)
  expect(run({ a: entry({ vi: { ...copy('Bài'), description: 'ngắn' } }) }, slugs)).toMatch(/content\/docs\/vi\/bai-a\.mdx: description dài 4 ký tự/)
  expect(run({ a: entry({ en: copy('A very long article title that goes on and on and on') }) }, slugs)).toMatch(/content\/docs\/en\/article-a\.mdx: title kèm hậu tố dài \d+ ký tự.*thêm metaTitle/)
  expect(run({ a: entry({ vi: copy('Cài EduFlow') }) }, slugs)).toMatch(/title đã có "EduFlow"/)
  expect(run({ a: entry(), b: entry() }, { ...slugs, b: { vi: 'bai-b', en: 'article-b' } })).toMatch(/order 1 trùng với a trong nhóm start/)
  expect(run({ a: entry(), b: entry({ order: 2 }) }, { ...slugs, b: { vi: 'bai-a', en: 'article-b' } })).toMatch(/slug "bai-a" trùng/)
  expect(run({ a: entry() }, { a: { vi: 'Bai_A', en: 'article-a' } })).toMatch(/slug "Bai_A" phải khớp/)
})

// Review Focus 4: CI build theo giờ UTC; ngày ghi trong bài là ngày Việt Nam.
test('today is the Vietnamese date, so an article dated today never fails a UTC build', () => {
  const lateEveningUtc = new Date('2026-10-15T18:30:00Z') // 01:30 ngày 16/10 ở Việt Nam
  expect(todayInVietnam(lateEveningUtc)).toBe('2026-10-16')
  const slugs = { a: { vi: 'bai-a', en: 'article-a' } }
  expect(validateDocs({ ...base, slugs, docs: { a: entry({ updatedAt: '2026-10-16' }) }, today: todayInVietnam(lateEveningUtc) })).toEqual([])
})

test('heading ids are plain kebab-case without diacritics', () => {
  expect(slugifyHeading('Bước 2: Đặt ngân sách tháng')).toBe('buoc-2-dat-ngan-sach-thang')
  expect(slugifyHeading('  Gỡ cài đặt  ')).toBe('go-cai-dat')
})

test('the table of contents follows ## headings and <Step> blocks in order, outside code fences', () => {
  const src = ['## Trước khi bắt đầu', '<Step n={1} id="chon-tep" title="Chọn đúng tệp">', '```', '## không phải tiêu đề', '```', '### Mục con', '## Gỡ cài đặt'].join('\n')
  expect(extractToc(src)).toEqual([
    { id: 'truoc-khi-bat-dau', label: 'Trước khi bắt đầu' },
    { id: 'chon-tep', label: 'Chọn đúng tệp' },
    { id: 'go-cai-dat', label: 'Gỡ cài đặt' },
  ])
})

// Review Focus 3: tiêu đề có định dạng làm id rỗng hay sai; hai tiêu đề trùng làm mục lục trỏ nhầm.
test('the body rules reject what would break headings, anchors or images', () => {
  const errs = (src: string) => checkDocBody('x.mdx', src).join('\n')
  expect(errs('# Tiêu đề một')).toMatch(/x\.mdx:1: không dùng tiêu đề #/)
  expect(errs('##### Quá sâu')).toMatch(/sâu hơn ####/)
  for (const h of ['## Có [link](https://x)', '## Có `mã`', '## **Đậm**', '## Có <Ui>Nút</Ui>']) expect(errs(h), h).toMatch(/chữ trơn/)
  expect(errs('![ảnh](/a.png)')).toMatch(/dùng <Figure>/)
  expect(errs('## Bước một\n\n## Bước một')).toMatch(/id "buoc-mot" trùng/)
  expect(errs('<Step n={1} id="a" title="A">\n## A')).toMatch(/id "a" trùng/)
  expect(errs('<Step n={1} title="Thiếu id">')).toMatch(/thiếu id hoặc title/)
  expect(errs('## !!!')).toMatch(/id rỗng/)
  expect(errs('## Trước khi bắt đầu\n\n```\n# lệnh shell\n```\n\n<Step n={1} id="mot" title="Một">')).toBe('')
})
```

- [ ] **Step 2: Chạy test để thấy hỏng**

Chạy: `pnpm vitest run tests/unit/docs-registry.test.ts`
Kỳ vọng: FAIL, `Failed to resolve import "@/content/docs"`.

- [ ] **Step 3: Viết `lib/docs/toc.ts`**

```ts
import type { ReactNode } from 'react'

export type TocItem = { id: string; label: string }

/** id của tiêu đề: chữ thường không dấu, nối bằng gạch ("Bước 2: Đặt ngân sách" → "buoc-2-dat-ngan-sach"). */
export function slugifyHeading(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** id cho thẻ h2 trong MDX. Luật thân bài buộc tiêu đề là chữ trơn, nên children luôn là chuỗi. */
export function headingId(children: ReactNode): string | undefined {
  return typeof children === 'string' ? slugifyHeading(children) : undefined
}

/** Mục lục từ nguồn MDX: tiêu đề `##` và khối `<Step id title>`, đúng thứ tự trong bài, bỏ qua khối mã. */
export function extractToc(source: string): TocItem[] {
  const items: TocItem[] = []
  let fenced = false
  for (const line of source.split('\n')) {
    if (line.trimStart().startsWith('```')) {
      fenced = !fenced
      continue
    }
    if (fenced) continue
    const h2 = /^##\s+(.+?)\s*$/.exec(line)
    if (h2) {
      items.push({ id: slugifyHeading(h2[1]), label: h2[1] })
      continue
    }
    const step = /<Step\b([^>]*)>/.exec(line)
    const id = step && /\bid="([^"]+)"/.exec(step[1])?.[1]
    const label = step && /\btitle="([^"]+)"/.exec(step[1])?.[1]
    if (id && label) items.push({ id, label })
  }
  return items
}
```

- [ ] **Step 4: Viết `lib/docs/validate.ts`**

```ts
import type { Locale } from '@/i18n/routing'
import { slugifyHeading } from './toc'

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const LOCALES: Locale[] = ['vi', 'en']

type CopyLike = { title: string; metaTitle?: string; description: string; keyword: string }
type DocEntryLike = { group: string; order: number; updatedAt: string; vi: CopyLike; en: CopyLike }

/** Hôm nay theo giờ Việt Nam, YYYY-MM-DD. Build trên CI chạy theo UTC, còn ngày ghi trong bài là ngày Việt Nam. */
export function todayInVietnam(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now)
}

const isRealDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && new Date(`${s}T00:00:00Z`).toISOString().slice(0, 10) === s

/** Luật của sổ bài hướng dẫn (spec §7.4). Trả danh sách lỗi, mỗi lỗi nêu tệp và tên trường; rỗng là hợp lệ. */
export function validateDocs(input: {
  docs: Record<string, DocEntryLike>
  slugs: Record<string, Record<Locale, string>>
  groups: readonly string[]
  suffix: Record<Locale, string>
  today: string
}): string[] {
  const errors: string[] = []
  const seenSlug = new Map<string, string>()
  const seenOrder = new Map<string, string>()
  for (const [id, entry] of Object.entries(input.docs)) {
    const where = `content/docs/index.ts (${id})`
    if (!input.groups.includes(entry.group)) errors.push(`${where}: group "${entry.group}" không thuộc ${input.groups.join(', ')}`)
    if (!Number.isInteger(entry.order) || entry.order < 1) errors.push(`${where}: order phải là số nguyên từ 1`)
    const orderKey = `${entry.group}#${entry.order}`
    const clash = seenOrder.get(orderKey)
    if (clash) errors.push(`${where}: order ${entry.order} trùng với ${clash} trong nhóm ${entry.group}`)
    else seenOrder.set(orderKey, id)
    if (!isRealDate(entry.updatedAt)) errors.push(`${where}: updatedAt "${entry.updatedAt}" không phải ngày YYYY-MM-DD có thật`)
    else if (entry.updatedAt > input.today) errors.push(`${where}: updatedAt ${entry.updatedAt} ở tương lai (hôm nay ${input.today})`)
    for (const locale of LOCALES) {
      const slug = input.slugs[id]?.[locale] ?? ''
      const file = `content/docs/${locale}/${slug}.mdx`
      if (!SLUG.test(slug)) errors.push(`${file}: slug "${slug}" phải khớp ${SLUG}`)
      const other = seenSlug.get(slug)
      if (other) errors.push(`${file}: slug "${slug}" trùng với ${other}`)
      else seenSlug.set(slug, `${id} (${locale})`)
      const c = entry[locale]
      const field = c.metaTitle ? 'metaTitle' : 'title'
      const title = c.metaTitle ?? c.title
      const full = [...`${title}${input.suffix[locale]}`].length
      if (full > 60) errors.push(`${file}: ${field} kèm hậu tố dài ${full} ký tự (tối đa 60)${c.metaTitle ? '' : '; thêm metaTitle ngắn hơn'}`)
      if (/EduFlow/.test(title)) errors.push(`${file}: ${field} đã có "EduFlow", hậu tố sẽ lặp tên`)
      const d = [...c.description].length
      if (d < 110 || d > 160) errors.push(`${file}: description dài ${d} ký tự (cần 110 tới 160)`)
      if (!c.keyword.trim()) errors.push(`${file}: keyword trống`)
    }
  }
  return errors
}

/**
 * Luật thân bài (spec §7.4): tiêu đề từ ## tới ####, là chữ trơn (không link, mã, chữ đậm, thẻ), không trùng id; không cú pháp
 * ảnh Markdown (dùng <Figure>); <Step> có đủ id và title. Khối mã (```) được bỏ qua.
 */
export function checkDocBody(file: string, source: string): string[] {
  const errors: string[] = []
  const ids = new Map<string, number>()
  const claim = (id: string, line: number) => {
    const first = ids.get(id)
    if (first) errors.push(`${file}:${line}: id "${id}" trùng với dòng ${first}`)
    else ids.set(id, line)
  }
  let fenced = false
  source.split('\n').forEach((text, i) => {
    const line = i + 1
    if (text.trimStart().startsWith('```')) {
      fenced = !fenced
      return
    }
    if (fenced) return
    const h = /^(#{1,6})\s+(.*?)\s*$/.exec(text)
    if (h) {
      if (h[1].length === 1) errors.push(`${file}:${line}: không dùng tiêu đề # (H1 là title của bài)`)
      if (h[1].length > 4) errors.push(`${file}:${line}: tiêu đề sâu hơn ####`)
      if (/[[\]`*_<>]/.test(h[2])) errors.push(`${file}:${line}: tiêu đề phải là chữ trơn (không link, mã, chữ đậm hay thẻ)`)
      else if (h[1].length === 2) {
        const id = slugifyHeading(h[2])
        if (!id) errors.push(`${file}:${line}: tiêu đề cho id rỗng`)
        else claim(id, line)
      }
    }
    if (/!\[[^\]]*\]\(/.test(text)) errors.push(`${file}:${line}: dùng <Figure> thay cho cú pháp ảnh Markdown`)
    const step = /<Step\b([^>]*)>/.exec(text)
    if (step) {
      const id = /\bid="([^"]+)"/.exec(step[1])?.[1]
      if (!id || !/\btitle="[^"]+"/.test(step[1])) errors.push(`${file}:${line}: <Step> thiếu id hoặc title`)
      else claim(id, line)
    }
  })
  return errors
}
```

- [ ] **Step 5: Viết `content/docs/slugs.ts`**

```ts
import type { Locale } from '@/i18n/routing'

/**
 * Mã và slug của bài hướng dẫn (spec §7.4). Tệp nhỏ, không import MDX, để component phía client (nút đổi ngôn ngữ) dùng được.
 * Slug là chữ thường không dấu nối bằng gạch, duy nhất qua cả hai ngôn ngữ: ảnh chia sẻ /og/docs/<slug> suy ra ngôn ngữ từ slug.
 * Thêm bài: thêm mã vào DOC_IDS, slug vào DOC_SLUGS, mục vào DOCS (content/docs/index.ts) và hai tệp MDX.
 */
export const DOC_IDS = ['install-macos', 'install-windows'] as const
export type DocId = (typeof DOC_IDS)[number]

export const DOC_SLUGS: Record<DocId, Record<Locale, string>> = {
  'install-macos': { vi: 'cai-dat-macos', en: 'install-macos' },
  'install-windows': { vi: 'cai-dat-windows', en: 'install-windows' },
}

export function docIdFromSlug(locale: Locale, slug: string): DocId | undefined {
  return DOC_IDS.find((id) => DOC_SLUGS[id][locale] === slug)
}

/** Bài và ngôn ngữ của một slug bất kỳ. */
export function findDocSlug(slug: string): { id: DocId; locale: Locale } | undefined {
  for (const id of DOC_IDS) {
    for (const locale of ['vi', 'en'] as const) if (DOC_SLUGS[id][locale] === slug) return { id, locale }
  }
  return undefined
}
```

- [ ] **Step 6: Viết `content/docs/index.ts`**

`updatedAt` của hai bài cài đặt là ngày commit của Task 3 (bài được viết lại ở đó): lấy bằng `git log -1 --format=%cs -- content/install/vi/macos.mdx`.

```ts
import type { Locale } from '@/i18n/routing'
import { todayInVietnam, validateDocs } from '@/lib/docs/validate'
import { DOC_IDS, DOC_SLUGS, type DocId } from './slugs'

/*
 * Sổ bài hướng dẫn (spec §7.4): nhóm, thứ tự, ngày cập nhật và chữ SEO của từng bài, hai ngôn ngữ. Metadata nằm ở đây thay
 * cho frontmatter MDX để Vitest kiểm được và build dừng khi sai (assertDocsValid trong generateStaticParams).
 * Mọi thao tác trong bài lấy từ `main` của repo app tại lúc viết; `updatedAt` là ngày nội dung đổi thật (giờ Việt Nam).
 */

/** Bốn nhóm, đúng thứ tự hiển thị: Bắt đầu, Phổ thông, Trợ lý và tài liệu, Chi phí và vận hành. */
export const DOC_GROUPS = ['start', 'k12', 'assistant', 'operations'] as const
export type DocGroup = (typeof DOC_GROUPS)[number]

export type DocCopy = {
  /** H1 của bài. Kèm hậu tố phải ≤ 60 ký tự, không thì đặt metaTitle. Không chứa "EduFlow" (hậu tố đã có). */
  title: string
  metaTitle?: string
  /** 110 tới 160 ký tự: meta description và câu dẫn dưới H1. */
  description: string
  /** Từ khoá dạng tác vụ ("cách cài EduFlow trên macOS"), không trùng từ khoá chính của trang nào. */
  keyword: string
}

export type DocEntry = { group: DocGroup; order: number; updatedAt: string; vi: DocCopy; en: DocCopy }

export const DOC_TITLE_SUFFIX: Record<Locale, string> = { vi: ' · Hướng dẫn EduFlow', en: ' · EduFlow Docs' }

export const DOCS: Record<DocId, DocEntry> = {
  'install-macos': {
    group: 'start',
    order: 1,
    updatedAt: 'YYYY-MM-DD của commit Task 3',
    vi: {
      title: 'Cài đặt trên macOS',
      description: 'Tải đúng bộ cài theo chip của máy Mac, kéo vào Applications, mở lần đầu khi macOS cảnh báo, kích hoạt key hoặc dùng thử và nhận bản mới.',
      keyword: 'cách cài EduFlow trên macOS',
    },
    en: {
      title: 'Install on macOS',
      description: 'Download the right installer for your Mac chip, drag it to Applications, open it past the first macOS warning, activate a key or a trial, and update.',
      keyword: 'install EduFlow on a Mac',
    },
  },
  'install-windows': {
    group: 'start',
    order: 2,
    updatedAt: 'YYYY-MM-DD của commit Task 3',
    vi: {
      title: 'Cài đặt trên Windows',
      description: 'Tải bộ cài EduFlow cho Windows 64-bit, chạy trình cài, mở qua cảnh báo SmartScreen, kích hoạt bằng key hoặc dùng thử và nhận bản mới trong app.',
      keyword: 'cách cài EduFlow trên Windows',
    },
    en: {
      title: 'Install on Windows',
      description: 'Download the EduFlow installer for 64-bit Windows, run it, get past the SmartScreen warning, activate with a key or a trial, and get new versions in the app.',
      keyword: 'install EduFlow on Windows',
    },
  },
}

/** Khối "Bắt đầu trong 5 phút" ở mục lục hướng dẫn: cài, kích hoạt, soạn đề đầu tiên (spec §7.3). */
export const QUICK_START: DocId[] = ['install-macos', 'install-windows']

/** Thứ tự đọc: theo nhóm (DOC_GROUPS), rồi theo `order` trong nhóm. Dẫn thanh bên và bài trước, bài sau. */
export function docsInOrder(): DocId[] {
  return [...DOC_IDS].sort((a, b) => DOC_GROUPS.indexOf(DOCS[a].group) - DOC_GROUPS.indexOf(DOCS[b].group) || DOCS[a].order - DOCS[b].order)
}

/** Đường dẫn tệp MDX tính từ gốc repo. */
export function docFile(locale: Locale, id: DocId): string {
  return `content/docs/${locale}/${DOC_SLUGS[id][locale]}.mdx`
}

/** Dừng build khi sổ sai; thông báo nêu từng tệp và trường. */
export function assertDocsValid(today: string = todayInVietnam()): void {
  const errors = validateDocs({ docs: DOCS, slugs: DOC_SLUGS, groups: DOC_GROUPS, suffix: DOC_TITLE_SUFFIX, today })
  if (errors.length) throw new Error(`Sổ bài hướng dẫn sai:\n${errors.join('\n')}`)
}
```

Thay hai chuỗi `'YYYY-MM-DD của commit Task 3'` bằng ngày in ra ở lệnh `git log` trên (dạng `2026-10-15`) trước khi chạy test: chuỗi giữ nguyên sẽ làm test đầu đỏ với lỗi `updatedAt ... không phải ngày`.

- [ ] **Step 7: Chạy test**

Chạy: `pnpm vitest run tests/unit/docs-registry.test.ts && pnpm verify`
Kỳ vọng: PASS, xanh.

- [ ] **Step 8: Commit**

```bash
git add content/docs/slugs.ts content/docs/index.ts lib/docs tests/unit/docs-registry.test.ts
git commit -m "feat(docs): sổ bài hướng dẫn, luật kiểm sổ và thân bài, mục lục từ nguồn MDX"
```

---

### Task 11: Trung tâm hướng dẫn: route, khung trang và hai bài cài đặt

Dựng `/huong-dan` và `/huong-dan/<slug>` (spec §7.3, §7.4) với component hiện có, chuyển hai bài cài đặt vào, xoá route `/install/[os]`, đặt 308 cho URL cũ. Bố cục ba cột, ngăn kéo và mục lục bám theo canvas để Kế hoạch 2; ở đây thanh bên và mục lục bài có bản `<details>` cho màn hẹp, không cần JavaScript.

**Files:**
- Create: `app/[locale]/docs/page.tsx`, `app/[locale]/docs/[slug]/page.tsx`, `components/docs/DocsNav.tsx`, `components/docs/DocsToc.tsx`, `components/docs/DocsPager.tsx`, `components/docs/DocHelp.tsx`, `components/docs/Ui.tsx`, `components/docs/Figure.tsx`, `tests/unit/docs-content.test.ts`, `tests/e2e/docs.spec.ts`
- Move: `content/install/vi/macos.mdx` → `content/docs/vi/cai-dat-macos.mdx`, `content/install/vi/windows.mdx` → `content/docs/vi/cai-dat-windows.mdx`, `content/install/en/macos.mdx` → `content/docs/en/install-macos.mdx`, `content/install/en/windows.mdx` → `content/docs/en/install-windows.mdx`
- Delete: `app/[locale]/install/`, `content/install/index.ts`, `components/guide/OsTabs.tsx`, `components/guide/Toc.tsx`, `tests/unit/guides.test.ts`
- Modify: `i18n/routing.ts`, `i18n/switch.ts`, `components/site/LocaleSwitcher.tsx`, `content/docs/index.ts`, `content/privacy/index.ts`, `types/mdx.d.ts`, `mdx-components.tsx`, `lib/seo/pages.ts`, `lib/seo/jsonld.ts`, `lib/next-routes.ts`, `messages/vi.json`, `messages/en.json`, `components/site/Footer.tsx`, `app/[locale]/download/page.tsx`, `components/download/PlatformCard.tsx`, `tests/unit/i18n.test.ts`, `tests/unit/seo.test.ts`, `tests/unit/jsonld.test.ts`, `tests/unit/locale-switch.test.ts`, `tests/unit/next-routes.test.ts`, `tests/unit/content.test.ts`, `tests/e2e/pages.ts`, `tests/e2e/mobile.spec.ts`, `README.md`

**Interfaces:**
- Consumes: Task 10 (sổ, luật, mục lục), Task 6 (`buildMetadata`, sổ trang), Task 8 (`techArticle`, `collectionPage`, `breadcrumb`).
- Produces:
  - Khoá routing `'/docs'` (`/huong-dan`, `/en/docs`) và `'/docs/[slug]'` (`/huong-dan/[slug]`, `/en/docs/[slug]`); bỏ `'/install/[os]'`.
  - `content/docs/index.ts` thêm: `DOC_SOURCES: Record<Locale, Record<DocId, () => Promise<{ default: ComponentType }>>>`, `docHref(locale: Locale, id: DocId): { pathname: '/docs/[slug]'; params: { slug: string } }`, `docParams(id: DocId): Record<Locale, { slug: string }>`.
  - `lib/seo/pages.ts` thêm: `docSeo(locale: Locale, id: DocId): Seo`; `STATIC_PAGES['/docs']`.
  - `i18n/switch.ts`: chữ ký mới `localeHref(pathname, params, from: Locale, to: Locale): string`.
  - Component: `DocsNav({ current?: DocId })`, `DocsToc({ items: TocItem[]; variant: 'inline' | 'aside' })`, `DocsPager({ current: DocId })`, `DocHelp()`, `Ui({ children })`, `Figure({ src, alt, width, height, caption? })`.
  - Namespace messages `docs` (khoá ở Step 7); bỏ namespace `install` và hai khoá `footer.installMacos`, `footer.installWindows`.

- [ ] **Step 1: Viết test hỏng**

`tests/e2e/docs.spec.ts`:

```ts
import { expect, test } from '@playwright/test'

// Spec §7.4: slug lạ, kể cả slug đúng của ngôn ngữ kia, trả 404 thật.
for (const path of ['/huong-dan/khong-co-bai-nay', '/en/docs/no-such-article', '/huong-dan/install-macos', '/en/docs/cai-dat-macos']) {
  test(`${path} is a real 404`, async ({ page }) => {
    expect((await page.goto(path))?.status()).toBe(404)
  })
}

test('the language switch on an article opens the same article in the other language', async ({ page }) => {
  await page.goto('/huong-dan/cai-dat-macos')
  await page.locator('header').getByRole('link', { name: 'EN', exact: true }).click()
  await expect(page).toHaveURL(/\/en\/docs\/install-macos$/)
  await page.locator('header').getByRole('link', { name: 'VI', exact: true }).click()
  await expect(page).toHaveURL(/\/huong-dan\/cai-dat-macos$/)
})

// Review Focus 2: trên một slug lạ, nút đổi ngôn ngữ về mục lục hướng dẫn của ngôn ngữ kia.
test('switching language on an unknown article lands on the other docs index', async ({ page }) => {
  await page.goto('/huong-dan/khong-co-bai-nay')
  await expect(page.locator('header a[hreflang="en"]')).toHaveAttribute('href', '/en/docs')
})

test('the sidebar marks the current article and every table-of-contents link has its target', async ({ page }) => {
  await page.goto('/huong-dan/cai-dat-windows')
  await expect(page.locator('a[aria-current="page"]:visible')).toHaveText('Cài đặt trên Windows')
  const targets = await page.locator('main nav a[href^="#"]').evaluateAll((as) => as.map((a) => a.getAttribute('href')!.slice(1)))
  expect(targets.length).toBeGreaterThanOrEqual(5)
  for (const id of new Set(targets)) await expect(page.locator(`[id="${id}"]`), id).toHaveCount(1)
})

test('the docs index links every article and carries a CollectionPage', async ({ page }) => {
  await page.goto('/huong-dan')
  await expect(page.locator('main a[href="/huong-dan/cai-dat-macos"]').first()).toBeVisible()
  const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).map((s) => JSON.parse(s))
  expect(ld.filter((d) => d['@type'] === 'CollectionPage')).toHaveLength(1)
})

test('an article carries a TechArticle and a three-step breadcrumb', async ({ page }) => {
  await page.goto('/en/docs/install-windows')
  const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).map((s) => JSON.parse(s))
  expect(ld.find((d) => d['@type'] === 'TechArticle')).toMatchObject({ headline: 'Install on Windows', inLanguage: 'en' })
  expect(ld.find((d) => d['@type'] === 'BreadcrumbList').itemListElement).toHaveLength(3)
})
```

Thêm vào `tests/unit/locale-switch.test.ts`:

```ts
test('an article switches to its own slug in the other language, an unknown one to the docs index', () => {
  expect(localeHref('/docs/[slug]', { slug: 'cai-dat-macos' }, 'vi', 'en')).toBe('/en/docs/install-macos')
  expect(localeHref('/docs/[slug]', { slug: 'install-windows' }, 'en', 'vi')).toBe('/huong-dan/cai-dat-windows')
  expect(localeHref('/docs/[slug]', { slug: 'khong-co' }, 'vi', 'en')).toBe('/en/docs')
  expect(localeHref('/docs', {}, 'en', 'vi')).toBe('/huong-dan')
})
```

và trong ba test cũ của tệp đó, thêm tham số `from` trước `to`: `localeHref('/pricing', {}, 'vi', 'en')`, `localeHref('/pricing', { locale: 'en' }, 'en', 'vi')`, `localeHref('/k12', {}, 'vi', 'en')`, `localeHref('/', {}, 'vi', 'en')`, `localeHref('/', {}, 'en', 'vi')`, `localeHref('/khong-co-trang-nay', {}, 'vi', 'en')`, `localeHref(null, {}, 'en', 'vi')`; trong vòng lặp: `localeHref(key, {}, to === 'vi' ? 'en' : 'vi', to)`.

`tests/unit/docs-content.test.ts` (thay `tests/unit/guides.test.ts`):

```ts
import { readdirSync, readFileSync } from 'node:fs'
import { expect, test } from 'vitest'
import { docFile } from '@/content/docs'
import { DOC_IDS } from '@/content/docs/slugs'
import { checkDocBody } from '@/lib/docs/validate'

const LOCALES = ['vi', 'en'] as const
const read = (locale: (typeof LOCALES)[number], id: (typeof DOC_IDS)[number]) => readFileSync(docFile(locale, id), 'utf8')

test('every registered article has its two MDX files, and no file is orphaned', () => {
  for (const locale of LOCALES) {
    const files = readdirSync(`content/docs/${locale}`).filter((f) => f.endsWith('.mdx')).map((f) => `content/docs/${locale}/${f}`).sort()
    expect(files).toEqual(DOC_IDS.map((id) => docFile(locale, id)).sort())
  }
})

test('every article body follows the body rules and keeps metadata in the registry', () => {
  for (const locale of LOCALES) {
    for (const id of DOC_IDS) {
      const src = read(locale, id)
      expect(checkDocBody(docFile(locale, id), src)).toEqual([])
      expect(src, docFile(locale, id)).not.toMatch(/export const meta/)
      expect(src, docFile(locale, id)).not.toMatch(/nội bộ|internal note|người gửi|DocOps/i)
    }
  }
})

for (const locale of LOCALES) {
  test(`${locale} install articles carry the key facts of an unsigned installer`, () => {
    const mac = read(locale, 'install-macos')
    expect(mac).toContain('EDU-')
    expect(mac).toContain('Applications')
    expect(mac).toContain('Apple Silicon')
    expect(mac).not.toContain('xattr')
    expect(mac).toContain(locale === 'vi' ? 'Quyền riêng tư & Bảo mật' : 'Privacy & Security')
    expect(mac).toContain(locale === 'vi' ? 'Vẫn mở' : 'Open Anyway')
    const win = read(locale, 'install-windows')
    expect(win).toContain('EDU-')
    for (const s of ['SmartScreen', 'More info', 'Run anyway', 'Unknown publisher', 'certutil -hashfile']) expect(win).toContain(s)
  })
}
```

- [ ] **Step 2: Chạy test để thấy hỏng**

Chạy: `pnpm vitest run tests/unit/locale-switch.test.ts tests/unit/docs-content.test.ts`
Kỳ vọng: FAIL (`docFile` trỏ tệp chưa có; `localeHref` chưa nhận `from`).

- [ ] **Step 3: Routing và chuyển hướng**

`i18n/routing.ts`: xoá dòng `'/install/[os]': ...`, thêm sau `'/download'`:

```ts
    // Trung tâm hướng dẫn: slug bài khác nhau giữa hai ngôn ngữ (content/docs/slugs.ts)
    '/docs': { vi: '/huong-dan', en: '/docs' },
    '/docs/[slug]': { vi: '/huong-dan/[slug]', en: '/docs/[slug]' },
```

`tests/unit/i18n.test.ts`: cập nhật object kỳ vọng theo đúng `pathnames` mới.

`lib/next-routes.ts`, thêm vào cuối `LEGACY_REDIRECTS`:

```ts
  { source: '/huong-dan-cai-dat/macos', destination: '/huong-dan/cai-dat-macos' },
  { source: '/en/install/macos', destination: '/en/docs/install-macos' },
  { source: '/huong-dan-cai-dat/windows', destination: '/huong-dan/cai-dat-windows' },
  { source: '/en/install/windows', destination: '/en/docs/install-windows' },
```

`tests/unit/next-routes.test.ts`: trong hàm `current()`, gộp thêm đường dẫn của mọi bài:

```ts
import { DOC_IDS, DOC_SLUGS } from '@/content/docs/slugs'
// ...
const current = () =>
  new Set([
    ...(Object.keys(routing.pathnames) as PageKey[]).filter((k) => !k.includes('[')).flatMap((k) => routing.locales.map((l) => localizedPath(l, k))),
    ...DOC_IDS.flatMap((id) => routing.locales.map((l) => localizedPath(l, '/docs/[slug]', { slug: DOC_SLUGS[id][l] }))),
  ])
```

và bỏ điều kiện `.filter((r) => !r.destination.includes('/huong-dan/') && !r.destination.includes('/docs/'))` ở test đầu (mọi đích giờ đều kiểm được).

Thêm vào `tests/e2e/redirects.spec.ts` (Review Focus 1, link trong app có chuỗi truy vấn):

```ts
test('an old install link from the app keeps its query on the new article', async ({ page }) => {
  const res = await page.goto('/huong-dan-cai-dat/macos?utm_source=app')
  expect(res?.status()).toBe(200)
  await expect(page).toHaveURL(/\/huong-dan\/cai-dat-macos\?utm_source=app$/)
})
```

- [ ] **Step 4: Đổi ngôn ngữ dịch slug bài**

`i18n/switch.ts`:

```ts
import { DOC_SLUGS, docIdFromSlug } from '@/content/docs/slugs'
import { localizedPath } from '@/lib/seo/urls'
import { routing, type Locale, type PageKey } from './routing'

const isPageKey = (p: string): p is PageKey => Object.hasOwn(routing.pathnames, p)

/**
 * URL của cùng trang ở ngôn ngữ `to`, tính thuần từ khoá nội bộ (`usePathname()` của next-intl trả khoá như '/k12' hay
 * '/docs/[slug]') và params của trang. Trỏ thẳng URL cuối, không qua `/vi/...` (spec §4.5). Bài hướng dẫn có slug khác
 * nhau giữa hai ngôn ngữ nên dịch qua DOC_SLUGS; slug lạ về mục lục hướng dẫn, đường dẫn lạ về trang chủ.
 */
export function localeHref(pathname: string | null, params: Record<string, string | string[] | undefined>, from: Locale, to: Locale): string {
  if (!pathname || !isPageKey(pathname)) return localizedPath(to, '/')
  if (pathname === '/docs/[slug]') {
    const id = typeof params.slug === 'string' ? docIdFromSlug(from, params.slug) : undefined
    return id ? localizedPath(to, '/docs/[slug]', { slug: DOC_SLUGS[id][to] }) : localizedPath(to, '/docs')
  }
  const plain = Object.fromEntries(Object.entries(params).filter((e): e is [string, string] => e[0] !== 'locale' && typeof e[1] === 'string'))
  return localizedPath(to, pathname, plain)
}
```

`components/site/LocaleSwitcher.tsx`: đổi `href={localeHref(pathname, params, code)}` thành `href={localeHref(pathname, params, locale, code)}`.

- [ ] **Step 5: Chuyển bốn tệp MDX**

```bash
mkdir -p content/docs/vi content/docs/en
git mv content/install/vi/macos.mdx content/docs/vi/cai-dat-macos.mdx
git mv content/install/vi/windows.mdx content/docs/vi/cai-dat-windows.mdx
git mv content/install/en/macos.mdx content/docs/en/install-macos.mdx
git mv content/install/en/windows.mdx content/docs/en/install-windows.mdx
git rm content/install/index.ts
```

Trong cả bốn tệp: xoá khối `export const meta = { ... }` ở đầu (title và description đã nằm trong `DOCS`; mục lục giờ dựng từ các `<Step id title>`).

Hai tệp tiếng Anh: nhãn nút tiếng Việt chuyển sang `<Ui>` (quyết định 7):

```bash
sed -i '' -E 's/\*\*(Kích hoạt|Dùng thử|Tải về|Khởi động lại để cài|Cài đặt|Lưu trữ và sao lưu)\*\*/<Ui>\1<\/Ui>/g' content/docs/en/install-macos.mdx content/docs/en/install-windows.mdx
grep -n "<Ui>" content/docs/en/*.mdx
```

Kỳ vọng: `grep` in mười dòng (năm dòng mỗi tệp), mỗi nhãn đứng trước phần dịch trong ngoặc, ví dụ `<Ui>Kích hoạt</Ui> (Activate)`.

`content/privacy/index.ts`, thay dòng import `MdxModule` từ `content/install` bằng định nghĩa tại chỗ:

```ts
import type { ComponentType } from 'react'

type MdxModule = { default: ComponentType<Record<string, unknown>>; meta: MdxMeta }
```

`types/mdx.d.ts`: xoá hai trường `minutes` và `toc` của `MdxMeta` (chỉ Chính sách bảo mật còn dùng `meta`).

- [ ] **Step 6: Bảng import MDX, link và params của bài**

Thêm vào `content/docs/index.ts`:

```ts
import type { ComponentType } from 'react'

type MdxBody = { default: ComponentType<Record<string, unknown>> }

/** Bảng import tĩnh để Turbopack phân tích được. Thêm bài: thêm hai dòng ở đây. */
export const DOC_SOURCES: Record<Locale, Record<DocId, () => Promise<MdxBody>>> = {
  vi: {
    'install-macos': () => import('./vi/cai-dat-macos.mdx'),
    'install-windows': () => import('./vi/cai-dat-windows.mdx'),
  },
  en: {
    'install-macos': () => import('./en/install-macos.mdx'),
    'install-windows': () => import('./en/install-windows.mdx'),
  },
}

/** href cho `Link` của next-intl: slug theo đúng ngôn ngữ của trang đang dựng. */
export function docHref(locale: Locale, id: DocId) {
  return { pathname: '/docs/[slug]' as const, params: { slug: DOC_SLUGS[id][locale] } }
}

/** params theo từng ngôn ngữ cho buildMetadata và sổ trang. */
export function docParams(id: DocId): Record<Locale, { slug: string }> {
  return { vi: { slug: DOC_SLUGS[id].vi }, en: { slug: DOC_SLUGS[id].en } }
}
```

- [ ] **Step 7: Chữ của trung tâm hướng dẫn**

`messages/vi.json`: xoá namespace `install`; trong `footer` xoá `installMacos`, `installWindows` và thêm `"allDocs": "Tất cả hướng dẫn"`; thêm namespace:

```json
"docs": {
  "meta": {
    "title": "Hướng dẫn sử dụng EduFlow: cài đặt, soạn đề, trợ lý",
    "description": "Hướng dẫn sử dụng EduFlow từng bước: cài trên macOS và Windows, kích hoạt key, soạn đề kiểm tra, giáo án, slide, dùng trợ lý AI và xử lý sự cố."
  },
  "eyebrow": "Trung tâm hướng dẫn",
  "h1": "Hướng dẫn sử dụng EduFlow",
  "lead": "Từng bước cài đặt, kích hoạt và dùng các tính năng có trong bản phát hành đầu của EduFlow, viết theo đúng màn hình của app.",
  "home": "Hướng dẫn",
  "quickStart": {
    "h2": "Bắt đầu trong 5 phút",
    "lead": "Cài app, kích hoạt key hoặc dùng thử, rồi soạn đề kiểm tra đầu tiên."
  },
  "groups": {
    "start": "Bắt đầu",
    "k12": "Phổ thông",
    "assistant": "Trợ lý và tài liệu",
    "operations": "Chi phí và vận hành"
  },
  "nav": "Mục lục hướng dẫn",
  "toc": "Trong bài này",
  "breadcrumb": "Vị trí trong trang",
  "updated": "Cập nhật {date}",
  "prev": "Bài trước",
  "next": "Bài sau",
  "readMore": "Đọc thêm",
  "help": {
    "title": "Không giải được?",
    "body": "Gửi câu hỏi cho Agentra kèm ảnh chụp màn hình, hoặc tải bản mới nhất của EduFlow.",
    "contact": "Liên hệ",
    "download": "Tải EduFlow"
  },
  "notFound": {
    "h2": "Không tìm thấy điều cần tìm?",
    "body": "Gửi câu hỏi cho Agentra, hoặc tải EduFlow và bắt đầu từ bài cài đặt."
  }
}
```

`messages/en.json`: cùng thay đổi, namespace `docs`:

```json
"docs": {
  "meta": {
    "title": "EduFlow user guide: install, tests, assistant",
    "description": "The EduFlow user guide, step by step: install on macOS and Windows, activate a key, create tests, lesson plans and slides, use the AI assistant, fix problems."
  },
  "eyebrow": "Help center",
  "h1": "EduFlow user guide",
  "lead": "Step-by-step guides to install, activate and use the features of the first EduFlow release, written against the screens of the app.",
  "home": "Docs",
  "quickStart": {
    "h2": "Get started in 5 minutes",
    "lead": "Install the app, activate a key or start a trial, then create your first test."
  },
  "groups": {
    "start": "Get started",
    "k12": "K-12",
    "assistant": "Assistant and documents",
    "operations": "Costs and operations"
  },
  "nav": "Guide contents",
  "toc": "In this article",
  "breadcrumb": "Location in the site",
  "updated": "Updated {date}",
  "prev": "Previous",
  "next": "Next",
  "readMore": "Read more",
  "help": {
    "title": "Still stuck?",
    "body": "Send Agentra your question with a screenshot, or download the latest EduFlow version.",
    "contact": "Contact",
    "download": "Download EduFlow"
  },
  "notFound": {
    "h2": "Can't find what you need?",
    "body": "Send Agentra your question, or download EduFlow and start with the install guide."
  }
},
```

và `"allDocs": "All guides"` trong `footer`.

Sổ trang (`lib/seo/pages.ts`): thêm vào `STATIC_PAGES`

```ts
  '/docs': { meta: (m) => m.docs.meta, absoluteTitle: true, keyword: { vi: 'hướng dẫn sử dụng EduFlow', en: 'EduFlow user guide' } },
```

xoá khối `install` trong `indexablePages()` và import `GUIDE_OS`, thêm bài hướng dẫn:

```ts
import { DOC_TITLE_SUFFIX, DOCS, docParams } from '@/content/docs'
import { DOC_IDS, type DocId } from '@/content/docs/slugs'

export function docSeo(locale: Locale, id: DocId): Seo {
  const c = DOCS[id][locale]
  return { title: c.metaTitle ?? c.title, description: c.description, titleSuffix: DOC_TITLE_SUFFIX[locale] }
}
```

và trong `indexablePages()` trả `[...statics, ...docs]` với

```ts
  const docs = DOC_IDS.map(
    (id): IndexablePage => ({
      id: `doc:${id}`,
      key: '/docs/[slug]',
      params: docParams(id),
      seo: both((l) => docSeo(l, id)),
      keyword: both((l) => DOCS[id][l].keyword),
      updatedAt: DOCS[id].updatedAt,
    }),
  )
```

`lib/seo/jsonld.ts`: `softwareHelp: { '@type': 'CreativeWork', url: absoluteUrl(locale, '/docs') }` và sửa chú thích dòng đó thành `// Trung tâm hướng dẫn (spec §9.1)`. `tests/unit/jsonld.test.ts`: kỳ vọng `softwareHelp` thành `{ '@type': 'CreativeWork', url: 'https://eduflow.test/huong-dan' }`.

`tests/unit/seo.test.ts`: trong test `absoluteUrl`, thay hai dòng `/install/[os]` bằng `expect(absoluteUrl('en', '/docs/[slug]', { slug: 'install-macos' })).toBe('https://eduflow.test/en/docs/install-macos')` và `expect(absoluteUrl('vi', '/docs')).toBe('https://eduflow.test/huong-dan')`; trong test `buildMetadata`, thay ca `/install/[os]` bằng `page: '/docs/[slug]', params: { vi: { slug: 'cai-dat-macos' }, en: { slug: 'install-macos' } }` với canonical `https://eduflow.test/huong-dan/cai-dat-macos` và hreflang en `https://eduflow.test/en/docs/install-macos`.

- [ ] **Step 8: Component cho MDX và khung bài**

`components/docs/Ui.tsx`:

```tsx
/** Nhãn nút của app (giao diện tiếng Việt, AD-16) trong bài tiếng Anh: giữ đúng chữ người dùng thấy trên màn. */
export function Ui({ children }: { children: React.ReactNode }) {
  return (
    <span lang="vi" className="font-semibold text-ink">
      {children}
    </span>
  )
}
```

`components/docs/Figure.tsx`:

```tsx
import Image from 'next/image'

/** Ảnh trong bài hướng dẫn: bắt buộc src, alt, width, height (spec §5.4). Kế hoạch 2 khoác giao diện theo canvas. */
export function Figure({ src, alt, width, height, caption }: { src: string; alt: string; width: number; height: number; caption?: string }) {
  return (
    <figure className="flex flex-col gap-2">
      <Image src={src} alt={alt} width={width} height={height} sizes="(min-width: 1024px) 720px, 100vw" className="h-auto w-full rounded-xl border border-line" />
      {caption ? <figcaption className="text-[13.5px] text-muted">{caption}</figcaption> : null}
    </figure>
  )
}
```

`mdx-components.tsx`: import `Ui`, `Figure` và `headingId`; thêm `Ui` và `Figure` vào `components`; thay dòng `h2` bằng

```tsx
  h2: ({ children, ...props }) => (
    <h2 id={headingId(children)} className="scroll-mt-24 pt-2 text-2xl font-bold tracking-[-0.01em]" {...props}>
      {children}
    </h2>
  ),
```

`components/docs/DocsNav.tsx`:

```tsx
import { getLocale, getTranslations } from 'next-intl/server'
import { DOC_GROUPS, DOCS, docHref, docsInOrder } from '@/content/docs'
import type { DocId } from '@/content/docs/slugs'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { cn } from '@/lib/cn'

/** Thanh bên theo nhóm; bài đang đọc có aria-current. Màn hẹp: gói trong <details> (không cần JavaScript). */
export async function DocsNav({ current }: { current?: DocId }) {
  const locale = (await getLocale()) as Locale
  const t = await getTranslations('docs')
  const order = docsInOrder()
  const list = (
    <div className="flex flex-col gap-5">
      {DOC_GROUPS.map((group) => {
        const ids = order.filter((id) => DOCS[id].group === group)
        if (!ids.length) return null
        return (
          <div key={group} className="flex flex-col gap-1.5">
            <p className="text-[12.5px] font-bold tracking-[0.5px] text-muted uppercase">{t(`groups.${group}`)}</p>
            <ul className="flex flex-col">
              {ids.map((id) => (
                <li key={id}>
                  <Link
                    href={docHref(locale, id)}
                    aria-current={id === current ? 'page' : undefined}
                    className={cn(
                      'flex min-h-11 items-center border-l-2 py-1.5 pl-3 text-[14.5px] leading-snug md:min-h-0',
                      id === current ? 'border-accent font-semibold text-ink' : 'border-transparent text-ink2 hover:text-ink',
                    )}
                  >
                    {DOCS[id][locale].title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </div>
  )
  return (
    <nav aria-label={t('nav')}>
      <details className="rounded-card border border-line bg-card px-4 py-2 lg:hidden">
        <summary className="flex min-h-11 cursor-pointer items-center font-semibold">{t('nav')}</summary>
        <div className="pt-2 pb-3">{list}</div>
      </details>
      <div className="hidden lg:sticky lg:top-24 lg:block">{list}</div>
    </nav>
  )
}
```

`components/docs/DocsToc.tsx`:

```tsx
import { getTranslations } from 'next-intl/server'
import type { TocItem } from '@/lib/docs/toc'

/** Mục lục trong bài. `inline`: đầu bài trên màn hẹp, thu trong <details>. `aside`: cột phải từ 1024 px. */
export async function DocsToc({ items, variant }: { items: TocItem[]; variant: 'inline' | 'aside' }) {
  const t = await getTranslations('docs')
  if (!items.length) return null
  const list = (
    <ol className="flex flex-col gap-0.5 border-l border-line">
      {items.map((item) => (
        <li key={item.id}>
          <a href={`#${item.id}`} className="flex min-h-11 items-center border-l-2 border-transparent py-1.5 pl-3 text-[14px] leading-snug text-ink2 hover:border-accent hover:text-ink md:min-h-0">
            {item.label}
          </a>
        </li>
      ))}
    </ol>
  )
  if (variant === 'inline') {
    return (
      <nav aria-label={t('toc')} className="lg:hidden">
        <details className="rounded-card border border-line bg-card px-4 py-2">
          <summary className="flex min-h-11 cursor-pointer items-center font-semibold">{t('toc')}</summary>
          <div className="pt-2 pb-3">{list}</div>
        </details>
      </nav>
    )
  }
  return (
    <nav aria-label={t('toc')} className="hidden lg:sticky lg:top-24 lg:flex lg:flex-col lg:gap-3">
      <span className="pl-3 text-[12.5px] font-bold tracking-[0.5px] text-muted uppercase">{t('toc')}</span>
      {list}
    </nav>
  )
}
```

`components/docs/DocsPager.tsx`:

```tsx
import { getLocale, getTranslations } from 'next-intl/server'
import { Icon } from '@/components/ui/Icon'
import { DOCS, docHref, docsInOrder } from '@/content/docs'
import type { DocId } from '@/content/docs/slugs'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'

/** Bài trước, bài sau theo thứ tự đọc của sổ. */
export async function DocsPager({ current }: { current: DocId }) {
  const locale = (await getLocale()) as Locale
  const t = await getTranslations('docs')
  const order = docsInOrder()
  const i = order.indexOf(current)
  const prev = order[i - 1]
  const next = order[i + 1]
  const card = 'flex min-h-11 flex-1 flex-col gap-1 rounded-card border border-line bg-card p-4 hover:border-muted'
  return (
    <nav aria-label={`${t('prev')} · ${t('next')}`} className="flex flex-col gap-3 sm:flex-row">
      {prev ? (
        <Link href={docHref(locale, prev)} className={card}>
          <span className="inline-flex items-center gap-1 text-[13px] text-muted"><Icon name="arrow-left" size={14} />{t('prev')}</span>
          <span className="font-semibold">{DOCS[prev][locale].title}</span>
        </Link>
      ) : <span className="flex-1" />}
      {next ? (
        <Link href={docHref(locale, next)} className={`${card} sm:items-end sm:text-right`}>
          <span className="inline-flex items-center gap-1 text-[13px] text-muted">{t('next')}<Icon name="arrow-right" size={14} /></span>
          <span className="font-semibold">{DOCS[next][locale].title}</span>
        </Link>
      ) : null}
    </nav>
  )
}
```

Hai icon `arrow-left`, `arrow-right` đã có trong `components/ui/icons.ts`.

`components/docs/DocHelp.tsx`:

```tsx
import { getTranslations } from 'next-intl/server'
import { ButtonLink } from '@/components/ui/Button'

/** Khối cuối bài: "Không giải được? Liên hệ · Tải EduFlow" (spec §7.4). */
export async function DocHelp() {
  const t = await getTranslations('docs.help')
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-accent-line bg-accent-soft p-5 md:flex-row md:items-center md:justify-between md:p-6">
      <div className="flex flex-col gap-1">
        <b className="text-base">{t('title')}</b>
        <span className="text-[14.5px] text-ink2">{t('body')}</span>
      </div>
      <div className="flex flex-col gap-2.5 sm:flex-row">
        <ButtonLink href="/contact" variant="secondary">{t('contact')}</ButtonLink>
        <ButtonLink href="/download" icon="download">{t('download')}</ButtonLink>
      </div>
    </div>
  )
}
```

- [ ] **Step 9: Trang bài**

`app/[locale]/docs/[slug]/page.tsx`:

```tsx
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { DocHelp } from '@/components/docs/DocHelp'
import { DocsNav } from '@/components/docs/DocsNav'
import { DocsPager } from '@/components/docs/DocsPager'
import { DocsToc } from '@/components/docs/DocsToc'
import { JsonLd } from '@/components/seo/JsonLd'
import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import { assertDocsValid, DOC_SOURCES, docFile, docParams, DOCS } from '@/content/docs'
import { DOC_IDS, DOC_SLUGS, docIdFromSlug } from '@/content/docs/slugs'
import { Link } from '@/i18n/navigation'
import { routing, type Locale } from '@/i18n/routing'
import { extractToc } from '@/lib/docs/toc'
import { formatDate } from '@/lib/format'
import { breadcrumb, techArticle } from '@/lib/seo/jsonld'
import { buildMetadata, ogImageUrl } from '@/lib/seo/metadata'
import { docSeo } from '@/lib/seo/pages'
import { absoluteUrl } from '@/lib/seo/urls'

type Params = Promise<{ locale: string; slug: string }>

// Slug lạ, kể cả slug của ngôn ngữ kia, trả 404 thật (spec §7.4). Nhánh này không có loading.tsx, nên notFound() chạy trước mọi Suspense.
export const dynamicParams = false

export function generateStaticParams() {
  // Build dừng ở đây khi sổ bài sai, kèm tên tệp và tên trường.
  assertDocsValid()
  return routing.locales.flatMap((locale) => DOC_IDS.map((id) => ({ locale, slug: DOC_SLUGS[id][locale] })))
}

async function resolve(params: Params) {
  const { locale: raw, slug } = await params
  const locale = raw as Locale
  const id = docIdFromSlug(locale, slug)
  if (!id) notFound()
  return { locale, id }
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, id } = await resolve(params)
  return buildMetadata({ locale, page: '/docs/[slug]', params: docParams(id), seo: docSeo(locale, id) })
}

export default async function DocPage({ params }: { params: Params }) {
  const { locale, id } = await resolve(params)
  const [{ default: Body }, t, tc] = await Promise.all([DOC_SOURCES[locale][id](), getTranslations('docs'), getTranslations('common')])
  const doc = DOCS[id]
  const c = doc[locale]
  // Mục lục đọc từ nguồn MDX lúc build. Trang sinh tĩnh hoàn toàn (không gọi getReleases): ISR ở runtime sẽ không có tệp nguồn.
  const toc = extractToc(readFileSync(join(process.cwd(), docFile(locale, id)), 'utf8'))
  const url = absoluteUrl(locale, '/docs/[slug]', { slug: DOC_SLUGS[id][locale] })
  const group = t(`groups.${doc.group}`)
  return (
    <main id="main" className="flex-1">
      <Container className="grid grid-cols-1 gap-8 pt-10 pb-16 md:pt-14 md:pb-24 lg:grid-cols-[230px_minmax(0,1fr)_210px] lg:gap-12">
        <aside className="lg:self-start">
          <DocsNav current={id} />
        </aside>
        <article className="flex min-w-0 flex-col gap-8 [&_code]:[font-variant-ligatures:none]">
          <header className="flex flex-col gap-3">
            <nav aria-label={t('breadcrumb')} className="flex flex-wrap items-center gap-2 text-[13.5px] text-muted">
              <Link href="/docs" className="inline-flex min-h-11 items-center hover:text-ink md:min-h-0">{t('home')}</Link>
              <Icon name="chevron-right" size={14} />
              <span>{group}</span>
              <Icon name="chevron-right" size={14} />
              <span className="text-ink2" aria-current="page">{c.title}</span>
            </nav>
            <h1 className="font-display text-[32px] leading-[1.12] font-bold tracking-[-0.02em] text-balance md:text-[42px]">{c.title}</h1>
            <p className="text-base leading-relaxed text-ink2 text-pretty md:text-lg">{c.description}</p>
            <p className="text-sm text-muted">{t('updated', { date: formatDate(doc.updatedAt, locale) })}</p>
          </header>
          <DocsToc items={toc} variant="inline" />
          <div className="flex flex-col gap-8 md:gap-10">
            <Body />
          </div>
          <DocsPager current={id} />
          <DocHelp />
        </article>
        <aside className="hidden lg:block lg:self-start">
          <DocsToc items={toc} variant="aside" />
        </aside>
      </Container>
      <JsonLd
        data={breadcrumb([
          { name: tc('siteName'), url: absoluteUrl(locale, '/') },
          { name: t('home'), url: absoluteUrl(locale, '/docs') },
          { name: c.title, url },
        ])}
      />
      <JsonLd data={techArticle({ url, headline: c.title, description: c.description, locale, dateModified: doc.updatedAt, section: group, image: ogImageUrl(locale, '/') })} />
    </main>
  )
}
```

- [ ] **Step 10: Mục lục hướng dẫn**

`app/[locale]/docs/page.tsx`:

```tsx
import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import { SectionHead } from '@/components/home/SectionHead'
import { JsonLd } from '@/components/seo/JsonLd'
import { ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { DOC_GROUPS, DOCS, docHref, docsInOrder, QUICK_START } from '@/content/docs'
import { DOC_SLUGS } from '@/content/docs/slugs'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { breadcrumb, collectionPage } from '@/lib/seo/jsonld'
import { buildMetadata } from '@/lib/seo/metadata'
import { staticSeo } from '@/lib/seo/pages'
import { absoluteUrl } from '@/lib/seo/urls'

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as Locale
  return buildMetadata({ locale, page: '/docs', seo: staticSeo(locale, '/docs') })
}

export default async function DocsIndexPage() {
  const locale = (await getLocale()) as Locale
  const [t, tc] = await Promise.all([getTranslations('docs'), getTranslations('common')])
  const order = docsInOrder()
  const url = absoluteUrl(locale, '/docs')
  const card = 'flex min-h-11 flex-col gap-1.5 rounded-card border border-line bg-card p-5 hover:border-muted'
  return (
    <main id="main" className="flex-1">
      <section className="pt-12 pb-8 md:pt-16 md:pb-10">
        <Container>
          <SectionHead as="h1" align="left" eyebrow={t('eyebrow')} title={t('h1')} lead={t('lead')} />
        </Container>
      </section>
      <Section className="pt-0 md:pt-0">
        <Container className="flex flex-col gap-12">
          <section className="flex flex-col gap-4">
            <h2 className="text-[24px] font-bold">{t('quickStart.h2')}</h2>
            <p className="text-ink2">{t('quickStart.lead')}</p>
            <ol className="grid gap-4 md:grid-cols-3">
              {QUICK_START.map((id, i) => (
                <li key={id}>
                  <Link href={docHref(locale, id)} className={card}>
                    <span className="font-mono text-[13px] font-semibold text-accent-strong">{String(i + 1).padStart(2, '0')}</span>
                    <span className="font-semibold">{DOCS[id][locale].title}</span>
                    <span className="text-[14.5px] text-ink2">{DOCS[id][locale].description}</span>
                  </Link>
                </li>
              ))}
            </ol>
          </section>
          {DOC_GROUPS.map((group) => {
            const ids = order.filter((id) => DOCS[id].group === group)
            if (!ids.length) return null
            return (
              <section key={group} className="flex flex-col gap-4">
                <h2 className="text-[24px] font-bold">{t(`groups.${group}`)}</h2>
                <ul className="grid gap-4 md:grid-cols-2">
                  {ids.map((id) => (
                    <li key={id}>
                      <Link href={docHref(locale, id)} className={card}>
                        <span className="font-semibold">{DOCS[id][locale].title}</span>
                        <span className="text-[14.5px] text-ink2">{DOCS[id][locale].description}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}
          <section className="flex flex-col gap-4 rounded-xl border border-line bg-card p-6">
            <h2 className="text-[20px] font-bold">{t('notFound.h2')}</h2>
            <p className="text-ink2">{t('notFound.body')}</p>
            <div className="flex flex-col gap-2.5 sm:flex-row">
              <ButtonLink href="/contact" variant="secondary">{t('help.contact')}</ButtonLink>
              <ButtonLink href="/download" icon="download">{t('help.download')}</ButtonLink>
            </div>
          </section>
        </Container>
      </Section>
      <JsonLd data={breadcrumb([{ name: tc('siteName'), url: absoluteUrl(locale, '/') }, { name: t('home'), url }])} />
      <JsonLd
        data={collectionPage({
          url,
          name: t('h1'),
          description: staticSeo(locale, '/docs').description,
          locale,
          items: order.map((id) => ({ name: DOCS[id][locale].title, url: absoluteUrl(locale, '/docs/[slug]', { slug: DOC_SLUGS[id][locale] }) })),
        })}
      />
    </main>
  )
}
```

- [ ] **Step 11: Bỏ route cũ, trỏ link sang bài mới**

```bash
git rm -r "app/[locale]/install" components/guide/OsTabs.tsx components/guide/Toc.tsx tests/unit/guides.test.ts
grep -rn "install/\[os\]\|content/install\|GUIDE_OS\|isGuideOs\|OsTabs\|guide/Toc" app components lib tests content
```

Kỳ vọng sau khi sửa các chỗ dưới: lệnh `grep` không in gì.

- `components/site/Footer.tsx`: cột `t('guides')` thành ba link

```tsx
            <Link href={docHref(locale, 'install-macos')} className={linkClass}>{DOCS['install-macos'][locale].title}</Link>
            <Link href={docHref(locale, 'install-windows')} className={linkClass}>{DOCS['install-windows'][locale].title}</Link>
            <Link href="/docs" className={linkClass}>{t('allDocs')}</Link>
```

(import `DOCS, docHref` từ `@/content/docs`; link `/pricing` trong cột này giữ nguyên). Task 22 dựng lại footer năm cột.
- `app/[locale]/download/page.tsx`, hàm `guide`: `href={docHref(locale, os === 'macos' ? 'install-macos' : 'install-windows')}`.
- `components/download/PlatformCard.tsx`: link cuối thẻ `href={docHref(locale, os === 'macos' ? 'install-macos' : 'install-windows')}` (thẻ đã nhận `locale` làm prop; nếu chưa có, lấy bằng `useLocale()` của next-intl).

- [ ] **Step 12: Sửa test còn trỏ đường dẫn cũ**

- `tests/e2e/pages.ts`: thay bốn mục `/huong-dan-cai-dat/...`, `/en/install/...` bằng `['/huong-dan', 'vi'], ['/en/docs', 'en'], ['/huong-dan/cai-dat-macos', 'vi'], ['/huong-dan/cai-dat-windows', 'vi'], ['/en/docs/install-macos', 'en'], ['/en/docs/install-windows', 'en']`.
- `tests/e2e/mobile.spec.ts`: trong `VI_PAGES` thay `'/huong-dan-cai-dat/macos', '/huong-dan-cai-dat/windows'` bằng `'/huong-dan', '/huong-dan/cai-dat-macos', '/huong-dan/cai-dat-windows'`.
- `tests/unit/content.test.ts`: `MDX_TOTAL` giữ 6, `MDX_ENGLISH` giữ 3 (bốn bài cài đặt và hai trang bảo mật); trong test `English copy carries no untranslated Vietnamese`, thay hằng `BUTTON_LABELS` và chú thích của nó bằng hàm bỏ nhãn `<Ui>`:

```ts
  // Nhãn nút thật của app (giao diện tiếng Việt, AD-16) trong bài tiếng Anh nằm trong <Ui>...</Ui>: được phép, bộ chữ messages thì không.
  const stripUi = (s: string) => s.replace(/<Ui>[^<]*<\/Ui>/g, '')
```

và dòng `guides.filter(...)` thành `guides.filter(([, text]) => VIETNAMESE.test(clean(stripUi(text), WATERMARK)))`.

- [ ] **Step 13: Tài liệu: cách thêm bài hướng dẫn**

`README.md`: trong cây thư mục, thay dòng `app/[locale]/install/[os]/page.tsx ...` bằng hai dòng `app/[locale]/docs/page.tsx  # /huong-dan, /en/docs` và `app/[locale]/docs/[slug]/page.tsx  # /huong-dan/<slug>, /en/docs/<slug>`; thêm mục:

```markdown
### Thêm một bài hướng dẫn

1. Thêm mã bài vào `DOC_IDS` và slug hai ngôn ngữ vào `DOC_SLUGS` (`content/docs/slugs.ts`). Slug chữ thường không dấu, nối bằng gạch, không trùng slug nào ở cả hai ngôn ngữ.
2. Thêm mục vào `DOCS` (`content/docs/index.ts`): nhóm, thứ tự, `updatedAt` (ngày Việt Nam, `TZ=Asia/Ho_Chi_Minh date +%F`), `title`, `description` 110 tới 160 ký tự, `keyword` dạng tác vụ. Title kèm hậu tố (" · Hướng dẫn EduFlow", " · EduFlow Docs") dài quá 60 ký tự thì thêm `metaTitle`.
3. Viết `content/docs/vi/<slug>.mdx` và `content/docs/en/<slug>.mdx`: tiêu đề từ `##`, chữ trơn; bước dùng `<Steps>`, `<Step n id title>`; ảnh dùng `<Figure>`; nhãn nút của app trong bài tiếng Anh bọc `<Ui>`. Mọi tên nút và đường đi màn đối chiếu với `main` của repo app.
4. Thêm hai dòng import vào `DOC_SOURCES`, hai đường dẫn vào `tests/e2e/pages.ts`, và tăng `MDX_TOTAL` (thêm 2), `MDX_ENGLISH` (thêm 1) ở `tests/unit/content.test.ts`.
5. `pnpm verify`. Build dừng khi sổ sai và báo tên tệp, tên trường.
```

- [ ] **Step 14: Chạy test**

Chạy: `pnpm vitest run && pnpm verify`
Kỳ vọng: PASS, xanh.
Chạy lệnh E2E-FEED (toàn bộ). Kỳ vọng: PASS, gồm `docs.spec.ts`, bốn test 308 mới của `redirects.spec.ts` và 26 trang của `pages.spec.ts`.

- [ ] **Step 15: Commit**

```bash
git add -u
git add content/docs "app/[locale]/docs" components/docs tests/unit/docs-content.test.ts tests/e2e/docs.spec.ts
git status --short   # chỉ các tệp của task này; không có AGENTS.md, CLAUDE.md
git commit -m "feat(docs): trung tâm hướng dẫn /huong-dan, chuyển hai bài cài đặt, 308 cho URL cũ"
```

---

### Khuôn chung của năm task viết bài hướng dẫn (Task 12 tới 16)

Mỗi task dưới đây viết hai bài, mỗi bài hai ngôn ngữ. Các bước giống nhau ở cả năm task; phần riêng của từng task là bảng "Bài" (mã, slug, chữ SEO đã đếm, nhóm, thứ tự), "Khung bài", "Dữ kiện bắt buộc" và "Nguồn". Người thực thi đọc khối này cùng task của mình.

Các bước của mỗi task:

1. **Đọc nguồn trong repo app** (`../eduflow-application`, nhánh `main`) ở mục "Nguồn" của task. Ghi lại đúng tên nút, tên màn, đường đi, giới hạn. Nhãn giao diện lấy ở `packages/desktop/src/renderer/labels.ts`, `packages/desktop/src/renderer/messages.ts` và thư mục màn tương ứng dưới `packages/desktop/src/renderer/`; thuật ngữ theo `docs/requirements/generated/glossary.md`. Điều nào nguồn không xác nhận được thì không viết.
2. **Viết test hỏng:** thêm hai đường dẫn của mỗi bài vào `tests/e2e/pages.ts`; tăng `MDX_TOTAL` thêm 4 và `MDX_ENGLISH` thêm 2 ở `tests/unit/content.test.ts`.
3. **Chạy để thấy hỏng:** `pnpm vitest run tests/unit/e2e-pages.test.ts tests/unit/content.test.ts`. Kỳ vọng: FAIL (đường dẫn chưa có trong sổ trang; số tệp MDX chưa khớp).
4. **Đăng ký bài:** thêm mã vào `DOC_IDS` (đúng vị trí trong mảng), slug vào `DOC_SLUGS`, mục vào `DOCS` theo bảng "Bài" (giữ nguyên chuỗi đã đếm), hai dòng vào `DOC_SOURCES`. `updatedAt` là ngày commit theo giờ Việt Nam (`TZ=Asia/Ho_Chi_Minh date +%F`). Bài thuộc khối "Bắt đầu trong 5 phút" thì thêm vào `QUICK_START` như task ghi.
5. **Viết bốn tệp MDX** theo "Khung bài": tiêu đề `##` chữ trơn, bước dùng `<Steps>` và `<Step n id title>` (id chữ thường không dấu, duy nhất trong bài), lưu ý dùng `<Callout kind="info|warning">`, ảnh dùng `<Figure>` chỉ khi ảnh có sẵn khớp đúng thao tác (quyết định 13). Bản tiếng Anh dịch sát, cùng cấu trúc, cùng số bước; nhãn nút của app bọc `<Ui>` và kèm phần dịch trong ngoặc, ví dụ `<Ui>Kích hoạt</Ui> (Activate)`. Mọi con số về app lấy từ `lib/seo/app-facts.ts` và viết đúng giá trị của nó. Không ký tự U+2014; không hứa kiểm định; không nói AI thay giáo viên; không tên nhà cung cấp mô hình.
6. **Chạy test:** `pnpm vitest run && pnpm verify`. Kỳ vọng: PASS, xanh. Test hay báo ở bước này: `docs-registry` (độ dài, ngày), `docs-content` (luật thân bài), `app-facts` (con số), `content` (chữ Việt chưa dịch trong bài tiếng Anh).
7. **Xem bằng mắt:** `pnpm dev`, mở bốn trang của task, đọc hết bài, bấm từng mục trong mục lục.
8. **E2E:** lệnh E2E-FEED với `pnpm e2e tests/e2e/pages.spec.ts tests/e2e/docs.spec.ts`. Kỳ vọng: PASS.
9. **Commit:** `git add content/docs tests/e2e/pages.ts tests/unit/content.test.ts` rồi `git commit` với thông điệp ghi ở cuối task.

**Interfaces chung:** Consumes `DOC_IDS`, `DOC_SLUGS`, `DOCS`, `DOC_SOURCES`, `QUICK_START` (Task 10, 11) và `appFacts` (Task 2). Produces: các mã bài mới trong `DocId`, dùng ở Task 18 tới 22 (link từ trang chủ đề, trang cấp, trang chủ).

---

### Task 12: Bài nhóm "Bắt đầu": kích hoạt và làm quen giao diện

**Bài:**

| Mã | Slug vi / en | Nhóm, thứ tự | Title vi · en | Description vi · en | Keyword vi · en |
|---|---|---|---|---|---|
| `activation-and-trial` | `kich-hoat-va-dung-thu` / `activation-and-trial` | start, 3 | Kích hoạt key và dùng thử · Activate a key or start a trial | Nhập key EDU- của trường để kích hoạt EduFlow, hoặc gửi đơn dùng thử ngay trong app; key dùng thử chạy trên một máy, có ngân sách và ngày hết hạn. · Enter your school EDU- key to activate EduFlow, or send a trial request from the app; a trial key runs on one computer, with a budget and an end date. | kích hoạt key EduFlow · activate an EduFlow license key |
| `interface-tour` | `lam-quen-giao-dien` / `interface-tour` | start, 4 | Làm quen giao diện · A tour of the interface | Các vùng của EduFlow: thanh bên, trang chủ có ô trò chuyện, màn làm việc với panel trợ lý, hàng chờ tác vụ và Cài đặt; cách chọn hồ sơ làm việc lần đầu. · The parts of EduFlow: the sidebar, the home screen with its chat box, work screens with the assistant panel, the job queue and Settings, and your first profile. | giao diện EduFlow · EduFlow interface |

Thêm `'activation-and-trial'` vào `QUICK_START` (sau hai bài cài đặt).

**Khung bài `activation-and-trial`:** `##` Trước khi bắt đầu (cần Internet; key do trường hay Agentra cấp) · Step "Kích hoạt bằng key của trường" · Step "Gửi đơn dùng thử" · Step "Khi đơn đang chờ duyệt" · `##` Key dùng thử có gì (một máy, ngân sách dùng thử, ngày hết hạn; khi hết hạn thì sao) · `##` Đổi key hay chuyển sang máy khác (thu hồi máy cũ qua Agentra) · `##` Lỗi thường gặp khi kích hoạt (nối sang bài Xử lý sự cố ở Task 16 bằng một câu, chưa link).

**Khung bài `interface-tour`:** Step "Chọn hồ sơ làm việc lần đầu" (sáu vai, chỉ sắp xếp giao diện, đổi trong Cài đặt) · `##` Thanh bên · `##` Trang chủ và ô trò chuyện với trợ lý · `##` Màn làm việc và panel trợ lý bên phải · `##` Hàng chờ tác vụ AI và chi phí · `##` Cài đặt (key, ngân sách, lưu trữ và sao lưu, cập nhật). Dùng `<Figure src="/images/product/assistant-home.webp" width={1600} height={1000} ...>` cho mục Trang chủ (ảnh có sẵn khớp màn).

**Dữ kiện bắt buộc:** key bắt đầu bằng `EDU-`; key dùng thử chạy trên `appFacts.trialDevices` (1) máy, có ngân sách dùng thử và ngày hết hạn; tự duyệt dùng thử khi Agentra bật, nếu không đơn chờ duyệt và app tự kích hoạt khi được duyệt; hồ sơ làm việc không khoá chức năng nào. Không có TOTP (RK1 bỏ TOTP).

**Nguồn:** `docs/superpowers/specs/2026-10-11-eduflow-registration-keys-no-totp-design.md`, `docs/superpowers/plans/2026-10-11-eduflow-rk1-registration-keys-no-totp.md`, `docs/requirements/generated/modules/nt-kich-hoat.md`, `be-kich-hoat.md`; `docs/superpowers/specs/2026-10-07-eduflow-desktop-onboarding-design.md`, `docs/superpowers/specs/2026-10-06-eduflow-desktop-macos26-shell-design.md`; `packages/desktop/src/renderer/onboarding/`, `shell/`, `screens/`.

Các bước: theo khuôn chung (Task 12 tăng `MDX_TOTAL` lên 10, `MDX_ENGLISH` lên 5). Commit: `feat(docs): bài kích hoạt và dùng thử, làm quen giao diện`.

---

### Task 13: Bài nhóm "Phổ thông": soạn đề kiểm tra và xuất nhiều mã đề

**Bài:**

| Mã | Slug vi / en | Nhóm, thứ tự | Title vi · en | Description vi · en | Keyword vi · en |
|---|---|---|---|---|---|
| `create-a-test` | `soan-de-kiem-tra` / `create-a-test` | k12, 1 | Soạn đề kiểm tra theo ma trận · Create a test from a blueprint | Từng bước soạn một đề kiểm tra trên EduFlow: thiết lập môn và thời lượng, lập ma trận bốn mức, để AI viết câu, xem cổng chất lượng, duyệt và ký. · Create a test in EduFlow step by step: set the subject and duration, build a four-level matrix, let AI write items, read the quality gates, review and sign. | cách soạn đề kiểm tra trên EduFlow · how to create a test in EduFlow |
| `export-test-versions` | `xuat-nhieu-ma-de` / `export-test-versions` | k12, 2 | Xuất đề với nhiều mã đề · Export a test in several versions | Chọn số mã đề, cách trộn câu và phương án, bố cục trang khi xuất đề trên EduFlow, rồi nhận tệp đề, đáp án theo từng mã và hướng dẫn chấm ở tệp riêng. · Choose the number of versions, the shuffling and the page layout when you export a test, then get the test files, a key per version and a marking guide. | xuất nhiều mã đề trên EduFlow · export test versions in EduFlow |

Thêm `'create-a-test'` vào cuối `QUICK_START` (khối "Bắt đầu trong 5 phút" đủ ba việc: cài, kích hoạt, soạn đề đầu tiên).

**Khung bài `create-a-test`:** `##` Đề kiểm tra trong EduFlow gồm gì (ba bước Thiết lập, Câu hỏi, Xuất; chỉ câu nhiều lựa chọn ở bản này) · Step "Mở màn Soạn đề kiểm tra" · Step "Thiết lập: môn, lớp, chương, thời gian, điểm" · Step "Lập ma trận chủ đề × bốn mức" (rải nhanh theo mẫu, nhập và xuất CSV) · Step "Để AI viết câu hỏi" (hộp ước tính chi phí trước khi chạy) · Step "Đọc cổng chất lượng" (mỗi cổng in số đơn vị đã kiểm; cổng kiểm 0 đơn vị là lỗi) · Step "Duyệt từng câu và ký" (cảnh báo đáp án phải xác nhận từng câu; bản xuất mang dấu chìm DÙNG THỬ tới khi ký nếu đúng như app) · `##` Đề này chưa làm được gì (đúng sai, trả lời ngắn, tự luận có ý là lộ trình; hình trong câu, LaTeX: lộ trình). Dùng `<Figure>` với `/images/product/exam-setup.webp` (bước Thiết lập) và `/images/product/result.webp` (bước cổng), 1600 × 1000.

**Khung bài `export-test-versions`:** `##` Khi nào cần nhiều mã đề · Step "Mở bước Xuất của đề đã duyệt" · Step "Chọn số mã đề" (1 tới `appFacts.maxTestVersions`) · Step "Bật hay tắt xáo trộn câu hỏi và xáo trộn đáp án" (mặc định bật cả hai; đổi lựa chọn không tạo phiên bản mới, không phải duyệt lại) · Step "Kiểm tra trước khi lưu" (từng mã đủ câu, chữ cái đáp án đúng sau khi xáo, tệp đề không chứa đáp án, mã không trùng, ô đầu đề còn trống) · Step "Nhận tệp" (tệp đề chỉ chứa các mã; đáp án và hướng dẫn chấm, ma trận và bản đặc tả là tệp riêng; định dạng DOCX và PDF như app) · `##` Xáo trộn tất định nghĩa là gì (cùng khoá thì cùng kết quả, in lại không đổi).

**Dữ kiện bắt buộc:** ma trận `appFacts.matrixLevels` (4) mức nhận biết, thông hiểu, vận dụng, vận dụng cao; mỗi đề tối đa `appFacts.maxTestVersions` (24) mã; đề chạy `appFacts.testGates` (8) cổng áp dụng trong bảng P1..P12 (chỉ nêu số 8 nếu bài nói số cổng); câu hỏi chỉ nhiều lựa chọn (`appFacts.testQuestionTypes`).

**Nguồn:** `docs/superpowers/plans/2026-10-04-eduflow-m2b-k12-exam-lean.md`, `docs/superpowers/plans/2026-10-10-eduflow-exam-e1-export-variants.md`, `docs/superpowers/specs/2026-10-10-eduflow-exam-format-variants-design.md` (chỉ phần E1), `docs/requirements/generated/modules/pt-thiet-lap.md`, `pt-de-kiem-tra.md`, `pt-duyet-xuat.md`; `packages/desktop/src/renderer/exam/`.

Các bước: theo khuôn chung (`MDX_TOTAL` 14, `MDX_ENGLISH` 7). Commit: `feat(docs): bài soạn đề kiểm tra và xuất nhiều mã đề`.

---

### Task 14: Bài nhóm "Phổ thông": giáo án 5512 và slide bài giảng

**Bài:**

| Mã | Slug vi / en | Nhóm, thứ tự | Title vi · en | Description vi · en | Keyword vi · en |
|---|---|---|---|---|---|
| `lesson-plans` | `soan-giao-an-5512` / `lesson-plans` | k12, 3 | Soạn giáo án theo Công văn 5512 · Write a lesson plan (Official Letter 5512) | Soạn giáo án theo Công văn 5512 trên EduFlow: chọn bài, để AI viết bốn hoạt động, đọc cảnh báo của cổng, sửa, duyệt và xuất tệp Word để nộp tổ chuyên môn. · Write an Official Letter 5512 lesson plan in EduFlow: pick the lesson, let AI draft the four activities, read gate warnings, edit, approve, export to Word. | cách soạn giáo án 5512 trên EduFlow · how to write a 5512 lesson plan in EduFlow |
| `lesson-slides` | `tao-slide-bai-giang` / `lesson-slides` | k12, 4 | Tạo slide bài giảng có quiz · Create lesson slides with quizzes | Tạo slide bài giảng từ giáo án trên EduFlow: chọn mẫu slide, để AI viết nội dung, chèn câu hỏi quiz, xem trước toàn bộ, kiểm cổng và xuất PDF. · Create lesson slides from a lesson plan in EduFlow: pick a template, let AI write the content, add quiz questions, preview the deck, run the gates, export PDF. | tạo slide bài giảng trên EduFlow · create lesson slides in EduFlow |

Title tiếng Anh của `lesson-plans` kèm hậu tố dài 57 ký tự: không cần `metaTitle`.

**Khung bài `lesson-plans`:** `##` Giáo án theo Công văn 5512 trong EduFlow (bốn hoạt động; khung chương trình GDPT 2018 có sẵn trong app) · Step "Bấm Soạn bài dạy và chọn loại Giáo án" (Giáo án, Slide hay Cả bộ) · Step "Chọn môn, lớp, chương, chủ đề và tên bài" · Step "Thiết lập: phạm vi, yêu cầu cần đạt, phần đầu giáo án" (họ tên giáo viên, trường, tổ không gửi cho AI) · Step "Để AI viết bốn hoạt động" · Step "Đọc cảnh báo của cổng và sửa" · Step "Duyệt và xuất" · `##` Môn chưa có ở bản này (Ngữ văn, Tiếng Việt, Âm nhạc, Mỹ thuật, Hoạt động trải nghiệm: chỉ có ở gói đầy đủ, theo câu 25 của v2-scope) · `##` Mẫu giáo án riêng của trường (chưa có ở bản này, OQ-251).

**Khung bài `lesson-slides`:** `##` Slide trong EduFlow (16:9, từ giáo án hay soạn riêng, mẫu S1 tới S3b) · Step "Chọn Slide hay Cả bộ khi Soạn bài dạy" · Step "Chọn mẫu slide" · Step "Để AI viết nội dung slide" · Step "Thêm quiz trong slide" · Step "Xem trước, đọc rubric và cổng slide" · Step "Xuất" (định dạng như app; PPTX sửa được là lộ trình, OQ-142) · `##` Gợi ý giao diện slide (nêu đúng như S3b: lượt gợi ý vẫn chạy và tính phí khi đóng hộp, nếu app vẫn như vậy). Dùng `<Figure src="/images/product/slide-studio.webp" width={1600} height={1000} ...>` cho bước xem trước.

**Dữ kiện bắt buộc:** giáo án theo Công văn 5512 có bốn hoạt động; thông tin người soạn không gửi cho AI; slide 16:9; PPTX sửa được chưa có. Không ghi tên môn nào là "đã có" khi chưa đối chiếu danh sách môn trong gói gdpt2018 của app.

**Nguồn:** `docs/superpowers/plans/2026-10-05-eduflow-m2c-k12-lesson-slide-lean.md`, `docs/superpowers/specs/2026-10-07-eduflow-slide-templates-design.md`, bốn kế hoạch `2026-10-08-eduflow-slide-templates-s1.md` tới `2026-10-10-eduflow-slide-templates-s3b.md`, `docs/requirements/generated/modules/pt-giao-an.md`, `pt-slide.md`, `pt-sinh-ca-bo.md`; v2-scope §3 V2-09 và §5 câu 24 tới 27; `packages/desktop/src/renderer/teach/`.

Các bước: theo khuôn chung (`MDX_TOTAL` 18, `MDX_ENGLISH` 9). Commit: `feat(docs): bài soạn giáo án 5512 và tạo slide bài giảng`.

---

### Task 15: Bài nhóm "Trợ lý và tài liệu": dùng trợ lý AI và nạp tài liệu

**Bài:**

| Mã | Slug vi / en | Nhóm, thứ tự | Title vi · en | Description vi · en | Keyword vi · en |
|---|---|---|---|---|---|
| `using-the-assistant` | `dung-tro-ly-ai` / `using-the-assistant` | assistant, 1 | Dùng trợ lý AI · Use the AI assistant | Hỏi trợ lý AI của EduFlow về màn đang mở, nhờ dựng thiết lập, đọc ba tầng kết luận, áp đề xuất vào bản nháp, và những việc trợ lý không bao giờ làm thay. · Ask the EduFlow AI assistant about the open screen, have it prepare a setup, read its three-tier answers, apply a suggestion to a draft, and what it never does. | cách dùng trợ lý AI của EduFlow · how to use the EduFlow assistant |
| `adding-documents` | `nap-tai-lieu` / `adding-documents` | assistant, 2 | Nạp tài liệu để AI đọc · Add documents for the AI to read | Nạp sách giáo khoa, bài giảng, tệp PDF hay ảnh chụp vào EduFlow: app đọc và nhận dạng chữ ngay tại máy, rồi AI tìm đúng đoạn cần dùng khi soạn. · Add textbooks, lecture notes, PDFs or scans to EduFlow: the app reads them and recognises text on your computer, then AI finds the passages it needs. | nạp tài liệu vào EduFlow · add documents to EduFlow |

**Khung bài `using-the-assistant`:** `##` Trợ lý ở đâu (Trang chủ là ô trò chuyện; panel bên phải mọi màn làm việc, mở rộng toàn màn) · Step "Hỏi về màn đang mở" (trợ lý gửi bản tóm tắt có cấu trúc của màn, không gửi tệp gốc) · Step "Nhờ dựng thiết lập" (ví dụ một câu như "Soạn đề 45 phút Toán 10, 4 mã đề"; thầy cô soát lại trước khi chạy) · Step "Đọc ba tầng kết luận" · Step "Dùng thẻ hành động" (việc tại máy chạy ngay, 0 đồng; tác vụ AI mở hộp ước tính chi phí) · Step "Áp đề xuất vào bản nháp" (hiện trước và sau; tạo phiên bản nháp mới, chạy lại cổng bị ảnh hưởng) · `##` Những việc trợ lý không làm (không duyệt, không ký, không bỏ qua cổng) · `##` Tắt AI cho một dự án. Chỉ viết những phần có trong phạm vi đã thu hẹp của M1g; phần nào chỉ có ở spec gốc thì bỏ. Dùng `<Figure src="/images/product/assistant-states.webp" ...>` nếu ảnh khớp đúng màn đang mô tả.

**Khung bài `adding-documents`:** `##` Tài liệu dùng để làm gì · Step "Nạp tệp vào dự án" (định dạng nhận được theo DR1) · Step "Chờ app đọc và nhận dạng chữ tại máy" (OCR tại máy, không tốn tiền) · Step "Xem trang và đoạn đã đọc" · Step "Thử tìm một đoạn" (truy hồi tại máy, DR1b) · `##` Dữ liệu tài liệu nằm ở đâu (ở máy thầy cô) · `##` Giới hạn hiện tại (OCR có tính tiền, bản đồ tài liệu là lộ trình: DR2b, DR3).

**Dữ kiện bắt buộc:** trợ lý không ký thay người, không duyệt; việc chạy tại máy `appFacts.localWorkCostVnd` (0) đồng; đọc và OCR tại máy không tốn tiền; tài liệu nằm ở máy thầy cô. Không nêu tên nhà cung cấp mô hình.

**Nguồn:** M1g trong `docs/superpowers/plans/2026-10-01-eduflow-roadmap.md` (mục 7) và các kế hoạch có nhắc M1g (`2026-10-04-eduflow-m1e-desktop-core.md`), `docs/requirements/generated/modules/tl-tro-ly.md`; `docs/superpowers/specs/2026-10-06-eduflow-document-reading-design.md`, `docs/superpowers/plans/2026-10-06-eduflow-dr1-local-document-reading.md`, `2026-10-08-eduflow-dr1b-local-retrieval.md`, `2026-10-09-eduflow-dr2a-local-ocr.md`; `packages/desktop/src/renderer/assistant/`, `documents/`.

Các bước: theo khuôn chung (`MDX_TOTAL` 22, `MDX_ENGLISH` 11). Commit: `feat(docs): bài dùng trợ lý AI và nạp tài liệu`.

---

### Task 16: Bài nhóm "Chi phí và vận hành": chi phí, ngân sách và xử lý sự cố

**Bài:**

| Mã | Slug vi / en | Nhóm, thứ tự | Title vi · en | Description vi · en | Keyword vi · en |
|---|---|---|---|---|---|
| `costs-and-budget` | `chi-phi-va-ngan-sach` / `costs-and-budget` | operations, 1 | Chi phí và ngân sách theo key · Costs and the monthly budget | Xem ước tính chi phí trước mỗi tác vụ AI, đặt và theo dõi ngân sách tháng của key, cảnh báo khi dùng tới 80% và các việc chạy tại máy không tốn tiền. · See the cost estimate before each AI job, set and track the monthly budget of a key, get a warning at 80% of it, and know which local work is always free. | đặt ngân sách tháng cho key EduFlow · set a monthly budget for an EduFlow key |
| `troubleshooting` | `xu-ly-su-co` / `troubleshooting` | operations, 2 | Xử lý sự cố thường gặp · Troubleshooting common problems | Cách xử lý sự cố EduFlow: macOS hay Windows chặn khi mở, không kích hoạt được key, tác vụ AI dừng, cập nhật bản mới, gỡ cài đặt và dữ liệu nằm ở đâu. · Fix common EduFlow problems: macOS or Windows blocks the app, a key will not activate, an AI job stops, updating, uninstalling, and finding your data. | sửa lỗi EduFlow · fix EduFlow problems |

**Khung bài `costs-and-budget`:** `##` EduFlow tính phí thế nào (theo token AI đã dùng; không công bố đơn giá trên site, theo spec 30/09) · Step "Đọc hộp ước tính trước khi chạy" · Step "Xem chi phí đã dùng" (màn dùng và hàng chờ tác vụ) · Step "Xem ngân sách tháng của key" (ai đặt ngân sách: theo app và trang quản trị) · `##` Cảnh báo khi dùng tới 80% · `##` Việc nào luôn 0 đồng (cổng, trộn mã đề, biên dịch, đọc và OCR tại máy) · `##` Khi hết ngân sách. Dùng `<Figure>` với `/images/product/usage.webp` hoặc `/images/product/jobs-cost.webp` nếu khớp màn. Không con số tiền nào khác 0 (luật giá của e2e và `app-facts`).

**Khung bài `troubleshooting`:** mỗi sự cố một `##`: macOS không mở được EduFlow (dẫn lại cách mở trong bài cài đặt) · Windows SmartScreen chặn bộ cài · Không kích hoạt được key (key sai định dạng, hết số máy, mất mạng) · Tác vụ AI dừng hay báo lỗi (mạng, hết ngân sách) · Cập nhật bản mới (Tải về, Khởi động lại để cài) · Gỡ cài đặt và giữ dữ liệu (sao lưu ở Cài đặt, mục Lưu trữ và sao lưu) · Dữ liệu nằm ở đâu (thư mục dữ liệu của app theo hệ điều hành, đúng như app). Cuối bài một `<Callout kind="info">` dẫn tới trang Liên hệ.

**Dữ kiện bắt buộc:** cảnh báo ngân sách ở `appFacts.budgetWarnPercent` (80) phần trăm; việc tại máy 0 đồng; bộ cài chưa ký (`appFacts.installerSigned` là `false`) nên lần mở đầu hệ điều hành chặn; đường dẫn thư mục dữ liệu ghi đúng như app (không đoán).

**Nguồn:** M1f trong `docs/superpowers/plans/2026-10-01-eduflow-roadmap.md` (mục 6) và `docs/superpowers/plans/2026-10-01-eduflow-m1a-backend-money-path.md`, `docs/requirements/generated/modules/nt-tac-vu-ai.md`, `be-tinh-tien.md`, `wa-gia-ngan-sach.md`, `nt-cap-nhat.md`, `nt-cai-dat.md`; `.superpowers/planning/v1/v1-scope.md` mục R1 và `.superpowers/planning/v1/backup/r1-notes-2026-10-10.md`; `packages/desktop/src/main/` (đường dẫn dữ liệu, cập nhật), `packages/desktop/package.json`.

Các bước: theo khuôn chung (`MDX_TOTAL` 26, `MDX_ENGLISH` 13). Thêm ở bước 5: trong bài `activation-and-trial` (Task 12), đổi câu nhắc "Lỗi thường gặp" thành link tới bài này: `[Xử lý sự cố thường gặp](/huong-dan/xu-ly-su-co)` (vi) và `[Troubleshooting common problems](/en/docs/troubleshooting)` (en). Commit: `feat(docs): bài chi phí và ngân sách, xử lý sự cố`.

---

### Task 17: Ảnh chia sẻ cho bài hướng dẫn

Mỗi bài có ảnh chia sẻ 1200×630 riêng qua route `/og/docs/<slug>` (spec §9.1, quyết định 4).

**Files:**
- Create: `app/og/docs/[slug]/route.tsx`, `tests/e2e/og.spec.ts`
- Modify: `proxy.ts`, `lib/seo/metadata.ts`, `app/[locale]/docs/[slug]/page.tsx`, `tests/unit/seo.test.ts`

**Interfaces:**
- Consumes: `findDocSlug`, `DOC_IDS`, `DOC_SLUGS` (Task 10); `DOCS`; `ogImage` (`lib/seo/og.tsx`).
- Produces: `docOgImageUrl(locale: Locale, id: DocId): string` (`lib/seo/metadata.ts`).

- [ ] **Step 1: Viết test hỏng**

Thêm vào `tests/unit/seo.test.ts`:

```ts
test('an article shares its own image at /og/docs/<slug>', async () => {
  const { docOgImageUrl } = await import('@/lib/seo/metadata')
  expect(docOgImageUrl('vi', 'install-macos')).toBe('https://eduflow.test/og/docs/cai-dat-macos')
  expect(docOgImageUrl('en', 'install-macos')).toBe('https://eduflow.test/og/docs/install-macos')
})
```

`tests/e2e/og.spec.ts`:

```ts
import { expect, test } from '@playwright/test'

test('every article has a 1200×630 share image of its own', async ({ page, request }) => {
  await page.goto('/huong-dan/cai-dat-macos')
  const og = await page.locator('meta[property="og:image"]').getAttribute('content')
  expect(new URL(og!).pathname).toBe('/og/docs/cai-dat-macos')
  const res = await request.get('/og/docs/cai-dat-macos')
  expect(res.status()).toBe(200)
  expect(res.headers()['content-type']).toBe('image/png')
})

test('an unknown slug has no share image', async ({ request }) => {
  expect((await request.get('/og/docs/khong-co')).status()).toBe(404)
})
```

- [ ] **Step 2: Chạy test để thấy hỏng**

Chạy: `pnpm vitest run tests/unit/seo.test.ts`
Kỳ vọng: FAIL, `docOgImageUrl is not a function`.

- [ ] **Step 3: Route ảnh và matcher của proxy**

`app/og/docs/[slug]/route.tsx`:

```tsx
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
```

`proxy.ts`: đổi matcher thành `'/((?!api|_next|_vercel|og/|.*\\..*).*)'` và thêm chú thích ngay trên: `// og/: ảnh chia sẻ của bài hướng dẫn (app/og/docs/[slug]) nằm ngoài [locale], không qua next-intl.`

Nếu `RouteContext` chưa có kiểu sau `pnpm typecheck` (typegen của Next 16 sinh nó), dùng `ctx: { params: Promise<{ slug: string }> }`.

- [ ] **Step 4: Metadata và JSON-LD của bài dùng ảnh riêng**

`lib/seo/metadata.ts`, thêm:

```ts
import { DOC_SLUGS, type DocId } from '@/content/docs/slugs'

/** Ảnh chia sẻ của một bài hướng dẫn (app/og/docs/[slug]/route.tsx). */
export function docOgImageUrl(locale: Locale, id: DocId): string {
  return `${site.siteUrl()}/og/docs/${DOC_SLUGS[id][locale]}`
}
```

`app/[locale]/docs/[slug]/page.tsx`: trong `generateMetadata` thêm `ogImage: docOgImageUrl(locale, id)`; trong `techArticle(...)` đổi `image: ogImageUrl(locale, '/')` thành `image: docOgImageUrl(locale, id)`; sửa import tương ứng.

- [ ] **Step 5: Chạy test, e2e, commit**

```bash
pnpm vitest run tests/unit/seo.test.ts && pnpm verify
```

Chạy E2E-FEED với `pnpm e2e tests/e2e/og.spec.ts tests/e2e/docs.spec.ts tests/e2e/pages.spec.ts`. Kỳ vọng: PASS. Mở `http://localhost:3200/og/docs/soan-de-kiem-tra` (khi `pnpm start` của e2e còn chạy, hoặc chạy lại `pnpm start -p 3200`): tiêu đề không tràn khung.

```bash
git add "app/og" proxy.ts lib/seo/metadata.ts "app/[locale]/docs/[slug]/page.tsx" tests/unit/seo.test.ts tests/e2e/og.spec.ts
git commit -m "feat(seo): ảnh chia sẻ riêng cho từng bài hướng dẫn"
```

---
### Task 18: Khung trang chủ đề và trang "AI tạo đề kiểm tra theo ma trận"

Module nội dung có kiểu cho trang chủ đề (chép khuôn `content/topics` và `components/topic/TopicPage.tsx` của DocOps, spec §7.2), trang đầu tiên, ảnh chia sẻ riêng, và nối hai chiều với bài hướng dẫn (trường `topic` của sổ docs, khối "Đọc thêm").

**Files:**
- Create: `content/topics/index.ts`, `content/topics/vi.ts`, `content/topics/en.ts`, `components/topic/TopicPage.tsx`, `app/[locale]/test-generator/page.tsx`, `app/[locale]/test-generator/opengraph-image.tsx`, `tests/unit/topics.test.ts`
- Modify: `lib/seo/pages.ts`, `lib/seo/metadata.ts`, `lib/seo/og.tsx`, `content/docs/index.ts`, `lib/docs/validate.ts`, `app/[locale]/docs/[slug]/page.tsx`, `messages/vi.json`, `messages/en.json`, `tests/unit/docs-registry.test.ts`, `tests/e2e/pages.ts`, `tests/e2e/og.spec.ts`, `README.md`

**Interfaces:**
- Consumes: `DocId`, `DOC_IDS`, `docHref` (Task 10, 11); `webPage`, `breadcrumb`, `faqPage` (Task 8); `STATIC_PAGES`, `Seo` (Task 6); `Faq` (`components/home/Faq.tsx`).
- Produces:
  - `content/topics/index.ts`: `TOPIC_IDS` (lớn dần ở Task 19, 20), `type TopicId`, `topicPage(id): '/<id>'`, `isTopicPage(page: string): boolean`, `TOPIC_META: Record<TopicId, TopicMeta>`, `type TopicMeta = { pillar: 'k12' | 'university' | 'program' | null; image?: { src: string; width: number; height: number }; updatedAt: string; absoluteTitle?: boolean }`, `type TopicLink`, `type TopicBlock`, `type TopicCopy` (trường ở Step 3), `TOPICS: Record<Locale, Record<TopicId, TopicCopy>>`, `topicCopy(locale, id): TopicCopy`, `topicWordCount(c: TopicCopy): number`.
  - `lib/seo/pages.ts`: `topicSeo(locale, id): Seo`, `pageName(locale, key: StaticPageKey): string` (từ khoá chính viết hoa chữ đầu, làm anchor text).
  - `lib/seo/og.tsx`: `topicOgImage(locale, id)`.
  - `content/docs/index.ts`: `DocEntry.topic?: TopicId`.
  - Namespace messages `topics` (Step 6).

- [ ] **Step 1: Viết test hỏng**

`tests/unit/topics.test.ts`:

```ts
import { expect, test } from 'vitest'
import { DOC_IDS } from '@/content/docs/slugs'
import { TOPIC_IDS, TOPIC_META, TOPICS, topicWordCount } from '@/content/topics'
import { routing } from '@/i18n/routing'
import { todayInVietnam } from '@/lib/docs/validate'

const all = () => TOPIC_IDS.flatMap((id) => routing.locales.map((locale) => ({ id, locale, c: TOPICS[locale][id] })))
const has = (text: string, term: string) => text.toLowerCase().includes(term.toLowerCase())

test('every topic has a routing key and a real update date', () => {
  for (const id of TOPIC_IDS) {
    expect(Object.hasOwn(routing.pathnames, `/${id}`), id).toBe(true)
    expect(TOPIC_META[id].updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(TOPIC_META[id].updatedAt <= todayInVietnam(), id).toBe(true)
  }
})

test('the H1 and the summary carry the primary keyword (spec §7.2)', () => {
  for (const { id, locale, c } of all()) {
    expect(has(c.h1, c.keywords[0]), `${id} ${locale} h1`).toBe(true)
    expect(has(c.inShort, c.keywords[0]), `${id} ${locale} inShort`).toBe(true)
  }
})

test('every topic has five FAQ answers, a dated comparison table, a "not yet" section and steps that link real guides', () => {
  for (const { id, locale, c } of all()) {
    const where = `${id} ${locale}`
    expect(c.faq, where).toHaveLength(5)
    expect(new Set(c.faq.map((f) => f.q)).size, where).toBe(5)
    for (const row of c.table.rows) expect(row, where).toHaveLength(c.table.head.length)
    expect(c.table.checkedAt, where).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(c.limits.items.length, where).toBeGreaterThanOrEqual(2)
    expect(c.howTo.steps.length, where).toBeGreaterThanOrEqual(3)
    for (const s of c.howTo.steps) if (s.doc) expect(DOC_IDS, where).toContain(s.doc)
  }
})

test('the English page mirrors the Vietnamese structure (spec §8.3)', () => {
  const shape = (locale: 'vi' | 'en', id: (typeof TOPIC_IDS)[number]) => {
    const c = TOPICS[locale][id]
    return [c.faq.length, c.table.head.length, c.table.rows.length, c.howTo.steps.length, c.limits.items.length, c.blocks?.length ?? 0, c.definition.paras?.length ?? 0]
  }
  for (const id of TOPIC_IDS) expect(shape('en', id), id).toEqual(shape('vi', id))
})

test('Vietnamese topic pages run 1,200 to 1,800 words (spec §7.2)', () => {
  for (const id of TOPIC_IDS) {
    const n = topicWordCount(TOPICS.vi[id])
    expect(n, id).toBeGreaterThanOrEqual(1200)
    expect(n, id).toBeLessThanOrEqual(1800)
  }
})
```

Thêm vào `tests/unit/docs-registry.test.ts`:

```ts
test('a guide may point to a topic page only if that page exists', () => {
  const slugs = { a: { vi: 'bai-a', en: 'article-a' } }
  const errs = validateDocs({ ...base, slugs, topics: ['test-generator'], docs: { a: entry({ topic: 'khong-co' }) } }).join('\n')
  expect(errs).toMatch(/content\/docs\/index\.ts \(a\): topic "khong-co" không phải trang chủ đề có thật/)
  expect(validateDocs({ ...base, slugs, topics: ['test-generator'], docs: { a: entry({ topic: 'test-generator' }) } })).toEqual([])
})
```

và thêm `topics: TOPIC_IDS` vào hằng `base` (import `TOPIC_IDS` từ `@/content/topics`).

`tests/e2e/og.spec.ts`, thêm:

```ts
test('a topic page shares its own image', async ({ page, request }) => {
  await page.goto('/ai-tao-de-kiem-tra-theo-ma-tran')
  const og = await page.locator('meta[property="og:image"]').getAttribute('content')
  expect(new URL(og!).pathname).toBe('/test-generator/opengraph-image')
  const res = await request.get(new URL(og!).pathname)
  expect(res.status()).toBe(200)
  expect(res.headers()['content-type']).toBe('image/png')
})

// Spec §12.1: FAQPage dựng từ đúng mảng mà trang hiển thị.
test('the topic FAQPage lists exactly the questions on the page', async ({ page }) => {
  await page.goto('/ai-tao-de-kiem-tra-theo-ma-tran')
  const shown = (await page.locator('main details summary').allTextContents()).map((s) => s.trim())
  const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).map((s) => JSON.parse(s))
  const faq = ld.find((d) => d['@type'] === 'FAQPage')
  expect(faq.mainEntity.map((q: { name: string }) => q.name)).toEqual(shown)
})
```

`tests/e2e/pages.ts`: thêm `['/ai-tao-de-kiem-tra-theo-ma-tran', 'vi'], ['/en/ai-test-generator', 'en']`.

- [ ] **Step 2: Chạy test để thấy hỏng**

Chạy: `pnpm vitest run tests/unit/topics.test.ts tests/unit/docs-registry.test.ts tests/unit/e2e-pages.test.ts`
Kỳ vọng: FAIL, `Failed to resolve import "@/content/topics"`.

- [ ] **Step 3: Viết `content/topics/index.ts`**

```ts
import type { DocId } from '@/content/docs/slugs'
import type { Locale, PageKey } from '@/i18n/routing'
import { TOPICS_EN } from './en'
import { TOPICS_VI } from './vi'

/*
 * Trang chủ đề (spoke, spec §7.2): mỗi trang sở hữu MỘT từ khoá chính (bản đồ ở lib/seo/brand.ts). Danh sách này dẫn sổ trang,
 * sitemap, footer, llms.txt, JSON-LD và khối "Chủ đề liên quan". Khoá routing của cả sáu trang đã có ở i18n/routing.ts.
 * Thêm chủ đề: thêm mã ở đây, nội dung ở vi.ts và en.ts, thư mục route mỏng app/[locale]/<mã>/ (page.tsx, opengraph-image.tsx).
 */
export const TOPIC_IDS = ['test-generator'] as const
export type TopicId = (typeof TOPIC_IDS)[number]

export const topicPage = (id: TopicId) => `/${id}` as const satisfies PageKey
export const isTopicPage = (page: string): boolean => TOPIC_IDS.some((id) => page === `/${id}`)

export type TopicMeta = {
  /** Trang cấp chứa chủ đề (link "lên pillar"); null: dẫn về trang chủ. */
  pillar: 'k12' | 'university' | 'program' | null
  /** Ảnh sản phẩm khớp đúng chủ đề; không có ảnh khớp thì bỏ trống (quyết định 13). */
  image?: { src: string; width: number; height: number }
  /** Ngày nội dung đổi thật, YYYY-MM-DD (sitemap, JSON-LD, dòng "Cập nhật"). */
  updatedAt: string
  /** Title đã có "EduFlow": không nối hậu tố. */
  absoluteTitle?: boolean
}

const shot = (name: string) => ({ src: `/images/product/${name}.webp`, width: 1600, height: 1000 })

export const TOPIC_META: Record<TopicId, TopicMeta> = {
  'test-generator': { pillar: 'k12', image: shot('exam-setup'), updatedAt: 'YYYY-MM-DD ngày viết' },
}

/** Link trong thân bài: trang chủ đề khác (anchor là `name` của nó), bài hướng dẫn, trang tĩnh, hoặc nguồn ngoài. */
export type TopicLink =
  | { topic: TopicId }
  | { doc: DocId }
  | { page: Exclude<PageKey, '/docs/[slug]'>; label: string }
  | { href: `https://${string}`; label: string }

export type TopicBlock = {
  h2: string
  paras?: string[]
  /** Danh sách; `title` in đậm đầu dòng. */
  items?: Array<{ title?: string; text: string; link?: TopicLink }>
  ordered?: boolean
}

export type TopicCopy = {
  /** Tên trang dạng từ khoá: nhãn thẻ, breadcrumb, footer, anchor text từ trang khác. */
  name: string
  /** Chuỗi trong <title>; kèm " · EduFlow" (trừ khi absoluteTitle) phải ≤ 60 ký tự. */
  metaTitle: string
  /** 110 tới 160 ký tự. */
  description: string
  /** Từ khoá chính đứng đầu (JSON-LD keywords); phải có trong h1 và inShort. */
  keywords: string[]
  /** Từ khoá phụ, in nhỏ trên H1. */
  eyebrow: string
  h1: string
  /** Trả lời ngay trong 2 tới 3 câu. */
  lead: string
  /** Mô tả một câu trên thẻ liên kết (trang cấp, chủ đề liên quan). */
  card: string
  /** Ô "Tóm tắt": câu trả lời gọn, đứng một mình vẫn đúng khi bị trích; từ khoá chính được in đậm. */
  inShort: string
  /** H2 "<...> là gì?": câu đầu là định nghĩa tự đủ nghĩa, `term` in đậm. */
  definition: { h2: string; term: string; rest: string; paras?: string[] }
  /** Bảng so sánh có ngày kiểm tra (spec §8.3). Cột đầu là tiêu chí. */
  table: { h2: string; caption: string; checkedAt: string; head: string[]; rows: string[][] }
  blocks?: TopicBlock[]
  /** Cách làm bằng EduFlow; bước nào có bài hướng dẫn thì gắn `doc`. */
  howTo: { h2: string; lead?: string; steps: Array<{ title: string; text: string; doc?: DocId }> }
  /** "EduFlow chưa làm gì": giới hạn thật, lấy từ v2-scope của app. */
  limits: { h2: string; items: string[] }
  /** Đúng 5 câu; FAQPage dựng từ chính mảng này. */
  faq: Array<{ q: string; a: string }>
  imageAlt: string
  /** Ảnh chia sẻ 1200×630: tiêu đề ngắn để không tràn. */
  share: { title: string; subtitle: string }
}

export const TOPICS: Record<Locale, Record<TopicId, TopicCopy>> = { vi: TOPICS_VI, en: TOPICS_EN }

export function topicCopy(locale: Locale, id: TopicId): TopicCopy {
  return TOPICS[locale][id]
}

/** Số chữ của phần thân hiển thị (cách nhau bằng khoảng trắng), để giữ bài trong 1.200 tới 1.800 chữ (spec §7.2). */
export function topicWordCount(c: TopicCopy): number {
  const texts = [
    c.lead,
    c.inShort,
    c.definition.term,
    c.definition.rest,
    ...(c.definition.paras ?? []),
    ...c.table.head,
    ...c.table.rows.flat(),
    ...(c.blocks ?? []).flatMap((b) => [b.h2, ...(b.paras ?? []), ...(b.items ?? []).flatMap((i) => [i.title ?? '', i.text])]),
    c.howTo.h2,
    c.howTo.lead ?? '',
    ...c.howTo.steps.flatMap((s) => [s.title, s.text]),
    c.limits.h2,
    ...c.limits.items,
    ...c.faq.flatMap((f) => [f.q, f.a]),
  ]
  return texts.join(' ').split(/\s+/).filter(Boolean).length
}
```

Thay `'YYYY-MM-DD ngày viết'` bằng ngày commit theo giờ Việt Nam (`TZ=Asia/Ho_Chi_Minh date +%F`).

- [ ] **Step 4: Viết nội dung trang "AI tạo đề kiểm tra theo ma trận"**

`content/topics/vi.ts` xuất `TOPICS_VI: Record<TopicId, TopicCopy>`, `content/topics/en.ts` xuất `TOPICS_EN`. Chú thích đầu mỗi tệp (chép khuôn DocOps): "Nội dung trang chủ đề <ngôn ngữ>. Mọi câu phải đúng với app (đối chiếu repo eduflow-application, nhánh main, ngày viết); mọi con số đi qua lib/seo/app-facts.ts. Sản phẩm đổi thì sửa ở đây trước, vì trợ lý AI trả lời theo đúng những gì trang này viết."

Các trường đã chốt (giữ nguyên chuỗi; độ dài đã đếm):

| Trường | vi | en |
|---|---|---|
| `name` | AI tạo đề kiểm tra theo ma trận | AI test generator |
| `metaTitle` | AI tạo đề kiểm tra theo ma trận và bản đặc tả | AI test generator from a test blueprint |
| `description` | AI tạo đề kiểm tra theo ma trận và bản đặc tả: lập ma trận bốn mức, để AI viết câu hỏi, máy kiểm cổng chất lượng, thầy cô duyệt từng câu rồi xuất đề và đáp án. | An AI test generator that works from your test blueprint: set a four-level matrix, let AI write the items, run quality gates, review each item, then export. |
| `keywords` | `['AI tạo đề kiểm tra', 'ma trận đề kiểm tra', 'bản đặc tả đề kiểm tra', 'AI tạo đề theo ma trận']` | `['AI test generator', 'test blueprint', 'test specification table', 'AI test generator from a blueprint']` |
| `eyebrow` | Ma trận và bản đặc tả đề kiểm tra | Test blueprint and specification |
| `h1` | AI tạo đề kiểm tra theo ma trận và bản đặc tả, thầy cô duyệt từng câu | AI test generator that follows your test blueprint, with every item reviewed by you |
| `share` | `{ title: 'AI tạo đề kiểm tra theo ma trận', subtitle: 'Ma trận bốn mức, bản đặc tả, cổng chất lượng và người duyệt' }` | `{ title: 'AI test generator', subtitle: 'A four-level blueprint, a specification, quality gates and human review' }` |
| `imageAlt` | Màn Soạn đề kiểm tra của EduFlow: ma trận chủ đề theo bốn mức, khung đề và ước tính chi phí | The EduFlow test setup screen: a topic matrix across four levels, the test frame and the cost estimate |

Các trường còn lại người thực thi viết, theo khung:

- `lead` (2 tới 3 câu): AI viết câu hỏi theo đúng số câu từng ô của ma trận; máy kiểm, thầy cô duyệt; xuất đề, đáp án, bản đặc tả.
- `inShort`: định nghĩa gọn chứa "AI tạo đề kiểm tra" và "ma trận", đứng một mình vẫn đúng.
- `definition`: `h2` "Ma trận và bản đặc tả đề kiểm tra là gì?", `term` "Ma trận đề kiểm tra", `rest` định nghĩa (bảng chủ đề × mức nhận thức, mỗi ô là số câu); `paras`: bản đặc tả là gì (mô tả yêu cầu cần đạt của từng câu theo ô), vì sao số câu từng mức là nguồn sự thật.
- `table`: `h2` "Soạn đề tay, dùng ChatGPT và dùng EduFlow"; `head` `['Tiêu chí', 'Soạn tay', 'ChatGPT hay công cụ chung', 'EduFlow']`; 6 hàng: bám số câu từng ô ma trận; bản đặc tả đi kèm; kiểm lại đáp án; nhiều mã đề; định dạng in được cho phòng thi; ai duyệt và ký. Ô của ChatGPT mô tả trung tính điều nó làm được và điều người dùng phải tự làm, không chê (spec §8.3). `checkedAt` là ngày viết. `caption` một câu mô tả bảng.
- `blocks` (1 tới 2 mục): bốn mức nhận thức trong EduFlow (nhận biết, thông hiểu, vận dụng, vận dụng cao); cổng chất lượng của đề (mỗi cổng in số đơn vị đã kiểm, cổng kiểm 0 đơn vị là lỗi; nếu nêu số cổng thì là `appFacts.testGates`).
- `howTo`: `h2` "Tạo đề theo ma trận bằng EduFlow", 5 tới 6 bước theo bài `create-a-test` (bước cuối là xuất nhiều mã đề, `doc: 'export-test-versions'`), các bước khác `doc: 'create-a-test'`.
- `limits`: `h2` "EduFlow chưa làm gì", ít nhất các ý: chỉ câu nhiều lựa chọn (đúng sai, trả lời ngắn, tự luận có ý là lộ trình, E2a); app dùng bốn mức, ba mức Biết, Hiểu, Vận dụng của Công văn 7991 là lộ trình (OQ-218); chưa có hình trong câu và công thức LaTeX (V2-09); chưa đọc đề cũ từ tệp để soạn lại (US-203, US-204).
- `faq` (5 câu, tiếng Anh cùng câu): (1) AI tạo đề kiểm tra của EduFlow có bám đúng ma trận không? (2) EduFlow dùng mấy mức nhận thức? (3) Có tạo được câu đúng sai, trả lời ngắn, tự luận không? (4) Đáp án do AI viết có cần kiểm lại không? (một lượt AI khác giải lại; thầy cô xác nhận từng câu) (5) Một đề xuất được bao nhiêu mã? (`appFacts.maxTestVersions`).

Độ dài: tổng chữ tiếng Việt 1.200 tới 1.800 (test `topicWordCount`). Bản tiếng Anh dịch sát, cùng số hàng, bước, mục, câu hỏi.

Nguồn: như Task 13 (M2b, E1, `pt-thiet-lap.md`, `pt-de-kiem-tra.md`, `pt-duyet-xuat.md`), cộng `docs/superpowers/specs/2026-10-10-eduflow-exam-source-spec.md` (đặc tả nguồn của chủ sản phẩm: định nghĩa ma trận và bản đặc tả) và v2-scope V2-05, V2-09, §5 câu 24.

- [ ] **Step 5: Component trang chủ đề**

`components/topic/TopicPage.tsx`:

```tsx
import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import Image from 'next/image'
import { Faq } from '@/components/home/Faq'
import { SectionHead } from '@/components/home/SectionHead'
import { JsonLd } from '@/components/seo/JsonLd'
import { ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { CtaBand } from '@/components/ui/CtaBand'
import { Icon } from '@/components/ui/Icon'
import { Section } from '@/components/ui/Section'
import { DOCS, docHref } from '@/content/docs'
import { TOPIC_IDS, TOPIC_META, topicCopy, topicPage, type TopicBlock, type TopicId, type TopicLink } from '@/content/topics'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { formatDate } from '@/lib/format'
import { breadcrumb, faqPage, webPage } from '@/lib/seo/jsonld'
import { buildMetadata } from '@/lib/seo/metadata'
import { finalTitle, pageName, topicSeo } from '@/lib/seo/pages'
import { absoluteUrl } from '@/lib/seo/urls'
import { site } from '@/lib/site'

const H2 = 'text-[24px] leading-[1.2] font-bold tracking-[-0.01em] text-balance md:text-[30px]'
const P = 'text-[16.5px] leading-relaxed text-ink2'
const LINK = 'font-semibold text-accent-strong underline underline-offset-2 hover:text-ink'
const PILLAR_PAGE = { k12: '/k12', university: '/university', program: '/program' } as const

export async function topicMetadata(id: TopicId): Promise<Metadata> {
  const locale = (await getLocale()) as Locale
  return buildMetadata({ locale, page: topicPage(id), seo: topicSeo(locale, id) })
}

/** In đậm lần xuất hiện đầu của từ khoá chính trong ô Tóm tắt (spec §7.2). */
function Highlight({ text, term }: { text: string; term: string }) {
  const i = text.toLowerCase().indexOf(term.toLowerCase())
  if (i < 0) return <>{text}</>
  return (
    <>
      {text.slice(0, i)}
      <strong className="font-semibold">{text.slice(i, i + term.length)}</strong>
      {text.slice(i + term.length)}
    </>
  )
}

function InlineLink({ link, locale }: { link: TopicLink; locale: Locale }) {
  if ('topic' in link) return <Link href={topicPage(link.topic)} className={LINK}>{topicCopy(locale, link.topic).name}</Link>
  if ('doc' in link) return <Link href={docHref(locale, link.doc)} className={LINK}>{DOCS[link.doc][locale].title}</Link>
  if ('href' in link) return <a href={link.href} className={LINK} rel="noopener">{link.label}</a>
  return <Link href={link.page} className={LINK}>{link.label}</Link>
}

function Block({ block, locale }: { block: TopicBlock; locale: Locale }) {
  const List = block.ordered ? 'ol' : 'ul'
  return (
    <section className="flex flex-col gap-4">
      <h2 className={H2}>{block.h2}</h2>
      {block.paras?.map((p) => <p key={p} className={P}>{p}</p>)}
      {block.items ? (
        <List className={block.ordered ? 'flex list-decimal flex-col gap-3 pl-6 marker:font-semibold marker:text-accent-strong' : 'flex flex-col gap-3'}>
          {block.items.map((it) => (
            <li key={it.text} className={block.ordered ? `pl-1 ${P}` : `flex gap-3 ${P}`}>
              {block.ordered ? null : <Icon name="check" size={20} className="mt-1 shrink-0 text-accent" />}
              <span>
                {it.title ? <strong className="font-semibold text-ink">{it.title}: </strong> : null}
                {it.text}
                {it.link ? <> <InlineLink link={it.link} locale={locale} />.</> : null}
              </span>
            </li>
          ))}
        </List>
      ) : null}
    </section>
  )
}

/** Trang chủ đề (spec §7.2): trả lời ngay, định nghĩa, bảng so sánh, cách làm, giới hạn, liên quan, hỏi đáp. */
export async function TopicPage({ id }: { id: TopicId }) {
  const locale = (await getLocale()) as Locale
  const [t, tc] = await Promise.all([getTranslations('topics'), getTranslations('common')])
  const c = topicCopy(locale, id)
  const meta = TOPIC_META[id]
  const url = absoluteUrl(locale, topicPage(id))
  const pillar = meta.pillar ? PILLAR_PAGE[meta.pillar] : null
  const firstDoc = c.howTo.steps.find((s) => s.doc)?.doc
  const siblings = TOPIC_IDS.filter((other) => other !== id)
  const crumbs = [
    { name: tc('siteName'), url: absoluteUrl(locale, '/') },
    ...(pillar ? [{ name: pageName(locale, pillar), url: absoluteUrl(locale, pillar) }] : []),
    { name: c.name, url },
  ]
  return (
    <main id="main" className="flex-1">
      <section className="bg-[radial-gradient(900px_300px_at_20%_-80px,#E8F3E7_0%,rgba(232,243,231,0)_70%)] pt-10 pb-10 md:pt-14 md:pb-12">
        <Container className="flex flex-col gap-4">
          <nav aria-label={t('breadcrumb')} className="flex flex-wrap items-center gap-2 text-[13.5px] text-muted">
            <Link href="/" className="inline-flex min-h-11 items-center hover:text-ink md:min-h-0">{tc('siteName')}</Link>
            {pillar ? (
              <>
                <Icon name="chevron-right" size={14} />
                <Link href={pillar} className="inline-flex min-h-11 items-center hover:text-ink md:min-h-0">{pageName(locale, pillar)}</Link>
              </>
            ) : null}
            <Icon name="chevron-right" size={14} />
            <span className="text-ink2" aria-current="page">{c.name}</span>
          </nav>
          <span className="text-[13px] font-bold tracking-[0.6px] text-accent-strong uppercase">{c.eyebrow}</span>
          <h1 className="max-w-[900px] font-display text-[32px] leading-[1.12] font-bold tracking-[-0.02em] text-balance md:text-[48px] md:leading-[1.08]">{c.h1}</h1>
          <p className="max-w-[800px] text-base leading-relaxed text-ink2 text-pretty md:text-lg">{c.lead}</p>
          <div className="mt-2 flex flex-col gap-2.5 sm:flex-row sm:gap-3">
            <ButtonLink href="/download" icon="download">{tc('download')}</ButtonLink>
            <ButtonLink href={firstDoc ? docHref(locale, firstDoc) : '/docs'} variant="secondary" icon="arrow-right" iconAfter>{t('readGuide')}</ButtonLink>
          </div>
          <p className="text-sm text-muted">{t('updated', { date: formatDate(meta.updatedAt, locale) })}</p>
        </Container>
      </section>

      <section className="pb-16 md:pb-24">
        <Container>
          <article className="flex max-w-[800px] flex-col gap-12 md:gap-14">
            <aside className="rounded-xl border border-accent-line bg-accent-soft p-5 md:p-6">
              <p className="text-[13px] font-bold tracking-[0.6px] text-accent-strong uppercase">{t('inShort')}</p>
              <p className="mt-2 text-[16.5px] leading-relaxed text-ink"><Highlight text={c.inShort} term={c.keywords[0]} /></p>
            </aside>

            <section className="flex flex-col gap-4">
              <h2 className={H2}>{c.definition.h2}</h2>
              <p className={P}><strong className="font-semibold text-ink">{c.definition.term}</strong> {c.definition.rest}</p>
              {c.definition.paras?.map((p) => <p key={p} className={P}>{p}</p>)}
            </section>

            {meta.image ? (
              <Image src={meta.image.src} alt={c.imageAlt} width={meta.image.width} height={meta.image.height} sizes="(min-width: 840px) 800px, 100vw" className="h-auto w-full rounded-xl border border-line" />
            ) : null}

            <section className="flex flex-col gap-4">
              <h2 className={H2}>{c.table.h2}</h2>
              <div tabIndex={0} role="region" aria-label={c.table.caption} className="overflow-x-auto rounded-xl border border-line bg-card">
                <table className="w-full min-w-[640px] border-collapse text-left text-[15px] leading-relaxed">
                  <caption className="sr-only">{c.table.caption}</caption>
                  <thead className="bg-sidebar">
                    <tr>{c.table.head.map((h) => <th key={h} scope="col" className="px-4 py-3 font-semibold">{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {c.table.rows.map((row) => (
                      <tr key={row[0]} className="border-t border-line">
                        {row.map((cell, i) =>
                          i === 0 ? <th key={i} scope="row" className="px-4 py-3 align-top font-semibold">{cell}</th> : <td key={i} className="px-4 py-3 align-top text-ink2">{cell}</td>,
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[13.5px] text-muted">{t('checked', { date: formatDate(c.table.checkedAt, locale) })}</p>
            </section>

            {c.blocks?.map((b) => <Block key={b.h2} block={b} locale={locale} />)}

            <section className="flex flex-col gap-4">
              <h2 className={H2}>{c.howTo.h2}</h2>
              {c.howTo.lead ? <p className={P}>{c.howTo.lead}</p> : null}
              <ol className="flex list-decimal flex-col gap-4 pl-6 marker:font-semibold marker:text-accent-strong">
                {c.howTo.steps.map((s) => (
                  <li key={s.title} className={`pl-1 ${P}`}>
                    <strong className="font-semibold text-ink">{s.title}.</strong> {s.text}
                    {s.doc ? <> <Link href={docHref(locale, s.doc)} className={LINK}>{DOCS[s.doc][locale].title}</Link></> : null}
                  </li>
                ))}
              </ol>
            </section>

            <section className="flex flex-col gap-4">
              <h2 className={H2}>{c.limits.h2}</h2>
              <ul className="flex list-disc flex-col gap-2.5 pl-6">
                {c.limits.items.map((it) => <li key={it} className={P}>{it}</li>)}
              </ul>
            </section>

            <section className="flex flex-col gap-4">
              <h2 className={H2}>{t('relatedH2')}</h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {pillar ? (
                  <li>
                    <Link href={pillar} className="flex min-h-11 flex-col gap-1 rounded-card border border-line bg-card p-4 hover:border-muted">
                      <span className="text-[12.5px] font-bold tracking-[0.5px] text-muted uppercase">{t('pillar')}</span>
                      <span className="font-semibold">{pageName(locale, pillar)}</span>
                    </Link>
                  </li>
                ) : null}
                {siblings.map((other) => (
                  <li key={other}>
                    <Link href={topicPage(other)} className="flex min-h-11 flex-col gap-1 rounded-card border border-line bg-card p-4 hover:border-muted">
                      <span className="font-semibold">{topicCopy(locale, other).name}</span>
                      <span className="text-[14.5px] text-ink2">{topicCopy(locale, other).card}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </article>
        </Container>
      </section>

      <Section className="border-t border-line bg-card">
        <Container>
          <SectionHead eyebrow={t('faqEyebrow')} title={t('faqH2')} />
          <Faq items={c.faq.map((f, i) => ({ id: `${id}-q${i + 1}`, ...f }))} />
        </Container>
      </Section>

      <CtaBand title={t('ctaH2')} sub={t('ctaSub')} primary={{ href: '/download', label: tc('download') }} secondary={{ href: '/contact', label: tc('contactSales') }} />
      <JsonLd
        data={webPage({
          url,
          name: finalTitle(topicSeo(locale, id)),
          description: c.description,
          locale,
          about: c.name,
          keywords: c.keywords,
          ...(meta.image ? { image: `${site.siteUrl()}${meta.image.src}` } : {}),
          dateModified: meta.updatedAt,
        })}
      />
      <JsonLd data={breadcrumb(crumbs)} />
      <JsonLd data={faqPage(c.faq)} />
    </main>
  )
}
```

`app/[locale]/test-generator/page.tsx`:

```tsx
import { TopicPage, topicMetadata } from '@/components/topic/TopicPage'

export const generateMetadata = () => topicMetadata('test-generator')

export default function Page() {
  return <TopicPage id="test-generator" />
}
```

`app/[locale]/test-generator/opengraph-image.tsx`:

```tsx
import { routing, type Locale } from '@/i18n/routing'
import { OG_SIZE, topicOgImage } from '@/lib/seo/og'

export const alt = 'EduFlow'
export const size = OG_SIZE
export const contentType = 'image/png'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return topicOgImage(locale as Locale, 'test-generator')
}
```

`lib/seo/og.tsx`, thêm:

```tsx
import { topicCopy, type TopicId } from '@/content/topics'
import type { Locale } from '@/i18n/routing'

/** Ảnh chia sẻ riêng của trang chủ đề (spec §7.2). */
export function topicOgImage(locale: Locale, id: TopicId) {
  const { share } = topicCopy(locale, id)
  return ogImage({ title: share.title, subtitle: share.subtitle })
}
```

- [ ] **Step 6: Sổ trang, metadata, chữ giao diện**

`lib/seo/pages.ts`:

```ts
import { TOPIC_IDS, TOPIC_META, TOPICS, topicPage, type TopicId } from '@/content/topics'

export function topicSeo(locale: Locale, id: TopicId): Seo {
  const c = TOPICS[locale][id]
  return { title: c.metaTitle, description: c.description, ...(TOPIC_META[id].absoluteTitle ? { absoluteTitle: true } : {}) }
}

/** Tên một trang tĩnh để làm anchor text: từ khoá chính, viết hoa chữ đầu (spec §4.2); trang không có từ khoá thì dùng title. */
export function pageName(locale: Locale, key: StaticPageKey): string {
  const keyword = (STATIC_PAGES[key] as StaticEntry).keyword?.[locale]
  return keyword ? keyword.charAt(0).toUpperCase() + keyword.slice(1) : staticSeo(locale, key).title
}
```

và trong `indexablePages()` thêm, đặt giữa `statics` và `docs`:

```ts
  const topics = TOPIC_IDS.map(
    (id): IndexablePage => ({
      id: `topic:${id}`,
      key: topicPage(id),
      seo: both((l) => topicSeo(l, id)),
      keyword: both((l) => TOPICS[l][id].keywords[0]),
      updatedAt: TOPIC_META[id].updatedAt,
    }),
  )
  return [...statics, ...topics, ...docs]
```

`lib/seo/metadata.ts`: `import { isTopicPage } from '@/content/topics'` và trong `ogImageUrl` đổi điều kiện thành `OWN_OG_IMAGE.has(page) || isTopicPage(page)`; sửa chú thích của `OWN_OG_IMAGE` thành "Trang có ảnh chia sẻ riêng theo file convention: Tải về và các trang chủ đề".

`messages/vi.json`, thêm namespace:

```json
"topics": {
  "breadcrumb": "Vị trí trong trang",
  "inShort": "Tóm tắt",
  "updated": "Cập nhật {date}",
  "checked": "Bảng được kiểm tra ngày {date}.",
  "readGuide": "Đọc hướng dẫn",
  "relatedH2": "Chủ đề liên quan",
  "pillar": "Thuộc nhóm",
  "faqEyebrow": "Hỏi đáp",
  "faqH2": "Câu hỏi thường gặp",
  "ctaH2": "Thử EduFlow với một việc soạn thật của thầy cô",
  "ctaSub": "Tải app và bấm Dùng thử ở màn đầu, hoặc liên hệ Agentra để nhận báo giá cho trường."
}
```

`messages/en.json`:

```json
"topics": {
  "breadcrumb": "Location in the site",
  "inShort": "In short",
  "updated": "Updated {date}",
  "checked": "Table checked on {date}.",
  "readGuide": "Read the guide",
  "relatedH2": "Related topics",
  "pillar": "Part of",
  "faqEyebrow": "FAQ",
  "faqH2": "Frequently asked questions",
  "ctaH2": "Try EduFlow on a real piece of your own preparation work",
  "ctaSub": "Download the app and start a trial from the first screen, or contact Agentra for a quote for your school."
}
```

- [ ] **Step 7: Bài hướng dẫn trỏ về trang chủ đề**

`content/docs/index.ts`: thêm vào `DocEntry` trường `/** Mã trang chủ đề tương ứng (khối "Đọc thêm"), hoặc bỏ trống. */ topic?: TopicId` (import type `TopicId` từ `@/content/topics`); trong `assertDocsValid` truyền thêm `topics: TOPIC_IDS`. Đặt `topic: 'test-generator'` cho `create-a-test` và `export-test-versions`.

`lib/docs/validate.ts`: tham số `input` thêm `topics: readonly string[]`; kiểu `DocEntryLike` thêm `topic?: string`; trong vòng lặp, ngay sau kiểm `order`:

```ts
    if (entry.topic !== undefined && !input.topics.includes(entry.topic)) errors.push(`${where}: topic "${entry.topic}" không phải trang chủ đề có thật`)
```

`app/[locale]/docs/[slug]/page.tsx`: ngay trước `<DocsPager current={id} />` thêm khối "Đọc thêm":

```tsx
          {doc.topic ? (
            <aside className="flex flex-col gap-1.5 rounded-card border border-line bg-card p-5">
              <span className="text-[12.5px] font-bold tracking-[0.5px] text-muted uppercase">{t('readMore')}</span>
              <Link href={topicPage(doc.topic)} className="font-semibold text-accent-strong underline underline-offset-2 hover:text-ink">
                {topicCopy(locale, doc.topic).name}
              </Link>
              <span className="text-[14.5px] text-ink2">{topicCopy(locale, doc.topic).card}</span>
            </aside>
          ) : null}
```

(import `topicCopy, topicPage` từ `@/content/topics`).

- [ ] **Step 8: Tài liệu: cách thêm trang chủ đề**

`README.md`, thêm mục:

```markdown
### Thêm một trang chủ đề

1. Chọn từ khoá chính chưa trang nào dùng (bản đồ ở đầu `lib/seo/brand.ts`); slug tiếng Việt là từ khoá đó.
2. Thêm khoá vào `routing.pathnames` (`i18n/routing.ts`) và mã vào `TOPIC_IDS`, `TOPIC_META` (`content/topics/index.ts`).
3. Viết nội dung hai ngôn ngữ ở `content/topics/vi.ts`, `content/topics/en.ts` theo kiểu `TopicCopy`: H1 và ô Tóm tắt chứa từ khoá chính; bảng so sánh có ngày kiểm tra; mục "EduFlow chưa làm gì"; đúng 5 câu hỏi đáp; tiếng Việt 1.200 tới 1.800 chữ.
4. Tạo `app/[locale]/<mã>/page.tsx` và `opengraph-image.tsx` (chép từ `app/[locale]/test-generator/`), thêm hai đường dẫn vào `tests/e2e/pages.ts`.
5. `pnpm verify` rồi lệnh SEO-AUDIT ở README.
```

- [ ] **Step 9: Chạy test**

Chạy: `pnpm vitest run && pnpm verify`
Kỳ vọng: PASS, xanh. Nếu `topics.test.ts` báo số chữ: viết thêm hay bớt ở `blocks`, `definition.paras` hoặc `faq`, không thêm chữ rỗng nghĩa.
Chạy E2E-FEED (toàn bộ). Kỳ vọng: PASS, gồm `og.spec.ts` và trang chủ đề trong `pages.spec.ts`.

- [ ] **Step 10: Commit**

```bash
git add content/topics components/topic "app/[locale]/test-generator" lib/seo lib/docs content/docs/index.ts "app/[locale]/docs/[slug]/page.tsx" messages tests README.md
git commit -m "feat(topics): khung trang chủ đề và trang AI tạo đề kiểm tra theo ma trận"
```

---

### Khuôn chung của hai task trang chủ đề còn lại (Task 19, 20)

Mỗi trang:

1. **Viết test hỏng:** thêm hai đường dẫn vào `tests/e2e/pages.ts`. Chạy `pnpm vitest run tests/unit/e2e-pages.test.ts`: FAIL.
2. **Đăng ký:** thêm mã vào `TOPIC_IDS` (đúng thứ tự: `test-generator`, `test-versions`, `lesson-plans`, `lesson-slides`, `course-syllabus`, `vs-chatgpt`) và mục `TOPIC_META` theo bảng của task; `updatedAt` là ngày commit theo giờ Việt Nam.
3. **Viết nội dung** vào `content/topics/vi.ts`, `en.ts`: các trường đã chốt giữ nguyên chuỗi; trường còn lại theo khung của task và kiểu `TopicCopy` (Task 18 Step 3). Luật như Task 18 Step 4: H1 và ô Tóm tắt chứa `keywords[0]`; bảng có `checkedAt`; ô của công cụ khác mô tả trung tính; "EduFlow chưa làm gì" lấy từ v2-scope; đúng 5 câu hỏi đáp; tiếng Việt 1.200 tới 1.800 chữ; mọi con số đúng `app-facts`; không tên nhà cung cấp mô hình (được nhắc "ChatGPT").
4. **Route:** chép `app/[locale]/test-generator/page.tsx` và `opengraph-image.tsx` sang thư mục `app/[locale]/<mã>/`, đổi mã ở hai chỗ mỗi tệp.
5. **Nối với bài hướng dẫn:** đặt `topic` cho các bài ở bảng của task (`content/docs/index.ts`).
6. **Chạy:** `pnpm vitest run && pnpm verify` (PASS, xanh), rồi E2E-FEED với `pnpm e2e tests/e2e/pages.spec.ts tests/e2e/og.spec.ts` (PASS). Xem bằng mắt hai trang mới qua `pnpm dev`.
7. **Commit** (lệnh ở cuối task).

**Interfaces chung:** Consumes `TopicCopy`, `TOPIC_META`, `TopicPage`, `topicOgImage` (Task 18). Produces: mã chủ đề mới trong `TopicId`, dùng ở Task 21, 22, 23.

---

### Task 19: Trang chủ đề trộn đề, giáo án và slide

**Đăng ký:**

| Mã | Đường dẫn vi / en | `TOPIC_META` | `topic` của bài hướng dẫn |
|---|---|---|---|
| `test-versions` | `/tron-de-trac-nghiem` / `/en/shuffle-test-versions` | `{ pillar: 'k12', image: shot('result'), updatedAt }` | (giữ `export-test-versions` ở `test-generator`) |
| `lesson-plans` | `/ai-soan-giao-an` / `/en/ai-lesson-plan-generator` | `{ pillar: 'k12', updatedAt }` (chưa có ảnh khớp) | `lesson-plans` |
| `lesson-slides` | `/tao-slide-bai-giang-bang-ai` / `/en/ai-slide-generator` | `{ pillar: 'k12', image: shot('slide-studio'), updatedAt }` | `lesson-slides` |

Đổi `topic` của bài `export-test-versions` thành `'test-versions'` (bài xuất mã đề khớp trang trộn đề hơn).

**Trường đã chốt:**

| Mã | Trường | vi | en |
|---|---|---|---|
| `test-versions` | `name` | Trộn đề trắc nghiệm | Shuffle test versions |
| | `metaTitle` | Trộn đề trắc nghiệm, tạo nhiều mã đề | Shuffle test versions for multiple-choice tests |
| | `description` | Trộn đề trắc nghiệm thành nhiều mã đề: xáo thứ tự câu và phương án theo khoá cố định, tối đa 24 mã mỗi đề, mỗi mã kèm đáp án, xuất Word và PDF. | Shuffle a multiple-choice test into several versions: questions and options reordered with a fixed key, up to 24 versions, each with its own answer key. |
| | `keywords` | `['trộn đề trắc nghiệm', 'tạo nhiều mã đề', 'phần mềm trộn đề']` | `['shuffle test versions', 'multiple test versions', 'test shuffling software']` |
| | `eyebrow` | Tạo nhiều mã đề | Multiple test versions |
| | `h1` | Trộn đề trắc nghiệm thành nhiều mã đề, đáp án đúng theo từng mã | Shuffle test versions of a multiple-choice test, with a correct key for each |
| `lesson-plans` | `name` | AI soạn giáo án | AI lesson plan generator |
| | `metaTitle` | AI soạn giáo án 5512 cho giáo viên phổ thông | AI lesson plan generator (Official Letter 5512) |
| | `description` | AI soạn giáo án theo Công văn 5512 từ khung GDPT 2018: bốn hoạt động có mục tiêu, sản phẩm, cách tổ chức; máy kiểm khung, thầy cô duyệt rồi xuất Word. | An AI lesson plan generator for Official Letter 5512: four activities with aims, outputs and steps, checked against the template, reviewed by you, in Word. |
| | `keywords` | `['AI soạn giáo án', 'giáo án 5512', 'kế hoạch bài dạy 5512']` | `['AI lesson plan generator', 'Official Letter 5512 lesson plan', '5512 lesson plan template']` |
| | `eyebrow` | Giáo án theo Công văn 5512 | Official Letter 5512 lesson plans |
| | `h1` | AI soạn giáo án theo Công văn 5512, đủ bốn hoạt động, thầy cô duyệt trước khi dùng | AI lesson plan generator for Official Letter 5512, with four activities you approve |
| `lesson-slides` | `name` | Tạo slide bài giảng bằng AI | AI slide generator |
| | `metaTitle` | Tạo slide bài giảng bằng AI, có quiz trong slide | AI slide generator for lessons, with quizzes |
| | `description` | Tạo slide bài giảng bằng AI từ giáo án: chọn mẫu slide, AI viết nội dung, chèn quiz ngay trong slide, xem trước, kiểm cổng rồi xuất PDF để trình chiếu. | An AI slide generator for lessons: start from a lesson plan, pick a template, let AI write the content, add quizzes inside the deck, review, export to PDF. |
| | `keywords` | `['tạo slide bài giảng bằng AI', 'AI tạo slide bài giảng']` | `['AI slide generator', 'AI lesson slides']` |
| | `eyebrow` | AI tạo slide bài giảng | AI lesson slides |
| | `h1` | Tạo slide bài giảng bằng AI từ giáo án, có quiz ngay trong slide | AI slide generator for lessons, from your lesson plan, with quizzes in the deck |

`share` của mỗi trang: `title` là `name`, `subtitle` một câu dưới 70 ký tự. `imageAlt` mô tả đúng ảnh trong `TOPIC_META` (trang không có ảnh vẫn điền `imageAlt` bằng một câu mô tả màn, để Kế hoạch 2 dùng).

**Khung riêng (spec §7.2):**
- `test-versions`: định nghĩa "trộn đề trắc nghiệm" và "mã đề"; xáo trộn tất định (cùng khoá thì in lại ra đúng mã cũ); tối đa `appFacts.maxTestVersions` mã; hai công tắc xáo câu, xáo phương án (mặc định bật); kiểm trước khi lưu (đủ câu mỗi mã, chữ cái đáp án đúng sau khi xáo, tệp đề không lộ đáp án). Bảng: Trộn tay hay bằng Word, phần mềm trộn đề chung, EduFlow. Bước cách làm: `doc: 'export-test-versions'`. "EduFlow chưa làm gì": **không trộn đề có sẵn từ tệp Word hay PDF** (EduFlow trộn đề soạn trong app; đọc đề cũ là US-203, US-204, v2) và nói điều này ngay trong `lead`, vì người tìm "phần mềm trộn đề" thường có đề sẵn; không trộn theo cấu trúc ba phần của đề tốt nghiệp (E2b, v2); chỉ câu nhiều lựa chọn.
- `lesson-plans`: Công văn 5512 và bốn hoạt động (mở đầu, hình thành kiến thức, luyện tập, vận dụng); khung GDPT 2018 có sẵn; thông tin người soạn không gửi cho AI; cổng kiểm cấu trúc giáo án. Bảng: Soạn tay, ChatGPT hay công cụ chung, EduFlow. Bước: `doc: 'lesson-plans'`. "Chưa làm gì": môn chỉ có ở gói đầy đủ (Ngữ văn, Tiếng Việt, Âm nhạc, Mỹ thuật, Hoạt động trải nghiệm); chưa có mẫu giáo án riêng của trường (OQ-251); chưa có thư viện mẫu và logo trường (US-280 tới US-283).
- `lesson-slides`: slide 16:9 từ giáo án hay soạn riêng; mẫu S1 tới S3b; quiz trong slide; rubric chấm bản nháp và cổng slide; xuất PDF (và PPTX nếu app vẫn xuất PPTX dạng không sửa được, ghi đúng như app). Bảng: Làm tay trên PowerPoint, công cụ tạo slide AI chung, EduFlow. Bước: `doc: 'lesson-slides'`. "Chưa làm gì": PPTX sửa được (OQ-142); giao diện của đơn vị qua máy chủ, chọn màu chủ đạo (V2-09).

**Nguồn:** như Task 13 và Task 14; với trộn đề thêm `docs/superpowers/plans/2026-10-10-eduflow-exam-e1-export-variants.md` (mục Goal và các BR, MSG của E1).

Commit: `git add content/topics content/docs/index.ts "app/[locale]/test-versions" "app/[locale]/lesson-plans" "app/[locale]/lesson-slides" tests/e2e/pages.ts` rồi `git commit -m "feat(topics): trang trộn đề trắc nghiệm, AI soạn giáo án, tạo slide bài giảng bằng AI"`.

---

### Task 20: Trang chủ đề đề cương học phần và "EduFlow và ChatGPT"

**Đăng ký:**

| Mã | Đường dẫn vi / en | `TOPIC_META` | `topic` của bài hướng dẫn |
|---|---|---|---|
| `course-syllabus` | `/de-cuong-chi-tiet-hoc-phan` / `/en/course-syllabus` | `{ pillar: 'university', image: shot('course-workbench'), updatedAt }` | (không bài nào) |
| `vs-chatgpt` | `/eduflow-va-chatgpt` / `/en/eduflow-vs-chatgpt` | `{ pillar: null, image: shot('assistant-home'), updatedAt, absoluteTitle: true }` | `using-the-assistant` |

**Trường đã chốt:**

| Mã | Trường | vi | en |
|---|---|---|---|
| `course-syllabus` | `name` | Đề cương chi tiết học phần | Course syllabus |
| | `metaTitle` | Đề cương chi tiết học phần: cấu trúc và cách viết | Course syllabus: structure and how to write one |
| | `description` | Đề cương chi tiết học phần gồm những mục nào, viết chuẩn đầu ra học phần (CLO) và kế hoạch tuần ra sao, và cách EduFlow giúp giảng viên soạn, kiểm, ký duyệt. | What a course syllabus contains, how to write course learning outcomes (CLOs) and a weekly plan, and how EduFlow helps lecturers draft, check and sign it off. |
| | `keywords` | `['đề cương chi tiết học phần', 'mẫu đề cương chi tiết học phần', 'cấu trúc đề cương học phần']` | `['course syllabus', 'course syllabus template', 'course syllabus structure']` |
| | `eyebrow` | Mẫu và cấu trúc đề cương | Template and structure |
| | `h1` | Đề cương chi tiết học phần: cấu trúc, cách viết CLO và cách EduFlow hỗ trợ | Course syllabus: structure, writing CLOs, and how EduFlow helps |
| `vs-chatgpt` | `name` | EduFlow và ChatGPT | EduFlow vs ChatGPT |
| | `metaTitle` (tuyệt đối) | EduFlow và ChatGPT: soạn đề, giáo án khác gì? | EduFlow vs ChatGPT for tests and lesson plans |
| | `description` | EduFlow và ChatGPT khác gì khi soạn đề kiểm tra và giáo án: khi nào ChatGPT đủ dùng, khi nào cần ma trận, cổng kiểm, nhiều mã đề và người duyệt của EduFlow. | EduFlow vs ChatGPT for tests and lesson plans: when ChatGPT is enough, and when you need the blueprint, quality gates, test versions and sign-off of EduFlow. |
| | `keywords` | `['ChatGPT soạn giáo án', 'EduFlow và ChatGPT', 'câu lệnh ChatGPT soạn giáo án']` | `['ChatGPT lesson plans', 'EduFlow vs ChatGPT', 'ChatGPT prompts for lesson plans']` |
| | `eyebrow` | So sánh trung thực | An honest comparison |
| | `h1` | ChatGPT soạn giáo án, soạn đề được tới đâu, và khi nào cần EduFlow | ChatGPT lesson plans and tests: how far it goes, and when you need EduFlow |

**Khung riêng (spec §7.2):**
- `course-syllabus`: đề cương chi tiết học phần là gì; các mục thường có (thông tin học phần, mô tả, CLO, kế hoạch tuần, đánh giá, tài liệu...; nêu mẫu 10 mục như trang Học phần đã nói); cách viết CLO theo bậc Bloom (động từ đo được); kế hoạch tuần gắn CLO; ma trận CLO và đánh giá. Bảng: Soạn tay trên Word, ChatGPT hay công cụ chung, EduFlow. Cách làm bằng EduFlow theo R6, đúng các câu trang Học phần đang nói (CLO và cổng G3, kế hoạch tuần, đề cương 10 mục, duyệt qua gói đã ký); bước nào chỉ có ở lộ trình thì không gắn `doc`; bước nạp bài giảng gắn `doc: 'adding-documents'`. **"EduFlow chưa làm gì" nói thật** (rủi ro K1): bản phát hành đầu tập trung vào cấp Phổ thông; công cụ cho học phần (CLO, kế hoạch tuần, buổi học, đánh giá, đề cương, duyệt qua gói) nằm trong lộ trình (V2-10 tới V2-12). Câu này PO thấy khi duyệt canvas (Task 25); PO muốn khác thì đổi ở đây.
- `vs-chatgpt`: so sánh trung thực, không chê; ChatGPT được mô tả là trợ lý trò chuyện đa năng, không nêu công ty làm ra nó (luật OQ-L07 cấm tên OpenAI). Khi nào ChatGPT đủ dùng (ý tưởng, câu hỏi lẻ, nháp nhanh, câu lệnh mẫu); khi nào cần EduFlow (bám số câu từng ô ma trận, bản đặc tả, kiểm lại đáp án, nhiều mã đề, khung 5512, cổng, người duyệt và ký, dữ liệu ở máy, chi phí hiện trước). Một khối "Câu lệnh ChatGPT soạn giáo án" (từ khoá phụ): 3 tới 4 câu lệnh mẫu tốt, trung lập, để trang hữu ích cả với người không dùng EduFlow. Bảng `head`: `['Tiêu chí', 'ChatGPT', 'EduFlow']`, 6 tới 8 hàng, `checkedAt` là ngày kiểm. Bước cách làm gắn `doc: 'create-a-test'`, `'lesson-plans'`, `'using-the-assistant'`. "EduFlow chưa làm gì": không phải trợ lý trò chuyện đa năng (trợ lý làm việc trong dự án đang mở); chỉ câu nhiều lựa chọn; công cụ học phần là lộ trình.

**Nguồn:** `docs/superpowers/specs/2026-09-30-eduflow-application-design.md` phần cấp Học phần (chỉ để mô tả, không khẳng định đã có), v2-scope §3 V2-10 tới V2-12; các nguồn của Task 13, 14, 15.

Commit: `git add content/topics content/docs/index.ts "app/[locale]/course-syllabus" "app/[locale]/vs-chatgpt" tests/e2e/pages.ts` rồi `git commit -m "feat(topics): trang đề cương chi tiết học phần và EduFlow và ChatGPT"`.

---

### Task 21: Ba trang cấp: chủ đề của cấp, hướng dẫn liên quan, hỏi đáp và WebPage

Thêm vào `LevelPage` các khối mới của spec §7.1 (6, 7, 8), H1 chứa từ khoá chính, JSON-LD WebPage và FAQPage. Khoác giao diện mới là việc của Kế hoạch 2.

**Files:**
- Modify: `components/level/levels.ts`, `components/level/LevelPage.tsx`, `messages/vi.json`, `messages/en.json`, `tests/unit/i18n.test.ts`
- Test: `tests/unit/levels.test.ts`, `tests/e2e/pages.spec.ts`

**Interfaces:**
- Consumes: `TopicId`, `topicCopy`, `topicPage` (Task 18 tới 20); `DocId`, `DOCS`, `docHref`; `webPage`, `faqPage`; `staticSeo`, `finalTitle`, `pageName`.
- Produces: `LEVELS[level].topics: TopicId[]`, `LEVELS[level].docs: DocId[]`; namespace messages `levelCommon` và `levels.<cấp>.faq`.

- [ ] **Step 1: Viết test hỏng**

`tests/unit/levels.test.ts`:

```ts
import { expect, test } from 'vitest'
import { LEVELS } from '@/components/level/levels'
import { DOC_IDS } from '@/content/docs/slugs'
import { TOPIC_IDS } from '@/content/topics'
import { STATIC_PAGES } from '@/lib/seo/pages'
import en from '@/messages/en.json'
import vi from '@/messages/vi.json'

// Spec §7.1: /k12 có bốn trang chủ đề Phổ thông; /university có đề cương học phần; /program dẫn đề cương và EduFlow và ChatGPT.
test('each level links the topic pages and guides of spec §7.1', () => {
  expect(LEVELS.k12.topics).toEqual(['test-generator', 'test-versions', 'lesson-plans', 'lesson-slides'])
  expect(LEVELS.university.topics).toEqual(['course-syllabus'])
  expect(LEVELS.program.topics).toEqual(['course-syllabus', 'vs-chatgpt'])
  for (const level of Object.values(LEVELS)) {
    for (const t of level.topics) expect(TOPIC_IDS).toContain(t)
    expect(level.docs.length).toBeGreaterThanOrEqual(2)
    for (const d of level.docs) expect(DOC_IDS).toContain(d)
  }
})

test('each level H1 carries its primary keyword and its FAQ has five questions in both languages', () => {
  for (const key of ['k12', 'university', 'program'] as const) {
    const keyword = STATIC_PAGES[`/${key}`].keyword
    expect(vi.levels[key].hero.h1.toLowerCase()).toContain(keyword.vi.toLowerCase())
    expect(en.levels[key].hero.h1.toLowerCase()).toContain(keyword.en.toLowerCase())
    for (const m of [vi, en]) expect(Object.keys(m.levels[key].faq).filter((k) => /^q\d$/.test(k))).toEqual(['q1', 'q2', 'q3', 'q4', 'q5'])
  }
})
```

Trong `tests/e2e/pages.spec.ts` thêm:

```ts
// Spec §7.1, §12.1: trang cấp có WebPage và FAQPage dựng từ đúng các câu hỏi đang hiển thị.
for (const path of ['/ai-cho-giao-vien', '/en/ai-for-lecturers', '/ra-soat-chuong-trinh-dao-tao']) {
  test(`${path} carries a WebPage and an FAQPage matching the questions shown`, async ({ page }) => {
    await page.goto(path)
    const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).map((s) => JSON.parse(s))
    expect(ld.filter((d) => d['@type'] === 'WebPage')).toHaveLength(1)
    const shown = (await page.locator('main details summary').allTextContents()).map((s) => s.trim())
    expect(ld.find((d) => d['@type'] === 'FAQPage').mainEntity.map((q: { name: string }) => q.name)).toEqual(shown)
  })
}
```

- [ ] **Step 2: Chạy test để thấy hỏng**

Chạy: `pnpm vitest run tests/unit/levels.test.ts`
Kỳ vọng: FAIL, `LEVELS.k12.topics` là `undefined`.

- [ ] **Step 3: Thêm liên kết vào `components/level/levels.ts`**

Thêm `import type { DocId } from '@/content/docs/slugs'` và `import type { TopicId } from '@/content/topics'`; kiểu của `LEVELS` thêm `topics: TopicId[]; docs: DocId[]`; giá trị:

```ts
  k12: { /* page, screens, icons như cũ */ topics: ['test-generator', 'test-versions', 'lesson-plans', 'lesson-slides'], docs: ['create-a-test', 'export-test-versions', 'lesson-plans', 'lesson-slides'] },
  university: { /* ... */ topics: ['course-syllabus'], docs: ['adding-documents', 'using-the-assistant'] },
  program: { /* ... */ topics: ['course-syllabus', 'vs-chatgpt'], docs: ['adding-documents', 'using-the-assistant'] },
```

- [ ] **Step 4: Chữ của trang cấp**

`messages/vi.json`: thêm namespace `levelCommon` và đổi ba `hero.h1`:

```json
"levelCommon": {
  "topicsEyebrow": "Đọc sâu từng việc",
  "topicsH2": "Trang chủ đề của cấp này",
  "docsEyebrow": "Hướng dẫn",
  "docsH2": "Làm từng bước trong app",
  "faqEyebrow": "Hỏi đáp",
  "faqH2": "Câu hỏi thường gặp"
}
```

- `levels.k12.hero.h1`: `AI cho giáo viên phổ thông: đề kiểm tra, giáo án và slide cho từng tiết dạy`
- `levels.university.hero.h1`: `AI cho giảng viên: từ bài giảng tới đề cương có chữ ký duyệt`
- `levels.program.hero.h1`: `Rà soát chương trình đào tạo trên bản sao số, tại một ngày xét`

Sửa câu của màn kết quả đề (spec §8.2: đề chạy `appFacts.testGates` cổng áp dụng trong bảng P1..P12, không phải 12):

- `levels.k12.screens.s2.title`: vi `Kết quả và cổng chất lượng`, en `Results and quality gates`
- `levels.k12.screens.s2.desc`: vi `Bảng cổng P1..P12 in số đơn vị đã kiểm, đề kiểm tra chạy 8 cổng áp dụng; cảnh báo đáp án phải được xác nhận từng câu.`, en `The P1..P12 gate table reports how many units each gate checked, and a test runs the 8 gates that apply; answer warnings must be confirmed item by item.`

Thêm `faq` vào mỗi cấp (cùng hình dạng ở cả ba cấp, test `the three level namespaces share one shape` giữ xanh):

`levels.k12.faq`:

```json
{
  "q1": { "q": "EduFlow giúp giáo viên phổ thông soạn những gì?", "a": "Đề kiểm tra trắc nghiệm theo ma trận bốn mức, trộn nhiều mã đề kèm bản đặc tả, đáp án và hướng dẫn chấm; giáo án theo Công văn 5512; slide bài giảng có quiz. Máy dựng khung, AI điền nội dung, thầy cô duyệt và ký." },
  "q2": { "q": "Đề kiểm tra có những dạng câu nào?", "a": "Bản hiện tại soạn câu trắc nghiệm nhiều lựa chọn. Câu đúng sai, trả lời ngắn và tự luận có ý nằm trong lộ trình của EduFlow." },
  "q3": { "q": "Một đề trộn được bao nhiêu mã?", "a": "Tối đa 24 mã đề. Thứ tự câu và phương án được trộn theo khoá cố định, nên in lại vẫn ra đúng các mã cũ; đáp án và hướng dẫn chấm nằm ở tệp riêng." },
  "q4": { "q": "Đáp án do AI viết có đáng tin không?", "a": "Một lượt AI khác giải lại đề. Câu bị đổi đáp án hiện thành cảnh báo, và thầy cô xác nhận từng câu trước khi duyệt." },
  "q5": { "q": "AI có tự xuất bản đề hay giáo án không?", "a": "Không. Nội dung AI mang nhãn Đề xuất cho tới khi thầy cô duyệt, cổng chất lượng không có nút bỏ qua, và chỉ người dùng mới ký. Bản xuất mang dấu chìm DÙNG THỬ cho tới khi thầy cô ký." }
}
```

`levels.university.faq`:

```json
{
  "q1": { "q": "EduFlow giúp giảng viên những việc gì?", "a": "Từ bài giảng, EduFlow đề xuất chuẩn đầu ra học phần (CLO), kế hoạch tuần, giáo án buổi, slide, đánh giá và đề cương 10 mục; mỗi phần có cổng kiểm, và trưởng bộ môn ký duyệt qua gói đã ký." },
  "q2": { "q": "CLO được kiểm thế nào?", "a": "Bộ CLO phải đủ các trường của mẫu chuẩn và động từ khớp bậc Bloom; cổng G3 bắt chỗ lệch bậc. Giảng viên quyết định câu chữ cuối cùng." },
  "q3": { "q": "Bài giảng có bị gửi đi không?", "a": "Bài giảng được bóc tách tại máy, không gửi nội dung đi. Dự án và hiện vật nằm ở máy của giảng viên." },
  "q4": { "q": "Đề cương học phần gồm những gì?", "a": "Mười mục theo mẫu chuẩn, mỗi đoạn kèm nguồn, dựng từ CLO, kế hoạch tuần và đánh giá đã duyệt. Mục chỉ chuyển sang đã duyệt khi giảng viên bấm Đạt." },
  "q5": { "q": "Trưởng bộ môn duyệt thế nào?", "a": "Giảng viên gửi gói đã ký. Phiên bản đã ký bị khoá sửa, mã băm được máy chủ công chứng mà không thấy nội dung, nên trưởng bộ môn xác minh được gói mình nhận." }
}
```

`levels.program.faq`:

```json
{
  "q1": { "q": "Rà soát chương trình đào tạo trên EduFlow gồm những gì?", "a": "Nạp hồ sơ CTĐT và gói đề cương, dựng bản sao số có xuất xứ của từng cạnh, rồi rà ba tầng: tất định, đối sánh, đề xuất. Kết quả là tài liệu làm việc nội bộ, không phải báo cáo tự đánh giá." },
  "q2": { "q": "Rà soát tại một ngày xét nghĩa là gì?", "a": "Mọi kết quả gắn với một ngày xét. Căn cứ đã hết hiệu lực, căn cứ sắp hết hiệu lực và căn cứ chưa tới hiệu lực tại ngày đó là ba con số riêng, không cộng thành một." },
  "q3": { "q": "Curriculum map được kiểm những gì?", "a": "Bảy phép kiểm: bao phủ PLO, bao phủ PI, progression, 5T, overload, gap và duplication. Mỗi phép in số đơn vị đã kiểm, và phép kiểm 0 đơn vị là lỗi, không bao giờ là đạt." },
  "q4": { "q": "Lớp phủ tiêu chí hoạt động thế nào?", "a": "Mỗi tiêu chí theo Thông tư 04/2025 có đúng một trạng thái: có minh chứng, minh chứng hết hạn hoặc chưa thấy. Đề xuất của tầng 3 cần người duyệt mới vào báo cáo." },
  "q5": { "q": "Thử thay đổi chương trình trước khi sửa thật được không?", "a": "Được. Kịch bản “nếu” thử bỏ một học phần hay đổi một PLO trên bản sao của đồ thị, cho thấy đường lan tới tiêu chí, chạy tại máy, 0 đồng." }
}
```

`messages/en.json`, cùng khoá:

```json
"levelCommon": {
  "topicsEyebrow": "Go deeper",
  "topicsH2": "Topic pages for this level",
  "docsEyebrow": "Guides",
  "docsH2": "Step by step in the app",
  "faqEyebrow": "FAQ",
  "faqH2": "Frequently asked questions"
}
```

- `levels.k12.hero.h1`: `AI for teachers: test papers, lesson plans and slides for every lesson`
- `levels.university.hero.h1`: `AI for lecturers: from lecture materials to a signed course syllabus`
- `levels.program.hero.h1`: `Curriculum review on a digital twin of your degree program, at a review date`

`levels.k12.faq` (en):

```json
{
  "q1": { "q": "What can EduFlow prepare for K-12 teachers?", "a": "Multiple-choice tests built from a four-level matrix, shuffled into several versions with the test specification, answer key and marking guide; Official Letter 5512 lesson plans; lesson slides with quizzes. The app builds the structure, AI fills in the content, and you review and sign." },
  "q2": { "q": "Which question types can a test have?", "a": "The current release writes multiple-choice questions. True or false, short-answer and structured essay questions are on the EduFlow roadmap." },
  "q3": { "q": "How many versions can one test have?", "a": "Up to 24 test versions. Questions and options are shuffled with a fixed key, so printing again gives the same versions; the answer key and marking guide are separate files." },
  "q4": { "q": "Can I trust answer keys written by AI?", "a": "A second AI pass solves the test again. Any item whose answer changes becomes a warning, and you confirm each item before approving." },
  "q5": { "q": "Does AI publish a test or lesson plan on its own?", "a": "No. AI content carries the Suggestion label until you approve it, quality gates have no skip button, and only people sign. Exports carry the TRIAL (DÙNG THỬ) watermark until you sign." }
}
```

`levels.university.faq` (en):

```json
{
  "q1": { "q": "What does EduFlow do for lecturers?", "a": "From your lecture materials, EduFlow suggests course learning outcomes (CLOs), a weekly plan, session plans, slides, assessments and a 10-section course syllabus; each part has gates, and the head of department signs off through a signed package." },
  "q2": { "q": "How are CLOs checked?", "a": "A CLO set must have every field of the standard template, with verbs that match the Bloom level; gate G3 catches level mismatches. You decide the final wording." },
  "q3": { "q": "Are my lecture materials sent anywhere?", "a": "Lecture materials are parsed on your computer; their content is never sent out. Projects and artifacts stay on your computer." },
  "q4": { "q": "What does a course syllabus contain?", "a": "Ten sections following the standard template, each paragraph with its source, built from the approved CLOs, weekly plan and assessments. A section only becomes approved when you mark it as passed." },
  "q5": { "q": "How does the head of department approve?", "a": "You send a signed package. A signed version is locked against edits and the server notarizes its hash without seeing the content, so the head of department can verify the package." }
}
```

`levels.program.faq` (en):

```json
{
  "q1": { "q": "What does curriculum review in EduFlow cover?", "a": "Load the degree program records and the course syllabus package, build a digital twin with the provenance of every edge, then review in three tiers: deterministic, comparative, suggestion. The result is an internal working document, not a self-assessment report." },
  "q2": { "q": "What does reviewing at a review date mean?", "a": "Every result is tied to a review date. Bases that have expired, bases about to expire and bases not yet in force on that date are three separate figures, never added into one." },
  "q3": { "q": "What do the curriculum map checks cover?", "a": "Seven checks: PLO coverage, PI coverage, progression, 5T, overload, gap and duplication. Each check reports how many units it checked, and a check of 0 units is an error, never a pass." },
  "q4": { "q": "How does the criteria overlay work?", "a": "Each criterion of Circular 04/2025 has exactly one status: evidence found, evidence expired or not found. Tier 3 suggestions need a person's approval before they enter a report." },
  "q5": { "q": "Can I test a change before making it?", "a": "Yes. A what-if scenario drops a course or changes a PLO on a copy of the graph and shows how the change spreads to the criteria, on your computer, at no cost." }
}
```

- [ ] **Step 5: Khối mới trong `LevelPage`**

Trong `components/level/LevelPage.tsx`: lấy thêm `getTranslations('levelCommon')` (biến `tl`); ngay sau `<Section>` của khối cổng chất lượng và trước `<CtaBand>`, chèn:

```tsx
      <Section className="pt-0 md:pt-0">
        <Container className="flex flex-col gap-12">
          <section className="flex flex-col gap-6">
            <SectionHead align="left" eyebrow={tl('topicsEyebrow')} title={tl('topicsH2')} />
            <ul className="grid gap-4 md:grid-cols-2">
              {cfg.topics.map((id) => (
                <li key={id}>
                  <Link href={topicPage(id)} className="flex min-h-11 flex-col gap-1.5 rounded-card border border-line bg-card p-5 hover:border-muted">
                    <span className="font-semibold">{topicCopy(locale, id).name}</span>
                    <span className="text-[14.5px] text-ink2">{topicCopy(locale, id).card}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
          <section className="flex flex-col gap-6">
            <SectionHead align="left" eyebrow={tl('docsEyebrow')} title={tl('docsH2')} />
            <ul className="grid gap-4 md:grid-cols-2">
              {cfg.docs.map((id) => (
                <li key={id}>
                  <Link href={docHref(locale, id)} className="flex min-h-11 flex-col gap-1.5 rounded-card border border-line bg-card p-5 hover:border-muted">
                    <span className="font-semibold">{DOCS[id][locale].title}</span>
                    <span className="text-[14.5px] text-ink2">{DOCS[id][locale].description}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </Container>
      </Section>

      <Section className="border-t border-line bg-card">
        <Container>
          <SectionHead eyebrow={tl('faqEyebrow')} title={tl('faqH2')} />
          <Faq items={faq} />
        </Container>
      </Section>
```

với, ở đầu thân hàm (sau `const cfg = LEVELS[level]`):

```tsx
  const faq = (['q1', 'q2', 'q3', 'q4', 'q5'] as const).map((k) => ({ id: `${level}-${k}`, q: t(`faq.${k}.q`), a: t(`faq.${k}.a`) }))
  const seo = staticSeo(locale, cfg.page)
  const url = absoluteUrl(locale, cfg.page)
```

và cạnh JSON-LD breadcrumb hiện có, thêm:

```tsx
      <JsonLd data={webPage({ url, name: finalTitle(seo), description: seo.description, locale, about: pageName(locale, cfg.page) })} />
      <JsonLd data={faqPage(faq)} />
```

Đồng thời đổi tên trong breadcrumb JSON-LD hiện có từ `t('hero.eyebrow')` thành `pageName(locale, cfg.page)` (anchor là từ khoá chính). Import: `Faq` (`@/components/home/Faq`), `Link` (`@/i18n/navigation`), `DOCS, docHref` (`@/content/docs`), `topicCopy, topicPage` (`@/content/topics`), `faqPage, webPage` (`@/lib/seo/jsonld`), `finalTitle, pageName, staticSeo` (`@/lib/seo/pages`).

- [ ] **Step 6: Chạy test, e2e, commit**

```bash
pnpm vitest run tests/unit/levels.test.ts tests/unit/i18n.test.ts tests/unit/app-facts.test.ts tests/unit/content.test.ts && pnpm verify
```

Kỳ vọng: PASS, xanh. Chạy E2E-FEED với `pnpm e2e tests/e2e/pages.spec.ts tests/e2e/mobile.spec.ts`. Kỳ vọng: PASS.

```bash
git add components/level messages tests/unit/levels.test.ts tests/e2e/pages.spec.ts
git commit -m "feat(levels): trang cấp dẫn tới trang chủ đề và hướng dẫn, hỏi đáp 5 câu, WebPage"
```

---

### Task 22: Chữ trang chủ, hỏi đáp 10 câu và footer năm cột

Viết chữ cho 14 khối của trang chủ (spec §6, §10.1: chữ trước canvas), hỏi đáp 10 câu dựng FAQPage từ cùng mảng, và footer năm cột (spec §4.4) để mọi trang chủ đề có link từ mọi trang. Các khối mới (dải dữ kiện, tính năng xen trái phải, tab vai trò, hướng dẫn nổi bật) do Kế hoạch 2 dựng theo canvas; ở đây chỉ có chữ và dữ liệu liên kết có kiểu.

**Files:**
- Create: `content/home.ts`, `tests/unit/home.test.ts`
- Modify: `messages/vi.json`, `messages/en.json` (namespace `home`, `footer`), `components/home/FaqSection.tsx`, `components/home/Faq.tsx`, `app/[locale]/page.tsx`, `components/site/Footer.tsx`, `tests/e2e/pages.spec.ts`

**Interfaces:**
- Consumes: `brand.description` (Task 2), `TOPIC_IDS`, `topicCopy`, `topicPage`, `DOCS`, `docHref`, `QUICK_START`, `pageName`, `appFacts`.
- Produces:
  - `content/home.ts`: `HOME_FAQ_KEYS = ['q1', ..., 'q10'] as const`; `HOME_LINKS: { features: Record<'tests' | 'lessons' | 'assistant' | 'syllabus', Array<{ topic: TopicId } | { page: '/assistant' | '/program' }>>; roles: Record<'teacher' | 'head' | 'lecturer' | 'qa', DocId>; docs: DocId[] }`; `HOME_FACTS: { levels: number; versions: number; localCost: number }`.
  - `Faq` nhận thêm `link?: { href: ComponentProps<typeof Link>['href']; label: string }` mỗi mục.

- [ ] **Step 1: Viết test hỏng**

`tests/unit/home.test.ts`:

```ts
import { expect, test } from 'vitest'
import { HOME_FACTS, HOME_FAQ_KEYS, HOME_LINKS } from '@/content/home'
import { DOC_IDS } from '@/content/docs/slugs'
import { TOPIC_IDS } from '@/content/topics'
import { appFacts } from '@/lib/seo/app-facts'
import { brand } from '@/lib/seo/brand'
import en from '@/messages/en.json'
import vi from '@/messages/vi.json'

test('the home FAQ shows every question in messages, ten of them (spec §6.12)', () => {
  for (const m of [vi, en]) expect(Object.keys(m.home.faq).filter((k) => /^q\d+$/.test(k))).toEqual([...HOME_FAQ_KEYS])
  expect(HOME_FAQ_KEYS).toHaveLength(10)
})

test('"What is EduFlow?" is answered with the canonical description, word for word', () => {
  expect(vi.home.faq.q9.a.startsWith(brand.description.vi)).toBe(true)
  expect(en.home.faq.q9.a.startsWith(brand.description.en)).toBe(true)
})

test('the home H1 is the category sentence with the primary keyword', () => {
  expect(vi.home.hero.h1.toLowerCase()).toContain('phần mềm ai cho giáo viên')
  expect(en.home.hero.h1.toLowerCase()).toContain('ai software for teachers')
})

test('home links point at real topics and guides, and the facts come from app-facts', () => {
  for (const links of Object.values(HOME_LINKS.features)) for (const l of links) if ('topic' in l) expect(TOPIC_IDS).toContain(l.topic)
  for (const d of [...Object.values(HOME_LINKS.roles), ...HOME_LINKS.docs]) expect(DOC_IDS).toContain(d)
  expect(HOME_FACTS).toEqual({ levels: appFacts.levels, versions: appFacts.maxTestVersions, localCost: appFacts.localWorkCostVnd })
})
```

Trong `tests/e2e/pages.spec.ts` thêm:

```ts
// Spec §6.12, §12.1: FAQPage của trang chủ dựng từ đúng 10 câu đang hiển thị; câu 10 dẫn tới trang EduFlow và ChatGPT.
for (const path of ['/', '/en']) {
  test(`${path} FAQPage matches the ten questions shown`, async ({ page }) => {
    await page.goto(path)
    const shown = (await page.locator('main details summary').allTextContents()).map((s) => s.trim())
    expect(shown).toHaveLength(10)
    const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).map((s) => JSON.parse(s))
    expect(ld.find((d) => d['@type'] === 'FAQPage').mainEntity.map((q: { name: string }) => q.name)).toEqual(shown)
    await expect(page.locator('main details').last().locator('a')).toHaveAttribute('href', path === '/' ? '/eduflow-va-chatgpt' : '/en/eduflow-vs-chatgpt')
  })
}

// Spec §4.4: footer dẫn tới mọi trang chủ đề trên mọi trang.
test('the footer links every topic page', async ({ page }) => {
  await page.goto('/tai-ve')
  for (const href of ['/ai-tao-de-kiem-tra-theo-ma-tran', '/tron-de-trac-nghiem', '/ai-soan-giao-an', '/tao-slide-bai-giang-bang-ai', '/de-cuong-chi-tiet-hoc-phan', '/eduflow-va-chatgpt']) {
    await expect(page.locator(`footer a[href="${href}"]`)).toHaveCount(1)
  }
})
```

- [ ] **Step 2: Chạy test để thấy hỏng**

Chạy: `pnpm vitest run tests/unit/home.test.ts`
Kỳ vọng: FAIL, `Failed to resolve import "@/content/home"`.

- [ ] **Step 3: Dữ liệu liên kết của trang chủ**

`content/home.ts`:

```ts
import type { DocId } from '@/content/docs/slugs'
import type { TopicId } from '@/content/topics'
import { appFacts } from '@/lib/seo/app-facts'

/** Mười câu hỏi đáp của trang chủ, đúng thứ tự hiển thị; FAQPage dựng từ chính danh sách này (spec §6.12). */
export const HOME_FAQ_KEYS = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10'] as const

/** Đích link của các khối trang chủ (spec §4.5, §6): hub dẫn tới mọi pillar và mọi spoke. Chữ ở messages `home`. */
export const HOME_LINKS: {
  features: Record<'tests' | 'lessons' | 'assistant' | 'syllabus', Array<{ topic: TopicId } | { page: '/assistant' | '/program' }>>
  roles: Record<'teacher' | 'head' | 'lecturer' | 'qa', DocId>
  docs: DocId[]
} = {
  features: {
    tests: [{ topic: 'test-generator' }, { topic: 'test-versions' }],
    lessons: [{ topic: 'lesson-plans' }, { topic: 'lesson-slides' }],
    assistant: [{ page: '/assistant' }],
    syllabus: [{ topic: 'course-syllabus' }, { page: '/program' }],
  },
  roles: { teacher: 'create-a-test', head: 'export-test-versions', lecturer: 'adding-documents', qa: 'using-the-assistant' },
  docs: ['activation-and-trial', 'create-a-test', 'lesson-plans', 'using-the-assistant'],
}

/** Số của dải dữ kiện (spec §6.3): luôn lấy từ app-facts, nhãn ở messages `home.facts`. */
export const HOME_FACTS = { levels: appFacts.levels, versions: appFacts.maxTestVersions, localCost: appFacts.localWorkCostVnd }
```

`components/home/FaqSection.tsx`: xoá hằng `FAQ_KEYS`, dùng `HOME_FAQ_KEYS` từ `@/content/home`; `faqItems` thêm link cho câu 10:

```tsx
export function faqItems(t: (key: string) => string) {
  return HOME_FAQ_KEYS.map((id) => ({
    id,
    q: t(`${id}.q`),
    a: t(`${id}.a`),
    // Câu 10 dẫn tới trang so sánh (spec §6.12); anchor là tên trang đó.
    ...(id === 'q10' ? { link: { href: '/vs-chatgpt' as const, label: t('q10.link') } } : {}),
  }))
}
```

`components/home/Faq.tsx`: kiểu mục thêm `link?: { href: ComponentProps<typeof Link>['href']; label: string }`; dưới thẻ `<p>` câu trả lời, thêm

```tsx
          {link ? (
            <p className="-mt-3 pb-5">
              <Link href={link.href} className="font-semibold text-accent-strong underline underline-offset-2 hover:text-ink">{link.label}</Link>
            </p>
          ) : null}
```

(import `Link` từ `@/i18n/navigation`, `ComponentProps` từ `react`; destructure `link` cùng `id, q, a`).

`app/[locale]/page.tsx`: JSON-LD FAQ dựng từ cùng hàm: `faqPage(faqItems((k) => t(k as Parameters<typeof t>[0])))` (import `faqItems`, bỏ `FAQ_KEYS`).

- [ ] **Step 4: Chữ trang chủ**

`messages/vi.json`, trong `home`:

- `hero.h1`: `Phần mềm AI cho giáo viên: soạn đề kiểm tra, giáo án và đề cương học phần`
- `hero.sub`: `Cho giáo viên phổ thông, giảng viên và Phòng Đảm bảo chất lượng. Máy dựng khung chuẩn, AI điền nội dung, thầy cô duyệt và ký.`
- `hero` thêm: `"ctaDocs": "Xem hướng dẫn"`, `"stats": { "versions": "mã đề tối đa mỗi đề", "gates": "cổng kiểm mỗi đề kiểm tra" }`
- thêm các khối:

```json
"facts": {
  "levels": "cấp trong một app",
  "versions": "mã đề tối đa mỗi đề",
  "local": "đồng cho mọi việc chạy tại máy",
  "platforms": "macOS và Windows: Apple Silicon, Intel, x64"
},
"features": {
  "eyebrow": "Làm được gì",
  "h2": "Mỗi việc soạn có khung chuẩn, AI điền và người duyệt",
  "tests": { "tag": "Đề kiểm tra", "title": "Đề theo ma trận và nhiều mã đề", "body": "Lập ma trận chủ đề theo bốn mức, để AI viết câu hỏi, rồi trộn tối đa 24 mã đề theo khoá cố định. Máy kiểm cổng, thầy cô duyệt từng câu." },
  "lessons": { "tag": "Giáo án và slide", "title": "Giáo án 5512 và slide có quiz", "body": "Chọn bài trong khung chương trình GDPT 2018, để AI viết bốn hoạt động của giáo án và nội dung slide, chèn quiz ngay trong slide, xem trước rồi xuất." },
  "assistant": { "tag": "Trợ lý AI", "title": "Trợ lý luôn có mặt", "body": "Hỏi ở trang chủ hay ngay cạnh màn đang làm. Trợ lý hiểu màn đang mở, đề xuất vào bản nháp, hiện chi phí trước khi chạy, và không ký thay ai." },
  "syllabus": { "tag": "Học phần và chương trình", "title": "Đề cương học phần và rà soát chương trình", "body": "Giảng viên đi từ bài giảng tới CLO, kế hoạch tuần và đề cương; Phòng Đảm bảo chất lượng rà chương trình đào tạo trên bản sao số tại một ngày xét." }
},
"roles": {
  "eyebrow": "Theo vai trò",
  "h2": "Việc hằng ngày của từng người trong trường",
  "teacher": { "label": "Giáo viên phổ thông", "b1": "Soạn đề kiểm tra giữa kỳ theo ma trận của tổ", "b2": "Trộn mã đề và in kèm đáp án, hướng dẫn chấm", "b3": "Soạn giáo án và slide cho tiết dạy tuần tới" },
  "head": { "label": "Tổ trưởng chuyên môn", "b1": "Soát ma trận và bản đặc tả trước khi giao đề", "b2": "Đọc bảng cổng chất lượng của từng đề", "b3": "Kiểm giáo án theo khung Công văn 5512" },
  "lecturer": { "label": "Giảng viên", "b1": "Viết CLO khớp bậc Bloom từ bài giảng", "b2": "Lập kế hoạch tuần và giáo án buổi", "b3": "Hoàn thiện đề cương 10 mục để trưởng bộ môn duyệt" },
  "qa": { "label": "Phòng Đảm bảo chất lượng", "b1": "Dựng bản sao số của chương trình đào tạo", "b2": "Rà curriculum map và hiệu lực văn bản tại ngày xét", "b3": "Thử kịch bản “nếu” trước khi sửa chương trình" }
},
"docsHighlights": { "eyebrow": "Hướng dẫn", "h2": "Bắt đầu từ bài phù hợp với việc của thầy cô", "all": "Tất cả hướng dẫn" }
```

- `faq` thêm hai câu:

```json
"q9": { "q": "EduFlow là gì?", "a": "EduFlow là phần mềm AI cho giáo viên và giảng viên: soạn đề kiểm tra theo ma trận, giáo án, slide, đề cương học phần, có trợ lý AI và người duyệt. EduFlow là ứng dụng desktop của Agentra JSC cho macOS và Windows." },
"q10": { "q": "EduFlow khác ChatGPT thế nào?", "a": "ChatGPT là trợ lý trò chuyện đa năng, hợp để lấy ý tưởng hay viết nháp nhanh. EduFlow dựng sẵn khung chuẩn của từng việc soạn: ma trận và bản đặc tả, nhiều mã đề, giáo án 5512, cổng chất lượng, người duyệt và ký, dữ liệu nằm ở máy thầy cô.", "link": "EduFlow và ChatGPT" }
```

`messages/en.json`, cùng khoá:

- `hero.h1`: `AI software for teachers: test papers, lesson plans and course syllabi`
- `hero.sub`: `For K-12 teachers, lecturers and quality assurance offices. The app builds the standard structure, AI fills in the content, and you review and sign.`
- `hero.ctaDocs`: `Read the guides`; `hero.stats`: `{ "versions": "test versions per test, at most", "gates": "gates checked on every test" }`

```json
"facts": {
  "levels": "levels in one app",
  "versions": "test versions per test, at most",
  "local": "VND for anything that runs on your computer",
  "platforms": "macOS and Windows: Apple Silicon, Intel, x64"
},
"features": {
  "eyebrow": "What it does",
  "h2": "Every piece of preparation has a standard structure, AI to fill it, and a person to approve it",
  "tests": { "tag": "Tests", "title": "Blueprint-based tests and test versions", "body": "Build a topic matrix across four levels, let AI write the items, then shuffle up to 24 test versions with a fixed key. Gates check the test; you review each item." },
  "lessons": { "tag": "Lesson plans and slides", "title": "5512 lesson plans and slides with quizzes", "body": "Pick a lesson from the 2018 general education curriculum, let AI draft the four activities of the lesson plan and the slides, add quizzes inside the deck, preview, export." },
  "assistant": { "tag": "AI assistant", "title": "An assistant that is always there", "body": "Ask on the home screen or right beside the screen you are working on. The assistant reads that screen, suggests changes to a draft, shows the cost before running, and never signs for anyone." },
  "syllabus": { "tag": "Courses and programs", "title": "Course syllabi and curriculum review", "body": "Lecturers go from lecture materials to CLOs, a weekly plan and a syllabus; the quality assurance office reviews the degree program on a digital twin at a review date." }
},
"roles": {
  "eyebrow": "By role",
  "h2": "The daily work of everyone in the school",
  "teacher": { "label": "K-12 teacher", "b1": "Write a midterm test from the subject group's blueprint", "b2": "Shuffle test versions and print them with keys and a marking guide", "b3": "Prepare the lesson plan and slides for next week's lesson" },
  "head": { "label": "Head of subject group", "b1": "Check the blueprint and specification before a test goes out", "b2": "Read the quality gate table of every test", "b3": "Check lesson plans against the Official Letter 5512 template" },
  "lecturer": { "label": "Lecturer", "b1": "Write CLOs that match Bloom levels from your lectures", "b2": "Plan the weeks and the sessions", "b3": "Finish the 10-section syllabus for the head of department to approve" },
  "qa": { "label": "Quality assurance office", "b1": "Build a digital twin of the degree program", "b2": "Review the curriculum map and legal validity at a review date", "b3": "Run what-if scenarios before changing the program" }
},
"docsHighlights": { "eyebrow": "Guides", "h2": "Start with the guide that fits your work", "all": "All guides" }
```

```json
"q9": { "q": "What is EduFlow?", "a": "EduFlow is AI software for teachers and lecturers: matrix-based tests, lesson plans, slides and course syllabi, with an AI assistant and human review. EduFlow is a desktop app by Agentra JSC for macOS and Windows." },
"q10": { "q": "How is EduFlow different from ChatGPT?", "a": "ChatGPT is a general-purpose chat assistant, good for ideas and quick drafts. EduFlow builds the standard structure of each piece of preparation: blueprint and specification, test versions, 5512 lesson plans, quality gates, review and sign-off, with your data on your computer.", "link": "EduFlow vs ChatGPT" }
```

Câu `home.facts.local` (en) có chữ "VND": con số do Kế hoạch 2 ghép từ `HOME_FACTS.localCost`, hiện "0 VND for anything that runs on your computer".

- [ ] **Step 5: Footer năm cột**

Viết lại phần lưới trong `components/site/Footer.tsx` (giữ khối thương hiệu, dòng cuối và `linkClass`):

```tsx
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.3fr_repeat(5,minmax(0,1fr))] lg:gap-8">
          {/* khối thương hiệu giữ nguyên */}
          <FooterColumn title={t('product')}>
            <Link href="/k12" className={linkClass}>{pageName(locale, '/k12')}</Link>
            <Link href="/university" className={linkClass}>{pageName(locale, '/university')}</Link>
            <Link href="/program" className={linkClass}>{pageName(locale, '/program')}</Link>
            <Link href="/assistant" className={linkClass}>{tn('assistant')}</Link>
            <Link href="/pricing" className={linkClass}>{tn('pricing')}</Link>
            <Link href="/download" className={linkClass}>{tn('download')}</Link>
          </FooterColumn>
          <FooterColumn title={t('solutions')}>
            {TOPIC_IDS.map((id) => (
              <Link key={id} href={topicPage(id)} className={linkClass}>{topicCopy(locale, id).name}</Link>
            ))}
          </FooterColumn>
          <FooterColumn title={t('guides')}>
            {QUICK_START.map((id) => (
              <Link key={id} href={docHref(locale, id)} className={linkClass}>{DOCS[id][locale].title}</Link>
            ))}
            <Link href="/docs" className={linkClass}>{t('allDocs')}</Link>
          </FooterColumn>
          <FooterColumn title={t('trust')}>
            <Link href="/ai-transparency" className={linkClass}>{tn('transparency')}</Link>
            <Link href="/privacy" className={linkClass}>{t('privacy')}</Link>
          </FooterColumn>
          <FooterColumn title={t('company')}>
            <a href={site.companyUrl} className={linkClass} rel="noopener">{site.company}</a>
            <Link href="/contact" className={linkClass}>{tn('contact')}</Link>
            <a href={`mailto:${site.email}`} className={`${linkClass} break-all`}>{site.email}</a>
          </FooterColumn>
        </div>
```

`FooterColumn`: nhãn cột là `<p>` (spec §4.4: không phải heading): đổi `<span className=...>{title}</span>` thành `<p className="text-[13px] font-bold tracking-[0.5px] text-muted uppercase">{title}</p>`. Thêm khoá `footer.solutions`: vi `"Giải pháp"`, en `"Solutions"`. Import `pageName` (`@/lib/seo/pages`), `TOPIC_IDS, topicCopy, topicPage` (`@/content/topics`), `DOCS, docHref, QUICK_START` (`@/content/docs`).

- [ ] **Step 6: Chạy test, e2e, xem bằng mắt**

```bash
pnpm vitest run && pnpm verify
```

Kỳ vọng: PASS, xanh (`app-facts.test.ts` kiểm "tối đa 24 mã đề", "bốn mức", "0 đồng" mới viết).
Chạy E2E-FEED (toàn bộ). Kỳ vọng: PASS, gồm các test không cuộn ngang ở 640, 768, 820, 1024 px (footer sáu cột). `pnpm dev`, mở `/` ở 1024 và 1280 px: footer không tràn, chữ dài xuống dòng.

- [ ] **Step 7: Commit**

```bash
git add content/home.ts components/home/FaqSection.tsx components/home/Faq.tsx "app/[locale]/page.tsx" components/site/Footer.tsx messages tests/unit/home.test.ts tests/e2e/pages.spec.ts
git commit -m "feat(home): chữ trang chủ 14 khối, hỏi đáp 10 câu, footer năm cột dẫn mọi trang chủ đề"
```

---

### Task 23: `llms.txt` và `llms-full.txt`

Bản đồ site cho mô hình AI theo llmstxt.org, sinh từ đúng các module nội dung và sổ trang (spec §9.1). Chép khuôn `lib/seo/llms.ts` của DocOps.

**Files:**
- Create: `lib/seo/llms.ts`, `app/llms.txt/route.ts`, `app/llms-full.txt/route.ts`, `tests/unit/llms.test.ts`
- Modify: `tests/e2e/og.spec.ts` (đổi tên thành `tests/e2e/static-routes.spec.ts`)

**Interfaces:**
- Consumes: `brand`, `appFacts`, `operatingSystems` (Task 8), `indexablePages`, `pageUrl`, `TOPIC_IDS`, `TOPICS`, `TOPIC_META`, `HOME_FAQ_KEYS`, messages.
- Produces: `type LlmsInput = { release: { version: string; releaseDate: string } | null }`, `llmsTxt(input: LlmsInput): string`, `llmsFullTxt(): string`.

- [ ] **Step 1: Viết test hỏng**

`tests/unit/llms.test.ts`:

```ts
import { beforeAll, expect, test } from 'vitest'
import { TOPIC_IDS, TOPICS } from '@/content/topics'
import { brand } from '@/lib/seo/brand'
import { llmsFullTxt, llmsTxt } from '@/lib/seo/llms'
import { indexablePages, pageUrl } from '@/lib/seo/pages'

const SITE = 'https://eduflow.agentra.io.vn'
beforeAll(() => {
  process.env.NEXT_PUBLIC_SITE_URL = SITE
})

test('llms.txt opens with the canonical description and the disambiguation', () => {
  const txt = llmsTxt({ release: { version: '1.0.0', releaseDate: '2026-10-01T02:00:00.000Z' } })
  expect(txt.startsWith(`# EduFlow\n\n> ${brand.description.vi}\n\n${brand.description.en}\n`)).toBe(true)
  expect(txt).toContain(brand.disambiguation.vi)
  expect(txt).toContain(brand.disambiguation.en)
  expect(txt).toContain('1.0.0 (2026-10-01)')
  expect(llmsTxt({ release: null })).not.toMatch(/Latest version/)
})

// Spec §12.1: llms.txt liệt kê đúng tập trang indexable, trên gốc canonical.
test('llms.txt links exactly the indexable pages, on the canonical origin', () => {
  const txt = llmsTxt({ release: null })
  const links = [...txt.matchAll(/\]\((https?:[^)]+)\)/g)].map((m) => m[1])
  const pages = indexablePages().flatMap((p) => [pageUrl(p, 'vi'), pageUrl(p, 'en')])
  expect(links.filter((l) => !l.endsWith('.txt') && !l.endsWith('.xml')).sort()).toEqual([...pages].sort())
  for (const l of links) expect(l.startsWith(SITE)).toBe(true)
  expect(txt).toContain(`${SITE}/llms-full.txt`)
  expect(txt).toContain(`${SITE}/sitemap.xml`)
  expect(txt).not.toMatch(/localhost|vercel\.app/)
})

test('llms-full.txt carries every topic page and the home FAQ as shown', () => {
  const full = llmsFullTxt()
  for (const id of TOPIC_IDS) {
    for (const locale of ['vi', 'en'] as const) {
      const c = TOPICS[locale][id]
      expect(full).toContain(`## ${c.h1}`)
      expect(full).toContain(`**${c.definition.term}** ${c.definition.rest}`)
      for (const item of c.limits.items) expect(full).toContain(item)
      for (const f of c.faq) expect(full).toContain(f.a)
    }
  }
  expect(full).toContain(brand.description.vi)
  expect(full).not.toMatch(/\{\w+\}/)
})
```

`git mv tests/e2e/og.spec.ts tests/e2e/static-routes.spec.ts` rồi thêm vào cuối:

```ts
for (const path of ['/llms.txt', '/llms-full.txt']) {
  test(`${path} is served as UTF-8 plain text`, async ({ request }) => {
    const res = await request.get(path)
    expect(res.status()).toBe(200)
    expect(res.headers()['content-type']).toBe('text/plain; charset=utf-8')
    expect(await res.text()).toMatch(/^# EduFlow\n/)
  })
}
```

- [ ] **Step 2: Chạy test để thấy hỏng**

Chạy: `pnpm vitest run tests/unit/llms.test.ts`
Kỳ vọng: FAIL, `Failed to resolve import "@/lib/seo/llms"`.

- [ ] **Step 3: Viết `lib/seo/llms.ts`**

```ts
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
```

- [ ] **Step 4: Hai route**

`app/llms.txt/route.ts`:

```ts
import { getReleases, latestRelease } from '@/lib/releases'
import { llmsTxt } from '@/lib/seo/llms'

// Tái tạo cùng nhịp với feed phát hành (10 phút), để phiên bản mới nhất luôn đúng. Không đọc tệp nào lúc chạy.
export const revalidate = 600

export async function GET() {
  const { assets } = await getReleases()
  return new Response(llmsTxt({ release: latestRelease(assets) }), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
```

`app/llms-full.txt/route.ts`:

```ts
import { llmsFullTxt } from '@/lib/seo/llms'

// Sinh tĩnh lúc build; toàn văn chỉ đổi khi nội dung đổi (deploy mới).
export const dynamic = 'force-static'

export function GET() {
  return new Response(llmsFullTxt(), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
```

`proxy.ts` đã loại trừ mọi đường dẫn có dấu chấm (`.*\\..*`), nên hai route này không qua next-intl.

- [ ] **Step 5: Chạy test, e2e, commit**

```bash
pnpm vitest run tests/unit/llms.test.ts && pnpm verify
```

Kỳ vọng: PASS, xanh. Chạy E2E-FEED với `pnpm e2e tests/e2e/static-routes.spec.ts`. Kỳ vọng: PASS. Đọc `http://localhost:3200/llms.txt` một lượt: mỗi URL một dòng, mô tả đúng.

```bash
git add lib/seo/llms.ts app/llms.txt app/llms-full.txt tests/unit/llms.test.ts tests/e2e/static-routes.spec.ts
git commit -m "feat(seo): llms.txt và llms-full.txt sinh từ sổ trang và nội dung chủ đề"
```

---

### Task 24: Kiểm link nội bộ, cổng `seo-audit` trên CI và tài liệu vận hành

Khoá các bất biến SEO bằng máy: mọi trang tới được từ trang chủ trong ≤ 3 lần bấm, không link nội bộ nào qua chuyển hướng, sitemap đúng 58 URL, `seo-audit` thoát 0 trên CI (spec §1, §4.5, §12.3). Cập nhật tài liệu vận hành cho ngày ra mắt và theo dõi hằng tháng (spec §13.2, §13.3).

**Files:**
- Create: `tests/e2e/links.spec.ts`, `scripts/seo-audit.mjs` (chép nguyên văn)
- Modify: `.github/workflows/ci.yml`, `lighthouserc.json`, `tests/unit/ci-config.test.ts`, `tests/unit/seo-pages.test.ts`, `eslint.config.mjs` và `.prettierignore` (nếu cần), `README.md`, `docs/van-hanh.md`

**Interfaces:**
- Consumes: `LEGACY_REDIRECTS` (Task 4), `PAGES` (Task 6), `indexablePages` (Task 6).
- Produces: không.

- [ ] **Step 1: Viết test hỏng**

Thêm vào `tests/unit/seo-pages.test.ts`:

```ts
// Spec §1, §4.2: 17 trang và 12 bài, mỗi trang hai ngôn ngữ, là 58 URL.
test('the site has exactly 29 indexable pages, 58 URLs', () => {
  expect(indexablePages()).toHaveLength(29)
  expect(indexablePages().filter((p) => p.id.startsWith('topic:'))).toHaveLength(6)
  expect(indexablePages().filter((p) => p.id.startsWith('doc:'))).toHaveLength(12)
})
```

`tests/e2e/links.spec.ts`:

```ts
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
```

Thay test Lighthouse trong `tests/unit/ci-config.test.ts`:

```ts
test('Lighthouse CI measures the pages of spec §12.3 in both languages', () => {
  const urls: string[] = JSON.parse(read('lighthouserc.json')).ci.collect.url
  const paths = ['/', '/ai-cho-giao-vien', '/ai-tao-de-kiem-tra-theo-ma-tran', '/huong-dan/soan-de-kiem-tra', '/tai-ve', '/en', '/en/ai-for-teachers', '/en/ai-test-generator', '/en/docs/create-a-test', '/en/download']
  expect(urls).toEqual(paths.map((p) => `http://localhost:3200${p}`))
})

test('CI gates a production build with seo-audit on the canonical domain (spec §12.3)', () => {
  const ci = read('.github/workflows/ci.yml')
  expect(ci).toContain('node scripts/seo-audit.mjs --base http://localhost:3400 --canonical https://eduflow.agentra.io.vn --next-manifest .next/prerender-manifest.json')
  expect(ci).toMatch(/VERCEL_ENV: production, NEXT_PUBLIC_SITE_URL: 'https:\/\/eduflow\.agentra\.io\.vn'/)
  expect(read('scripts/seo-audit.mjs')).toContain('Exit code 1 when any error is found')
})
```

- [ ] **Step 2: Chạy test để thấy hỏng**

Chạy: `pnpm vitest run tests/unit/ci-config.test.ts tests/unit/seo-pages.test.ts`
Kỳ vọng: FAIL ở hai test CI (chưa có bước audit, danh sách Lighthouse cũ). Test 58 URL phải PASS (Task 11 tới 20 đã đủ); nếu đỏ, bài hay trang nào thiếu thì quay lại task đó.

- [ ] **Step 3: Chép script và thêm bước CI**

```bash
cp ~/.claude/skills/seo-master/scripts/seo-audit.mjs scripts/seo-audit.mjs
```

Thêm hai dòng đầu tệp (sau shebang nếu có):

```js
// Chép nguyên văn từ skill seo-master (scripts/seo-audit.mjs) ngày <ngày chép>, để CI không phụ thuộc thư mục home của máy dev.
// Sửa ở nguồn rồi chép lại; không sửa tại đây.
```

Chạy `pnpm lint`. Nếu ESLint hay Prettier báo lỗi ở tệp này, thêm `'scripts/seo-audit.mjs'` vào mảng `ignores` của `eslint.config.mjs` và một dòng `scripts/seo-audit.mjs` vào `.prettierignore`.

`.github/workflows/ci.yml`: ngay sau bước `pnpm e2e` của chế độ sắp phát hành và trước bước dựng cho Lighthouse, thêm:

```yaml
      # Cổng SEO (spec §12.3): dựng như production trên domain thật, rồi seo-audit phải thoát 0. Không feed: URL tải của feed giả
      # là localhost, mà seo-audit coi localhost trong HTML là lỗi host không phải production.
      - run: pnpm build
        env: { VERCEL_ENV: production, NEXT_PUBLIC_SITE_URL: 'https://eduflow.agentra.io.vn', DOWNLOAD_FEED_URL: '' }
      - run: |
          pnpm start -p 3400 & echo $! > "$RUNNER_TEMP/seo-server.pid"
          curl --retry 20 --retry-connrefused --retry-delay 1 -fsS http://localhost:3400/ > /dev/null
          node scripts/seo-audit.mjs --base http://localhost:3400 --canonical https://eduflow.agentra.io.vn --next-manifest .next/prerender-manifest.json --json "$RUNNER_TEMP/seo-audit.json"
          kill "$(cat "$RUNNER_TEMP/seo-server.pid")"
```

và thêm `${{ runner.temp }}/seo-audit.json` vào `path` của bước `actions/upload-artifact`.

`lighthouserc.json`: `url` thành đúng mười URL ở test trên.

- [ ] **Step 4: Chạy unit test và audit tại máy**

Chạy: `pnpm vitest run && pnpm verify`. Kỳ vọng: PASS, xanh.
Chạy lệnh SEO-AUDIT. Kỳ vọng: in `0 errors` và thoát 0. Mỗi cảnh báo còn lại: sửa nếu sửa được trong phạm vi kế hoạch này; nếu không, ghi vào README ở Step 6 kèm lý do (spec §1).

- [ ] **Step 5: E2E đủ ba chế độ**

Chạy E2E-FEED (toàn bộ), rồi chế độ `oneos` và `prelaunch` theo README mục "Kiểm thử e2e ba chế độ". Kỳ vọng: PASS cả ba, gồm `links.spec.ts`.

- [ ] **Step 6: Tài liệu**

`README.md`:
- Đoạn mở đầu: site có 17 trang và 12 bài hướng dẫn, mỗi trang hai ngôn ngữ (58 URL); có Route Handler cho `llms.txt`, `llms-full.txt`, `/og/docs/[slug]`.
- Bảng lệnh: thêm dòng `node scripts/seo-audit.mjs ...` (lệnh SEO-AUDIT của kế hoạch) và sửa dòng `pnpm lhci` theo mười URL mới.
- Mục CI: thêm bước cổng SEO.
- Mục mới "Cảnh báo seo-audit còn lại": liệt kê từng cảnh báo của Step 4 và lý do giữ; không có thì ghi "Không có (đo ngày <ngày>)".

`docs/van-hanh.md`, thêm hai mục cuối:

```markdown
## Ngày ra mắt trên domain thật (spec §13.2)

1. `node scripts/seo-audit.mjs --base https://eduflow.agentra.io.vn` thoát 0. Kiểm tay: `curl -sI https://<bí danh>.vercel.app/` trả 308 về `https://eduflow.agentra.io.vn/`; `curl -sI https://eduflow.agentra.io.vn/pho-thong` trả 308 tới `/ai-cho-giao-vien`; `curl -sI https://eduflow.agentra.io.vn/huong-dan/x` trả 404.
2. Google Search Console: xác minh bằng `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`, gửi `https://eduflow.agentra.io.vn/sitemap.xml`, yêu cầu index trang chủ và ba trang cấp.
3. Bing Webmaster Tools: nhập từ Search Console, gửi sitemap. ChatGPT search và Copilot trả lời từ chỉ mục của Bing.
4. Google Rich Results Test và validator.schema.org cho trang chủ, `/ai-cho-giao-vien`, `/ai-tao-de-kiem-tra-theo-ma-tran`, `/huong-dan/soan-de-kiem-tra`.
5. Dán nguyên văn câu mô tả chuẩn (`brand.description` ở `lib/seo/brand.ts`) lên các hồ sơ ngoài có thật, rồi thêm URL hồ sơ vào `brand.sameAs` (OQ-R3).

## Theo dõi hằng tháng (spec §13.3)

- Search Console: số URL được index, lý do không index, truy vấn có lượt hiển thị. Mục tiêu tuần 8: ≥ 90% URL trong sitemap được index.
- Bộ 25 câu hỏi cố định chạy trên ChatGPT, Perplexity, Claude, Gemini (ví dụ "EduFlow là gì", "phần mềm AI soạn đề kiểm tra theo ma trận", "AI soạn giáo án 5512", "EduFlow và ChatGPT"). Ghi: có nhắc EduFlow không, đúng dữ kiện không, trích URL nào. Câu nào sai thì sửa trang nguồn (thường là `content/topics` hay `lib/seo/app-facts.ts`).
- GA4 (nếu bật, OQ-L03): kênh riêng cho nguồn giới thiệu từ chatgpt.com, perplexity.ai, claude.ai, gemini.google.com, copilot.microsoft.com.
- Mỗi tháng thêm 2 tới 4 trang mới (trang chủ đề hay bài hướng dẫn) theo truy vấn thật trong Search Console; cách thêm ở README.
- Mỗi bản app mới: rà các bài hướng dẫn có thao tác đổi (rủi ro K3), cập nhật `updatedAt`.
```

Sửa các chỗ trong `docs/van-hanh.md` còn nói 8 URL của Lighthouse thành mười URL mới.

- [ ] **Step 7: Commit**

```bash
git add tests/e2e/links.spec.ts scripts/seo-audit.mjs .github/workflows/ci.yml lighthouserc.json tests/unit/ci-config.test.ts tests/unit/seo-pages.test.ts README.md docs/van-hanh.md
git add eslint.config.mjs .prettierignore 2>/dev/null; git status --short
git commit -m "ci(seo): cổng seo-audit trên build production, kiểm link nội bộ, Lighthouse cho trang mới, tài liệu ra mắt"
```

---

### Task 25: Canvas Claude Design v2 và cổng PO duyệt

Dựng canvas v2 theo hướng A (spec §5, §6, §10) với chữ lấy nguyên văn từ repo, phát hành riêng tư, và dừng chờ PO duyệt. Task này do người điều phối làm (cần PO), không giao cho subagent. Không code giao diện nào trước khi PO duyệt.

**Files:**
- Move: `docs/thiet-ke/canvas/` → `docs/thiet-ke/v1/canvas/`
- Create: `docs/thiet-ke/v2/canvas/project/*.dc.html`, `docs/thiet-ke/v2/canvas/project/canvas.json`
- Modify: `docs/thiet-ke/README.md`

- [ ] **Step 1: Chuyển canvas cũ**

```bash
mkdir -p docs/thiet-ke/v1 docs/thiet-ke/v2/canvas/project
git mv docs/thiet-ke/canvas docs/thiet-ke/v1/canvas
```

Trong `docs/thiet-ke/README.md`: đổi tiêu đề mục cũ thành "Canvas v1 (Phấn xanh, đã thay)", sửa mọi đường dẫn `canvas/project/` thành `v1/canvas/project/`, giữ URL canvas v1.

- [ ] **Step 2: Nạp quy trình dựng canvas**

Gọi skill `artifact-design` trước khi viết tệp (yêu cầu của công cụ Artifact). Đọc lại định dạng `.dc.html` ở `docs/thiet-ke/v1/canvas/project/Main.dc.html` và `canvas.json` (mỗi artboard một tệp, `<x-dc>`, mẫu chữ `{{...}}`), và công cụ kiểm ở `../eduflow-application/docs/thiet-ke/tools/check_dc.py`, `preview_dc.py`.

- [ ] **Step 3: Dựng artboard**

Hệ thiết kế theo spec §5.1 tới §5.5 (màu, chữ Be Vietnam Pro, logo `public/brand/eduflow-wordmark.svg`, bo góc, không chế độ tối). Bố cục tham khảo ladipage.vn (R4). Chữ trên artboard lấy **nguyên văn** từ `messages/vi.json` (trang chủ: `home.*` gồm các khối mới của Task 22; trang cấp: `levels.k12.*`, `levelCommon`), `content/topics/vi.ts` (`test-generator`), `messages/vi.json` `docs.*` và `content/docs/vi/soan-de-kiem-tra.mdx`. Con số của dải dữ kiện và thẻ số nổi lấy từ `HOME_FACTS` (`content/home.ts`). Ảnh sản phẩm: khung giữ chỗ ghi "Ảnh: <tên artboard của canvas app>" kèm chữ thay thế, như quy ước v1 (ảnh thật chụp lại ở Kế hoạch 2, spec §10.5).

| Tệp | Kích thước | Nội dung |
|---|---|---|
| `Home.dc.html`, `Home2.dc.html` | 1440, cắt hai (mỗi artboard ≤ 8.000 px) | Trang chủ tiếng Việt, 14 khối spec §6, trạng thái có bản phát hành |
| `HomeMobile.dc.html`, `HomeMobile2.dc.html` (thêm `HomeMobile3` nếu cần) | 390 | Trang chủ trên điện thoại, trạng thái sắp phát hành |
| `MegaMenu.dc.html` | 1440 × 900 | Header với menu Sản phẩm đang mở (spec §4.4) |
| `MobileMenu.dc.html` | 390 × 844 | Menu điện thoại mở, ba nhóm `<details>`, hai nút ở đáy |
| `LevelK12.dc.html` | 1440 | Trang "AI cho giáo viên" theo spec §7.1 (9 khối) |
| `TopicTestGenerator.dc.html` | 1440 | Trang chủ đề "AI tạo đề kiểm tra theo ma trận" theo spec §7.2, có mục lục "Trong trang" bám phải |
| `DocsIndex.dc.html` | 1440 | Mục lục hướng dẫn theo spec §7.3 |
| `DocArticle.dc.html`, `DocArticleMobile.dc.html` | 1440; 390 (ngăn kéo mở) | Bài "Soạn đề kiểm tra theo ma trận", ba cột từ 1024 px |
| `Download.dc.html` | 1440 | Tải về, nửa trên có bản phát hành, nửa dưới sắp phát hành; câu ký số theo `download.signing.unsigned` |

Chạy `python3 ../eduflow-application/docs/thiet-ke/tools/check_dc.py docs/thiet-ke/v2/canvas/project/*.dc.html`: mọi luật qua, trừ các mục README ghi là bình thường với artboard landing. Xem trước từng artboard bằng `preview_dc.py`.

- [ ] **Step 4: Phát hành và ghi lại**

Phát hành thư mục `docs/thiet-ke/v2/canvas` bằng công cụ Artifact (riêng tư). Trong `docs/thiet-ke/README.md` thêm mục "Canvas v2 (hướng A, logo mới)" với URL, bảng artboard như Step 3, và quy ước: chữ đổi trên canvas phải chép về `messages/*.json`, `content/topics`, MDX rồi chạy `pnpm verify`.

```bash
git add docs/thiet-ke
git commit -m "docs(thiet-ke): canvas v2 hướng A, chuyển canvas Phấn xanh vào v1"
```

- [ ] **Step 5: Cổng PO**

Gửi PO link canvas và danh sách việc cần duyệt: (1) bố cục và hệ thiết kế của từng artboard; (2) câu mô tả chuẩn, danh mục và câu phân biệt (OQ-R1); (3) mục "EduFlow chưa làm gì" của trang đề cương học phần (rủi ro K1, Task 20); (4) hồ sơ ngoài có thật cho `sameAs` (OQ-R3); (5) ai chụp ảnh màn app cho bài hướng dẫn (OQ-R2). Dừng ở đây. Khi PO duyệt: ghi ngày duyệt vào `docs/thiet-ke/README.md`, chép mọi chữ PO đã sửa trên canvas về repo, rồi gọi `superpowers:writing-plans` để viết Kế hoạch 2 (giao diện theo canvas).

---
