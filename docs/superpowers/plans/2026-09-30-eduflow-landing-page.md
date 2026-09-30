# EduFlow Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the bilingual (vi/en) marketing site for EduFlow on Vercel: 12 static pages per locale (home, three level pages, AI assistant, pricing explanation, AI transparency, download, two install guides, contact, privacy), a Download page fed by the app's stable update feed with a pre-launch state, full SEO, analytics behind a consent bar, and no forms.

**Architecture:** Bootstrap from the finished `docops-landing-page` codebase (same stack, same patterns, already Lighthouse-clean), then replace brand, routes, copy and page content. Next.js 16 App Router with next-intl (`/` = vi, `/en/...` = en, localized slugs). Every page is a Server Component rendered statically per locale. Download data comes from `latest.yml` / `latest-mac.yml` (ISR 10 min) with a committed snapshot that starts empty, which puts the site in a pre-launch state until the first release. Pure logic in `lib/` is unit-tested with Vitest; pages are verified with Playwright in two modes (feed and pre-launch) and with Lighthouse CI.

**Tech Stack:** Next.js 16.3.7 (16.3.5 at the start, raised for a security fix, Ruling 28), React 19.2.8, TypeScript ^5.9 (strict), pnpm 9.15.0, Tailwind CSS ^4.3.3, next-intl ^4.14.5, @next/mdx 16.3.7 + remark-gfm, yaml, @vercel/analytics ^2, @vercel/speed-insights ^2, @next/third-parties 16.3.7, Vitest ^5.0.1, @playwright/test ^1.63.0, @lhci/cli ^0.15.1, sharp.

**Spec:** `docs/superpowers/specs/2026-09-30-eduflow-landing-page-design.md` (approved by the PO on 30/09/2026). Read it with this plan.

**Companion file:** `docs/superpowers/plans/2026-09-30-eduflow-landing-page.messages.vi.json` is the complete Vietnamese copy deck. It becomes `messages/vi.json` in Task 1; every component below reads keys that exist in it.

**Reference code (read-only):** `../docops-landing-page` (called DOCOPS below). **App sources:** `../eduflow-application` (product spec, design canvas in `docs/thiet-ke/canvas/project/`, check and preview tools in `docs/thiet-ke/tools/`).

## Global Constraints

- Node ≥ 22.18, pnpm 9.15.0, TypeScript `strict: true`, `typescript` pinned to `^5.9`. Versions of every dependency copied from DOCOPS `package.json` at the start of Task 2, except `next`, `@next/mdx`, `@next/third-parties` and `eslint-config-next`, pinned at `16.3.7` for the next/og security fix of 16.3.6 (Ruling 28).
- `next.config.ts` sets `experimental: { optimisticRouting: false }` (Ruling 27). Next 16.3 predicts the route of the proxy-rewritten English slugs wrongly and re-requests them without end (vercel/next.js#96893). Keep the flag until that bug is fixed upstream, and remove it only when the Task 14 prefetch guard passes without it.
- Locales `vi` (default, no prefix) and `en` (`/en` prefix); `localeDetection: false`; hreflang `x-default` = vi.
- Localized slugs exactly as spec §5: `/pho-thong`↔`/en/k12`, `/hoc-phan`↔`/en/university-courses`, `/chuong-trinh`↔`/en/program-review`, `/tro-ly-ai`↔`/en/ai-assistant`, `/cach-tinh-phi`↔`/en/pricing`, `/minh-bach-ai`↔`/en/ai-transparency`, `/tai-ve`↔`/en/download`, `/huong-dan-cai-dat/[os]`↔`/en/install/[os]`, `/lien-he`↔`/en/contact`, `/chinh-sach-bao-mat`↔`/en/privacy`.
- Feed: `DOWNLOAD_FEED_URL` (stable channel of the app, value pending OQ-L02), fetch timeout 5000 ms, ISR `revalidate: 600`, snapshot `content/releases.json` starts as `{ "baseUrl": null, "windows": null, "mac": null }`. No feed and no snapshot means the pre-launch state (spec §6.8, §7.3).
- Palette = the app's Phấn xanh system, spec §8.1: paper `#F6F7F2`, surface `#FFFFFF`, ink `#16201A`, ink-2 `#3F4A43`, ink-3 `#5B675F`, line `#DDE3DA`, brand-strong `#237A31` (primary buttons, white text on it), brand `#2F8F3C` (never text), brand-tint `#E8F3E7`, lime `#9BCB3C` (never text), tier1 `#1E2B23`, tier3 `#6D28D9`, warn `#FEF3C7`/`#9A4A06`, crit `#B42318`. Text contrast ≥ 4.5:1.
- Fonts via `next/font/google`: Fraunces for H1/H2, Be Vietnam Pro for body (subsets `latin`, `vietnamese`), JetBrains Mono for numbers, codes, checksums.
- Content rules, spec §15: never the phrase "đạt kiểm định"; never "AI thay giáo viên"; no U+2014 em-dash anywhere; Vietnamese copy addresses the reader as "thầy cô"; numbers only from the app spec; the pricing page shows no prices; the program-level copy says it is an internal working tool, not a self-assessment report; no model-provider name and no model-training claim until OQ-L07 is answered.
- No forms, no Route Handlers, no Edge runtime, no online payment. Trial sign-up and key requests live in the app.
- Env vars (spec §11): `NEXT_PUBLIC_SITE_URL` (required in production), `DOWNLOAD_FEED_URL`, `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`, `NEXT_PUBLIC_CONSENT_BANNER`.
- Company facts are provisional until OQ-L04: Agentra JSC · Đà Nẵng · info@agentra.io.vn · https://agentra.io.vn (same company as DOCOPS). Phone and Zalo stay empty, so their cards hide.
- Work on branch `feat/landing-page`. Every task ends with `pnpm verify` green (from Task 3 on) and one commit; commit messages in Vietnamese with an English scope, e.g. `feat(home): …`.

## Review Focus

These five conditions follow from the spec but no happy-path test exercises them. Each has a test in the task that owns the code.

1. **Feed down and snapshot empty (pre-launch):** every download entry point (header button, hero, home download block, Download page) must lead to the "EduFlow sắp phát hành" notice and the contact page, never to an empty grid or a dead link. Owned by Task 2 (`resolveReleases` unit test), Task 6 and Task 10 (components), Task 14 (`prelaunch.spec.ts`).
2. **Feed has one OS only** (Windows published before macOS, or the reverse): the published cards show, and a visitor on the missing OS sees "Bản cho macOS sắp có" instead of a silently missing card. Owned by Task 2 (`hasAssetFor` unit test) and Task 10 (`PlatformGrid`).
3. **Phone or tablet visitor:** the hero button must go to the Download page (never start an `.exe` download on a phone), and the pages state that EduFlow runs on macOS and Windows computers. Owned by Task 6 (`HeroCta`) and Task 14 (`mobile.spec.ts`).
4. **Untranslated English:** an English page must not show Vietnamese strings copied over by mistake. Owned by Task 3 (`content.test.ts`, "English copy carries no untranslated Vietnamese").
5. **Copy-rule violations slipping in during edits** (em-dash, "đạt kiểm định", "AI thay giáo viên"): checked over `messages/*.json` and every MDX file. Owned by Task 3 (`content.test.ts`, "copy rules").

## File Structure

```
app/[locale]/layout.tsx                 # root layout: <html lang>, three fonts, Header, Footer, ConsentBar, AnalyticsGate
app/[locale]/page.tsx                   # Home
app/[locale]/k12/page.tsx               # /pho-thong
app/[locale]/university/page.tsx        # /hoc-phan
app/[locale]/program/page.tsx           # /chuong-trinh
app/[locale]/assistant/page.tsx         # /tro-ly-ai
app/[locale]/pricing/page.tsx           # /cach-tinh-phi
app/[locale]/ai-transparency/page.tsx   # /minh-bach-ai
app/[locale]/download/page.tsx          # /tai-ve
app/[locale]/install/[os]/page.tsx      # /huong-dan-cai-dat/[os]
app/[locale]/contact/page.tsx           # /lien-he
app/[locale]/privacy/page.tsx           # /chinh-sach-bao-mat
app/[locale]/[...rest]/page.tsx  not-found.tsx  error.tsx
app/[locale]/opengraph-image.tsx  app/[locale]/download/opengraph-image.tsx
app/sitemap.ts  app/robots.ts  app/manifest.ts  app/icon.svg  app/icon.png  app/apple-icon.png  app/globals.css
proxy.ts  i18n/{routing,navigation,request}.ts  global.d.ts  mdx-components.tsx  types/mdx.d.ts
messages/vi.json  messages/en.json
content/releases.json  content/install/{index.ts,vi/*.mdx,en/*.mdx}  content/privacy/{index.ts,vi.mdx,en.mdx}
lib/site.ts  lib/cn.ts  lib/format.ts  lib/platform.ts  lib/usePlatform.ts  lib/consent.ts  lib/useConsent.ts
lib/analytics.ts  lib/contact.ts  lib/env.ts
lib/releases/{types,parse,feed,snapshot,state,index}.ts
lib/seo/{urls,metadata,jsonld,og}.tsx?
components/ui/{Button,Callout,Card,Container,Section,Icon,icons,Logo,WindowFrame,CtaBand}.tsx
components/site/{Header,NavLinks,MobileNav,Footer,LocaleSwitcher,SkipLink,ConsentBar,AnalyticsGate,CopyButton,TrackedAnchor}.tsx
components/seo/JsonLd.tsx
components/home/{SectionHead,Hero,HeroCta,LevelCards,AssistantShowcase,PipelineStrip,TrustGrid,CostTeaser,DownloadBlock,FaqSection,Faq,FinalCta}.tsx
components/level/{levels.ts,LevelPage.tsx}
components/download/{DownloadLink,PlatformCard,PlatformGrid,ChecksumField,SystemRequirements,PrelaunchNotice}.tsx
components/guide/{Step,Toc,OsTabs,CodeBlock}.tsx
scripts/sync-releases.mjs  scripts/capture-product-images.mjs  scripts/serve-fixtures.mjs
public/images/product/*.webp  assets/fonts/{BeVietnamPro-Bold.ttf,BeVietnamPro-Regular.ttf,OFL.txt}
docs/thiet-ke/  (landing design canvas source, Task 1)
tests/unit/**  tests/e2e/**  tests/fixtures/{latest.yml,latest-mac.yml}
vitest.config.mts  playwright.config.ts  lighthouserc.json  .github/workflows/ci.yml  .env.example
```

---

### Task 1: Copy deck and landing design canvas

**Files:**
- Create: `messages/vi.json`, `messages/en.json`, `docs/thiet-ke/README.md`, `docs/thiet-ke/canvas/project/*.dc.html` (7 artboards), `docs/thiet-ke/canvas/project/canvas.json`

**Interfaces:**
- Produces: `messages/vi.json` and `messages/en.json` with identical key sets. Top-level namespaces: `common`, `nav`, `footer`, `consent`, `notFound`, `error`, `home`, `levels` (`k12`, `university`, `program`, identical shapes), `assistant`, `pricing`, `transparency`, `download`, `install`, `contact`. Every later task reads only keys that exist in the companion file.

- [ ] **Step 1: Create the branch and install the Vietnamese copy**

```bash
git checkout -b feat/landing-page
mkdir -p messages
cp docs/superpowers/plans/2026-09-30-eduflow-landing-page.messages.vi.json messages/vi.json
```

- [ ] **Step 2: Write `messages/en.json`**

Translate every value of `messages/vi.json` into English, keeping every key, every ICU placeholder (`{year}`, `{version}`, `{date}`, `{n}`) and every rich-text tag (`<email></email>`) unchanged. Use this glossary so terms stay consistent:

| Vietnamese | English |
|---|---|
| thầy cô | you |
| Phổ thông | K-12 |
| Học phần (đại học) | University courses |
| Chương trình đào tạo, CTĐT | Degree program |
| Phòng Đảm bảo chất lượng | Quality Assurance Office |
| Hội đồng CTĐT | Program Council |
| Ban giám hiệu | School leadership |
| tổ trưởng chuyên môn | head of subject group |
| trưởng bộ môn | head of department |
| đề kiểm tra, mã đề | test paper, test version |
| ma trận (bốn mức NB, TH, VD, VDC) | test blueprint (four levels: recall, understanding, application, advanced application) |
| giáo án, giáo án buổi | lesson plan, session plan |
| đề cương | course syllabus |
| cổng chất lượng; Lỗi cổng; Đạt | quality gate; Gate error; Pass |
| hiện vật | artifact |
| key kích hoạt; Dùng thử | license key; Try it |
| Trợ lý AI; thẻ hành động | AI assistant; action card |
| bản nháp; ký; công chứng mã băm | draft; sign; hash notarization |
| ngày xét | review date |
| căn cứ chết; nền sắp sập; chưa tới hiệu lực | dead basis; expiring basis; not yet in force |
| tầng tất định; đối sánh; đề xuất | deterministic tier; comparative tier; suggestion tier |
| Tắt AI | AI off |
| dấu chìm DÙNG THỬ | TRIAL (DÙNG THỬ) watermark |
| TT 04/2025 | Circular 04/2025 |
| CV5512 | Official Letter 5512 (CV5512) |
| Cách tính phí | Pricing |
| © {year} Agentra JSC · Đà Nẵng, Việt Nam | © {year} Agentra JSC · Da Nang, Vietnam |

Rules: no em-dash; no Vietnamese diacritics except inside the exact string `DÙNG THỬ`; `common.siteName` stays `EduFlow`.

- [ ] **Step 3: Check key parity and the copy rules**

```bash
node -e "
const vi=require('./messages/vi.json'), en=require('./messages/en.json');
const f=(o,p='')=>typeof o==='object'?Object.entries(o).flatMap(([k,v])=>f(v,p?p+'.'+k:k)):[p];
const a=f(vi).sort().join(), b=f(en).sort().join();
if(a!==b){console.error('key sets differ');process.exit(1)}
const all=JSON.stringify(vi)+JSON.stringify(en);
if(/\u2014/.test(all)||/đạt kiểm định/i.test(all)){console.error('copy rule violated');process.exit(1)}
console.log('ok', f(vi).length, 'keys')"
```

Expected: `ok 489 keys` (the count printed by your copy; it must be identical for both files).

- [ ] **Step 4: Build the landing design canvas**

Create a new Claude Design canvas named "EduFlow Landing" (Artifact tool: `action: "quickstart"`, `intent: "design"`, then create from the Design type it returns). Use the app's design system (tokens above; look at `../eduflow-application/docs/thiet-ke/canvas/project/DesignSystem.dc.html` for exact styles). Seven artboards, all text taken verbatim from `messages/vi.json` (and `messages/en.json` for the English home):

| Artboard | Size | Content |
|---|---|---|
| `Main.dc.html` | 1440 × 3600 | Home VI: all 9 blocks of spec §6.1 |
| `HomeMobile.dc.html` | 390 × 5200 | Home VI at phone width |
| `HomeEN.dc.html` | 1440 × 3600 | Home EN |
| `LevelK12.dc.html` | 1440 × 2600 | Phổ thông page |
| `Assistant.dc.html` | 1440 × 2800 | Trợ lý AI page |
| `Pricing.dc.html` | 1440 × 2600 | Cách tính phí page |
| `Download.dc.html` | 1440 × 1800 | Tải về, upper half with feed, lower half the pre-launch notice |

Product screenshots inside the artboards are placeholders with the board name (e.g. "Ảnh: AssistantHome") until Task 5 produces the WebP files. Save every artboard and `canvas.json` under `docs/thiet-ke/canvas/project/`, validate each with `python3 ../eduflow-application/docs/thiet-ke/tools/check_dc.py <file>` (the "root size" line is expected for boards that are not 1440 × 900), publish, and write `docs/thiet-ke/README.md` with the canvas URL, the artboard list and how to re-render (`python3 ../eduflow-application/docs/thiet-ke/tools/preview_dc.py <file> macOS <png>`).

- [ ] **Step 5: PO review checkpoint**

Send the canvas link to the PO. Tasks 2 to 5 do not depend on the answer; Task 6 starts only after the PO approves the copy and layout. Record any copy change in `messages/*.json` (both files) and re-run Step 3.

- [ ] **Step 6: Commit**

```bash
git add messages docs/thiet-ke
git commit -m "docs(copy): bộ chữ hai ngôn ngữ và canvas thiết kế landing page EduFlow"
```

### Task 2: Bootstrap from docops-landing-page: config, libraries, release feed with pre-launch

**Files:**
- Copy verbatim from DOCOPS: `pnpm-lock.yaml`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`, `vitest.config.ts`, `.prettierrc`, `.prettierignore`, `lib/cn.ts`, `lib/format.ts`, `lib/platform.ts`, `lib/usePlatform.ts`, `lib/useConsent.ts`, `lib/analytics.ts`, `lib/releases/types.ts`, `lib/releases/parse.ts`, `lib/releases/feed.ts`, `tests/unit/smoke.test.ts`, `tests/unit/format.test.ts`, `tests/unit/platform.test.ts`, `tests/unit/analytics.test.ts`
- Copy then modify: `package.json`, `next.config.ts`, `.gitignore`, `lib/consent.ts`, `tests/unit/consent.test.ts`
- Create: `i18n/routing.ts`, `lib/site.ts`, `lib/releases/snapshot.ts`, `lib/releases/state.ts`, `lib/releases/index.ts`, `content/releases.json`, `scripts/sync-releases.mjs`, `tests/fixtures/latest.yml`, `tests/fixtures/latest-mac.yml`, `tests/unit/releases.test.ts`, `tests/unit/site.test.ts`, `.env.example`
- Do not copy: `lib/releases/codename.ts` and its test (DocOps-only), `content/releases.json` of DOCOPS, anything under `docs/`, `public/images/product/`.

**Interfaces:**
- Produces:
```ts
// lib/site.ts
export const site: { name: 'EduFlow'; shortName: 'EduFlow'; company: string; email: string; city: Record<Locale,string>; country: Record<Locale,string>; companyUrl: string; phone: string; zalo: string; address: string; mapsUrl: string; siteUrl(): string; feedUrl(): string | null }
// lib/releases/snapshot.ts
export interface ReleaseSnapshot { baseUrl: string | null; windows: unknown; mac: unknown }
export const releaseSnapshot: ReleaseSnapshot
// lib/releases/index.ts
export function resolveReleases(input: { base: string | null; windows: unknown | null; mac: unknown | null; snapshot: ReleaseSnapshot }): ReleaseInfo
export const getReleases: () => Promise<ReleaseInfo>        // React.cache
export function findAsset(assets: ReleaseAsset[], platform: Platform): ReleaseAsset | undefined
export function latestRelease(assets: ReleaseAsset[]): { version: string; releaseDate: string } | null
// lib/releases/state.ts
export type DownloadState = 'available' | 'prelaunch'
export function downloadState(assets: ReleaseAsset[]): DownloadState
export function hasAssetFor(assets: ReleaseAsset[], os: DetectedOs): boolean
// i18n/routing.ts
export const routing; export type Locale = 'vi' | 'en'; export type PageKey = keyof typeof routing.pathnames
```
- Unchanged from DOCOPS: `Platform`, `ReleaseAsset`, `ReleaseInfo`, `FeedSource`, `parseFeeds`, `fetchFeed`, `formatBytes`, `formatDate`, `detectPlatform`, `PLATFORM_FOR_OS`, `usePlatform`, `track`, `AnalyticsEvent`.

- [ ] **Step 1: Copy the verbatim files**

```bash
D=../docops-landing-page
mkdir -p lib/releases i18n content scripts tests/unit tests/fixtures
cp $D/{pnpm-lock.yaml,tsconfig.json,eslint.config.mjs,postcss.config.mjs,vitest.config.ts,.prettierrc,.prettierignore,package.json,next.config.ts} .
cat $D/.gitignore >> .gitignore
cp $D/lib/{cn,format,platform,usePlatform,consent,useConsent,analytics}.ts lib/
cp $D/lib/releases/{types,parse,feed}.ts lib/releases/
cp $D/tests/unit/{smoke,format,platform,analytics,consent}.test.ts tests/unit/
```

Then remove duplicate lines from `.gitignore` by hand.

- [ ] **Step 2: Edit the copied files**

In `package.json`: set `"name": "eduflow-landing-page"` and replace the `typecheck` script with `"typecheck": "next typegen && tsc --noEmit"` only if it differs (keep DOCOPS's value). Keep every dependency version as copied.

In `next.config.ts`: delete the whole `async redirects() { … }` block (EduFlow has no legacy URLs). Keep `securityHeaders`, `headers()`, MDX and next-intl plugins.

In `lib/consent.ts`: change the two constants to

```ts
export const CONSENT_KEY = 'eduflow.consent'
export const CONSENT_EVENT = 'eduflow:consent'
```

In `tests/unit/consent.test.ts`: replace every `'docops.consent'` with `'eduflow.consent'`.

- [ ] **Step 3: Create `i18n/routing.ts`**

```ts
import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['vi', 'en'],
  defaultLocale: 'vi',
  localePrefix: 'as-needed',
  localeDetection: false,
  pathnames: {
    '/': '/',
    '/k12': { vi: '/pho-thong', en: '/k12' },
    '/university': { vi: '/hoc-phan', en: '/university-courses' },
    '/program': { vi: '/chuong-trinh', en: '/program-review' },
    '/assistant': { vi: '/tro-ly-ai', en: '/ai-assistant' },
    '/pricing': { vi: '/cach-tinh-phi', en: '/pricing' },
    '/ai-transparency': { vi: '/minh-bach-ai', en: '/ai-transparency' },
    '/download': { vi: '/tai-ve', en: '/download' },
    '/install/[os]': { vi: '/huong-dan-cai-dat/[os]', en: '/install/[os]' },
    '/contact': { vi: '/lien-he', en: '/contact' },
    '/privacy': { vi: '/chinh-sach-bao-mat', en: '/privacy' },
  },
})

export type Locale = (typeof routing.locales)[number]
export type PageKey = keyof typeof routing.pathnames
```

- [ ] **Step 4: Write the failing tests**

`tests/fixtures/latest.yml` (fixture only; names follow electron-builder defaults for product name EduFlow):

```yaml
version: 1.0.0
files:
  - url: EduFlow Setup 1.0.0.exe
    sha512: Zm9yLWZpeHR1cmUtb25seS1lZHVmbG93LXdpbmRvd3MtaW5zdGFsbGVyLXNoYTUxMi12YWx1ZS0xMjM0NTY3OA==
    size: 312456789
path: EduFlow Setup 1.0.0.exe
sha512: Zm9yLWZpeHR1cmUtb25seS1lZHVmbG93LXdpbmRvd3MtaW5zdGFsbGVyLXNoYTUxMi12YWx1ZS0xMjM0NTY3OA==
releaseDate: '2026-10-01T02:00:00.000Z'
```

`tests/fixtures/latest-mac.yml`:

```yaml
version: 1.0.0
files:
  - url: EduFlow-1.0.0-arm64-mac.zip
    sha512: Zm9yLWZpeHR1cmUtb25seS1lZHVmbG93LW1hYy1hcm02NC16aXAtc2hhNTEyLXZhbHVlLTAwMDAwMDAwMDAwMA==
    size: 298765432
  - url: EduFlow-1.0.0-arm64.dmg
    sha512: Zm9yLWZpeHR1cmUtb25seS1lZHVmbG93LW1hYy1hcm02NC1kbWctc2hhNTEyLXZhbHVlLTAwMDAwMDAwMDAwMA==
    size: 301234567
  - url: EduFlow-1.0.0-mac.zip
    sha512: Zm9yLWZpeHR1cmUtb25seS1lZHVmbG93LW1hYy14NjQtemlwLXNoYTUxMi12YWx1ZS0wMDAwMDAwMDAwMDAwMA==
    size: 305432109
  - url: EduFlow-1.0.0.dmg
    sha512: Zm9yLWZpeHR1cmUtb25seS1lZHVmbG93LW1hYy14NjQtZG1nLXNoYTUxMi12YWx1ZS0wMDAwMDAwMDAwMDAwMA==
    size: 309876543
path: EduFlow-1.0.0-arm64-mac.zip
sha512: Zm9yLWZpeHR1cmUtb25seS1lZHVmbG93LW1hYy1hcm02NC16aXAtc2hhNTEyLXZhbHVlLTAwMDAwMDAwMDAwMA==
releaseDate: '2026-10-01T02:00:00.000Z'
```

`tests/unit/releases.test.ts`:

```ts
import { readFileSync } from 'node:fs'
import { describe, expect, test, vi } from 'vitest'
import { parse } from 'yaml'
import { resolveReleases } from '@/lib/releases'
import { fetchFeed } from '@/lib/releases/feed'
import { parseFeeds } from '@/lib/releases/parse'
import { downloadState, hasAssetFor } from '@/lib/releases/state'

const BASE = 'https://feed.example.test/desktop/'
const winYaml = readFileSync('tests/fixtures/latest.yml', 'utf8')
const win = parse(winYaml)
const mac = parse(readFileSync('tests/fixtures/latest-mac.yml', 'utf8'))
const EMPTY = { baseUrl: null, windows: null, mac: null }

describe('parseFeeds', () => {
  test('maps the three platforms and skips zip/blockmap', () => {
    const assets = parseFeeds({ windows: win, mac }, BASE)
    expect(assets.map((a) => a.platform)).toEqual(['windows-x64', 'macos-arm64', 'macos-x64'])
    expect(assets[0]).toMatchObject({ fileName: 'EduFlow Setup 1.0.0.exe', url: `${BASE}EduFlow%20Setup%201.0.0.exe`, sizeBytes: 312456789, version: '1.0.0' })
    expect(assets[1]).toMatchObject({ fileName: 'EduFlow-1.0.0-arm64.dmg', sizeBytes: 301234567 })
    expect(assets[2]).toMatchObject({ fileName: 'EduFlow-1.0.0.dmg', sizeBytes: 309876543 })
    expect(assets.every((a) => a.releaseDate.startsWith('2026-10-01'))).toBe(true)
  })
  test('missing or malformed feed yields no asset for that platform, no throw', () => {
    expect(parseFeeds({ mac }, BASE).map((a) => a.platform)).toEqual(['macos-arm64', 'macos-x64'])
    expect(parseFeeds({ windows: { nonsense: true }, mac: null }, BASE)).toEqual([])
  })
})

describe('resolveReleases', () => {
  test('pre-launch: no feed URL and an empty snapshot give no assets', () => {
    const info = resolveReleases({ base: null, windows: null, mac: null, snapshot: EMPTY })
    expect(info.assets).toEqual([])
    expect(downloadState(info.assets)).toBe('prelaunch')
  })
  test('feed down: the snapshot and its own base URL are used', () => {
    const info = resolveReleases({ base: null, windows: null, mac: null, snapshot: { baseUrl: BASE, windows: win, mac } })
    expect(info.assets).toHaveLength(3)
    expect(info.assets.every((a) => a.url.startsWith(BASE))).toBe(true)
    expect(info.source).toEqual({ windows: 'snapshot', mac: 'snapshot' })
  })
  test('snapshot without a base URL cannot build links, so it gives no assets', () => {
    expect(resolveReleases({ base: null, windows: null, mac: null, snapshot: { baseUrl: null, windows: win, mac } }).assets).toEqual([])
  })
  test('one OS published: Windows from the feed, macOS missing', () => {
    const info = resolveReleases({ base: BASE, windows: win, mac: null, snapshot: EMPTY })
    expect(info.assets.map((a) => a.platform)).toEqual(['windows-x64'])
    expect(info.source).toEqual({ windows: 'feed', mac: 'snapshot' })
    expect(downloadState(info.assets)).toBe('available')
    expect(hasAssetFor(info.assets, 'windows')).toBe(true)
    expect(hasAssetFor(info.assets, 'macos')).toBe(false)
  })
})

describe('fetchFeed', () => {
  const url = `${BASE}latest.yml`
  test('returns parsed YAML on 200 with ISR revalidate 600', async () => {
    const ok = vi.fn().mockResolvedValue(new Response(winYaml, { status: 200 }))
    expect(((await fetchFeed(url, ok)) as { version: string }).version).toBe('1.0.0')
    expect(ok).toHaveBeenCalledWith(url, expect.objectContaining({ next: { revalidate: 600 } }))
  })
  test('returns null on 404, network error and invalid YAML', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(await fetchFeed(url, vi.fn().mockResolvedValue(new Response('nope', { status: 404 })))).toBeNull()
    expect(await fetchFeed(url, vi.fn().mockRejectedValue(new Error('ECONNRESET')))).toBeNull()
    expect(await fetchFeed(url, vi.fn().mockResolvedValue(new Response('a: [b', { status: 200 })))).toBeNull()
    spy.mockRestore()
  })
})
```

`tests/unit/site.test.ts`:

```ts
import { afterEach, expect, test, vi } from 'vitest'
import { site } from '@/lib/site'

afterEach(() => vi.unstubAllEnvs())

test('feedUrl is null when unset and gains a trailing slash when set', () => {
  vi.stubEnv('DOWNLOAD_FEED_URL', '')
  expect(site.feedUrl()).toBeNull()
  vi.stubEnv('DOWNLOAD_FEED_URL', 'https://feed.example.test/desktop')
  expect(site.feedUrl()).toBe('https://feed.example.test/desktop/')
})

test('siteUrl strips trailing slashes and defaults to localhost', () => {
  vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://eduflow.test//')
  expect(site.siteUrl()).toBe('https://eduflow.test')
  vi.stubEnv('NEXT_PUBLIC_SITE_URL', '')
  expect(site.siteUrl()).toBe('http://localhost:3000')
})
```

- [ ] **Step 5: Run the tests to see them fail**

Run: `pnpm install && pnpm test`
Expected: FAIL, modules `@/lib/releases`, `@/lib/releases/state`, `@/lib/site` not found.

- [ ] **Step 6: Implement**

`lib/site.ts`:

```ts
import type { Locale } from '@/i18n/routing'

/** Thông tin công ty và biến môi trường (spec §11). Liên hệ là giá trị tạm của Agentra, chờ PO xác nhận (OQ-L04). */
export const site = {
  name: 'EduFlow',
  shortName: 'EduFlow',
  company: 'Agentra JSC',
  email: 'info@agentra.io.vn',
  city: { vi: 'Đà Nẵng', en: 'Da Nang' } satisfies Record<Locale, string>,
  country: { vi: 'Việt Nam', en: 'Vietnam' } satisfies Record<Locale, string>,
  companyUrl: 'https://agentra.io.vn',
  phone: '',
  zalo: '',
  address: '',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Agentra+JSC+%C4%90%C3%A0+N%E1%BA%B5ng',
  siteUrl(): string {
    return (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '')
  },
  /** Feed kênh ổn định của app (OQ-L02). Chưa đặt → null → dùng snapshot; snapshot rỗng → trạng thái sắp phát hành. */
  feedUrl(): string | null {
    const url = (process.env.DOWNLOAD_FEED_URL ?? '').trim()
    if (!url) return null
    return url.endsWith('/') ? url : `${url}/`
  },
}
```

`lib/releases/snapshot.ts`:

```ts
import snapshot from '@/content/releases.json'

export interface ReleaseSnapshot {
  baseUrl: string | null
  windows: unknown
  mac: unknown
}

/** Bản chụp feed commit trong repo. Ban đầu rỗng (chưa phát hành). Cập nhật bằng `pnpm sync-releases`. */
export const releaseSnapshot = snapshot as ReleaseSnapshot
```

`lib/releases/state.ts`:

```ts
import { PLATFORM_FOR_OS, type DetectedOs } from '@/lib/platform'
import type { ReleaseAsset } from './types'

export type DownloadState = 'available' | 'prelaunch'

/** Không có tệp nào từ feed hay snapshot → trạng thái sắp phát hành (spec §6.8). */
export function downloadState(assets: ReleaseAsset[]): DownloadState {
  return assets.length > 0 ? 'available' : 'prelaunch'
}

/** Hệ điều hành của người xem đã có bản cài chưa (feed có thể phát hành lệch hai nền tảng). */
export function hasAssetFor(assets: ReleaseAsset[], os: DetectedOs): boolean {
  return assets.some((a) => PLATFORM_FOR_OS[os].includes(a.platform))
}
```

`lib/releases/index.ts`:

```ts
import { cache } from 'react'
import { site } from '@/lib/site'
import { fetchFeed } from './feed'
import { parseFeeds } from './parse'
import { releaseSnapshot, type ReleaseSnapshot } from './snapshot'
import type { Platform, ReleaseAsset, ReleaseInfo } from './types'

export type { FeedSource, Platform, ReleaseAsset, ReleaseInfo } from './types'

/** Ghép feed với snapshot, thuần để test. Không có URL gốc nào thì không dựng được link tải → không có tệp. */
export function resolveReleases(input: {
  base: string | null
  windows: unknown | null
  mac: unknown | null
  snapshot: ReleaseSnapshot
}): ReleaseInfo {
  const base = input.base ?? input.snapshot.baseUrl
  const windows = input.windows ?? input.snapshot.windows
  const mac = input.mac ?? input.snapshot.mac
  return {
    assets: base ? parseFeeds({ windows, mac }, base) : [],
    source: { windows: input.windows ? 'feed' : 'snapshot', mac: input.mac ? 'feed' : 'snapshot' },
  }
}

/** Tải feed thật (ISR 10 phút) khi có URL; mỗi lần render gọi một lần (React.cache). */
export const getReleases = cache(async (): Promise<ReleaseInfo> => {
  const base = site.feedUrl()
  const [windows, mac] = base
    ? await Promise.all([fetchFeed(`${base}latest.yml`), fetchFeed(`${base}latest-mac.yml`)])
    : [null, null]
  return resolveReleases({ base, windows, mac, snapshot: releaseSnapshot })
})

export function findAsset(assets: ReleaseAsset[], platform: Platform): ReleaseAsset | undefined {
  return assets.find((a) => a.platform === platform)
}

/** Phiên bản và ngày mới nhất trong các tệp (Windows và macOS có thể phát hành lệch nhau). */
export function latestRelease(assets: ReleaseAsset[]): { version: string; releaseDate: string } | null {
  if (assets.length === 0) return null
  const newest = [...assets].sort((a, b) => b.releaseDate.localeCompare(a.releaseDate))[0]
  return { version: newest.version, releaseDate: newest.releaseDate }
}
```

`content/releases.json`:

```json
{ "baseUrl": null, "windows": null, "mac": null }
```

`scripts/sync-releases.mjs`:

```js
// Cập nhật content/releases.json từ feed kênh ổn định (URL) hoặc thư mục release cục bộ, kèm URL gốc để dựng link tải.
// Dùng: node scripts/sync-releases.mjs [--from <url|thư mục>] [--base <url gốc khi đọc từ thư mục>]
import { readFile, stat, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { parse } from 'yaml'

const arg = (name) => {
  const i = process.argv.indexOf(name)
  return i > -1 ? process.argv[i + 1] : undefined
}
const from = arg('--from') || process.env.DOWNLOAD_FEED_URL
if (!from) {
  console.error('Thiếu nguồn: đặt DOWNLOAD_FEED_URL hoặc truyền --from <url|thư mục>')
  process.exit(1)
}
const isDir = await stat(from).then((s) => s.isDirectory()).catch(() => false)
const rawBase = isDir ? arg('--base') || process.env.DOWNLOAD_FEED_URL : from
if (!rawBase) {
  console.error('Đọc từ thư mục cần --base <url gốc> hoặc DOWNLOAD_FEED_URL để dựng link tải')
  process.exit(1)
}
const baseUrl = rawBase.endsWith('/') ? rawBase : `${rawBase}/`

async function readSource(name) {
  if (isDir) return readFile(join(from, name), 'utf8')
  const res = await fetch(baseUrl + name, { signal: AbortSignal.timeout(15000) })
  if (!res.ok) throw new Error(`${baseUrl}${name}: HTTP ${res.status}`)
  return res.text()
}

const [windows, mac] = await Promise.all([readSource('latest.yml'), readSource('latest-mac.yml')])
const out = { baseUrl, windows: parse(windows), mac: parse(mac) }
await writeFile('content/releases.json', `${JSON.stringify(out, null, 2)}\n`)
console.log(`content/releases.json ← ${from} (Windows ${out.windows?.version}, macOS ${out.mac?.version})`)
```

`.env.example`:

```
# Bắt buộc ở production (OQ-L01). Để trống khi chạy máy dev → http://localhost:3000
NEXT_PUBLIC_SITE_URL=
# Feed kênh ổn định mà electron-updater của app đọc (OQ-L02). Để trống → trạng thái sắp phát hành nếu snapshot rỗng.
DOWNLOAD_FEED_URL=
NEXT_PUBLIC_GA_MEASUREMENT_ID=
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=
NEXT_PUBLIC_CONSENT_BANNER=on
```

- [ ] **Step 7: Run the tests**

Run: `pnpm test && pnpm exec tsc --noEmit && pnpm lint`
Expected: all unit tests PASS (smoke, format, platform, analytics, consent, releases, site); no type or lint errors. `pnpm verify` and `pnpm build` start working in Task 3, once the app directory exists.

- [ ] **Step 8: Check nothing DocOps-specific came along**

Run: `grep -rni "docops\|uranus\|agentra.io.vn/desktop\|download-docsopapp" lib tests scripts content package.json next.config.ts`
Expected: no output.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "chore: khởi tạo từ docops-landing-page, thư viện feed có trạng thái sắp phát hành"
```

### Task 3: i18n routing, locale layout, SEO helpers, content-rule tests

> **Amended after the task review (Ruling 17).** The `tests/unit/content.test.ts` block in Step 2 below is the committed version, not the one first planned: the file walk no longer swallows fs errors and starts from the test file's location; the English guard also reads English MDX (a directory segment `en`, or the file name `en.mdx`); the constants `MDX_TOTAL` and `MDX_ENGLISH` pin how many MDX files the scan must see (Tasks 11 and 12 raise them); and a third test, `no U+2014 em-dash in any source file`, scans every text file in the repository. Also in this task: `vitest.config.ts` was renamed to `vitest.config.mts` (Ruling 11).

**Files:**
- Copy verbatim from DOCOPS: `i18n/navigation.ts`, `i18n/request.ts`, `proxy.ts`, `global.d.ts`, `lib/seo/urls.ts`, `lib/seo/metadata.ts`, `lib/seo/jsonld.ts`, `components/seo/JsonLd.tsx`, `app/[locale]/[...rest]/page.tsx`, `app/[locale]/not-found.tsx`, `app/[locale]/error.tsx`, `tests/unit/jsonld.test.ts`
- Create: `app/[locale]/layout.tsx`, `app/[locale]/page.tsx` (temporary, replaced in Task 6), `tests/unit/i18n.test.ts`, `tests/unit/seo.test.ts`, `tests/unit/content.test.ts`
- Modify: `lib/seo/jsonld.ts` (`softwareApplication`), `lib/seo/metadata.ts` (comment only), `tests/unit/jsonld.test.ts`

**Interfaces:**
- Consumes: `routing`, `Locale`, `PageKey` (Task 2); `site` (Task 2).
- Produces: `Link`, `redirect`, `usePathname`, `useRouter`, `getPathname`; `localizedPath(locale, page, params?)`, `absoluteUrl(locale, page, params?)`; `buildMetadata({ locale, page, params?, title, description, absoluteTitle? }): Metadata`; `organization()`, `softwareApplication(assets, locale, downloadPageUrl)`, `faqPage(items)`, `breadcrumb(items)`, `howTo(input)`; `<JsonLd data={…} />`.

- [ ] **Step 1: Copy the verbatim files**

```bash
D=../docops-landing-page
mkdir -p lib/seo components/seo "app/[locale]/[...rest]"
cp $D/i18n/{navigation,request}.ts i18n/
cp $D/{proxy.ts,global.d.ts} .
cp $D/lib/seo/{urls,metadata,jsonld}.ts lib/seo/
cp $D/components/seo/JsonLd.tsx components/seo/
cp "$D/app/[locale]/[...rest]/page.tsx" "app/[locale]/[...rest]/"
cp "$D/app/[locale]/not-found.tsx" "$D/app/[locale]/error.tsx" "app/[locale]/"
cp $D/tests/unit/jsonld.test.ts tests/unit/
```

- [ ] **Step 2: Write the failing tests**

`tests/unit/i18n.test.ts`:

```ts
import { describe, expect, test } from 'vitest'
import { routing } from '@/i18n/routing'
import en from '@/messages/en.json'
import vi from '@/messages/vi.json'

const flatten = (o: unknown, p = ''): string[] =>
  typeof o === 'object' && o !== null ? Object.entries(o).flatMap(([k, v]) => flatten(v, p ? `${p}.${k}` : k)) : [p]

describe('i18n', () => {
  test('pathnames cover every page with the slugs of spec §5', () => {
    expect(routing.pathnames).toEqual({
      '/': '/',
      '/k12': { vi: '/pho-thong', en: '/k12' },
      '/university': { vi: '/hoc-phan', en: '/university-courses' },
      '/program': { vi: '/chuong-trinh', en: '/program-review' },
      '/assistant': { vi: '/tro-ly-ai', en: '/ai-assistant' },
      '/pricing': { vi: '/cach-tinh-phi', en: '/pricing' },
      '/ai-transparency': { vi: '/minh-bach-ai', en: '/ai-transparency' },
      '/download': { vi: '/tai-ve', en: '/download' },
      '/install/[os]': { vi: '/huong-dan-cai-dat/[os]', en: '/install/[os]' },
      '/contact': { vi: '/lien-he', en: '/contact' },
      '/privacy': { vi: '/chinh-sach-bao-mat', en: '/privacy' },
    })
  })
  test('vi and en messages have the same keys', () => {
    expect(flatten(en).sort()).toEqual(flatten(vi).sort())
  })
  test('vi is the default locale without prefix and without detection', () => {
    expect(routing.defaultLocale).toBe('vi')
    expect(routing.localePrefix).toBe('as-needed')
    expect(routing.localeDetection).toBe(false)
  })
  test('the three level namespaces share one shape', () => {
    const shape = (o: unknown) => flatten(o).sort()
    expect(shape(vi.levels.university)).toEqual(shape(vi.levels.k12))
    expect(shape(vi.levels.program)).toEqual(shape(vi.levels.k12))
  })
})
```

`tests/unit/seo.test.ts` (sitemap cases are added in Task 13):

```ts
import { beforeAll, expect, test } from 'vitest'

beforeAll(() => {
  process.env.NEXT_PUBLIC_SITE_URL = 'https://eduflow.test'
})

test('absoluteUrl localizes slugs and prefixes', async () => {
  const { absoluteUrl } = await import('@/lib/seo/urls')
  expect(absoluteUrl('vi', '/')).toBe('https://eduflow.test')
  expect(absoluteUrl('en', '/')).toBe('https://eduflow.test/en')
  expect(absoluteUrl('vi', '/k12')).toBe('https://eduflow.test/pho-thong')
  expect(absoluteUrl('en', '/university')).toBe('https://eduflow.test/en/university-courses')
  expect(absoluteUrl('vi', '/pricing')).toBe('https://eduflow.test/cach-tinh-phi')
  expect(absoluteUrl('en', '/install/[os]', { os: 'macos' })).toBe('https://eduflow.test/en/install/macos')
  expect(absoluteUrl('vi', '/install/[os]', { os: 'windows' })).toBe('https://eduflow.test/huong-dan-cai-dat/windows')
})

test('buildMetadata emits canonical + hreflang with x-default = vi', async () => {
  const { buildMetadata } = await import('@/lib/seo/metadata')
  const m = buildMetadata({ locale: 'en', page: '/pricing', title: 'Pricing', description: 'd' })
  expect(m.alternates?.canonical).toBe('https://eduflow.test/en/pricing')
  expect(m.alternates?.languages).toEqual({
    vi: 'https://eduflow.test/cach-tinh-phi',
    en: 'https://eduflow.test/en/pricing',
    'x-default': 'https://eduflow.test/cach-tinh-phi',
  })
  expect(m.openGraph).toMatchObject({ locale: 'en_US', siteName: 'EduFlow', url: 'https://eduflow.test/en/pricing' })
  expect(buildMetadata({ locale: 'vi', page: '/', title: 'T', description: 'd', absoluteTitle: true }).title).toEqual({ absolute: 'T' })
})
```

`tests/unit/content.test.ts`:

```ts
import { readdirSync, readFileSync } from 'node:fs'
import { basename, dirname, extname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'
import en from '@/messages/en.json'
import vi from '@/messages/vi.json'

// Ai thêm hoặc xoá tệp MDX thì sửa hai số này (tổng, và riêng tiếng Anh): nhờ đó chắc chắn bộ quét thấy tệp.
const MDX_TOTAL = 0
const MDX_ENGLISH = 0

// Gốc repo tính từ vị trí tệp test này, không phụ thuộc thư mục đang chạy lệnh.
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const rel = (f: string) => relative(ROOT, f).split(sep).join('/')

const values = (o: unknown, p = ''): Array<[string, string]> =>
  typeof o === 'object' && o !== null
    ? Object.entries(o).flatMap(([k, v]) => values(v, p ? `${p}.${k}` : k))
    : [[p, String(o)]]

// Một bộ duyệt cho cả ba test. Không bắt lỗi: thư mục thiếu hoặc không đọc được thì test phải đỏ.
const walk = (dir: string, skipDir: (name: string) => boolean = () => false): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name)
    if (e.isDirectory()) return skipDir(e.name) ? [] : walk(p, skipDir)
    return e.isFile() ? [p] : []
  })

const mdxFiles = () => walk(join(ROOT, 'content')).filter((f) => f.endsWith('.mdx'))

// Trang tiếng Anh: có thư mục tên đúng "en", hoặc tên tệp đúng "en.mdx".
const isEnglish = (f: string) => {
  const parts = rel(f).split('/')
  return parts.slice(0, -1).includes('en') || parts.at(-1) === 'en.mdx'
}

// Luật nội dung của spec §15.
const FORBIDDEN = [/\u2014/, /đạt kiểm định/i, /thay (thế )?giáo viên/i, /replaces? teachers/i]

test('copy rules: no em-dash, no promised accreditation, no "AI replaces teachers"', () => {
  const mdx = mdxFiles()
  // soft: một lần chạy báo được cả số tệp sai lẫn nội dung vi phạm.
  expect.soft(mdx.length).toBe(MDX_TOTAL)
  const texts: Array<[string, string]> = [
    ...values(vi).map(([k, v]) => [`vi:${k}`, v] as [string, string]),
    ...values(en).map(([k, v]) => [`en:${k}`, v] as [string, string]),
    ...mdx.map((f) => [rel(f), readFileSync(f, 'utf8')] as [string, string]),
  ]
  // NFC trước khi so: cụm từ cấm viết dạng tổ hợp (chữ cái + dấu rời) cũng bị bắt.
  const hits = texts.flatMap(([where, text]) =>
    FORBIDDEN.filter((r) => r.test(text.normalize('NFC'))).map((r) => `${where} ${r}`),
  )
  expect(hits).toEqual([])
})

test('English copy carries no untranslated Vietnamese', () => {
  const VIETNAMESE = /[ăâđêôơưàáảãạằắẳẵặầấẩẫậèéẻẽẹềếểễệìíỉĩịòóỏõọồốổỗộờớởỡợùúủũụừứửữựỳýỷỹỵ]/i
  const ALLOWED = ['DÙNG THỬ']
  // NFC trước khi so: chữ Việt dạng tổ hợp (chữ cái + dấu rời) cũng bị bắt.
  const clean = (s: string) => ALLOWED.reduce((acc, a) => acc.split(a).join(''), s.normalize('NFC'))
  const mdx = mdxFiles().filter(isEnglish)
  expect.soft(mdx.length).toBe(MDX_ENGLISH)
  const texts: Array<[string, string]> = [
    ...values(en),
    ...mdx.map((f) => [rel(f), readFileSync(f, 'utf8')] as [string, string]),
  ]
  const offenders = texts.filter(([, text]) => VIETNAMESE.test(clean(text))).map(([where]) => where)
  expect(offenders).toEqual([])
})

// Cả mã nguồn, cấu hình và tài liệu, không chỉ chữ trên trang.
const SKIP_DIRS = new Set(['node_modules', 'out', 'coverage', 'test-results', 'playwright-report'])
const TEXT_EXTS = new Set('.ts .tsx .mts .mjs .js .json .md .mdx .css .yml .yaml .txt .svg .html'.split(' '))

test('no U+2014 em-dash in any source file', () => {
  const EM_DASH = /\u2014/
  const skipDir = (name: string) => (name.startsWith('.') && name !== '.github') || SKIP_DIRS.has(name)
  const isText = (f: string) => TEXT_EXTS.has(extname(f)) && basename(f) !== 'pnpm-lock.yaml'
  const files = walk(ROOT, skipDir).filter(isText)
  expect(files.length).toBeGreaterThan(40)
  expect(files.filter((f) => EM_DASH.test(readFileSync(f, 'utf8'))).map(rel)).toEqual([])
})
```

Update `tests/unit/jsonld.test.ts`: in the asset fixture use `fileName: 'EduFlow Setup 1.0.0.exe'`, `url: 'https://feed.example.test/desktop/EduFlow%20Setup%201.0.0.exe'`, `releaseDate: '2026-10-01T02:00:00.000Z'`; in the `softwareApplication` expectation use `name: 'EduFlow'`, `operatingSystem: 'macOS 12+, Windows 10 22H2+'`, `applicationCategory: 'EducationalApplication'`, `downloadUrl: 'https://eduflow.test/tai-ve'`, and pass `'https://eduflow.test/tai-ve'` as the third argument. Add `expect(app).not.toHaveProperty('offers')`.

- [ ] **Step 3: Run the tests to see them fail**

Run: `pnpm test`
Expected: FAIL only in `tests/unit/jsonld.test.ts` (the copied `softwareApplication` still returns DocOps values). `i18n`, `seo` and `content` tests pass, because the SEO helpers were copied in Step 1 and `messages/*.json` exist from Task 1.

- [ ] **Step 4: Implement**

In `lib/seo/jsonld.ts`, replace `softwareApplication` with:

```ts
export function softwareApplication(assets: ReleaseAsset[], locale: Locale, downloadPageUrl: string): JsonLd {
  const newest = [...assets].sort((a, b) => b.releaseDate.localeCompare(a.releaseDate))[0]
  // Không khai `offers`: EduFlow không công bố giá (spec §9).
  return {
    '@context': CONTEXT,
    '@type': 'SoftwareApplication',
    name: site.name,
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'macOS 12+, Windows 10 22H2+',
    inLanguage: locale,
    downloadUrl: downloadPageUrl,
    publisher: { '@type': 'Organization', name: site.company, url: site.companyUrl },
    ...(newest ? { softwareVersion: newest.version, datePublished: newest.releaseDate.slice(0, 10) } : {}),
  }
}
```

In `lib/seo/metadata.ts`, change the comment `/** Trang chủ: không nối template '· Agentra DocOps'. */` to `/** Trang chủ: không nối template '· EduFlow'. */`.

`app/[locale]/layout.tsx` (chrome is added in Task 4):

```tsx
import type { Metadata, Viewport } from 'next'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { Be_Vietnam_Pro, Fraunces, JetBrains_Mono } from 'next/font/google'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { site } from '@/lib/site'
import '@/app/globals.css'

// ROOT layout (không có app/layout.tsx) để `locale` là root param, đọc được khi render tĩnh (next-intl 4, Next 16.3).
const sans = Be_Vietnam_Pro({ subsets: ['latin', 'vietnamese'], weight: ['400', '600', '700'], variable: '--font-be-vietnam', display: 'swap' })
const display = Fraunces({ subsets: ['latin', 'vietnamese'], weight: ['600', '700'], variable: '--font-fraunces', display: 'swap' })
const mono = JetBrains_Mono({ subsets: ['latin', 'vietnamese'], weight: ['400', '600'], variable: '--font-jetbrains', display: 'swap' })

export const dynamicParams = false
export const viewport: Viewport = { themeColor: '#237A31', width: 'device-width', initialScale: 1 }

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  const t = await getTranslations({ locale, namespace: 'common' })
  const verification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
  return {
    metadataBase: new URL(site.siteUrl()),
    title: { default: t('siteName'), template: `%s · ${t('siteName')}` },
    description: t('tagline'),
    applicationName: t('siteName'),
    robots: { index: true, follow: true },
    ...(verification ? { verification: { google: verification } } : {}),
  }
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  return (
    <html lang={locale} className={`${sans.variable} ${display.variable} ${mono.variable}`}>
      <body className="flex min-h-dvh flex-col bg-page font-sans text-ink antialiased">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  )
}
```

If `next build` reports that a font does not support the `vietnamese` subset, use `subsets: ['latin', 'latin-ext']` for that font only.

Temporary `app/[locale]/page.tsx`:

```tsx
import { useTranslations } from 'next-intl'

export default function HomePage() {
  const t = useTranslations('home.hero')
  return (
    <main id="main" className="flex-1 p-10">
      <h1 className="font-display text-4xl font-bold">{t('h1')}</h1>
    </main>
  )
}
```

`app/globals.css` placeholder until Task 4:

```css
@import "tailwindcss";
```

- [ ] **Step 5: Run everything**

Run: `pnpm verify && pnpm build`
Expected: all unit tests PASS; the build lists `/` and `/en` as static (○) and the 404 route.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(i18n): routing vi/en với slug dịch, layout ba font, SEO helpers, test luật nội dung"
```

### Task 4: Design tokens, UI primitives, logo, site chrome, consent and analytics

**Files:**
- Copy verbatim from DOCOPS: `components/ui/{Button,Callout,Card,Container,Icon,Section}.tsx`, `components/ui/icons.ts`, `components/site/{AnalyticsGate,ConsentBar,CopyButton,LocaleSwitcher,MobileNav,SkipLink,TrackedAnchor}.tsx`, `tests/unit/icon.test.ts`
- Create: `app/globals.css` (replace placeholder), `components/ui/Logo.tsx`, `components/ui/WindowFrame.tsx`, `components/ui/CtaBand.tsx`, `components/site/Header.tsx`, `components/site/NavLinks.tsx`, `components/site/Footer.tsx`
- Modify: `components/ui/icons.ts` (add icons), `components/site/MobileNav.tsx` (panel offset), `app/[locale]/layout.tsx` (chrome)

**Interfaces:**
- Consumes: `track` (Task 2), `useConsent` (Task 2), `Link` (Task 3).
- Produces: `Button`, `ButtonLink({ href, variant?: 'primary'|'secondary'|'white'|'ghost-white', size?: 'sm'|'md'|'lg', icon?, iconAfter?, full?, className?, onClick? })`, `buttonClasses(variant, size, full, className)`; `Icon({ name, size?, strokeWidth?, className? })`; `IconName` now also includes `spark`, `graduation`, `wifi-off`, `eye`, `wallet`, `layers`, `shuffle`, `receipt`; `LogoMark({ size?, title? })`, `Wordmark({ className? })`; `WindowFrame({ src, alt, title, width?, height?, priority?, sizes, className? })`; `CtaBand({ title, sub, primary: { href: Href; label: string; icon?: IconName }, secondary: { href: Href; label: string } })`; `Header()`, `Footer()`, `NAV_ITEMS`.

- [ ] **Step 1: Copy the verbatim files**

```bash
D=../docops-landing-page
mkdir -p components/ui components/site
cp $D/components/ui/{Button,Callout,Card,Container,Icon,Section}.tsx $D/components/ui/icons.ts components/ui/
cp $D/components/site/{AnalyticsGate,ConsentBar,CopyButton,LocaleSwitcher,MobileNav,SkipLink,TrackedAnchor}.tsx components/site/
cp $D/tests/unit/icon.test.ts tests/unit/
```

- [ ] **Step 2: Write the failing test for the new icons**

Append to `tests/unit/icon.test.ts`:

```ts
test('EduFlow icons exist', () => {
  for (const name of ['spark', 'graduation', 'wifi-off', 'eye', 'wallet', 'layers', 'shuffle', 'receipt'] as const) {
    expect(ICON_NAMES).toContain(name)
    expect(ICONS[name]).toMatch(/<(path|circle|rect)/)
  }
})
```

Run: `pnpm test tests/unit/icon.test.ts` → FAIL (names missing).

- [ ] **Step 3: Implement tokens, icons and primitives**

`app/globals.css`:

```css
@import "tailwindcss";

/* Bảng màu Phấn xanh của app EduFlow (spec §8.1), đặt vào tên token kế thừa từ docops-landing-page để dùng lại component:
   paper→page, surface→card/card2, ink-2→ink2, ink-3→muted, brand-strong→accent, chữ link→accent-strong,
   brand-tint→accent-soft, lime→brand-light, tier1→brand-deep. */
@theme {
  --color-page: #F6F7F2;
  --color-card: #FFFFFF;
  --color-card2: #FFFFFF;
  --color-sidebar: #EEF1EA;
  --color-chrome: #ECEEE8;
  --color-ink: #16201A;
  --color-ink2: #3F4A43;
  --color-muted: #5B675F;
  --color-line: #DDE3DA;
  --color-brand-light: #9BCB3C;
  --color-brand: #2F8F3C;
  --color-accent: #237A31;
  --color-accent-strong: #1F6A2B;
  --color-accent-soft: #E8F3E7;
  --color-accent-line: #CFE3CC;
  --color-brand-deep: #1E2B23;
  --color-tier3: #6D28D9;
  --color-good: #2F8F3C;
  --color-warn-dot: #F59E0B;
  --color-warn-soft: #FEF3C7;
  --color-warn-text: #9A4A06;
  --color-warn-border: #F5DFA0;
  --color-crit: #B42318;
  --color-info-soft: #E0EAFF;
  --color-info-text: #1E3A8A;
  --color-info-border: #C7D7FE;
  --radius-card: 14px;
  --radius-control: 10px;
  --radius-modal: 16px;
}

@theme inline {
  --font-sans: var(--font-be-vietnam), system-ui, -apple-system, "Segoe UI", sans-serif;
  --font-display: var(--font-fraunces), Georgia, serif;
  --font-mono: var(--font-jetbrains), ui-monospace, "SF Mono", Menlo, monospace;
}

html {
  scroll-behavior: smooth;
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
}

body {
  text-rendering: optimizeLegibility;
}

/* Mọi H1, H2 dùng Fraunces (Global Constraints), kể cả tiêu đề trong MDX và trong trang chép từ docops-landing-page. */
@layer base {
  h1,
  h2 {
    @apply font-display;
  }
}
```

In `components/ui/icons.ts`, replace the first line (a comment that carries an em-dash and points at a generator script this repo does not have) with `// Bộ icon SVG nét 1.6px trên lưới 24. Không dùng emoji.`, then add these names to `ICON_NAMES` (before `"apple"`) and these entries to `ICONS`:

```ts
'eye': "<path d=\"M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z\"></path><circle cx=\"12\" cy=\"12\" r=\"3\"></circle>",
'graduation': "<path d=\"M2 9l10-5 10 5-10 5z\"></path><path d=\"M6 11v5c3 2 9 2 12 0v-5\"></path>",
'layers': "<path d=\"M12 3 2 8l10 5 10-5z\"></path><path d=\"m2 13 10 5 10-5\"></path>",
'receipt': "<path d=\"M6 3h12v18l-3-2-3 2-3-2-3 2z\"></path><path d=\"M9 8h6M9 12h6\"></path>",
'shuffle': "<path d=\"M16 3h5v5\"></path><path d=\"M4 20 21 3\"></path><path d=\"M21 16v5h-5\"></path><path d=\"m15 15 6 6\"></path><path d=\"m4 4 5 5\"></path>",
'spark': "<path d=\"M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z\"></path><path d=\"M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z\"></path>",
'wallet': "<rect x=\"3\" y=\"6\" width=\"18\" height=\"13\" rx=\"2\"></rect><path d=\"M16 12h3\"></path><path d=\"M3 9h14a2 2 0 0 0 2-2V6\"></path>",
'wifi-off': "<path d=\"M3 3l18 18\"></path><path d=\"M8.5 16a5 5 0 0 1 7 0\"></path><path d=\"M5.5 12.5a9.5 9.5 0 0 1 3.4-2.2M13 9.1a9.5 9.5 0 0 1 5.5 3.4\"></path><circle cx=\"12\" cy=\"19.5\" r=\"1\"></circle>",
```

`components/ui/Logo.tsx`:

```tsx
import { cn } from '@/lib/cn'

/** Logo EduFlow như trong app: ô vuông xanh bo góc với nét chữ E trắng (canvas app, khung 34 px, icon 17 px trên lưới 24). */
export function LogoMark({ size = 30, title }: { size?: number; title?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 34 34" fill="none" {...(title ? { role: 'img', 'aria-label': title } : { 'aria-hidden': true })}>
      {title ? <title>{title}</title> : null}
      <rect width="34" height="34" rx="9" fill="#237A31" />
      <g transform="translate(8.5 8.5) scale(0.7083)" stroke="#FFFFFF" strokeWidth="3.1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19V5h10" />
        <path d="M4 12h8" />
        <path d="M4 19h12" />
      </g>
    </svg>
  )
}

/** Chữ EduFlow bằng Fraunces với gạch lime bên dưới. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex flex-col', className)}>
      <span className="font-display text-[19px] leading-none font-bold text-ink">EduFlow</span>
      <span className="mt-1.5 block h-0.5 w-9 bg-brand-light" aria-hidden="true" />
    </span>
  )
}
```

`components/ui/WindowFrame.tsx`:

```tsx
import Image from 'next/image'
import { cn } from '@/lib/cn'

/** Ảnh sản phẩm trong khung cửa sổ: thanh tiêu đề giả và bóng đổ (spec §8.3). */
export function WindowFrame({
  src,
  alt,
  title,
  width = 1600,
  height = 1000,
  priority = false,
  sizes,
  className,
}: {
  src: string
  alt: string
  title: string
  width?: number
  height?: number
  priority?: boolean
  sizes: string
  className?: string
}) {
  return (
    <figure className={cn('overflow-hidden rounded-[14px] border border-line bg-card shadow-[0_30px_70px_-30px_rgba(22,32,26,0.45)]', className)}>
      <div className="flex h-9 items-center gap-2 border-b border-line bg-chrome px-4" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span key={i} className="h-2.5 w-2.5 rounded-full bg-[#D5DAD1]" />
        ))}
        <span className="ml-2 truncate text-[12.5px] text-muted">{title}</span>
      </div>
      <Image src={src} alt={alt} width={width} height={height} priority={priority} sizes={sizes} className="h-auto w-full" />
    </figure>
  )
}
```

`components/ui/CtaBand.tsx`:

```tsx
import type { ComponentProps } from 'react'
import { ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import type { IconName } from '@/components/ui/icons'

type Href = ComponentProps<typeof ButtonLink>['href']

/** Dải kêu gọi cuối trang, nền xanh đậm (tier1). */
export function CtaBand({
  title,
  sub,
  primary,
  secondary,
}: {
  title: string
  sub: string
  primary: { href: Href; label: string; icon?: IconName }
  secondary: { href: Href; label: string }
}) {
  return (
    <section className="bg-brand-deep py-14 md:py-22">
      <Container className="flex flex-col items-center gap-4 text-center md:gap-5">
        <h2 className="max-w-[820px] font-display text-[28px] leading-[1.18] font-bold text-white text-balance md:text-[38px] md:leading-[1.15]">{title}</h2>
        <p className="max-w-[640px] text-[15.5px] leading-relaxed text-white/80 md:text-[17px]">{sub}</p>
        <div className="mt-2 flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row sm:gap-3">
          <ButtonLink href={primary.href} variant="white" size="lg" icon={primary.icon ?? 'download'} className="w-full sm:w-auto">
            {primary.label}
          </ButtonLink>
          <ButtonLink href={secondary.href} variant="ghost-white" size="lg" className="w-full sm:w-auto">
            {secondary.label}
          </ButtonLink>
        </div>
      </Container>
    </section>
  )
}
```

- [ ] **Step 4: Implement the site chrome**

`components/site/NavLinks.tsx`: copy DOCOPS's file and replace `NAV_ITEMS` with:

```ts
export const NAV_ITEMS = [
  { href: '/k12', key: 'k12' },
  { href: '/university', key: 'university' },
  { href: '/program', key: 'program' },
  { href: '/assistant', key: 'assistant' },
  { href: '/pricing', key: 'pricing' },
] as const
```

`components/site/Header.tsx`:

```tsx
import { useTranslations } from 'next-intl'
import { ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { LogoMark, Wordmark } from '@/components/ui/Logo'
import { Link } from '@/i18n/navigation'
import { LocaleSwitcher } from './LocaleSwitcher'
import { MobileNav } from './MobileNav'
import { NavLinks } from './NavLinks'

export function Header() {
  const t = useTranslations('common')
  return (
    <header className="sticky top-0 z-30 h-16 border-b border-line md:h-[72px]">
      {/* Nền mờ nằm ở lớp riêng. Đặt backdrop-filter lên chính header sẽ biến header thành khung chứa của panel menu `fixed`, làm panel chỉ còn cao 49 px trên Chrome. */}
      <div className="absolute inset-0 -z-10 bg-card/95 backdrop-blur" aria-hidden="true" />
      <Container className="flex h-full items-center gap-8">
        <Link href="/" className="flex min-h-11 items-center gap-2.5">
          <LogoMark size={30} />
          <Wordmark />
        </Link>
        {/* Menu ngang hiện từ 1100 px. Ở 1024 px bản tiếng Anh cần 999 px cho một hàng, trong khi chỉ có 960 px. */}
        <nav aria-label={t('mainNav')} className="ml-auto hidden items-center gap-6 min-[1100px]:flex">
          <NavLinks className="whitespace-nowrap" />
        </nav>
        <div className="hidden items-center gap-3.5 min-[1100px]:flex">
          <LocaleSwitcher />
          <ButtonLink href="/download" size="sm" icon="download">
            {t('download')}
          </ButtonLink>
        </div>
        <div className="ml-auto min-[1100px]:hidden">
          <MobileNav />
        </div>
      </Container>
    </header>
  )
}
```

In `components/site/MobileNav.tsx`, change the panel class `fixed inset-x-0 top-16 bottom-0` to `fixed inset-x-0 top-16 bottom-0 md:top-[72px]` (the header is 72 px tall from `md`, and the mobile menu now shows up to 1100 px).

In `components/site/LocaleSwitcher.tsx`, change the link class `inline-flex h-[30px] items-center rounded-full px-2.5` to `inline-flex h-11 items-center rounded-full px-3.5 md:h-[30px] md:px-2.5`, so the VI/EN pills are 44 px tall on phones (spec §8.3).

In `components/site/CopyButton.tsx`, change the button class `inline-flex items-center gap-1.5 text-[14.5px] font-semibold text-accent-strong hover:text-accent` to `inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 text-[14.5px] font-semibold text-accent-strong hover:text-accent md:min-h-0 md:min-w-0`, for the same reason. The rule for every later task: a link, button or `<summary>` that stands on its own (anything that is not a link inside a line of text) is at least 44 px tall below `md`; Task 14 checks it on every page.

`components/site/Footer.tsx`:

```tsx
import { useLocale, useTranslations } from 'next-intl'
import { Container } from '@/components/ui/Container'
import { LogoMark, Wordmark } from '@/components/ui/Logo'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { site } from '@/lib/site'
import { LocaleSwitcher } from './LocaleSwitcher'

// Trên điện thoại mỗi link cao tối thiểu 44 px (spec §8.3).
const linkClass = 'inline-flex min-h-11 items-center text-[15px] text-ink2 transition-colors hover:text-ink md:min-h-0'

export function Footer() {
  const t = useTranslations('footer')
  const tn = useTranslations('nav')
  const locale = useLocale() as Locale
  return (
    <footer className="border-t border-line bg-sidebar pt-14 pb-8 md:pt-16">
      <Container>
        {/* Năm cột từ 1024 px. Ở 768 px cột cuối chỉ rộng khoảng 104 px, email không ngắt dòng được sẽ tràn ngang (Ruling 29). */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(4,minmax(0,1fr))]">
          <div className="flex max-w-[340px] flex-col gap-4 sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex min-h-11 items-center gap-2.5 md:min-h-0">
              <LogoMark size={30} />
              <Wordmark />
            </Link>
            <p className="text-[15px] leading-relaxed text-ink2">{t('tagline')}</p>
            <p className="text-sm text-muted">
              {site.company} · {site.city[locale]}, {site.country[locale]} · {site.email}
            </p>
          </div>
          <FooterColumn title={t('product')}>
            <Link href="/k12" className={linkClass}>{tn('k12')}</Link>
            <Link href="/university" className={linkClass}>{tn('university')}</Link>
            <Link href="/program" className={linkClass}>{tn('program')}</Link>
            <Link href="/assistant" className={linkClass}>{tn('assistant')}</Link>
            <Link href="/download" className={linkClass}>{tn('download')}</Link>
          </FooterColumn>
          <FooterColumn title={t('guides')}>
            <Link href={{ pathname: '/install/[os]', params: { os: 'macos' } }} className={linkClass}>{t('installMacos')}</Link>
            <Link href={{ pathname: '/install/[os]', params: { os: 'windows' } }} className={linkClass}>{t('installWindows')}</Link>
            <Link href="/pricing" className={linkClass}>{tn('pricing')}</Link>
          </FooterColumn>
          <FooterColumn title={t('trust')}>
            <Link href="/ai-transparency" className={linkClass}>{tn('transparency')}</Link>
            <Link href="/privacy" className={linkClass}>{t('privacy')}</Link>
          </FooterColumn>
          <FooterColumn title={t('company')}>
            <a href={site.companyUrl} className={linkClass} rel="noopener">{site.company}</a>
            <Link href="/contact" className={linkClass}>{tn('contact')}</Link>
            <a href={`mailto:${site.email}`} className={linkClass}>{site.email}</a>
          </FooterColumn>
        </div>
        <div className="mt-12 flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-[13.5px] text-muted">{t('copyright', { year: 2026 })}</span>
          <LocaleSwitcher />
        </div>
      </Container>
    </footer>
  )
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 md:gap-3">
      <span className="text-[13px] font-bold tracking-[0.5px] text-muted uppercase">{title}</span>
      {children}
    </div>
  )
}
```

In `app/[locale]/layout.tsx`, add `data-scroll-behavior="smooth"` to the `<html>` element (Next 16 turns smooth scrolling off during route changes only when this attribute is present, Ruling 30), then add the imports and wrap the children exactly like DOCOPS:

```tsx
import { AnalyticsGate } from '@/components/site/AnalyticsGate'
import { ConsentBar } from '@/components/site/ConsentBar'
import { Footer } from '@/components/site/Footer'
import { Header } from '@/components/site/Header'
import { SkipLink } from '@/components/site/SkipLink'
```

```tsx
<NextIntlClientProvider>
  <SkipLink />
  <Header />
  {children}
  <Footer />
  <ConsentBar />
  <AnalyticsGate gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
</NextIntlClientProvider>
```

- [ ] **Step 5: Run everything**

Run: `pnpm verify && pnpm build`
Expected: PASS. Then `pnpm dev`, open `/` and `/en`: header shows the logo, 5 nav links from 1100 px, the menu button below it; footer has 4 columns; the consent bar appears; switching VI/EN keeps the page.

Then measure the mobile menu in a real browser (headless Chromium, viewport 390×844, against `pnpm start`): open `/`, press the button named "Mở menu" and read the bounding box of `#mobile-nav`. Expected: top 64 px, height 780 px. A height near 49 px means the header itself carries `backdrop-filter` again, which turns the header into the containing block of the `fixed` panel. Also check at 1100 px wide (viewport 1100×800), in both languages, that the header nav sits on one line (every `header nav a` has the same height) and that the page has no horizontal overflow; at 1099 px the menu button shows instead of the nav.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(ui): token Phấn xanh, logo EduFlow, primitives, header và footer, thanh đồng ý cookie"
```

### Task 5: Product images from the app canvas

**Files:**
- Create: `scripts/capture-product-images.mjs`, `public/images/product/*.webp` (13 files), `tests/unit/images.test.ts`

**Interfaces:**
- Produces: WebP files used by later tasks: `assistant-home` (2000×1250), and at 1600×1000: `result`, `exam-setup`, `slide-studio`, `course-workbench`, `course-gates`, `course-approval`, `program-graph`, `program-review`, `what-if`, `assistant-states`, `usage`, `jobs-cost`.

- [ ] **Step 1: Write the failing test**

`tests/unit/images.test.ts`:

```ts
import { statSync } from 'node:fs'
import { expect, test } from 'vitest'

export const PRODUCT_IMAGES = [
  'assistant-home', 'result', 'exam-setup', 'slide-studio', 'course-workbench', 'course-gates', 'course-approval',
  'program-graph', 'program-review', 'what-if', 'assistant-states', 'usage', 'jobs-cost',
] as const

test('every product image exists and weighs at most 200 KB (spec §8.3)', () => {
  for (const name of PRODUCT_IMAGES) {
    const size = statSync(`public/images/product/${name}.webp`).size
    expect(size, name).toBeGreaterThan(10_000)
    expect(size, name).toBeLessThanOrEqual(200 * 1024)
  }
})
```

Run: `pnpm test tests/unit/images.test.ts` → FAIL (files missing).

- [ ] **Step 2: Write the capture script**

`scripts/capture-product-images.mjs` (the DOCOPS script with three changes: `sc-if` is evaluated instead of always kept, and `isMac` and `isWin` are forced to false, so the app's own title bar is left out and the page's `WindowFrame` draws the only one, as on the landing canvas (Ruling 31); the `Component` class is built from the artboard's `<script type="text/x-dc">`, which a browser does not run by itself; and the script waits for the web fonts and stops with an error when a `{{…}}` hole or an `sc-*` tag is left):

```js
// Chụp artboard app EduFlow (../eduflow-application/docs/thiet-ke/canvas/project/*.dc.html) thành WebP cho site, không kèm thanh tiêu đề của app (WindowFrame vẽ khung).
// Dùng: node scripts/capture-product-images.mjs [<thư mục artboard>] [--os macOS|Windows]
import { mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { chromium } from '@playwright/test'
import sharp from 'sharp'

const args = process.argv.slice(2)
const osIdx = args.indexOf('--os')
const os = osIdx > -1 ? args[osIdx + 1] : 'macOS'
const positional = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--os')
const srcDir = resolve(positional[0] ?? '../eduflow-application/docs/thiet-ke/canvas/project')
const outDir = 'public/images/product'
const SHOTS = [
  { artboard: 'AssistantHome', out: 'assistant-home', width: 2000, quality: 74 },
  { artboard: 'Result', out: 'result', width: 1600, quality: 72 },
  { artboard: 'ExamSetup', out: 'exam-setup', width: 1600, quality: 72 },
  { artboard: 'SlideStudio', out: 'slide-studio', width: 1600, quality: 72 },
  { artboard: 'CourseWorkbench', out: 'course-workbench', width: 1600, quality: 72 },
  { artboard: 'CourseGates', out: 'course-gates', width: 1600, quality: 72 },
  { artboard: 'CourseApproval', out: 'course-approval', width: 1600, quality: 72 },
  { artboard: 'ProgramGraph', out: 'program-graph', width: 1600, quality: 72 },
  { artboard: 'ProgramReview', out: 'program-review', width: 1600, quality: 72 },
  { artboard: 'WhatIf', out: 'what-if', width: 1600, quality: 72 },
  { artboard: 'AssistantStates', out: 'assistant-states', width: 1600, quality: 72 },
  { artboard: 'Usage', out: 'usage', width: 1600, quality: 72 },
  { artboard: 'JobsCost', out: 'jobs-cost', width: 1600, quality: 72 },
]

const tmp = await mkdtemp(join(tmpdir(), 'eduflow-shots-'))
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })
await page.addInitScript(() => {
  window.DCLogic = class DCLogic {
    constructor(props) { this.props = props || {}; this.state = {} }
    setState() {}
    forceUpdate() {}
  }
})
for (const shot of SHOTS) {
  await page.goto(`file://${join(srcDir, `${shot.artboard}.dc.html`)}`, { waitUntil: 'load' })
  await page.evaluate((osName) => {
    // Artboard EduFlow khai báo logic trong <script type="text/x-dc">, trình duyệt không tự chạy thẻ này,
    // nên dựng lớp Component từ mã nguồn của nó.
    const source = document.querySelector('script[data-dc-script]')?.textContent ?? ''
    const Comp = source ? new Function('DCLogic', `${source}\nreturn Component`)(window.DCLogic) : null
    const vals = Comp ? (new Comp({ os: osName }).renderVals?.() ?? {}) : {}
    // Khung cửa sổ do WindowFrame của trang vẽ, nên bỏ thanh tiêu đề macOS và Windows của chính artboard.
    vals.isMac = false
    vals.isWin = false
    const lookup = (scope, path) => path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), scope)
    const fill = (html, scope) =>
      html.replace(/\{\{\s*([\w$.]+)\s*\}\}/g, (m, p) => { const v = lookup(scope, p); return v === undefined ? m : String(v) })
    const outermost = (root) => Array.from(root.querySelectorAll('sc-for')).filter((n) => !n.parentElement?.closest('sc-for'))
    const renderFor = (el, scope) => {
      const list = lookup(scope, (el.getAttribute('list') || '').replace(/[{}\s]/g, '')) || []
      const alias = el.getAttribute('as') || 'item'
      return list.map((item, i) => {
        const s = Object.assign({}, scope, { [alias]: item, $index: i })
        const tmpEl = document.createElement('div')
        tmpEl.innerHTML = el.innerHTML
        for (const n of outermost(tmpEl)) n.outerHTML = renderFor(n, s)
        return fill(tmpEl.innerHTML, s)
      }).join('')
    }
    for (const n of outermost(document.body)) n.outerHTML = renderFor(n, vals)
    document.body.innerHTML = fill(document.body.innerHTML, vals)
    // sc-if: giữ nội dung khi giá trị đúng, bỏ khi sai (khung macOS hay Windows). Xử lý từng phần tử một vì
    // thay outerHTML tạo lại các sc-if lồng bên trong.
    const truthy = (expr) => {
      const e = (expr || '').replace(/[{}\s]/g, '')
      if (e === 'true') return true
      if (e === 'false' || e === '') return false
      return Boolean(lookup(vals, e))
    }
    for (let n = document.querySelector('sc-if'); n; n = document.querySelector('sc-if')) {
      n.outerHTML = truthy(n.getAttribute('value')) ? n.innerHTML : ''
    }
  }, os)
  // Chờ stylesheet và font web nạp xong sau khi dựng lại DOM, rồi kiểm không còn lỗ {{…}} hay thẻ sc-* nào sót.
  const state = await page.evaluate(async () => {
    await Promise.all(
      Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map((l) =>
        l.sheet ? null : new Promise((done) => { l.addEventListener('load', done); l.addEventListener('error', done) })),
    )
    await Promise.all(Array.from(document.fonts).map((f) => f.load().catch(() => null)))
    await document.fonts.ready
    const root = document.querySelector('x-dc') ?? document.body
    const loaded = new Set(Array.from(document.fonts).filter((f) => f.status === 'loaded').map((f) => f.family.replace(/["']/g, '')))
    return {
      holes: (root.innerText.match(/\{\{[^}]*\}\}/g) ?? []).length,
      tags: root.querySelectorAll('sc-for, sc-if').length,
      fonts: ['Be Vietnam Pro', 'Fraunces', 'JetBrains Mono'].every((name) => loaded.has(name)),
    }
  })
  if (state.holes > 0 || state.tags > 0) throw new Error(`${shot.artboard}: còn ${state.holes} lỗ chưa điền, ${state.tags} thẻ sc-* chưa dựng`)
  if (!state.fonts) throw new Error(`${shot.artboard}: font web chưa nạp, cần mạng để tải Google Fonts`)
  await page.waitForTimeout(300)
  const png = join(tmp, `${shot.out}.png`)
  await page.screenshot({ path: png, type: 'png' })
  const out = join(outDir, `${shot.out}.webp`)
  const info = await sharp(png).resize({ width: shot.width }).webp({ quality: shot.quality }).toFile(out)
  console.log(`${out}  ${info.width}×${info.height}  ${Math.round(info.size / 1024)} KB`)
}
await browser.close()
```

- [ ] **Step 3: Capture**

```bash
mkdir -p public/images/product
pnpm exec playwright install chromium
node scripts/capture-product-images.mjs
```

Expected: 13 lines, each between 95 and 150 KB (the 13 artboards are 1440×900, so every image is 1600×1000 except `assistant-home` at 2000×1250). If a file is over 200 KB, lower its `quality` by 4 and run again. Open three of the images and check that no title bar is drawn (the app's left rail and content start at the top edge; the page's `WindowFrame` adds the bar), that the tables and lists carry rows, and that no `{{…}}` text is visible.

- [ ] **Step 4: Run the test**

Run: `pnpm test tests/unit/images.test.ts` → PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/capture-product-images.mjs public/images/product tests/unit/images.test.ts
git commit -m "feat(images): chụp 13 ảnh sản phẩm WebP từ canvas app EduFlow"
```

### Task 6: Home page

Start after the PO approved the copy in Task 1.

**Files:**
- Copy verbatim from DOCOPS: `components/home/Faq.tsx`, `components/download/DownloadLink.tsx`
- Copy then modify: `components/home/SectionHead.tsx`, `components/home/TrustGrid.tsx`, `components/home/FaqSection.tsx`, `components/download/PlatformCard.tsx`, `components/download/ChecksumField.tsx`
- Create: `components/home/{Hero,HeroCta,LevelCards,AssistantShowcase,PipelineStrip,CostTeaser,DownloadBlock,FinalCta}.tsx`, `components/download/PrelaunchNotice.tsx`, `app/[locale]/page.tsx` (replace)

**Interfaces:**
- Consumes: `getReleases`, `latestRelease`, `downloadState` (Task 2); `buildMetadata`, `absoluteUrl`, JSON-LD helpers (Task 3); `WindowFrame`, `CtaBand`, `ButtonLink`, `buttonClasses`, `Icon` (Task 4); product images (Task 5).
- Produces: `SectionHead({ eyebrow, title, lead?, align?, as? })`; `PrelaunchNotice({ title, body, cta, headingLevel? })`; `PlatformCard({ asset, locale, location, highlighted?, badge?, checksum?, guideLabel?, headingLevel? })`; `DownloadLink({ asset, location, variant?, size?, full?, className, children })`; `FAQ_KEYS` (8 keys).

- [ ] **Step 1: Copy and adjust shared pieces**

```bash
D=../docops-landing-page
mkdir -p components/home components/download
cp $D/components/home/{Faq,SectionHead,TrustGrid,FaqSection}.tsx components/home/
cp $D/components/download/{DownloadLink,ChecksumField,PlatformCard}.tsx components/download/
```

In `components/home/SectionHead.tsx`, add `font-display` to the heading class: `className="max-w-[800px] font-display text-[28px] …"`.

In `components/home/FaqSection.tsx`, set `export const FAQ_KEYS = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8'] as const`.

In `components/home/TrustGrid.tsx`, replace `ITEMS` with six entries and keep the rest:

```ts
const ITEMS: Array<{ key: 't1' | 't2' | 't3' | 't4' | 't5' | 't6'; icon: IconName }> = [
  { key: 't1', icon: 'laptop' },
  { key: 't2', icon: 'layers' },
  { key: 't3', icon: 'shield' },
  { key: 't4', icon: 'lock' },
  { key: 't5', icon: 'wifi-off' },
  { key: 't6', icon: 'wallet' },
]
```

In `components/download/PlatformCard.tsx`: delete the `codename` import; replace `{versionLabel(asset.version)}` with `v{asset.version}`; replace `shadow-[0_0_0_3px_#eff5e3]` with `shadow-[0_0_0_3px_#E8F3E7]`; replace `<Heading className="text-lg leading-snug font-semibold">` with `<Heading className={cn('text-lg leading-snug font-semibold', headingLevel === 'h2' && 'font-display')}>` (H1 and H2 use Fraunces).

Tap targets (spec §8.3, 44 px on phones): add `min-h-11 md:min-h-0` to the class of three elements that are `inline-flex items-center` already: the text link under the grid in `components/home/TrustGrid.tsx`, the guide link at the bottom of `components/download/PlatformCard.tsx`, and the `<summary>` in `components/download/ChecksumField.tsx`.

- [ ] **Step 2: Create the new home components**

`components/download/PrelaunchNotice.tsx`:

```tsx
import { ButtonLink } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'

/** Trạng thái sắp phát hành: chưa có bản cài nào (spec §6.8). Mọi lối tải dẫn về đây và về trang Liên hệ. */
export function PrelaunchNotice({ title, body, cta, headingLevel = 'h2' }: { title: string; body: string; cta: string; headingLevel?: 'h2' | 'h3' }) {
  const Heading = headingLevel
  return (
    <div data-testid="prelaunch" className="mx-auto flex max-w-[760px] flex-col items-center gap-4 rounded-card border border-accent-line bg-accent-soft px-6 py-10 text-center">
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-card text-accent-strong">
        <Icon name="clock" size={24} />
      </span>
      <Heading className="font-display text-2xl font-bold">{title}</Heading>
      <p className="max-w-[560px] text-[15.5px] leading-relaxed text-ink2">{body}</p>
      <ButtonLink href="/contact" icon="mail">
        {cta}
      </ButtonLink>
    </div>
  )
}
```

`components/home/HeroCta.tsx`:

```tsx
'use client'

import { DownloadLink } from '@/components/download/DownloadLink'
import { ButtonLink, buttonClasses } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { track } from '@/lib/analytics'
import { downloadState } from '@/lib/releases/state'
import type { ReleaseAsset } from '@/lib/releases/types'
import { usePlatform } from '@/lib/usePlatform'

/**
 * Nút chính của hero. Sắp phát hành → Liên hệ để dùng sớm. Windows → tải thẳng .exe. macOS, điện thoại, máy tính bảng,
 * Linux → trang Tải về (trình duyệt không phân biệt chip Mac; điện thoại không cài được app desktop).
 */
export function HeroCta({
  assets,
  labels,
}: {
  assets: ReleaseAsset[]
  labels: { default: string; mac: string; windows: string; prelaunch: string; secondary: string }
}) {
  const os = usePlatform()
  const windows = assets.find((a) => a.platform === 'windows-x64')
  let primary: React.ReactNode
  if (downloadState(assets) === 'prelaunch') {
    primary = (
      <ButtonLink href="/contact" size="lg" icon="mail" className="w-full sm:w-auto" onClick={() => track({ name: 'cta_click', id: 'hero_early_access', location: 'hero' })}>
        {labels.prelaunch}
      </ButtonLink>
    )
  } else if (os === 'windows' && windows) {
    primary = (
      <DownloadLink asset={windows} location="hero" size="lg" className="w-full sm:w-auto">
        {labels.windows}
      </DownloadLink>
    )
  } else {
    primary = (
      <ButtonLink
        href="/download"
        size="lg"
        icon="download"
        className="w-full sm:w-auto"
        onClick={() => track({ name: 'cta_click', id: os === 'macos' ? 'hero_download_mac' : 'hero_download', location: 'hero' })}
      >
        {os === 'macos' ? labels.mac : labels.default}
      </ButtonLink>
    )
  }
  return (
    <div className="mt-1.5 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
      {primary}
      <a
        href="#tro-ly"
        className={buttonClasses('secondary', 'lg', false, 'w-full sm:w-auto')}
        onClick={() => track({ name: 'cta_click', id: 'hero_assistant', location: 'hero' })}
      >
        <span>{labels.secondary}</span>
        <Icon name="arrow-right" size={20} />
      </a>
    </div>
  )
}
```

`components/home/Hero.tsx`:

```tsx
import { useTranslations } from 'next-intl'
import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import { WindowFrame } from '@/components/ui/WindowFrame'
import type { ReleaseAsset } from '@/lib/releases/types'
import { HeroCta } from './HeroCta'

export function Hero({ assets }: { assets: ReleaseAsset[] }) {
  const t = useTranslations('home.hero')
  const trust = [t('trust1'), t('trust2'), t('trust3')]
  return (
    <section className="overflow-hidden bg-[radial-gradient(1000px_480px_at_50%_-60px,#E8F3E7_0%,rgba(232,243,231,0)_70%)] pt-10 md:pt-20">
      <Container className="flex flex-col items-center gap-5 text-center">
        <span className="text-[13px] font-bold tracking-[0.6px] text-accent-strong uppercase">{t('eyebrow')}</span>
        <h1 className="max-w-[980px] font-display text-[34px] leading-[1.12] font-bold tracking-[-0.02em] text-balance md:text-[56px] md:leading-[1.08]">
          {t('h1')}
        </h1>
        <p className="max-w-[780px] text-base leading-relaxed text-ink2 text-pretty md:text-[19px]">{t('sub')}</p>
        <HeroCta
          assets={assets}
          labels={{ default: t('ctaDefault'), mac: t('ctaMac'), windows: t('ctaWindows'), prelaunch: t('ctaPrelaunch'), secondary: t('cta2') }}
        />
        <p className="text-[13.5px] text-muted">{t('platformNote')}</p>
        <ul className="flex flex-col gap-2 sm:flex-row sm:gap-7">
          {trust.map((item) => (
            <li key={item} className="inline-flex items-center gap-2 text-[14.5px] text-ink2">
              <Icon name="check" size={18} strokeWidth={2} className="text-accent" />
              {item}
            </li>
          ))}
        </ul>
      </Container>
      <div className="mx-auto mt-10 w-[calc(100%-32px)] max-w-[1080px] md:mt-14">
        <WindowFrame
          src="/images/product/assistant-home.webp"
          alt={t('imageAlt')}
          title={t('windowTitle')}
          width={2000}
          height={1250}
          priority
          sizes="(min-width: 1120px) 1078px, 100vw"
          className="rounded-b-none border-b-0"
        />
      </div>
    </section>
  )
}
```

`components/home/LevelCards.tsx`:

```tsx
import { useTranslations } from 'next-intl'
import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import type { IconName } from '@/components/ui/icons'
import { Section } from '@/components/ui/Section'
import { Link } from '@/i18n/navigation'
import { SectionHead } from './SectionHead'

const LEVELS: Array<{ key: 'k12' | 'university' | 'program'; href: '/k12' | '/university' | '/program'; icon: IconName }> = [
  { key: 'k12', href: '/k12', icon: 'book' },
  { key: 'university', href: '/university', icon: 'graduation' },
  { key: 'program', href: '/program', icon: 'graph' },
]

export function LevelCards() {
  const t = useTranslations('home.levels')
  const tl = useTranslations('levels')
  return (
    <Section>
      <Container>
        <SectionHead eyebrow={t('eyebrow')} title={t('h2')} lead={t('lead')} />
        <div className="mt-8 grid gap-4 md:mt-12 md:grid-cols-3 md:gap-6">
          {LEVELS.map(({ key, href, icon }) => (
            <div key={key} className="flex flex-col gap-4 rounded-card border border-line bg-card p-6">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-accent-strong">
                <Icon name={icon} size={22} />
              </span>
              <h3 className="font-display text-xl font-bold">{tl(`${key}.card.title`)}</h3>
              <ul className="flex flex-col gap-2">
                {(['p1', 'p2', 'p3'] as const).map((p) => (
                  <li key={p} className="flex items-start gap-2 text-[15px] leading-relaxed text-ink2">
                    <Icon name="check" size={18} className="mt-0.5 shrink-0 text-accent" />
                    {tl(`${key}.card.${p}`)}
                  </li>
                ))}
              </ul>
              <Link href={href} className="mt-auto inline-flex min-h-11 items-center gap-1.5 text-[15px] font-semibold text-accent-strong hover:text-accent md:min-h-0">
                {tl(`${key}.card.link`)}
                <Icon name="arrow-right" size={16} />
              </Link>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  )
}
```

`components/home/AssistantShowcase.tsx`:

```tsx
import { useTranslations } from 'next-intl'
import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import type { IconName } from '@/components/ui/icons'
import { Section } from '@/components/ui/Section'
import { WindowFrame } from '@/components/ui/WindowFrame'
import { Link } from '@/i18n/navigation'
import { SectionHead } from './SectionHead'

const POINTS: Array<{ key: 'p1' | 'p2' | 'p3' | 'p4'; icon: IconName }> = [
  { key: 'p1', icon: 'eye' },
  { key: 'p2', icon: 'wallet' },
  { key: 'p3', icon: 'pen' },
  { key: 'p4', icon: 'user-check' },
]

/** Neo #tro-ly là đích của nút phụ ở hero. */
export function AssistantShowcase() {
  const t = useTranslations('home.assistant')
  return (
    <Section id="tro-ly" className="scroll-mt-20 border-y border-line bg-card">
      <Container className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-14">
        <div className="flex flex-col gap-6">
          <SectionHead align="left" eyebrow={t('eyebrow')} title={t('h2')} lead={t('lead')} />
          <ul className="flex flex-col gap-4">
            {POINTS.map(({ key, icon }) => (
              <li key={key} className="flex gap-3.5">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-accent-soft text-accent-strong">
                  <Icon name={icon} size={20} />
                </span>
                <div className="flex flex-col gap-1">
                  <b className="text-base">{t(`${key}.title`)}</b>
                  <span className="text-[15px] leading-relaxed text-ink2">{t(`${key}.desc`)}</span>
                </div>
              </li>
            ))}
          </ul>
          <Link href="/assistant" className="inline-flex min-h-11 items-center gap-2 text-[15.5px] font-semibold text-accent-strong hover:text-accent md:min-h-0">
            {t('link')}
            <Icon name="arrow-right" size={18} />
          </Link>
        </div>
        <WindowFrame src="/images/product/result.webp" alt={t('imageAlt')} title={t('windowTitle')} sizes="(min-width: 1024px) 620px, 100vw" />
      </Container>
    </Section>
  )
}
```

`components/home/PipelineStrip.tsx`:

```tsx
import { useTranslations } from 'next-intl'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { cn } from '@/lib/cn'
import { SectionHead } from './SectionHead'

const STEPS = ['s1', 's2', 's3', 's4', 's5'] as const

export function PipelineStrip() {
  const t = useTranslations('home.pipeline')
  return (
    <Section>
      <Container>
        <SectionHead eyebrow={t('eyebrow')} title={t('h2')} lead={t('caption')} />
        <ol className="mt-8 grid gap-4 md:mt-12 md:grid-cols-5">
          {STEPS.map((s, i) => (
            <li key={s} className={cn('flex flex-col gap-2 rounded-card border bg-card p-5', i === STEPS.length - 1 ? 'border-accent' : 'border-line')}>
              <span className="font-mono text-[13px] font-semibold text-accent-strong">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="text-base leading-snug font-semibold">{t(`${s}.title`)}</h3>
              <p className="text-[14px] leading-relaxed text-ink2">{t(`${s}.desc`)}</p>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  )
}
```

`components/home/CostTeaser.tsx`:

```tsx
import { useTranslations } from 'next-intl'
import { ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'

export function CostTeaser() {
  const t = useTranslations('home.cost')
  return (
    <Section>
      <Container>
        <div className="flex flex-col items-start gap-5 rounded-card border border-accent-line bg-card p-6 md:flex-row md:items-center md:justify-between md:gap-10 md:p-10">
          <div className="flex max-w-[760px] flex-col gap-3">
            <span className="text-[13px] font-bold tracking-[0.6px] text-accent-strong uppercase">{t('eyebrow')}</span>
            <h2 className="font-display text-[26px] leading-tight font-bold md:text-[32px]">{t('h2')}</h2>
            <p className="text-[15.5px] leading-relaxed text-ink2">{t('body')}</p>
          </div>
          <ButtonLink href="/pricing" variant="secondary" icon="arrow-right" iconAfter>
            {t('link')}
          </ButtonLink>
        </div>
      </Container>
    </Section>
  )
}
```

`components/home/DownloadBlock.tsx`:

```tsx
import { useTranslations } from 'next-intl'
import { PlatformCard } from '@/components/download/PlatformCard'
import { PrelaunchNotice } from '@/components/download/PrelaunchNotice'
import { Callout } from '@/components/ui/Callout'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import type { Locale } from '@/i18n/routing'
import { formatDate } from '@/lib/format'
import { downloadState } from '@/lib/releases/state'
import type { ReleaseAsset } from '@/lib/releases/types'
import { SectionHead } from './SectionHead'

export function DownloadBlock({ assets, locale, latest }: { assets: ReleaseAsset[]; locale: Locale; latest: { version: string; releaseDate: string } | null }) {
  const t = useTranslations('home.download')
  return (
    <Section id="tai-ve">
      <Container>
        <SectionHead
          eyebrow={t('eyebrow')}
          title={t('h2')}
          lead={latest ? t('lead', { version: latest.version, date: formatDate(latest.releaseDate, locale) }) : undefined}
        />
        {downloadState(assets) === 'prelaunch' ? (
          <div className="mt-8 md:mt-12">
            <PrelaunchNotice title={t('prelaunch.title')} body={t('prelaunch.body')} cta={t('prelaunch.cta')} headingLevel="h3" />
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-4 md:mt-12 md:grid-cols-3 md:gap-6">
              {assets.map((asset) => (
                <PlatformCard key={asset.platform} asset={asset} locale={locale} location="home_block" />
              ))}
            </div>
            <div className="mx-auto mt-6 max-w-[860px] md:mt-7">
              <Callout kind="info">{t('note')}</Callout>
            </div>
          </>
        )}
      </Container>
    </Section>
  )
}
```

`components/home/FinalCta.tsx`:

```tsx
import { useTranslations } from 'next-intl'
import { CtaBand } from '@/components/ui/CtaBand'

export function FinalCta() {
  const t = useTranslations('home.cta')
  return <CtaBand title={t('h2')} sub={t('sub')} primary={{ href: '/download', label: t('b1') }} secondary={{ href: '/contact', label: t('b2') }} />
}
```

- [ ] **Step 3: Compose the page**

`app/[locale]/page.tsx`:

```tsx
import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import { AssistantShowcase } from '@/components/home/AssistantShowcase'
import { CostTeaser } from '@/components/home/CostTeaser'
import { DownloadBlock } from '@/components/home/DownloadBlock'
import { FAQ_KEYS, FaqSection } from '@/components/home/FaqSection'
import { FinalCta } from '@/components/home/FinalCta'
import { Hero } from '@/components/home/Hero'
import { LevelCards } from '@/components/home/LevelCards'
import { PipelineStrip } from '@/components/home/PipelineStrip'
import { TrustGrid } from '@/components/home/TrustGrid'
import { JsonLd } from '@/components/seo/JsonLd'
import type { Locale } from '@/i18n/routing'
import { getReleases, latestRelease } from '@/lib/releases'
import { faqPage, organization, softwareApplication } from '@/lib/seo/jsonld'
import { buildMetadata } from '@/lib/seo/metadata'
import { absoluteUrl } from '@/lib/seo/urls'

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as Locale
  const t = await getTranslations('home.meta')
  return buildMetadata({ locale, page: '/', title: t('title'), description: t('description'), absoluteTitle: true })
}

export default async function HomePage() {
  const locale = (await getLocale()) as Locale
  const [{ assets }, t] = await Promise.all([getReleases(), getTranslations('home.faq')])
  const latest = latestRelease(assets)
  return (
    <main id="main" className="flex-1">
      <Hero assets={assets} />
      <LevelCards />
      <AssistantShowcase />
      <PipelineStrip />
      <TrustGrid />
      <CostTeaser />
      <DownloadBlock assets={assets} locale={locale} latest={latest} />
      <FaqSection />
      <FinalCta />
      <JsonLd data={organization()} />
      <JsonLd data={softwareApplication(assets, locale, absoluteUrl(locale, '/download'))} />
      <JsonLd data={faqPage(FAQ_KEYS.map((k) => ({ q: t(`${k}.q`), a: t(`${k}.a`) })))} />
    </main>
  )
}
```

- [ ] **Step 4: Run and look**

Run: `pnpm verify && pnpm build`
Expected: PASS; `/` and `/en` static. With `pnpm start` and no `DOWNLOAD_FEED_URL`: the hero button reads "Liên hệ để dùng sớm" and goes to `/lien-he`; the download block shows the pre-launch notice. To see the feed mode before Task 14 adds the fixture server, fill the snapshot from the fixtures with `pnpm sync-releases --from tests/fixtures --base https://feed.example.test/desktop/`, rebuild, confirm three platform cards on the home page (their links point to the fake host, which is expected), then restore the empty snapshot with `git checkout content/releases.json`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(home): trang chủ 9 khối, hero theo hệ điều hành, trạng thái sắp phát hành, JSON-LD"
```

### Task 7: Level pages (Phổ thông, Học phần, Chương trình)

**Files:**
- Create: `components/level/levels.ts`, `components/level/LevelPage.tsx`, `app/[locale]/k12/page.tsx`, `app/[locale]/university/page.tsx`, `app/[locale]/program/page.tsx`

**Interfaces:**
- Consumes: `SectionHead`, `WindowFrame`, `CtaBand`, `Callout`, `ButtonLink`, `Icon`, `buildMetadata`, `breadcrumb`, `absoluteUrl`.
- Produces: `type LevelKey = 'k12' | 'university' | 'program'`; `LEVELS: Record<LevelKey, { page: PageKey; screens: [Shot, Shot, Shot]; icons: IconName[6] }>`; `levelMetadata(level): Promise<Metadata>`; `LevelPage({ level })`.

- [ ] **Step 1: Write the level config**

`components/level/levels.ts`:

```ts
import type { IconName } from '@/components/ui/icons'
import type { PageKey } from '@/i18n/routing'

export type LevelKey = 'k12' | 'university' | 'program'
export type Shot = { src: string; width: number; height: number }

const shot = (name: string): Shot => ({ src: `/images/product/${name}.webp`, width: 1600, height: 1000 })

type Six<T> = [T, T, T, T, T, T]

export const LEVELS: Record<LevelKey, { page: PageKey; screens: [Shot, Shot, Shot]; icons: Six<IconName> }> = {
  k12: {
    page: '/k12',
    screens: [shot('exam-setup'), shot('result'), shot('slide-studio')],
    icons: ['layers', 'shuffle', 'check', 'file', 'monitor', 'archive'],
  },
  university: {
    page: '/university',
    screens: [shot('course-workbench'), shot('course-gates'), shot('course-approval')],
    icons: ['graduation', 'clock', 'file', 'monitor', 'shield', 'book'],
  },
  program: {
    page: '/program',
    screens: [shot('program-graph'), shot('program-review'), shot('what-if')],
    icons: ['graph', 'warning', 'search', 'check', 'user-check', 'refresh'],
  },
}
```

- [ ] **Step 2: Write the page component**

`components/level/LevelPage.tsx`:

```tsx
import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import { SectionHead } from '@/components/home/SectionHead'
import { JsonLd } from '@/components/seo/JsonLd'
import { ButtonLink } from '@/components/ui/Button'
import { Callout } from '@/components/ui/Callout'
import { Container } from '@/components/ui/Container'
import { CtaBand } from '@/components/ui/CtaBand'
import { Icon } from '@/components/ui/Icon'
import { Section } from '@/components/ui/Section'
import { WindowFrame } from '@/components/ui/WindowFrame'
import type { Locale } from '@/i18n/routing'
import { cn } from '@/lib/cn'
import { breadcrumb } from '@/lib/seo/jsonld'
import { buildMetadata } from '@/lib/seo/metadata'
import { absoluteUrl } from '@/lib/seo/urls'
import { LEVELS, type LevelKey } from './levels'

const SCREENS = ['s1', 's2', 's3'] as const
const OUTCOMES = ['o1', 'o2', 'o3', 'o4', 'o5', 'o6'] as const

// Ba namespace levels.k12, levels.university, levels.program cùng một hình dạng (tests/unit/i18n.test.ts kiểm);
// ép kiểu về levels.k12 để next-intl kiểm khoá.
const ns = (level: LevelKey) => `levels.${level}` as 'levels.k12'

export async function levelMetadata(level: LevelKey): Promise<Metadata> {
  const locale = (await getLocale()) as Locale
  const t = await getTranslations(ns(level))
  return buildMetadata({ locale, page: LEVELS[level].page, title: t('meta.title'), description: t('meta.description') })
}

export async function LevelPage({ level }: { level: LevelKey }) {
  const locale = (await getLocale()) as Locale
  const [t, tc, tn] = await Promise.all([getTranslations(ns(level)), getTranslations('common'), getTranslations('nav')])
  const cfg = LEVELS[level]
  return (
    <main id="main" className="flex-1">
      <section className="bg-[radial-gradient(900px_300px_at_20%_-80px,#E8F3E7_0%,rgba(232,243,231,0)_70%)] pt-12 pb-10 md:pt-16 md:pb-14">
        <Container className="flex flex-col gap-5">
          <SectionHead as="h1" align="left" eyebrow={t('hero.eyebrow')} title={t('hero.h1')} lead={t('hero.lead')} />
          <p className="text-[15px] text-ink2">{t('hero.audience')}</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/download" size="lg" icon="download">{tc('download')}</ButtonLink>
            <ButtonLink href="/assistant" variant="secondary" size="lg" icon="spark">{tn('assistant')}</ButtonLink>
          </div>
          <div className="max-w-[760px]">
            <Callout kind="note">{t('hero.note')}</Callout>
          </div>
        </Container>
      </section>

      <Section className="pt-4 md:pt-8">
        <Container className="flex flex-col gap-14 md:gap-20">
          <SectionHead align="left" eyebrow={t('screens.eyebrow')} title={t('screens.h2')} />
          {SCREENS.map((s, i) => (
            <div
              key={s}
              className={cn(
                'grid items-center gap-8 lg:gap-14',
                // Hàng lẻ: chữ sang phải, ảnh vẫn ở cột rộng 1.2fr.
                i % 2 === 1 ? 'lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:[&>*:first-child]:order-2' : 'lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]',
              )}
            >
              <div className="flex flex-col gap-3">
                <span className="font-mono text-[13px] font-semibold text-accent-strong">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="font-display text-[24px] leading-tight font-bold">{t(`screens.${s}.title`)}</h3>
                <p className="text-[16px] leading-relaxed text-ink2">{t(`screens.${s}.desc`)}</p>
              </div>
              <WindowFrame
                src={cfg.screens[i].src}
                width={cfg.screens[i].width}
                height={cfg.screens[i].height}
                alt={t(`screens.${s}.alt`)}
                title={t(`screens.${s}.windowTitle`)}
                priority={i === 0}
                sizes="(min-width: 1024px) 680px, 100vw"
              />
            </div>
          ))}
          <p className="text-[13.5px] text-muted">{tc('sampleData')}</p>
        </Container>
      </Section>

      <Section className="border-y border-line bg-card">
        <Container>
          <SectionHead eyebrow={t('outcomes.eyebrow')} title={t('outcomes.h2')} />
          <div className="mt-8 grid gap-4 md:mt-12 md:grid-cols-3 md:gap-6">
            {OUTCOMES.map((o, i) => (
              <div key={o} className="flex flex-col gap-3 rounded-card border border-line bg-page p-6">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] bg-accent-soft text-accent-strong">
                  <Icon name={cfg.icons[i]} size={20} />
                </span>
                <h3 className="text-[17px] leading-snug font-semibold">{t(`outcomes.${o}.title`)}</h3>
                <p className="text-[15px] leading-relaxed text-ink2">{t(`outcomes.${o}.desc`)}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="flex flex-col gap-3 rounded-card border border-accent-line bg-accent-soft p-6 md:p-8">
            <h2 className="font-display text-[24px] font-bold">{t('gates.title')}</h2>
            <p className="text-[16px] leading-relaxed text-ink2">{t('gates.body')}</p>
            <p className="inline-flex items-center gap-2 text-[15px] font-semibold text-accent-strong">
              <Icon name="shield" size={18} />
              {t('gates.rule')}
            </p>
          </div>
        </Container>
      </Section>

      <CtaBand title={t('cta.h2')} sub={t('cta.sub')} primary={{ href: '/download', label: tc('download') }} secondary={{ href: '/contact', label: tc('contactSales') }} />
      <JsonLd data={breadcrumb([{ name: tc('siteName'), url: absoluteUrl(locale, '/') }, { name: t('hero.eyebrow'), url: absoluteUrl(locale, cfg.page) }])} />
    </main>
  )
}
```

- [ ] **Step 3: Add the three routes**

`app/[locale]/k12/page.tsx`:

```tsx
import { LevelPage, levelMetadata } from '@/components/level/LevelPage'

export const generateMetadata = () => levelMetadata('k12')

export default function K12Page() {
  return <LevelPage level="k12" />
}
```

`app/[locale]/university/page.tsx` and `app/[locale]/program/page.tsx`: the same file with `'university'` / `UniversityPage` and `'program'` / `ProgramPage`.

- [ ] **Step 4: Run and look**

Run: `pnpm verify && pnpm build`
Expected: PASS; the build lists `/pho-thong`, `/hoc-phan`, `/chuong-trinh`, `/en/k12`, `/en/university-courses`, `/en/program-review` as static. In `pnpm start`, the Chương trình page shows the note "Đây là tài liệu làm việc nội bộ, không phải báo cáo tự đánh giá."

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(levels): ba trang cấp Phổ thông, Học phần, Chương trình dùng chung một component"
```

### Task 8: Assistant page

**Files:**
- Create: `app/[locale]/assistant/page.tsx`

**Interfaces:**
- Consumes: `SectionHead`, `WindowFrame`, `CtaBand`, `Icon`, `buildMetadata`, `breadcrumb`, `absoluteUrl`; images `assistant-home`, `result`, `assistant-states`.

- [ ] **Step 1: Write the page**

`app/[locale]/assistant/page.tsx`:

```tsx
import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import { SectionHead } from '@/components/home/SectionHead'
import { JsonLd } from '@/components/seo/JsonLd'
import { ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { CtaBand } from '@/components/ui/CtaBand'
import { Icon } from '@/components/ui/Icon'
import type { IconName } from '@/components/ui/icons'
import { Section } from '@/components/ui/Section'
import { WindowFrame } from '@/components/ui/WindowFrame'
import type { Locale } from '@/i18n/routing'
import { breadcrumb } from '@/lib/seo/jsonld'
import { buildMetadata } from '@/lib/seo/metadata'
import { absoluteUrl } from '@/lib/seo/urls'

const WHERE: Array<{ key: 'w1' | 'w2' | 'w3'; icon: IconName }> = [
  { key: 'w1', icon: 'message' },
  { key: 'w2', icon: 'monitor' },
  { key: 'w3', icon: 'external' },
]
const HOW: Array<{ key: 'c1' | 'c2' | 'c3' | 'c4'; icon: IconName }> = [
  { key: 'c1', icon: 'eye' },
  { key: 'c2', icon: 'layers' },
  { key: 'c3', icon: 'check' },
  { key: 'c4', icon: 'pen' },
]
const NEVER = ['n1', 'n2', 'n3', 'n4', 'n5'] as const
const STATES: Array<{ key: 's1' | 's2' | 's3' | 's4'; icon: IconName }> = [
  { key: 's1', icon: 'wifi-off' },
  { key: 's2', icon: 'lock' },
  { key: 's3', icon: 'key' },
  { key: 's4', icon: 'wallet' },
]

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as Locale
  const t = await getTranslations('assistant.meta')
  return buildMetadata({ locale, page: '/assistant', title: t('title'), description: t('description') })
}

export default async function AssistantPage() {
  const locale = (await getLocale()) as Locale
  const [t, tc] = await Promise.all([getTranslations('assistant'), getTranslations('common')])
  return (
    <main id="main" className="flex-1">
      <section className="overflow-hidden bg-[radial-gradient(1000px_420px_at_50%_-60px,#E8F3E7_0%,rgba(232,243,231,0)_70%)] pt-12 md:pt-16">
        <Container className="flex flex-col items-center gap-5 text-center">
          <SectionHead as="h1" eyebrow={t('hero.eyebrow')} title={t('hero.h1')} lead={t('hero.lead')} />
          <ButtonLink href="/download" size="lg" icon="download">{tc('download')}</ButtonLink>
        </Container>
        <div className="mx-auto mt-10 w-[calc(100%-32px)] max-w-[1080px]">
          <WindowFrame src="/images/product/assistant-home.webp" width={2000} height={1250} alt={t('hero.imageAlt')} title={t('hero.windowTitle')} priority sizes="(min-width: 1120px) 1078px, 100vw" className="rounded-b-none border-b-0" />
        </div>
      </section>

      <Section className="border-t border-line bg-card">
        <Container>
          <SectionHead eyebrow={t('where.eyebrow')} title={t('where.h2')} />
          <div className="mt-8 grid gap-4 md:mt-12 md:grid-cols-3 md:gap-6">
            {WHERE.map(({ key, icon }) => (
              <div key={key} className="flex flex-col gap-3 rounded-card border border-line bg-page p-6">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] bg-accent-soft text-accent-strong"><Icon name={icon} size={20} /></span>
                <h3 className="text-[17px] font-semibold">{t(`where.${key}.title`)}</h3>
                <p className="text-[15px] leading-relaxed text-ink2">{t(`where.${key}.desc`)}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-14">
          <div className="flex flex-col gap-6">
            <SectionHead align="left" eyebrow={t('how.eyebrow')} title={t('how.h2')} />
            <ul className="flex flex-col gap-4">
              {HOW.map(({ key, icon }) => (
                <li key={key} className="flex gap-3.5">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-accent-soft text-accent-strong"><Icon name={icon} size={20} /></span>
                  <div className="flex flex-col gap-1">
                    <b className="text-base">{t(`how.${key}.title`)}</b>
                    <span className="text-[15px] leading-relaxed text-ink2">{t(`how.${key}.desc`)}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <WindowFrame src="/images/product/result.webp" alt={t('how.imageAlt')} title={t('how.windowTitle')} sizes="(min-width: 1024px) 620px, 100vw" />
        </Container>
      </Section>

      <Section className="border-y border-line bg-card">
        <Container className="grid gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-4 rounded-card border border-line bg-page p-6 lg:col-span-1">
            <span className="text-[13px] font-bold tracking-[0.6px] text-accent-strong uppercase">{t('never.eyebrow')}</span>
            <h2 className="font-display text-[24px] font-bold">{t('never.h2')}</h2>
            <p className="text-[15px] text-ink2">{t('never.lead')}</p>
            <ul className="flex flex-col gap-2">
              {NEVER.map((n) => (
                <li key={n} className="flex items-center gap-2 text-[15px] text-ink">
                  <Icon name="close" size={16} className="text-crit" />
                  {t(`never.${n}`)}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-3 rounded-card border border-line bg-page p-6">
            <Icon name="wallet" size={22} className="text-accent-strong" />
            <h3 className="text-[18px] font-semibold">{t('cost.title')}</h3>
            <p className="text-[15px] leading-relaxed text-ink2">{t('cost.body')}</p>
          </div>
          <div className="flex flex-col gap-3 rounded-card border border-line bg-page p-6">
            <Icon name="lock" size={22} className="text-accent-strong" />
            <h3 className="text-[18px] font-semibold">{t('privacy.title')}</h3>
            <p className="text-[15px] leading-relaxed text-ink2">{t('privacy.body')}</p>
          </div>
        </Container>
      </Section>

      <Section>
        <Container className="flex flex-col gap-8">
          <SectionHead eyebrow={t('states.eyebrow')} title={t('states.h2')} lead={t('states.lead')} />
          <div className="grid gap-4 md:grid-cols-4">
            {STATES.map(({ key, icon }) => (
              <div key={key} className="flex flex-col gap-2 rounded-card border border-line bg-card p-5">
                <Icon name={icon} size={20} className="text-warn-text" />
                <h3 className="text-base font-semibold">{t(`states.${key}.title`)}</h3>
                <p className="text-[14.5px] leading-relaxed text-ink2">{t(`states.${key}.desc`)}</p>
              </div>
            ))}
          </div>
          <WindowFrame src="/images/product/assistant-states.webp" alt={t('states.imageAlt')} title={t('states.windowTitle')} sizes="(min-width: 1120px) 1078px, 100vw" />
          <p className="text-[13.5px] text-muted">{tc('sampleData')}</p>
        </Container>
      </Section>

      <CtaBand title={t('cta.h2')} sub={t('cta.sub')} primary={{ href: '/download', label: tc('download') }} secondary={{ href: '/contact', label: tc('contactSales') }} />
      <JsonLd data={breadcrumb([{ name: tc('siteName'), url: absoluteUrl(locale, '/') }, { name: t('hero.eyebrow'), url: absoluteUrl(locale, '/assistant') }])} />
    </main>
  )
}
```

- [ ] **Step 2: Run and look**

Run: `pnpm verify && pnpm build`
Expected: PASS; `/tro-ly-ai` and `/en/ai-assistant` static; one H1 on the page (the hero `SectionHead as="h1"`).

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(assistant): trang Trợ lý AI: ở đâu, cách làm việc, giới hạn, chi phí, trạng thái"
```

### Task 9: Pricing page

**Files:**
- Create: `lib/contact.ts`, `tests/unit/contact.test.ts`, `app/[locale]/pricing/page.tsx`

**Interfaces:**
- Produces: `contactSalesHref(locale: Locale): string` (mailto with subject and body).

- [ ] **Step 1: Write the failing test**

`tests/unit/contact.test.ts`:

```ts
import { expect, test } from 'vitest'
import { contactSalesHref } from '@/lib/contact'

test('contactSalesHref builds a mailto with a subject and a body per locale', () => {
  const vi = new URL(contactSalesHref('vi'))
  expect(vi.protocol).toBe('mailto:')
  expect(vi.pathname).toBe('info@agentra.io.vn')
  expect(vi.searchParams.get('subject')).toBe('Báo giá EduFlow cho trường')
  expect(vi.searchParams.get('body')).toContain('Số máy dự kiến')
  expect(new URL(contactSalesHref('en')).searchParams.get('subject')).toBe('EduFlow quote for our institution')
})
```

Run: `pnpm test tests/unit/contact.test.ts` → FAIL (module missing).

- [ ] **Step 2: Implement `lib/contact.ts`**

```ts
import type { Locale } from '@/i18n/routing'
import { site } from '@/lib/site'

const COPY: Record<Locale, { subject: string; body: string }> = {
  vi: {
    subject: 'Báo giá EduFlow cho trường',
    body: 'Tên đơn vị:\nNgười liên hệ:\nSố máy dự kiến:\nCấp dùng chính (Phổ thông, Học phần, Chương trình):\n',
  },
  en: {
    subject: 'EduFlow quote for our institution',
    body: 'Institution:\nContact person:\nNumber of computers:\nMain level (K-12, university courses, degree program):\n',
  },
}

/** Nút "Liên hệ báo giá": mở thư soạn sẵn, không có form trên web (spec §2, quyết định 5). */
export function contactSalesHref(locale: Locale): string {
  const { subject, body } = COPY[locale]
  return `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}
```

Run: `pnpm test tests/unit/contact.test.ts` → PASS.

- [ ] **Step 3: Write the page**

`app/[locale]/pricing/page.tsx`:

```tsx
import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import { SectionHead } from '@/components/home/SectionHead'
import { JsonLd } from '@/components/seo/JsonLd'
import { ButtonLink, buttonClasses } from '@/components/ui/Button'
import { Callout } from '@/components/ui/Callout'
import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import { Section } from '@/components/ui/Section'
import { WindowFrame } from '@/components/ui/WindowFrame'
import type { Locale } from '@/i18n/routing'
import { contactSalesHref } from '@/lib/contact'
import { breadcrumb } from '@/lib/seo/jsonld'
import { buildMetadata } from '@/lib/seo/metadata'
import { absoluteUrl } from '@/lib/seo/urls'

const STEPS = ['s1', 's2', 's3', 's4', 's5', 's6', 's7'] as const
const FREE = ['i1', 'i2', 'i3', 'i4', 'i5', 'i6', 'i7', 'i8'] as const
const BUDGET = [
  { key: 'normal', dot: 'bg-good' },
  { key: 'near', dot: 'bg-warn-dot' },
  { key: 'over', dot: 'bg-crit' },
] as const

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as Locale
  const t = await getTranslations('pricing.meta')
  return buildMetadata({ locale, page: '/pricing', title: t('title'), description: t('description') })
}

export default async function PricingPage() {
  const locale = (await getLocale()) as Locale
  const [t, tc] = await Promise.all([getTranslations('pricing'), getTranslations('common')])
  const sales = contactSalesHref(locale)
  return (
    <main id="main" className="flex-1">
      <section className="bg-[radial-gradient(900px_300px_at_20%_-80px,#E8F3E7_0%,rgba(232,243,231,0)_70%)] pt-12 pb-10 md:pt-16 md:pb-14">
        <Container className="flex flex-col gap-5">
          <SectionHead as="h1" align="left" eyebrow={t('hero.eyebrow')} title={t('hero.h1')} lead={t('hero.lead')} />
          <div className="flex flex-col gap-3 sm:flex-row">
            <a href={sales} className={buttonClasses('primary', 'lg')}>
              <Icon name="mail" size={20} />
              <span>{t('cta.sales')}</span>
            </a>
            <ButtonLink href="/download" variant="secondary" size="lg" icon="download">{t('cta.download')}</ButtonLink>
          </div>
        </Container>
      </section>

      <Section className="pt-4 md:pt-8">
        <Container>
          <SectionHead align="left" eyebrow={t('steps.eyebrow')} title={t('steps.h2')} />
          <ol className="mt-8 grid gap-4 md:mt-10 md:grid-cols-2">
            {STEPS.map((s, i) => (
              <li key={s} className="flex gap-4 rounded-card border border-line bg-card p-5">
                <span className="font-mono text-[15px] font-semibold text-accent-strong">{String(i + 1).padStart(2, '0')}</span>
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-[17px] font-semibold">{t(`steps.${s}.title`)}</h3>
                  <p className="text-[15px] leading-relaxed text-ink2">{t(`steps.${s}.body`)}</p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      <Section className="border-y border-line bg-card">
        <Container className="flex flex-col gap-4">
          <h2 className="font-display text-[26px] font-bold">{t('formula.title')}</h2>
          <p className="rounded-control border border-line bg-page px-5 py-4 font-mono text-[15px] text-ink md:text-[17px]">{t('formula.expr')}</p>
          <p className="max-w-[820px] text-[15px] leading-relaxed text-ink2">{t('formula.note')}</p>
        </Container>
      </Section>

      <Section>
        <Container>
          <SectionHead align="left" eyebrow={t('budget.eyebrow')} title={t('budget.h2')} />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {BUDGET.map(({ key, dot }) => (
              <div key={key} className="flex flex-col gap-2 rounded-card border border-line bg-card p-5">
                <span className="inline-flex items-center gap-2 text-[16px] font-semibold">
                  <span className={`h-2.5 w-2.5 rounded-full ${dot}`} aria-hidden="true" />
                  {t(`budget.${key}.title`)}
                </span>
                <p className="text-[15px] leading-relaxed text-ink2">{t(`budget.${key}.desc`)}</p>
              </div>
            ))}
          </div>
          <div className="mt-5">
            <Callout kind="info">{t('budget.essential')}</Callout>
          </div>
        </Container>
      </Section>

      <Section className="border-t border-line bg-card">
        <Container className="grid items-start gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="flex flex-col gap-5">
            <SectionHead align="left" eyebrow={t('free.eyebrow')} title={t('free.h2')} />
            <ul className="grid gap-2.5 sm:grid-cols-2">
              {FREE.map((i) => (
                <li key={i} className="flex items-start gap-2 text-[15px] text-ink2">
                  <Icon name="check" size={18} className="mt-0.5 shrink-0 text-accent" />
                  {t(`free.${i}`)}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-2">
            <WindowFrame src="/images/product/usage.webp" alt={t('imageAlt')} title={t('windowTitle')} sizes="(min-width: 1024px) 620px, 100vw" />
            <p className="text-[13.5px] text-muted">{tc('sampleData')}</p>
          </div>
        </Container>
      </Section>

      <section className="bg-brand-deep py-14 md:py-20">
        <Container className="flex flex-col items-center gap-4 text-center">
          <h2 className="font-display text-[28px] font-bold text-white md:text-[38px]">{t('cta.h2')}</h2>
          <p className="max-w-[640px] text-[16px] leading-relaxed text-white/80">{t('cta.sub')}</p>
          <div className="mt-2 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <a href={sales} className={buttonClasses('white', 'lg', false, 'w-full sm:w-auto')}>
              <Icon name="mail" size={20} />
              <span>{t('cta.sales')}</span>
            </a>
            <ButtonLink href="/download" variant="ghost-white" size="lg" className="w-full sm:w-auto">{t('cta.download')}</ButtonLink>
          </div>
        </Container>
      </section>
      <JsonLd data={breadcrumb([{ name: tc('siteName'), url: absoluteUrl(locale, '/') }, { name: t('hero.eyebrow'), url: absoluteUrl(locale, '/pricing') }])} />
    </main>
  )
}
```

- [ ] **Step 4: Check the no-price rule**

```bash
pnpm build
pnpm start -p 3200 >/dev/null 2>&1 &
for i in $(seq 1 30); do curl -sf localhost:3200/cach-tinh-phi -o pricing.tmp.html && break; sleep 1; done
grep -c "<h1" pricing.tmp.html
grep -o -E "[0-9][0-9.,]* ?(₫|VNĐ|VND)" pricing.tmp.html
kill %1; rm -f pricing.tmp.html
```

Expected: the first `grep` prints `1` (the page really loaded: one H1), the second prints nothing (no price figure on the page). Run the same two checks for `localhost:3200/en/pricing` before stopping the server.

- [ ] **Step 5: Run and commit**

Run: `pnpm verify && pnpm build` → PASS.

```bash
git add -A
git commit -m "feat(pricing): trang Cách tính phí không công bố đơn giá, nút liên hệ báo giá soạn sẵn thư"
```

### Task 10: Download page

**Files:**
- Copy then modify: `components/download/PlatformGrid.tsx`, `components/download/SystemRequirements.tsx` (verbatim)
- Create: `app/[locale]/download/page.tsx`, `tests/unit/sync-releases.test.ts`
- Modify (Ruling 32, releases that ship one OS first, and iPads): `components/home/HeroCta.tsx`, `components/home/DownloadBlock.tsx`, `lib/platform.ts`, `lib/usePlatform.ts`, `tests/unit/platform.test.ts`, `scripts/sync-releases.mjs`

**Interfaces:**
- Consumes: `getReleases`, `latestRelease`, `downloadState`, `hasAssetFor` (Task 2); `PrelaunchNotice`, `PlatformCard` (Task 6).
- Produces: `PlatformGrid({ assets, locale })` with the missing-OS notice.

- [ ] **Step 1: Copy and extend the grid**

```bash
cp ../docops-landing-page/components/download/{PlatformGrid,SystemRequirements}.tsx components/download/
```

In `components/download/PlatformGrid.tsx`, add the import and the notice right after the "detected" pill:

```tsx
import { Callout } from '@/components/ui/Callout'
import { hasAssetFor } from '@/lib/releases/state'
```

```tsx
{os && !hasAssetFor(assets, os) ? (
  <div className="mt-4">
    <Callout kind="info">{t(`missing.${os}`)}</Callout>
  </div>
) : null}
```

- [ ] **Step 1b: One-OS releases outside the Download page, and iPads (Ruling 32)**

The feed can publish Windows before macOS or the reverse (Review Focus 2). Four places must say so instead of hiding it.

`lib/platform.ts`: iPadOS 13 and later sends a "Macintosh" user agent and no Client Hints. A Mac has no touch screen, so more than one touch point means an iPad. Change the signature and the Mac line, and extend the doc comment:

```ts
/** Nhận hệ điều hành desktop từ user agent (ưu tiên Client Hints). iOS/iPadOS/Linux → null.
 *  iPadOS 13+ tự xưng "Macintosh"; máy Mac không có màn cảm ứng, nên maxTouchPoints > 1 là iPad. */
export function detectPlatform(userAgent: string, uaDataPlatform?: string, maxTouchPoints = 0): DetectedOs | null {
```

```ts
  if (/Macintosh|Mac OS X/i.test(userAgent)) return maxTouchPoints > 1 ? null : 'macos'
```

`lib/usePlatform.ts`: pass the touch points: `cached = detectPlatform(nav.userAgent, nav.userAgentData?.platform, nav.maxTouchPoints)`.

Append to `tests/unit/platform.test.ts` (write it first and watch it fail):

```ts
test('an iPad that presents itself as a Mac is not a desktop (iPadOS 13+)', () => {
  const ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15'
  expect(detectPlatform(ua, undefined, 5)).toBe(null)
  expect(detectPlatform(ua, undefined, 0)).toBe('macos')
  expect(detectPlatform(ua)).toBe('macos')
})
```

`components/home/HeroCta.tsx`: invite "Tải về cho macOS" only when a macOS build exists. Change the import to `import { downloadState, hasAssetFor } from '@/lib/releases/state'`, add after the `windows` line:

```tsx
  // Chỉ mời "Tải về cho macOS" khi đã có bản macOS (feed có thể phát hành lệch hai nền tảng).
  const macReady = os === 'macos' && hasAssetFor(assets, 'macos')
```

and in the last branch use `macReady` instead of `os === 'macos'`, both for the analytics id (`macReady ? 'hero_download_mac' : 'hero_download'`) and for the label (`{macReady ? labels.mac : labels.default}`).

`components/home/DownloadBlock.tsx`: change the import to `import { downloadState, hasAssetFor } from '@/lib/releases/state'`, add `const td = useTranslations('download')` under `t`, and replace the whole non-prelaunch branch (`<>` … `</>`) with:

```tsx
          <>
            <div className="mt-8 flex flex-col gap-4 md:mt-12 md:gap-6">
              {/* Feed có thể phát hành lệch hai nền tảng: nói rõ bản nào sắp có, không để thẻ biến mất lặng lẽ. */}
              {(['windows', 'macos'] as const)
                .filter((os) => !hasAssetFor(assets, os))
                .map((os) => (
                  <Callout key={os} kind="info">
                    {td(`missing.${os}`)}
                  </Callout>
                ))}
              <div className="grid gap-4 md:grid-cols-3 md:gap-6">
                {assets.map((asset) => (
                  <PlatformCard key={asset.platform} asset={asset} locale={locale} location="home_block" />
                ))}
              </div>
            </div>
            {hasAssetFor(assets, 'macos') ? (
              <div className="mx-auto mt-6 max-w-[860px] md:mt-7">
                <Callout kind="info">{t('note')}</Callout>
              </div>
            ) : null}
          </>
```

`scripts/sync-releases.mjs`: a release may carry only one of the two `.yml` files. Replace the two lines from `const [windows, mac] = await Promise.all(` to `const out = …` with:

```js
// Một nền tảng có thể phát hành trước: tệp thiếu (không có trong thư mục hoặc HTTP 404) ghi null, trang hiện "sắp có".
async function readOptional(name) {
  try {
    return parse(await readSource(name))
  } catch (err) {
    if (err?.code === 'ENOENT' || /HTTP 404/.test(String(err?.message))) return null
    throw err
  }
}
const [windows, mac] = await Promise.all([readOptional('latest.yml'), readOptional('latest-mac.yml')])
if (!windows && !mac) {
  console.error(`Không thấy latest.yml lẫn latest-mac.yml ở ${from}`)
  process.exit(1)
}
const out = { baseUrl, windows, mac }
```

and make the last log line print `chưa có` for a missing side: `(Windows ${out.windows?.version ?? 'chưa có'}, macOS ${out.mac?.version ?? 'chưa có'})`.

`tests/unit/sync-releases.test.ts` (write it first and watch it fail; it runs the script in a temporary working directory, so the repo's `content/releases.json` is never touched):

```ts
import { spawnSync } from 'node:child_process'
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { expect, test } from 'vitest'

const SCRIPT = resolve('scripts/sync-releases.mjs')

function run(files: string[]) {
  const work = mkdtempSync(join(tmpdir(), 'sync-releases-'))
  const feed = join(work, 'feed')
  mkdirSync(join(work, 'content'))
  mkdirSync(feed)
  for (const f of files) copyFileSync(resolve('tests/fixtures', f), join(feed, f))
  const res = spawnSync(process.execPath, [SCRIPT, '--from', feed, '--base', 'https://feed.example.test/desktop/'], { cwd: work, encoding: 'utf8' })
  return { res, read: () => JSON.parse(readFileSync(join(work, 'content', 'releases.json'), 'utf8')) }
}

test('sync-releases keeps a Windows-only release and writes null for macOS', () => {
  const { res, read } = run(['latest.yml'])
  expect(res.status).toBe(0)
  const out = read()
  expect(out.baseUrl).toBe('https://feed.example.test/desktop/')
  expect(out.windows.version).toBeTruthy()
  expect(out.mac).toBeNull()
})

test('sync-releases stops when neither file exists', () => {
  const { res } = run([])
  expect(res.status).toBe(1)
  expect(res.stderr).toContain('latest.yml')
})
```

- [ ] **Step 2: Write the page**

`app/[locale]/download/page.tsx`:

```tsx
import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import { PlatformGrid } from '@/components/download/PlatformGrid'
import { PrelaunchNotice } from '@/components/download/PrelaunchNotice'
import { SystemRequirements } from '@/components/download/SystemRequirements'
import { SectionHead } from '@/components/home/SectionHead'
import { JsonLd } from '@/components/seo/JsonLd'
import { Callout } from '@/components/ui/Callout'
import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { formatDate } from '@/lib/format'
import { getReleases, latestRelease } from '@/lib/releases'
import { downloadState, hasAssetFor } from '@/lib/releases/state'
import { breadcrumb, softwareApplication } from '@/lib/seo/jsonld'
import { buildMetadata } from '@/lib/seo/metadata'
import { absoluteUrl } from '@/lib/seo/urls'
import { site } from '@/lib/site'

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as Locale
  const t = await getTranslations('download.meta')
  return buildMetadata({ locale, page: '/download', title: t('title'), description: t('description') })
}

export default async function DownloadPage() {
  const locale = (await getLocale()) as Locale
  const [{ assets }, t, tc] = await Promise.all([getReleases(), getTranslations('download'), getTranslations('common')])
  const latest = latestRelease(assets)
  const guide = (os: 'macos' | 'windows', label: string) => (
    <Link href={{ pathname: '/install/[os]', params: { os } }} className="font-semibold underline underline-offset-2">
      {label}
    </Link>
  )
  return (
    <main id="main" className="flex-1">
      <section className="bg-[radial-gradient(900px_300px_at_20%_-80px,#E8F3E7_0%,rgba(232,243,231,0)_70%)] pt-12 pb-10 md:pt-16 md:pb-12">
        <Container>
          <SectionHead
            as="h1"
            align="left"
            eyebrow={t('eyebrow')}
            title={t('h1')}
            lead={latest ? t('lead', { version: latest.version, date: formatDate(latest.releaseDate, locale) }) : undefined}
          />
        </Container>
      </section>
      <section className="pb-16 md:pb-20">
        <Container>
          {downloadState(assets) === 'prelaunch' ? (
            <PrelaunchNotice title={t('prelaunch.title')} body={t('prelaunch.body')} cta={t('prelaunch.cta')} />
          ) : (
            <>
              <PlatformGrid assets={assets} locale={locale} />
              <div className="mt-6">
                {/* Ghi chú chọn chip chỉ có nghĩa khi đã có bản macOS. */}
                {hasAssetFor(assets, 'macos') ? <Callout kind="info">{t('chipNote')}</Callout> : null}
              </div>
            </>
          )}
          <p className="mt-6 text-[14.5px] text-muted">{t('desktopOnly')}</p>
        </Container>
      </section>
      <section className="border-t border-line bg-card py-16 md:py-20">
        <Container>
          <SectionHead align="left" eyebrow={t('req.eyebrow')} title={t('req.h2')} />
          <div className="mt-8">
            <SystemRequirements />
          </div>
          <div className="mt-8 flex flex-col gap-4">
            <Callout kind="info" title={t('signed.title')}>
              {t('signed.body')} {guide('windows', t('guideWindows'))} · {guide('macos', t('guideMac'))}
            </Callout>
            <div className="flex gap-3.5 rounded-xl border border-line bg-card2 p-5">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-accent-soft text-accent-strong">
                <Icon name="refresh" size={20} />
              </span>
              <div className="flex flex-col gap-1">
                <b className="text-base">{t('update.title')}</b>
                <span className="text-[15px] leading-relaxed text-ink2">{t('update.body')}</span>
              </div>
            </div>
          </div>
          <p className="mt-7 text-center text-[14.5px] text-muted">
            {t.rich('help', {
              email: () => (
                <a href={`mailto:${site.email}`} className="font-semibold text-accent-strong">
                  {site.email}
                </a>
              ),
            })}
          </p>
        </Container>
      </section>
      <JsonLd data={breadcrumb([{ name: tc('siteName'), url: absoluteUrl(locale, '/') }, { name: t('h1'), url: absoluteUrl(locale, '/download') }])} />
      <JsonLd data={softwareApplication(assets, locale, absoluteUrl(locale, '/download'))} />
    </main>
  )
}
```

- [ ] **Step 3: Run in both modes**

Run: `pnpm verify && pnpm build && pnpm start -p 3200`, open `/tai-ve`: the pre-launch notice shows, no `a[download]` link exists. Stop the server. Then:

```bash
pnpm sync-releases --from tests/fixtures --base https://feed.example.test/desktop/
pnpm build && pnpm start -p 3200
```

Open `/tai-ve`: three cards, SHA-512 behind "Kiểm tra toàn vẹn tệp". Stop the server.

Then the one-OS release (Ruling 32): set `"mac": null` in `content/releases.json` (a node one-liner), build and start again. On `/tai-ve` with a macOS user agent: the Windows card shows, the "Bản cho macOS sắp có" notice shows, the chip note does not. On `/` with a macOS user agent: the hero button reads "Tải EduFlow" (not "Tải về cho macOS") and leads to `/tai-ve`; the download block shows the macOS notice above the Windows card and no chip note. With an iPad user agent ("Macintosh" plus `hasTouch`, more than one touch point): the hero button reads "Tải EduFlow" and has no `download` attribute. Stop the server and restore the snapshot: `git checkout content/releases.json`.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(download): trang Tải về từ feed, báo bản còn thiếu theo hệ điều hành, trạng thái sắp phát hành"
```

### Task 11: Install guides (MDX)

**Files:**
- Copy verbatim from DOCOPS: `mdx-components.tsx`, `types/mdx.d.ts`, `content/install/index.ts`, `components/guide/{Step,CodeBlock}.tsx`
- Copy then modify: `components/guide/{Toc,OsTabs}.tsx` (tap targets), `app/[locale]/install/[os]/page.tsx` (gradient colour, breadcrumb tap target, bottom button label)
- Create: `content/install/vi/macos.mdx`, `content/install/vi/windows.mdx`, `content/install/en/macos.mdx`, `content/install/en/windows.mdx`, `tests/unit/guides.test.ts`
- Modify: `tests/unit/content.test.ts` (MDX count pins, allowed Vietnamese labels)

**Interfaces:**
- Consumes: `hasAssetFor` (Task 2).
- Produces: MDX modules exporting `meta = { title, description, updated, minutes, toc: [{ id, label }] }`; `GUIDES`, `GUIDE_OS`, `isGuideOs`.

- [ ] **Step 1: Copy the guide machinery**

```bash
D=../docops-landing-page
mkdir -p components/guide content/install/vi content/install/en types "app/[locale]/install/[os]"
cp $D/mdx-components.tsx .
cp $D/types/mdx.d.ts types/
cp $D/content/install/index.ts content/install/
cp $D/components/guide/{Step,Toc,OsTabs,CodeBlock}.tsx components/guide/
cp "$D/app/[locale]/install/[os]/page.tsx" "app/[locale]/install/[os]/"
```

In `app/[locale]/install/[os]/page.tsx`, replace `#eff5e3_0%,rgba(239,245,227,0)_70%` with `#E8F3E7_0%,rgba(232,243,231,0)_70%`, and add `font-display` to the `<h1>` class.

Still in that page, the button at the bottom must not read "Chọn bộ cài macOS" when no macOS installer exists, nor on the Windows guide when the Windows installer is missing (the pre-launch state is how the site goes live). Import `hasAssetFor` from `@/lib/releases/state` and replace

```tsx
<ButtonLink href="/download" icon="download">{t('bottom.downloadMac')}</ButtonLink>
```

with

```tsx
<ButtonLink href="/download" icon="download">
  {os === 'macos' && hasAssetFor(assets, 'macos') ? t('bottom.downloadMac') : tc('download')}
</ButtonLink>
```

Tap targets (spec §8.3, 44 px on phones), three class changes:

- `app/[locale]/install/[os]/page.tsx`, the breadcrumb link: `className="hover:text-ink"` becomes `className="inline-flex min-h-11 items-center hover:text-ink md:min-h-0"`.
- `components/guide/OsTabs.tsx`: `inline-flex h-10 items-center gap-2 rounded-[7px] px-4 text-[14.5px] font-semibold` becomes `inline-flex h-11 items-center gap-2 rounded-[7px] px-4 text-[14.5px] font-semibold md:h-10`.
- `components/guide/Toc.tsx`: in the link class, `py-1.5` becomes `py-3.5 md:py-1.5`.

- [ ] **Step 2: Write the failing test**

`tests/unit/guides.test.ts`:

```ts
import { readFileSync } from 'node:fs'
import { expect, test } from 'vitest'
import { GUIDE_OS, isGuideOs } from '@/content/install'

for (const locale of ['vi', 'en']) {
  for (const os of GUIDE_OS) {
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
      }
      if (os === 'windows') {
        expect(src).toContain('SmartScreen')
        expect(src).toContain('Agentra JSC')
        expect(src).toContain('Run anyway')
      }
    })
  }
}

test('isGuideOs', () => {
  expect(isGuideOs('macos')).toBe(true)
  expect(isGuideOs('linux')).toBe(false)
})
```

Run: `pnpm test tests/unit/guides.test.ts` → FAIL (MDX files missing).

- [ ] **Step 3: Write the Vietnamese guides**

`content/install/vi/macos.mdx`:

```mdx
export const meta = {
  title: 'Cài EduFlow trên máy Mac',
  description: 'Chọn đúng bộ cài theo chip, kéo vào Applications, kích hoạt bằng key hoặc dùng thử, chọn hồ sơ làm việc và nhận bản mới trong app.',
  updated: '2026-09-30',
  minutes: 4,
  toc: [
    { id: 'chon-tep', label: 'Chọn đúng tệp theo chip' },
    { id: 'cai-dat', label: 'Cài vào Applications' },
    { id: 'mo-lan-dau', label: 'Mở lần đầu' },
    { id: 'kich-hoat', label: 'Kích hoạt hoặc dùng thử' },
    { id: 'ho-so', label: 'Chọn hồ sơ làm việc' },
    { id: 'cap-nhat', label: 'Nhận bản mới' },
    { id: 'go-cai', label: 'Gỡ cài đặt' },
  ],
}

<Steps>

<Step n={1} id="chon-tep" title="Chọn đúng tệp theo chip">

Mở Apple menu, chọn **Giới thiệu về máy Mac này** và đọc dòng **Chip**.

| Dòng Chip ghi | Tải tệp |
|---|---|
| Apple M1, M2, M3 hoặc mới hơn | `EduFlow-<phiên bản>-arm64.dmg` (Apple Silicon) |
| Intel | `EduFlow-<phiên bản>.dmg` (Intel) |

EduFlow chạy trên macOS 12 trở lên.

</Step>

<Step n={2} id="cai-dat" title="Cài vào Applications">

Bấm đúp tệp **.dmg** vừa tải, rồi kéo biểu tượng **EduFlow** vào thư mục **Applications**. Sau đó có thể đẩy đĩa cài ra.

</Step>

<Step n={3} id="mo-lan-dau" title="Mở lần đầu">

Mở EduFlow từ **Applications** hoặc Launchpad. Bộ cài đã được ký Developer ID và Apple notarize, nên macOS chỉ hỏi xác nhận một lần vì app được tải từ Internet. Bấm **Mở**.

</Step>

<Step n={4} id="kich-hoat" title="Kích hoạt hoặc dùng thử">

Ở màn Chào mừng:

1. Có key của trường: nhập key bắt đầu bằng `EDU-` và các nhóm 4 ký tự, bấm **Kích hoạt**.
2. Chưa có key: bấm **Dùng thử**, điền họ tên, email, số điện thoại và đơn vị. Khi Agentra bật tự duyệt dùng thử, máy nhận key dùng thử ngay; nếu không, đơn chờ duyệt và app tự kích hoạt khi đơn được duyệt.

Key dùng thử chạy trên 1 máy, có ngân sách dùng thử và ngày hết hạn.

</Step>

<Step n={5} id="ho-so" title="Chọn hồ sơ làm việc">

Chọn vai thầy cô dùng nhiều nhất: giáo viên phổ thông, giảng viên, trưởng bộ môn, Phòng Đảm bảo chất lượng, Hội đồng CTĐT hoặc Ban giám hiệu. Hồ sơ chỉ sắp xếp giao diện, không khoá chức năng nào, và đổi được trong Cài đặt.

</Step>

<Step n={6} id="cap-nhat" title="Nhận bản mới">

Khi có bản mới, app hiện thông báo. Bấm **Tải về**, làm việc tiếp trong lúc tải, rồi bấm **Khởi động lại để cài**. Dự án và dữ liệu giữ nguyên.

</Step>

<Step n={7} id="go-cai" title="Gỡ cài đặt">

Thoát EduFlow, kéo **EduFlow** từ **Applications** vào Thùng rác. Dữ liệu dự án nằm trong thư mục dữ liệu của app; nếu cần giữ lại, tạo bản sao lưu ở **Cài đặt**, mục **Lưu trữ và sao lưu**, trước khi gỡ.

</Step>

</Steps>
```

`content/install/vi/windows.mdx`:

```mdx
export const meta = {
  title: 'Cài EduFlow trên máy Windows',
  description: 'Tải bộ cài đã ký, chạy trình cài, xử lý SmartScreen nếu có, kích hoạt bằng key hoặc dùng thử và nhận bản mới trong app.',
  updated: '2026-09-30',
  minutes: 3,
  toc: [
    { id: 'tai-tep', label: 'Tải tệp cài' },
    { id: 'trinh-cai', label: 'Chạy trình cài' },
    { id: 'smartscreen', label: 'Nếu SmartScreen hỏi lại' },
    { id: 'kich-hoat', label: 'Kích hoạt hoặc dùng thử' },
    { id: 'ho-so', label: 'Chọn hồ sơ làm việc' },
    { id: 'cap-nhat', label: 'Nhận bản mới' },
    { id: 'go-cai', label: 'Gỡ cài đặt' },
  ],
}

<Steps>

<Step n={1} id="tai-tep" title="Tải tệp cài">

Tải tệp `EduFlow Setup <phiên bản>.exe` từ trang Tải về. Tệp chạy trên Windows 10 22H2 trở lên, bản 64-bit.

</Step>

<Step n={2} id="trinh-cai" title="Chạy trình cài">

Bấm đúp tệp **.exe**. Trình cài hiện nhà phát hành **Agentra JSC**. Giữ thư mục cài mặc định hoặc chọn thư mục khác, bấm **Cài đặt**, rồi mở EduFlow từ menu Start.

</Step>

<Step n={3} id="smartscreen" title="Nếu SmartScreen hỏi lại">

Với bản vừa phát hành, Windows Defender SmartScreen có thể hiện hộp thoại **"Windows đã bảo vệ PC của bạn"** (Windows protected your PC) dù bộ cài đã ký.

1. Bấm **Thông tin thêm** (More info).
2. Kiểm dòng nhà phát hành ghi **Agentra JSC**.
3. Bấm **Vẫn chạy** (Run anyway).

Nếu nhà phát hành không phải Agentra JSC, không chạy tệp đó và tải lại từ trang Tải về.

</Step>

<Step n={4} id="kich-hoat" title="Kích hoạt hoặc dùng thử">

Ở màn Chào mừng:

1. Có key của trường: nhập key bắt đầu bằng `EDU-` và các nhóm 4 ký tự, bấm **Kích hoạt**.
2. Chưa có key: bấm **Dùng thử**, điền họ tên, email, số điện thoại và đơn vị. Khi Agentra bật tự duyệt dùng thử, máy nhận key dùng thử ngay; nếu không, đơn chờ duyệt và app tự kích hoạt khi đơn được duyệt.

Key dùng thử chạy trên 1 máy, có ngân sách dùng thử và ngày hết hạn.

</Step>

<Step n={5} id="ho-so" title="Chọn hồ sơ làm việc">

Chọn vai thầy cô dùng nhiều nhất: giáo viên phổ thông, giảng viên, trưởng bộ môn, Phòng Đảm bảo chất lượng, Hội đồng CTĐT hoặc Ban giám hiệu. Hồ sơ chỉ sắp xếp giao diện, không khoá chức năng nào, và đổi được trong Cài đặt.

</Step>

<Step n={6} id="cap-nhat" title="Nhận bản mới">

Khi có bản mới, app hiện thông báo. Bấm **Tải về**, làm việc tiếp trong lúc tải, rồi bấm **Khởi động lại để cài**. Dự án và dữ liệu giữ nguyên.

</Step>

<Step n={7} id="go-cai" title="Gỡ cài đặt">

Mở **Cài đặt** của Windows, chọn **Ứng dụng**, tìm **EduFlow** và bấm **Gỡ cài đặt**. Dữ liệu dự án nằm trong thư mục dữ liệu của app; nếu cần giữ lại, tạo bản sao lưu ở **Cài đặt** của EduFlow, mục **Lưu trữ và sao lưu**, trước khi gỡ.

</Step>

</Steps>
```

- [ ] **Step 4: Write the English guides**

Translate both files into `content/install/en/macos.mdx` and `content/install/en/windows.mdx` with the same `toc` ids, the same component structure and the glossary of Task 1. Keep the exact strings the test requires: `Applications`, `Apple Silicon`, `SmartScreen`, `Agentra JSC`, `Run anyway`, `EDU-`. Use `Official` Windows labels in English (`Windows protected your PC`, `More info`, `Run anyway`, `Settings > Apps`) and macOS labels (`About This Mac`, `Chip`, `Open`).

The EduFlow app itself has a Vietnamese interface (app spec AD-16), so the English guides name each EduFlow button by its real on-screen label in bold, followed by the English meaning in parentheses, for example `**Kích hoạt** (Activate)`, `**Dùng thử** (Trial)`, `**Tải về** (Download)`, `**Khởi động lại để cài** (Restart to install)`, `**Cài đặt** (Settings)`, `**Lưu trữ và sao lưu** (Storage and backup)`. The test 'English copy carries no untranslated Vietnamese' reads English MDX too: add exactly these quoted labels to its `ALLOWED` list and nothing else, so any other Vietnamese text in an English file still fails. In the same test change `acc.split(a)` to `acc.split(a.normalize('NFC'))`, so a label typed in decomposed form still matches.

- [ ] **Step 5: Run and commit**

In `tests/unit/content.test.ts` set `MDX_TOTAL = 4` and `MDX_ENGLISH = 2` (four guides, two of them English). The test fails until the numbers match the files, which proves the copy-rule scan reads the new MDX.

Run: `pnpm verify && pnpm build`
Expected: PASS; four static guide pages.

```bash
git add -A
git commit -m "feat(install): hướng dẫn cài EduFlow trên macOS và Windows bằng MDX hai ngôn ngữ"
```

### Task 12: AI transparency, Contact, Privacy

**Files:**
- Copy then modify from DOCOPS: `app/[locale]/ai-transparency/page.tsx`, `app/[locale]/contact/page.tsx`, `app/[locale]/privacy/page.tsx`, `content/privacy/index.ts` (verbatim)
- Create: `content/privacy/vi.mdx`, `content/privacy/en.mdx`

**Interfaces:**
- Consumes: `transparency.*`, `contact.*`, `common.privacyPolicy`, `install.updated` messages; `site`.

- [ ] **Step 1: Copy and adjust the pages**

```bash
D=../docops-landing-page
mkdir -p "app/[locale]/ai-transparency" "app/[locale]/contact" "app/[locale]/privacy" content/privacy
cp "$D/app/[locale]/ai-transparency/page.tsx" "app/[locale]/ai-transparency/"
cp "$D/app/[locale]/contact/page.tsx" "app/[locale]/contact/"
cp "$D/app/[locale]/privacy/page.tsx" "app/[locale]/privacy/"
cp $D/content/privacy/index.ts content/privacy/
```

In all three pages replace `#eff5e3_0%,rgba(239,245,227,0)_70%` with `#E8F3E7_0%,rgba(232,243,231,0)_70%`.

In `app/[locale]/ai-transparency/page.tsx`: set `const UPDATED = '2026-09-30'`; set `const ITEMS = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8'] as const`; replace the ternary that renders `p10` with rich text by plain `{t(`${key}.body`)}` (EduFlow's copy has no `p10` and no email tag in the list), then delete the now unused `import { site } from '@/lib/site'` so lint stays green.

In `app/[locale]/contact/page.tsx`: one class change, add `min-h-11 md:min-h-0` to the `linkClass` constant (44 px tap target on phones, spec §8.3). Nothing else changes; the EduFlow `contact.*` keys follow DocOps's shape (`email`, `phone`, `address`, `key.s1..s3`, `key.note`, `support.i1..i4`, `support.boxTitle`, `support.boxBody`, `support.btn`, `support.subject`). Build and check that every key resolves (next-intl logs a missing-message error in `pnpm build` otherwise).

- [ ] **Step 2: Write the privacy policy**

`content/privacy/vi.mdx`:

```mdx
export const meta = {
  title: 'Chính sách bảo mật',
  description: 'Trang web EduFlow thu thập gì, dùng cookie phân tích ra sao, cách rút lại đồng ý, liên kết ngoài và quyền của thầy cô theo Nghị định 13/2023/NĐ-CP.',
  updated: '2026-09-30',
}

## 1. Phạm vi

Chính sách này áp dụng cho trang web giới thiệu EduFlow do Agentra JSC vận hành. Cách ứng dụng EduFlow xử lý dữ liệu của thầy cô và của đơn vị được nêu ở trang **Minh bạch AI và dữ liệu**.

## 2. Dữ liệu trang web thu thập

- Trang web không có biểu mẫu; thầy cô không nhập dữ liệu cá nhân nào vào đây.
- **Vercel Web Analytics** và **Speed Insights** ghi số liệu truy cập ẩn danh (trang được xem, quốc gia, loại thiết bị, tốc độ tải) và không dùng cookie.
- **Google Analytics 4** chỉ được nạp khi thầy cô bấm "Đồng ý" ở thanh cookie. Google Analytics đặt cookie để phân biệt các lượt truy cập.
- Khi thầy cô bấm tải bộ cài, yêu cầu được gửi thẳng tới máy chủ phân phối của Agentra; máy chủ đó ghi nhật ký truy cập kỹ thuật thông thường (địa chỉ IP, thời điểm, tệp tải).

## 3. Cookie và cách rút lại đồng ý

Lựa chọn ở thanh cookie được lưu trong trình duyệt (localStorage, khoá `eduflow.consent`), không gửi về máy chủ. Để rút lại đồng ý, xoá dữ liệu trang web này trong cài đặt trình duyệt; thanh cookie sẽ hiện lại ở lần truy cập sau và Google Analytics không được nạp cho tới khi thầy cô đồng ý lại.

## 4. Liên kết ngoài

Trang web dẫn tới máy chủ phân phối bộ cài của Agentra và tới trang agentra.io.vn. Các trang ngoài có chính sách riêng.

## 5. Dữ liệu trong ứng dụng EduFlow

Dự án, hiện vật và lịch sử trò chuyện với trợ lý nằm trên máy của thầy cô. Máy chủ của EduFlow chuyển nội dung cho mô hình ngôn ngữ và ghi số token, số tiền, mã băm; nội dung không được lưu. Chi tiết ở trang Minh bạch AI và dữ liệu.

## 6. Quyền của thầy cô

Theo Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân, thầy cô có quyền được biết, truy cập, chỉnh sửa, xoá và rút lại sự đồng ý đối với dữ liệu cá nhân của mình. Vì trang web không lưu dữ liệu cá nhân định danh, yêu cầu thường được đáp ứng bằng cách xoá dữ liệu trình duyệt như mục 3; mọi yêu cầu khác gửi về địa chỉ ở mục 7.

## 7. Liên hệ

Agentra JSC, Đà Nẵng, Việt Nam. Email: [info@agentra.io.vn](mailto:info@agentra.io.vn).
```

`content/privacy/en.mdx`: the same seven sections in English, with a `meta.description` of 140 to 160 characters (glossary of Task 1; "you" for "thầy cô"; Decree 13/2023/ND-CP on personal data protection). Do not add any statement about model training (OQ-L07).

- [ ] **Step 3: Run and commit**

In `tests/unit/content.test.ts` set `MDX_TOTAL = 6` and `MDX_ENGLISH = 3` (the two privacy files join the four guides).

Run: `pnpm verify && pnpm build`
Expected: PASS; `content.test.ts` now also scans the privacy and guide MDX files.

```bash
git add -A
git commit -m "feat(pages): Minh bạch AI, Liên hệ, Chính sách bảo mật hai ngôn ngữ"
```

### Task 13: SEO plumbing: sitemap, robots, manifest, icons, OG images, production guard

**Files:**
- Copy then modify from DOCOPS: `app/sitemap.ts`, `app/robots.ts` (verbatim), `app/manifest.ts`, `lib/seo/og.tsx`, `app/[locale]/opengraph-image.tsx`, `app/[locale]/download/opengraph-image.tsx`, `assets/fonts/{BeVietnamPro-Bold.ttf,BeVietnamPro-Regular.ttf,OFL.txt}` (verbatim)
- Create: `app/icon.svg`, `app/icon.png`, `app/apple-icon.png`, `lib/env.ts`, `tests/unit/env.test.ts`
- Modify: `next.config.ts`, `tests/unit/seo.test.ts`, `tests/unit/content.test.ts`, `messages/vi.json`, `messages/en.json`, `docs/superpowers/plans/2026-09-30-eduflow-landing-page.messages.vi.json` (meta descriptions)

**Interfaces:**
- Produces: `assertProductionEnv(env: Record<string, string | undefined>): void` (throws when `VERCEL_ENV === 'production'` and `NEXT_PUBLIC_SITE_URL` is empty).

- [ ] **Step 1: Write the failing tests**

In `tests/unit/seo.test.ts`, add `vi` to the existing `vitest` import, add this line right after the imports (Vitest hoists it):

```ts
vi.mock('@/lib/releases/feed', () => ({ fetchFeed: async () => null }))
```

and append this test:

```ts
test('sitemap lists 24 urls (12 pages × 2 locales) with alternates', async () => {
  const { default: sitemap } = await import('@/app/sitemap')
  const entries = await sitemap()
  expect(entries).toHaveLength(24)
  const urls = entries.map((e) => e.url)
  for (const u of ['https://eduflow.test', 'https://eduflow.test/pho-thong', 'https://eduflow.test/en/program-review', 'https://eduflow.test/cach-tinh-phi', 'https://eduflow.test/en/install/windows']) {
    expect(urls).toContain(u)
  }
  const dl = entries.find((e) => e.url.endsWith('/tai-ve'))!
  expect(dl.alternates?.languages).toMatchObject({ en: 'https://eduflow.test/en/download', 'x-default': 'https://eduflow.test/tai-ve' })
})
```

`tests/unit/env.test.ts`:

```ts
import { expect, test } from 'vitest'
import { assertProductionEnv } from '@/lib/env'

test('production builds need NEXT_PUBLIC_SITE_URL, other builds do not', () => {
  expect(() => assertProductionEnv({ VERCEL_ENV: 'production', NEXT_PUBLIC_SITE_URL: '' })).toThrow(/NEXT_PUBLIC_SITE_URL/)
  expect(() => assertProductionEnv({ VERCEL_ENV: 'production', NEXT_PUBLIC_SITE_URL: 'https://x.test' })).not.toThrow()
  expect(() => assertProductionEnv({ VERCEL_ENV: 'preview' })).not.toThrow()
  expect(() => assertProductionEnv({})).not.toThrow()
})
```

Run: `pnpm test` → FAIL (`app/sitemap`, `lib/env` missing).

- [ ] **Step 2: Implement**

```bash
D=../docops-landing-page
mkdir -p assets/fonts
cp $D/assets/fonts/* assets/fonts/
cp $D/app/{sitemap,robots,manifest}.ts app/
cp $D/lib/seo/og.tsx lib/seo/
cp "$D/app/[locale]/opengraph-image.tsx" "app/[locale]/"
mkdir -p "app/[locale]/download" && cp "$D/app/[locale]/download/opengraph-image.tsx" "app/[locale]/download/"
```

`app/sitemap.ts`: replace the `push(...)` list with:

```ts
push('/', 1)
push('/k12', 0.9)
push('/university', 0.9)
push('/program', 0.9)
push('/assistant', 0.8)
push('/pricing', 0.8)
push('/download', 0.9, undefined, latest?.releaseDate ? new Date(latest.releaseDate) : built)
for (const os of GUIDE_OS) push('/install/[os]', 0.7, { os })
push('/ai-transparency', 0.6)
push('/contact', 0.6)
push('/privacy', 0.3)
```

`app/manifest.ts`:

```ts
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
```

`app/icon.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 34 34"><rect width="34" height="34" rx="9" fill="#237A31"/><g transform="translate(8.5 8.5) scale(0.7083)" fill="none" stroke="#FFFFFF" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19V5h10"/><path d="M4 12h8"/><path d="M4 19h12"/></g></svg>
```

Render the PNG icons:

```bash
node -e "const s=require('sharp');s('app/icon.svg',{density:600}).resize(192).png().toFile('app/icon.png');s('app/icon.svg',{density:600}).resize(180).png().toFile('app/apple-icon.png')"
```

`lib/seo/og.tsx`: keep the structure and the fonts; replace the background with `linear-gradient(135deg, #1E2B23 0%, #237A31 100%)`; replace the Agentra logo `<svg>` with the EduFlow mark (the same `rect` and `g` as `app/icon.svg`, width and height 56); replace `Agentra DocOps` with `EduFlow`; replace the lime badge colours with `rgba(155,203,60,0.22)` / `rgba(155,203,60,0.6)` / `#E3F1E4`; replace the footer line `docops.agentra.io.vn` with `{new URL(site.siteUrl()).host}` (import `site` from `@/lib/site`) and `Windows · macOS` with `macOS · Windows`.

`app/[locale]/opengraph-image.tsx`:

```tsx
import { getTranslations } from 'next-intl/server'
import { routing, type Locale } from '@/i18n/routing'
import { OG_SIZE, ogImage } from '@/lib/seo/og'

export const alt = 'EduFlow'
export const size = OG_SIZE
export const contentType = 'image/png'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale: locale as Locale, namespace: 'home.hero' })
  return ogImage({ title: t('h1'), subtitle: t('sub').split('. ')[0] })
}
```

`app/[locale]/download/opengraph-image.tsx`:

```tsx
import { getTranslations } from 'next-intl/server'
import { routing, type Locale } from '@/i18n/routing'
import { getReleases, latestRelease } from '@/lib/releases'
import { OG_SIZE, ogImage } from '@/lib/seo/og'

export const alt = 'Tải EduFlow'
export const size = OG_SIZE
export const contentType = 'image/png'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const [t, { assets }] = await Promise.all([getTranslations({ locale: locale as Locale, namespace: 'download' }), getReleases()])
  const latest = latestRelease(assets)
  return ogImage({ title: t('h1'), subtitle: t('meta.description'), badge: latest ? `v${latest.version}` : undefined })
}
```

`lib/env.ts`:

```ts
/** Build production trên Vercel phải có domain thật, nếu không canonical và sitemap sẽ trỏ về localhost (spec §11). */
export function assertProductionEnv(env: Record<string, string | undefined>): void {
  if (env.VERCEL_ENV === 'production' && !(env.NEXT_PUBLIC_SITE_URL ?? '').trim()) {
    throw new Error('NEXT_PUBLIC_SITE_URL phải được đặt cho build production (OQ-L01).')
  }
}
```

In `next.config.ts`, add at the top, after the imports:

```ts
import { assertProductionEnv } from './lib/env'

assertProductionEnv(process.env)
```

- [ ] **Step 2b: Meta descriptions of 140 to 160 characters (spec §9)**

Append to `tests/unit/content.test.ts` (the file was reworked in the Task 3 review; it already has the helpers `ROOT`, `values`, `walk` and `mdxFiles` this test uses):

```ts
test('every meta description is 140 to 160 characters (spec §9)', () => {
  // Trang Chính sách bảo mật lấy mô tả từ meta.description của tệp MDX, các trang khác lấy từ messages.
  const privacy = ['vi', 'en'].map((lang) => {
    const src = readFileSync(join(ROOT, 'content', 'privacy', `${lang}.mdx`), 'utf8')
    return [`content/privacy/${lang}.mdx`, /description:\s*(['"])(.+)\1/.exec(src)?.[2] ?? ''] as const
  })
  const bad = [...values(vi).map(([k, v]) => [`vi:${k}`, v] as const), ...values(en).map(([k, v]) => [`en:${k}`, v] as const)]
    .filter(([k]) => k.endsWith('.description'))
    .concat(privacy)
    .filter(([, v]) => v.length < 140 || v.length > 160)
    .map(([k, v]) => `${k} (${v.length})`)
  expect(bad).toEqual([])
})
```

Run: `pnpm test tests/unit/content.test.ts` → FAIL listing 8 Vietnamese and 2 English keys. Then set these values in `messages/vi.json` (and the same eight in `docs/superpowers/plans/2026-09-30-eduflow-landing-page.messages.vi.json`, so the two stay identical):

| Key | New value |
|---|---|
| `levels.k12.meta.description` | Soạn đề kiểm tra theo ma trận bốn mức với nhiều mã đề, giáo án CV5512 và slide có quiz; 12 cổng chất lượng; thầy cô duyệt và ký trước khi xuất bản. |
| `levels.university.meta.description` | Từ bài giảng tới CLO, kế hoạch tuần, giáo án buổi, slide, đánh giá và đề cương 10 mục; kiểm 12 cổng G1..G12; trưởng bộ môn ký duyệt qua gói đã ký. |
| `levels.program.meta.description` | Dựng bản sao số của chương trình đào tạo, rà hiệu lực pháp lý tại ngày xét, bảy phép kiểm curriculum map, lớp phủ tiêu chí và kịch bản “nếu” trước khi sửa. |
| `transparency.meta.description` | EduFlow dùng AI ở đâu, gửi dữ liệu gì, dữ liệu nào ở lại máy thầy cô, máy chủ ghi gì, cùng các nguyên tắc máy đề xuất, người quyết định và ba tầng kết luận. |
| `download.meta.description` | Tải bộ cài EduFlow đã ký số cho macOS (Apple Silicon, Intel) và Windows, kèm mã SHA-512, yêu cầu hệ thống, hướng dẫn cài đặt và cách nhận bản cập nhật. |
| `install.meta.macos.description` | Chọn đúng bộ cài EduFlow theo chip của máy Mac, cài vào Applications, kích hoạt bằng key hoặc dùng thử, chọn hồ sơ làm việc và nhận bản cập nhật mới. |
| `install.meta.windows.description` | Tải bộ cài EduFlow đã ký cho Windows, chạy trình cài, xử lý SmartScreen nếu có, kích hoạt bằng key hoặc dùng thử, chọn hồ sơ làm việc và nhận bản mới. |
| `contact.meta.description` | Liên hệ Agentra để nhận báo giá EduFlow cho trường, xin key kích hoạt, hỏi về dùng thử hoặc báo lỗi; trang có email, địa chỉ và các bước nhận key. |

and these two in `messages/en.json`:

| Key | New value |
|---|---|
| `install.meta.windows.description` | Download the signed EduFlow installer for Windows, run it, handle SmartScreen if it appears, activate with a license key or a trial, and get new versions. |
| `contact.meta.description` | Contact Agentra for an EduFlow quote for your school, a license key, a trial or a bug report; the page lists the email, the address and how to get a key. |

In the same pass fix three English wording points in `messages/en.json`: write "90- or 150-minute" and "45-minute" with hyphens wherever they modify a noun, and replace "Turn on the AI off switch" with "Switch AI off". Run: `pnpm test tests/unit/content.test.ts tests/unit/i18n.test.ts` → PASS.

- [ ] **Step 2c: Page titles do not repeat the brand (Ruling 34)**

The layout's title template appends " · EduFlow" to every page title except the home page (which passes `absoluteTitle`). Six titles already contain "EduFlow", so the browser tab reads, for example, "Tải EduFlow cho macOS và Windows · EduFlow". Append to `tests/unit/content.test.ts`:

```ts
test('page titles do not repeat the brand the title template adds', () => {
  const bad = [...values(vi).map(([k, v]) => [`vi:${k}`, v] as const), ...values(en).map(([k, v]) => [`en:${k}`, v] as const)]
    // Khoá kiểu `…meta.title` và `install.meta.macos.title`; trang chủ dùng tiêu đề tuyệt đối nên được mang tên.
    .filter(([k]) => /\bmeta\.(?:\w+\.)?title$/.test(k) && !k.endsWith(':home.meta.title'))
    .filter(([, v]) => v.includes('EduFlow'))
    .map(([k]) => k)
  expect(bad).toEqual([])
})
```

Run: `pnpm test tests/unit/content.test.ts` → FAIL listing six keys per language. Then set these values in `messages/vi.json` (and the same six in `docs/superpowers/plans/2026-09-30-eduflow-landing-page.messages.vi.json`, so the two stay identical) and in `messages/en.json`:

| Key | vi | en |
|---|---|---|
| `assistant.meta.title` | Trợ lý AI trong ứng dụng | The in-app AI assistant |
| `pricing.meta.title` | Cách tính phí | How pricing works |
| `download.meta.title` | Tải về cho macOS và Windows | Download for macOS and Windows |
| `install.meta.macos.title` | Cài đặt trên macOS | Install on macOS |
| `install.meta.windows.title` | Cài đặt trên Windows | Install on Windows |
| `contact.meta.title` | Liên hệ Agentra | Contact Agentra |

Run: `pnpm test tests/unit/content.test.ts tests/unit/i18n.test.ts` → PASS.

- [ ] **Step 3: Run**

Run: `pnpm verify && pnpm build && pnpm start -p 3200`
Expected: PASS; `curl -s localhost:3200/sitemap.xml | grep -c '<loc>'` prints `24`; `/robots.txt` lists the sitemap; `/opengraph-image` and `/en/download/opengraph-image` return PNGs.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(seo): sitemap 24 URL, robots, manifest, icon EduFlow, ảnh OG, chặn build production thiếu domain"
```

### Task 14: End-to-end tests in feed and pre-launch modes, Lighthouse CI, GitHub Actions

**Files:**
- Copy then modify from DOCOPS: `playwright.config.ts`, `lighthouserc.json`, `.github/workflows/ci.yml`, `tests/e2e/consent.spec.ts`
- Create: `scripts/serve-fixtures.mjs`, `tests/e2e/pages.spec.ts`, `tests/e2e/download.spec.ts`, `tests/e2e/prelaunch.spec.ts`, `tests/e2e/mobile.spec.ts`

**Interfaces:**
- Produces: `E2E_MODE=feed|prelaunch` selects the specs; the feed mode builds against a local fixture feed on port 3300.

- [ ] **Step 1: Fixture feed server**

`scripts/serve-fixtures.mjs`:

```js
// Máy chủ feed giả cho e2e: phục vụ tests/fixtures/*.yml tại http://localhost:3300/.
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

const PORT = Number(process.env.FIXTURE_PORT ?? 3300)
createServer(async (req, res) => {
  const name = decodeURIComponent((req.url ?? '/').split('?')[0].replace(/^\/+/, ''))
  if (!/^latest(-mac)?\.yml$/.test(name)) {
    res.writeHead(404).end('not found')
    return
  }
  try {
    const body = await readFile(join('tests/fixtures', name))
    res.writeHead(200, { 'content-type': 'text/yaml; charset=utf-8' }).end(body)
  } catch {
    res.writeHead(404).end('not found')
  }
}).listen(PORT, () => console.log(`fixture feed on http://localhost:${PORT}/`))
```

- [ ] **Step 2: Playwright config**

Copy DOCOPS `playwright.config.ts`, then set the projects to:

```ts
const MODE = process.env.E2E_MODE === 'prelaunch' ? 'prelaunch' : 'feed'
const MODE_IGNORE = MODE === 'prelaunch' ? /download\.spec\.ts/ : /prelaunch\.spec\.ts/

projects: [
  { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } }, testIgnore: [/mobile\.spec\.ts/, MODE_IGNORE] },
  // Spec §13 yêu cầu kiểm menu mobile ở 390 px, cũng là bề rộng artboard điện thoại trên canvas.
  { name: 'mobile', use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 } }, testMatch: /mobile\.spec\.ts/ },
],
```

and the web server to start the fixture feed in feed mode:

```ts
webServer: [
  ...(MODE === 'feed' ? [{ command: 'node scripts/serve-fixtures.mjs', url: 'http://localhost:3300/latest.yml', reuseExistingServer: true }] : []),
  { command: `pnpm start -p ${PORT}`, url: BASE_URL, reuseExistingServer: !process.env.CI, timeout: 60_000 },
],
```

- [ ] **Step 3: Write the specs**

`tests/e2e/pages.spec.ts`:

```ts
import { expect, test } from '@playwright/test'

export const PAGES: Array<[string, 'vi' | 'en']> = [
  ['/', 'vi'], ['/en', 'en'],
  ['/pho-thong', 'vi'], ['/en/k12', 'en'],
  ['/hoc-phan', 'vi'], ['/en/university-courses', 'en'],
  ['/chuong-trinh', 'vi'], ['/en/program-review', 'en'],
  ['/tro-ly-ai', 'vi'], ['/en/ai-assistant', 'en'],
  ['/cach-tinh-phi', 'vi'], ['/en/pricing', 'en'],
  ['/minh-bach-ai', 'vi'], ['/en/ai-transparency', 'en'],
  ['/tai-ve', 'vi'], ['/en/download', 'en'],
  ['/huong-dan-cai-dat/macos', 'vi'], ['/huong-dan-cai-dat/windows', 'vi'],
  ['/en/install/macos', 'en'], ['/en/install/windows', 'en'],
  ['/lien-he', 'vi'], ['/en/contact', 'en'],
  ['/chinh-sach-bao-mat', 'vi'], ['/en/privacy', 'en'],
]

for (const [path, lang] of PAGES) {
  test(`${path} renders with SEO basics`, async ({ page }) => {
    const errors: string[] = []
    page.on('console', (m) => m.type() === 'error' && !m.text().includes('/_vercel/') && errors.push(m.text()))
    page.on('pageerror', (e) => errors.push(e.message))
    const res = await page.goto(path)
    expect(res?.status()).toBe(200)
    await expect(page.locator('html')).toHaveAttribute('lang', lang)
    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1)
    expect(await page.locator('link[rel="alternate"][hreflang]').count()).toBeGreaterThanOrEqual(3)
    await expect(page.locator('meta[property="og:image"]')).toHaveCount(1)
    for (const s of await page.locator('script[type="application/ld+json"]').allTextContents()) JSON.parse(s)
    await expect(page.locator('main#main')).toHaveCount(1)
    // Spec §13: không trang nào chứa ký tự gạch ngang dài (U+2014). Dựng ký tự bằng mã để tệp test không chứa nó.
    expect(await page.content()).not.toContain(String.fromCharCode(0x2014))
    expect(errors).toEqual([])
  })
}

test('locale switch keeps the current page', async ({ page }) => {
  await page.goto('/cach-tinh-phi')
  await page.locator('header').getByRole('link', { name: 'EN', exact: true }).click()
  await expect(page).toHaveURL(/\/en\/pricing$/)
  await page.locator('header').getByRole('link', { name: 'VI', exact: true }).click()
  await expect(page).toHaveURL(/\/cach-tinh-phi$/)
})

test('unknown paths give a localized 404', async ({ page }) => {
  expect((await page.goto('/khong-co-trang-nay'))?.status()).toBe(404)
  await expect(page.locator('h1')).toHaveText('Không tìm thấy trang')
  expect((await page.goto('/en/no-such-page'))?.status()).toBe(404)
  await expect(page.locator('h1')).toHaveText('Page not found')
})

for (const path of ['/cach-tinh-phi', '/en/pricing']) {
  test(`${path} shows no price figure`, async ({ page }) => {
    await page.goto(path)
    const text = await page.locator('main').innerText()
    expect(text.length).toBeGreaterThan(500)
    // Một con số đi liền đơn vị tiền. "đ" theo sau bởi chữ cái (đề, điểm, đến) không tính.
    expect(text).not.toMatch(/\d[\d.,]*\s?(₫|VNĐ|VND|đ(?!\p{L}))/u)
  })
}

// Ruling 27: với optimisticRouting bật, trang 404 tiếng Anh gửi hàng trăm yêu cầu _rsc mỗi giây không dừng.
// Trang bình thường dừng ở khoảng 13 tới 27 yêu cầu; `next dev` không tái hiện được lỗi này, nên test chạy trên bản build.
for (const path of ['/', '/en', '/en/no-such-page']) {
  test(`no runaway prefetch on ${path}`, async ({ page }) => {
    let rsc = 0
    page.on('request', (r) => {
      if (new URL(r.url()).searchParams.has('_rsc')) rsc++
    })
    await page.goto(path)
    await page.waitForTimeout(2000)
    expect(rsc).toBeLessThan(60)
  })
}

// Ruling 29: không cuộn ngang ở bề rộng máy tính bảng (spec §8.3); lưới footer từng tràn từ 768 tới 829 px.
for (const width of [640, 768, 820, 1024]) {
  test(`no horizontal overflow at ${width} px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    for (const path of ['/', '/en', '/tai-ve', '/en/pricing']) {
      await page.goto(path)
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
      expect(overflow, path).toBeLessThanOrEqual(0)
    }
  })
}
```

`tests/e2e/download.spec.ts` (feed mode):

```ts
import { expect, test } from '@playwright/test'

const FEED = /^http:\/\/localhost:3300\/.+\.(exe|dmg)$/

test('download page lists the three installers from the feed', async ({ page }) => {
  await page.goto('/tai-ve')
  const links = page.locator('main a[download]')
  await expect(links).toHaveCount(3)
  const hrefs = await links.evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).href))
  for (const href of hrefs) expect(href).toMatch(FEED)
  expect(hrefs.some((h) => h.includes('EduFlow%20Setup'))).toBe(true)
  expect(hrefs.some((h) => h.endsWith('-arm64.dmg'))).toBe(true)
  await expect(page.getByTestId('prelaunch')).toHaveCount(0)
})

test('home page download block links the same three installers', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('#tai-ve a[download]')).toHaveCount(3)
})
```

`tests/e2e/prelaunch.spec.ts` (pre-launch mode, Review Focus 1):

```ts
import { expect, test } from '@playwright/test'

test('download page shows the pre-launch notice and no installer link', async ({ page }) => {
  await page.goto('/tai-ve')
  await expect(page.getByTestId('prelaunch')).toBeVisible()
  await expect(page.locator('main a[download]')).toHaveCount(0)
  await page.getByTestId('prelaunch').getByRole('link').click()
  await expect(page).toHaveURL(/\/lien-he$/)
})

test('home hero and download block lead to contact, header button still reaches the notice', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('link', { name: 'Liên hệ để dùng sớm' }).first()).toHaveAttribute('href', '/lien-he')
  await expect(page.locator('#tai-ve').getByTestId('prelaunch')).toBeVisible()
  await page.locator('header').getByRole('link', { name: 'Tải EduFlow' }).click()
  await expect(page).toHaveURL(/\/tai-ve$/)
  await expect(page.getByTestId('prelaunch')).toBeVisible()
})
```

`tests/e2e/mobile.spec.ts` (Review Focus 3):

```ts
import { expect, test } from '@playwright/test'

const VI_PAGES = ['/', '/pho-thong', '/hoc-phan', '/chuong-trinh', '/tro-ly-ai', '/cach-tinh-phi', '/minh-bach-ai', '/tai-ve', '/huong-dan-cai-dat/macos', '/huong-dan-cai-dat/windows', '/lien-he', '/chinh-sach-bao-mat']

test('mobile menu opens with the five nav links and a download button', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Mở menu' }).click()
  const nav = page.locator('#mobile-nav')
  await expect(nav.locator('nav').getByRole('link')).toHaveCount(5)
  await expect(nav.getByRole('link', { name: 'Tải EduFlow' })).toBeVisible()
  // Panel phải phủ hết màn hình dưới header. toBeVisible vẫn qua khi panel co còn 49 px, nên đo hộp thật.
  const box = await nav.boundingBox()
  const viewport = page.viewportSize()
  expect(box).not.toBeNull()
  expect(viewport).not.toBeNull()
  expect(box!.y).toBeLessThanOrEqual(72)
  expect(box!.height).toBeGreaterThanOrEqual(viewport!.height - 73)
})

test('on a phone the hero button never starts an installer download', async ({ page }) => {
  await page.goto('/')
  const hero = page.locator('main section').first()
  await expect(hero.locator('a[download]')).toHaveCount(0)
  await expect(hero.getByText('EduFlow chạy trên máy tính macOS và Windows.')).toBeVisible()
})

for (const path of VI_PAGES) {
  test(`no horizontal overflow on ${path}`, async ({ page }) => {
    await page.goto(path)
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    expect(overflow).toBeLessThanOrEqual(0)
  })

  // Spec §8.3: vùng chạm tối thiểu 44 px trên điện thoại. Link nằm trong dòng chữ (display inline) được miễn.
  test(`tap targets are at least 44 px tall on ${path}`, async ({ page }) => {
    await page.goto(path)
    const small = await page.evaluate(() =>
      [...document.querySelectorAll('a, button, summary')]
        .filter((el) => {
          const box = el.getBoundingClientRect()
          return box.width > 1 && box.height > 1 && getComputedStyle(el).display !== 'inline'
        })
        .map((el) => ({ tag: el.tagName.toLowerCase(), text: (el.textContent ?? '').trim().slice(0, 40), height: Math.round(el.getBoundingClientRect().height) }))
        .filter((target) => target.height < 44),
    )
    expect(small).toEqual([])
  })
}
```

`tests/e2e/consent.spec.ts`: copy DOCOPS's file and replace `'docops.consent'` with `'eduflow.consent'`.

- [ ] **Step 4: Lighthouse and CI**

`lighthouserc.json`: copy DOCOPS's file and set `collect.url` to:

```json
["http://localhost:3200/", "http://localhost:3200/pho-thong", "http://localhost:3200/cach-tinh-phi", "http://localhost:3200/tai-ve", "http://localhost:3200/en"]
```

`.github/workflows/ci.yml`: copy DOCOPS's file, set `NEXT_PUBLIC_SITE_URL: https://eduflow.example.test` in `env`, and replace the steps after `pnpm verify` with:

```yaml
      - run: pnpm exec playwright install --with-deps chromium
      # Chế độ feed: dựng với feed giả chạy nền trên cổng 3300
      - run: node scripts/serve-fixtures.mjs &
      - run: pnpm build
        env: { DOWNLOAD_FEED_URL: 'http://localhost:3300/' }
      - run: pnpm e2e
        env: { CI: true, E2E_MODE: feed, DOWNLOAD_FEED_URL: 'http://localhost:3300/' }
      # Chế độ sắp phát hành: không có feed, snapshot rỗng
      - run: pnpm build
        env: { DOWNLOAD_FEED_URL: '' }
      - run: pnpm e2e
        env: { CI: true, E2E_MODE: prelaunch }
      # Lighthouse chấm canonical theo domain đang chạy → build lại với URL localhost trước khi đo
      - run: pnpm build
        env: { NEXT_PUBLIC_SITE_URL: 'http://localhost:3200', DOWNLOAD_FEED_URL: 'http://localhost:3300/' }
      - run: pnpm lhci
```

Keep DOCOPS's `upload-artifact` step on failure.

- [ ] **Step 5: Run locally**

```bash
# consent.spec.ts cần một ID GA giả lúc build, đúng như env của ci.yml; thiếu nó thì GA không bao giờ nạp và test đỏ.
export NEXT_PUBLIC_GA_MEASUREMENT_ID=G-TEST
node scripts/serve-fixtures.mjs &
DOWNLOAD_FEED_URL=http://localhost:3300/ pnpm build && E2E_MODE=feed DOWNLOAD_FEED_URL=http://localhost:3300/ pnpm e2e
DOWNLOAD_FEED_URL= pnpm build && E2E_MODE=prelaunch pnpm e2e
NEXT_PUBLIC_SITE_URL=http://localhost:3200 DOWNLOAD_FEED_URL=http://localhost:3300/ pnpm build && pnpm lhci
kill %1
```

Expected: every spec passes in both modes; Lighthouse mobile scores meet the thresholds (Performance ≥ 0.9, SEO 1, Accessibility ≥ 0.95, Best Practices ≥ 0.95). Fix each failure at its cause (typical: an image without `sizes`, low contrast on a muted line, a heading order skip).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "test(e2e): Playwright hai chế độ feed và sắp phát hành, Lighthouse CI, GitHub Actions"
```

### Task 15: README, ops runbook, final verification

**Files:**
- Modify: `README.md`
- Create: `docs/van-hanh.md`

- [ ] **Step 1: README**

Write `README.md` in Vietnamese with these sections: what the site is (one paragraph from spec §1); commands (`pnpm dev`, `pnpm build`, `pnpm verify`, `pnpm e2e` with `E2E_MODE`, `pnpm lhci`, `pnpm sync-releases`, `pnpm capture-images`); folder structure (the File Structure block of this plan); how to edit copy (`messages/vi.json` then `messages/en.json`, `content/**/*.mdx`, `lib/site.ts`); env vars (the table of spec §11 with the OQ references); Vercel settings (framework Next.js, Node 24, function region `sin1`); the pre-launch state and how it ends (first release on the feed, then `pnpm sync-releases`); the design canvas link from `docs/thiet-ke/README.md`; the open questions OQ-L01 to OQ-L08 that block production; and a note that `pnpm dev` under Next 16.3.7 writes `AGENTS.md` and `CLAUDE.md` into the repository root on its first run (the team decides whether to commit them or to set `agentRules: false` in `next.config.ts`).

- [ ] **Step 2: Ops runbook**

Write `docs/van-hanh.md` in Vietnamese: (1) releasing a new app version: upload installers and the `latest*.yml` files to the distribution server (the `.yml` files last), the site refreshes within 10 minutes, then run `pnpm sync-releases` and commit so the snapshot keeps up; (2) going live on a domain: set `NEXT_PUBLIC_SITE_URL` in Vercel production, add the domain to the project, point DNS to Vercel, check HTTPS, `sitemap.xml`, `robots.txt`, submit the sitemap in Search Console; (3) refreshing product images after an app redesign: `node scripts/capture-product-images.mjs`, check sizes, commit; (4) what to change when OQ-L04 (contact), OQ-L05 (disk space), OQ-L07 (provider and training statement) and OQ-L08 (product name) are answered, with the exact files (`lib/site.ts`, `messages/*.json` keys `download.req.*.disk`, a new transparency section, `common.siteName`); (5) upgrading Next: bump `next`, `@next/mdx`, `@next/third-parties` and `eslint-config-next` together, run both e2e modes, and keep `experimental.optimisticRouting: false` until vercel/next.js#96893 is fixed; remove it only when the "no runaway prefetch" tests pass without it.

- [ ] **Step 3: Final run**

```bash
pnpm verify
export NEXT_PUBLIC_GA_MEASUREMENT_ID=G-TEST
node scripts/serve-fixtures.mjs &
DOWNLOAD_FEED_URL=http://localhost:3300/ pnpm build && E2E_MODE=feed DOWNLOAD_FEED_URL=http://localhost:3300/ pnpm e2e
DOWNLOAD_FEED_URL= pnpm build && E2E_MODE=prelaunch pnpm e2e
kill %1
git status
```

Expected: everything green; `git status` shows only the README and runbook changes.

- [ ] **Step 4: Commit**

```bash
git add README.md docs/van-hanh.md
git commit -m "docs: README vận hành, quy trình phát hành, lên domain và làm mới ảnh sản phẩm"
```

## Self-review notes

- **Spec coverage:** §1–§3 → Tasks 1, 2 (decisions encoded in Global Constraints); §4 → Tasks 2–4; §5 → Tasks 2, 3; §6.1 → Task 6; §6.2–6.4 → Task 7; §6.5 → Task 8; §6.6 → Task 9; §6.7 → Task 12; §6.8 → Task 10; §6.9 → Task 11; §6.10–6.11 → Task 12; §6.12 → Task 3; §7 → Tasks 2, 10, 14; §8.1–8.3 → Tasks 4, 5; §8.4 → Task 1; §9 → Tasks 3, 13; §10 → Tasks 2, 4, 14; §11 → Tasks 2, 13, 15; §12 → Tasks 2, 10, 13; §13 → Tasks 2–14; §14 → Tasks 14, 15; §15 → Tasks 1, 3; §16 open questions → Global Constraints, Task 15 runbook.
- **Type consistency:** `ReleaseAsset`, `Platform`, `ReleaseInfo` come unchanged from DOCOPS and are consumed by Tasks 6, 10, 13; `resolveReleases`, `downloadState`, `hasAssetFor` (Task 2) are consumed by Tasks 6 and 10; `PageKey` and `absoluteUrl` (Tasks 2, 3) by every page; `LevelKey` and `LEVELS` (Task 7) only inside `components/level`; `contactSalesHref` (Task 9) only by the pricing page; `CONSENT_KEY = 'eduflow.consent'` (Task 2) matches the privacy MDX (Task 12) and `consent.spec.ts` (Task 14).
- **Message keys:** every `t(…)` call in this plan reads a key present in the companion file; the level namespaces share one shape (tested in Task 3); DocOps pages reused as-is (install, contact, privacy, error, not-found) read keys that the companion file provides with the same names.
