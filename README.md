# Landing page EduFlow

Trang web marketing hai ngôn ngữ (tiếng Việt mặc định, tiếng Anh dưới `/en`) cho **EduFlow**, app desktop macOS và Windows gộp ba cấp nghiệp vụ giáo dục: Phổ thông (đề kiểm tra, giáo án, slide), Học phần đại học (CLO, kế hoạch tuần, giáo án buổi, slide, đề cương, đánh giá) và Chương trình đào tạo (bản sao số, rà soát ba tầng, kịch bản nếu), với Trợ lý AI luôn có mặt ở Trang chủ và bên phải mọi màn làm việc của app. Trong một lần ghé, khách cần hiểu EduFlow làm gì cho đúng vai của mình (giáo viên phổ thông, giảng viên, Phòng Đảm bảo chất lượng), thấy trợ lý AI làm việc thế nào và vì sao an toàn (máy đề xuất, người duyệt và ký), hiểu cách tính phí theo mức dùng AI, tải đúng bộ cài, rồi liên hệ Agentra để nhận báo giá hoặc key cho trường. Site có 12 trang × 2 ngôn ngữ, sinh tĩnh lúc build và chạy trên Vercel; trang Tải về đọc feed phát hành của app (ISR 10 phút) và hiện trạng thái "sắp phát hành" khi chưa có bản nào; không có form, không có Route Handler, không thanh toán trực tuyến (dùng thử và xin key nằm trong app).

- Spec thiết kế: `docs/superpowers/specs/2026-09-30-eduflow-landing-page-design.md`
- Kế hoạch triển khai: `docs/superpowers/plans/2026-09-30-eduflow-landing-page.md`
- Vận hành (phát hành bản app mới, lên domain, làm mới ảnh sản phẩm, nâng cấp Next, danh sách kiểm trước production, lần chạy CI đầu tiên): `docs/van-hanh.md`
- Canvas thiết kế: xem mục "Canvas thiết kế" bên dưới

## Lệnh

Cần Node ≥ 22.18 (Vercel và CI dùng Node 24) và pnpm 9.15.0.

```bash
pnpm install
cp .env.example .env.local              # không bắt buộc: để trống thì site chạy ở http://localhost:3000, trạng thái sắp phát hành
pnpm exec playwright install chromium   # một lần, cho e2e và pnpm capture-images
pnpm dev                                # đọc lưu ý về AGENTS.md và CLAUDE.md bên dưới trước lần chạy đầu
```

| Lệnh | Việc làm |
|---|---|
| `pnpm dev` | Máy dev tại http://localhost:3000. |
| `pnpm build` | Dựng bản production. Lúc dựng, các trang đọc feed từ `DOWNLOAD_FEED_URL` nếu biến này có giá trị. |
| `pnpm start -p 3200` | Chạy bản đã dựng. Cổng 3200 là cổng của e2e và Lighthouse. |
| `pnpm verify` | `next typegen` và `tsc --noEmit`, rồi `eslint .`, rồi `vitest run`. Phải xanh trước mỗi commit. Không gồm e2e và Lighthouse. |
| `pnpm e2e` | Playwright trên bản đã dựng, ba chế độ chọn bằng `E2E_MODE` (mục sau). |
| `pnpm lhci` | Lighthouse CI mobile cho 5 URL: `/`, `/pho-thong`, `/cach-tinh-phi`, `/tai-ve`, `/en`. |
| `pnpm sync-releases` | Ghi `content/releases.json` từ feed hoặc từ thư mục release. |
| `pnpm capture-images` | Chụp lại ảnh sản phẩm từ canvas của app vào `public/images/product/`. |

```bash
pnpm sync-releases                                                     # đọc DOWNLOAD_FEED_URL
pnpm sync-releases --from <URL feed>
pnpm sync-releases --from <thư mục release> --base <URL gốc của feed>  # đọc từ thư mục thì cần --base
pnpm capture-images [<thư mục artboard>] [--os macOS|Windows]          # mặc định ../eduflow-application/docs/thiet-ke/canvas/project
```

`sync-releases` chỉ ghi khi đọc được ít nhất một tệp feed hợp lệ; tệp có mà không phải feed (trang lỗi HTML, rỗng, thiếu `files`) làm lệnh dừng và không ghi gì. Chi tiết `sync-releases`: `docs/van-hanh.md`, mục 1. Chi tiết `capture-images`: mục 3.

### Lưu ý: `pnpm dev` ghi `AGENTS.md` và `CLAUDE.md` vào thư mục gốc

Với Next 16.3.7, lần chạy `pnpm dev` đầu tiên, nếu Next nhận ra một công cụ lập trình AI đang chạy và thư mục gốc chưa có khối quy tắc do Next quản lý, Next tự ghi `AGENTS.md` và `CLAUDE.md` vào thư mục gốc repo (trỏ tới tài liệu khớp phiên bản ở `node_modules/next/dist/docs/`) rồi in dòng `Generated AGENTS.md and CLAUDE.md for AI agents`. Hai tệp này không nằm trong `.gitignore` nên sẽ hiện ở `git status`.

Đội quyết định một trong hai cách: commit hai tệp làm quy tắc chung của repo, hoặc tắt hẳn bằng cách đặt `agentRules: false` trong `next.config.ts` (khoá cấp cao nhất của `NextConfig`, không nằm trong `experimental`). Chưa quyết thì đừng `git add -A` ngay sau khi chạy `pnpm dev`.

### Kiểm thử e2e ba chế độ

`pnpm e2e` chạy Playwright trên bản đã dựng và tự bật `pnpm start -p 3200`. `E2E_MODE` chọn chế độ: `feed`, `oneos` hoặc `prelaunch`. Không đặt thì là `feed`; giá trị lạ làm lệnh báo lỗi `E2E_MODE không hợp lệ`.

| Chế độ | Nguồn bản phát hành lúc dựng | Spec riêng |
|---|---|---|
| `feed` | Feed giả `node scripts/serve-fixtures.mjs` ở cổng 3300, có `latest.yml` và `latest-mac.yml` | `tests/e2e/download.spec.ts` |
| `oneos` | Feed giả ở cổng 3301 trả 404 cho `latest-mac.yml` (`FIXTURE_PORT=3301 FIXTURE_MISSING=latest-mac.yml`), tức chỉ có Windows | `tests/e2e/oneos.spec.ts` |
| `prelaunch` | Không có feed (`DOWNLOAD_FEED_URL` rỗng) và snapshot rỗng | `tests/e2e/prelaunch.spec.ts` |

`pages.spec.ts` và `consent.spec.ts` (dự án `desktop`, 1280 px) cùng `mobile.spec.ts` (dự án `mobile`, 390 px) chạy ở cả ba chế độ.

Bốn điều kiện, thiếu một là test đỏ hoặc chạy nhầm bản dựng:

1. **Dựng lại sau mỗi lần đổi chế độ.** Feed được đọc lúc dựng, nên feed giả phải chạy **trước** `pnpm build`.
2. **`NEXT_PUBLIC_GA_MEASUREMENT_ID=G-TEST` lúc dựng.** `consent.spec.ts` kiểm GA4 chỉ nạp sau khi đồng ý; thiếu ID giả thì GA không bao giờ nạp và test đỏ.
3. **Cổng 3200 phải trống trước mỗi chế độ.** Ở máy cục bộ Playwright dùng lại máy chủ đang chạy trên cổng đó, nên một `pnpm start` còn sót (hoặc chạy tay) làm test chạy trên bản dựng của chế độ khác mà không báo gì. Kiểm bằng `lsof -nP -iTCP:3200 -sTCP:LISTEN`; có thì dừng đúng tiến trình đó theo PID.
4. **Snapshot rỗng cho `oneos` và `prelaunch` khi `content/releases.json` đã chứa bản thật.** `oneos` sẽ lấy macOS từ snapshot, còn `prelaunch` không còn là sắp phát hành. Chế độ `feed` không cần vì feed thắng snapshot. CI tự ghi snapshot rỗng; ở máy thì làm tay, lệnh ở khối thứ hai dưới đây.

```bash
export NEXT_PUBLIC_GA_MEASUREMENT_ID=G-TEST
lsof -nP -iTCP:3200 -sTCP:LISTEN     # không in gì là cổng trống; có thì kill <PID> đúng tiến trình đó

# Chế độ feed
node scripts/serve-fixtures.mjs & FEED_PID=$!                     # feed giả ở cổng 3300, chạy trước khi dựng
DOWNLOAD_FEED_URL=http://localhost:3300/ pnpm build
E2E_MODE=feed DOWNLOAD_FEED_URL=http://localhost:3300/ pnpm e2e

# Chế độ một hệ điều hành (cổng 3200 phải trống lại, xem điều kiện 3)
FIXTURE_PORT=3301 FIXTURE_MISSING=latest-mac.yml node scripts/serve-fixtures.mjs & ONEOS_PID=$!
DOWNLOAD_FEED_URL=http://localhost:3301/ pnpm build
E2E_MODE=oneos DOWNLOAD_FEED_URL=http://localhost:3301/ pnpm e2e

# Chế độ sắp phát hành (cổng 3200 phải trống lại)
DOWNLOAD_FEED_URL= pnpm build
E2E_MODE=prelaunch pnpm e2e

kill $FEED_PID $ONEOS_PID            # dừng feed giả theo PID, không dùng pkill
```

Đừng `export DOWNLOAD_FEED_URL`: bản `pnpm start` do Playwright bật cũng đọc biến này lúc chạy, nên mỗi lệnh chỉ đặt nó cho riêng lệnh đó như trên.

Khi `content/releases.json` đã chứa bản thật, bao hai chế độ `oneos` và `prelaunch` bằng đoạn sau (ghi snapshot rỗng trước lúc dựng, khôi phục sau khi chạy xong):

```bash
SNAPSHOT_BACKUP=$(mktemp)
cp content/releases.json "$SNAPSHOT_BACKUP"
echo '{ "baseUrl": null, "windows": null, "mac": null }' > content/releases.json
#   ... dựng và chạy e2e chế độ oneos, rồi prelaunch như trên ...
cp "$SNAPSHOT_BACKUP" content/releases.json && rm "$SNAPSHOT_BACKUP"
git status --short content/releases.json   # không in gì nghĩa là đã khôi phục đúng bản đã commit
```

### Lighthouse

Lighthouse CI mobile đo 5 URL ở cổng 3200. Để canonical trùng địa chỉ đang đo, dựng lại với `NEXT_PUBLIC_SITE_URL=http://localhost:3200` trước khi đo (CI cũng làm vậy). Feed giả cổng 3300 phải đang chạy lúc dựng, cổng 3200 phải trống (`lhci` tự bật `pnpm start -p 3200`).

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3200 DOWNLOAD_FEED_URL=http://localhost:3300/ pnpm build && pnpm lhci
```

Ngưỡng ở `lighthouserc.json`: Accessibility ≥ 0,95, Best Practices ≥ 0,95 và SEO = 1 là **lỗi** (lệnh thoát khác 0, CI đỏ); Performance ≥ 0,9 chỉ là **cảnh báo**. Lý do: `next start` phục vụ HTTP/1.1 với 6 kết nối, nên Lighthouse mô phỏng chậm hơn thực tế. Đo qua `next start`, điểm Performance mobile là 0,84 tới 0,91; ước lượng Lantern ngoại tuyến với HTTP/2 (Vercel phục vụ HTTP/2) cho 0,94 tới 0,98. Vì vậy mục tiêu của spec (Performance từ 90 trở lên) được đo trên bản preview hoặc production của Vercel trước khi lên chính thức: `docs/van-hanh.md`, mục 6.

## CI

`.github/workflows/ci.yml` chạy trên mỗi pull request và mỗi lần push `main`, một job tối đa 20 phút: `pnpm install --frozen-lockfile`, `pnpm verify`, cài Chromium, ghi snapshot rỗng vào `content/releases.json`, dựng và chạy e2e ba chế độ (hai feed giả chạy nền ở cổng 3300 và 3301), dựng lại với `NEXT_PUBLIC_SITE_URL=http://localhost:3200`, rồi `pnpm lhci`.

- Báo cáo không đăng công khai. `lighthouserc.json` ghi báo cáo vào `.lighthouseci` trên đĩa (không dùng kho lưu trữ công cộng của Lighthouse). Bước cuối của workflow đăng artifact `ci-reports`, gồm thư mục `.lighthouseci` và `test-results` (vết Playwright của test hỏng), kể cả khi CI đỏ. Tải ở trang của lần chạy trên GitHub, mục Artifacts.
- CI chưa chạy lần nào lúc viết tài liệu này. Danh sách kiểm cho lần chạy đầu tiên: `docs/van-hanh.md`, mục 7.

## Cấu trúc thư mục

```
app/[locale]/layout.tsx                 # layout gốc: <html lang>, ba font, Header, Footer, ConsentBar, AnalyticsGate
app/[locale]/page.tsx                   # Trang chủ
app/[locale]/k12/page.tsx               # /pho-thong
app/[locale]/university/page.tsx        # /hoc-phan
app/[locale]/program/page.tsx           # /chuong-trinh
app/[locale]/assistant/page.tsx         # /tro-ly-ai
app/[locale]/pricing/page.tsx           # /cach-tinh-phi
app/[locale]/ai-transparency/page.tsx   # /minh-bach-ai
app/[locale]/download/page.tsx          # /tai-ve
app/[locale]/install/[os]/page.tsx      # /huong-dan-cai-dat/[os], os là macos hoặc windows
app/[locale]/contact/page.tsx           # /lien-he
app/[locale]/privacy/page.tsx           # /chinh-sach-bao-mat
app/[locale]/[...rest]/page.tsx         # đường dẫn lạ → 404 theo ngôn ngữ; cùng not-found.tsx, error.tsx
app/[locale]/opengraph-image.tsx        # ảnh OG theo ngôn ngữ; download/opengraph-image.tsx cho trang Tải về
app/sitemap.ts  robots.ts  manifest.ts  icon.svg  icon.png  apple-icon.png  globals.css
proxy.ts                                # next-intl (Next 16 gọi là proxy, thay cho middleware)
i18n/{routing,navigation,request}.ts    # locale, slug dịch (pathnames)
global.d.ts  mdx-components.tsx  types/mdx.d.ts
messages/{vi,en}.json                   # chuỗi giao diện; hai tệp phải cùng tập khoá
content/releases.json                   # snapshot feed phát hành
content/install/{index.ts,vi/*.mdx,en/*.mdx}   # hướng dẫn cài macOS và Windows
content/privacy/{index.ts,vi.mdx,en.mdx}       # chính sách bảo mật
lib/site.ts                             # thông tin công ty, siteUrl(), feedUrl()
lib/env.ts                              # chặn build production thiếu domain thật
lib/releases/{types,parse,feed,snapshot,state,index}.ts   # đọc feed, snapshot, trạng thái sắp phát hành
lib/seo/{urls,metadata,jsonld,og}       # canonical, hreflang, JSON-LD, ảnh OG
lib/{analytics,consent,useConsent,contact,format,platform,usePlatform,cn}.ts
components/ui/        # Button, Callout, Card, Container, Section, Icon, Logo, WindowFrame, CtaBand
components/site/      # Header, NavLinks, MobileNav, Footer, LocaleSwitcher, SkipLink, ConsentBar, AnalyticsGate, CopyButton, TrackedAnchor
components/seo/       # JsonLd
components/home/      # Hero, HeroCta, LevelCards, AssistantShowcase, PipelineStrip, TrustGrid, CostTeaser, DownloadBlock, FaqSection, Faq, FinalCta, SectionHead
components/level/     # LevelPage và cấu hình ba cấp
components/download/  # PlatformCard, PlatformGrid, DownloadLink, ChecksumField, SystemRequirements, PrelaunchNotice
components/guide/     # Step, Toc, OsTabs, CodeBlock
scripts/sync-releases.mjs  capture-product-images.mjs  serve-fixtures.mjs
public/images/product/*.webp            # ảnh sản phẩm chụp từ canvas app
assets/fonts/                           # Be Vietnam Pro cho ảnh OG
docs/superpowers/{specs,plans}/         # spec và kế hoạch triển khai
docs/thiet-ke/                          # nguồn canvas thiết kế landing page
docs/van-hanh.md                        # sổ tay vận hành
tests/unit/**  tests/e2e/**  tests/fixtures/{latest.yml,latest-mac.yml}
vitest.config.mts  playwright.config.ts  lighthouserc.json  .github/workflows/ci.yml  .env.example
```

## Sửa nội dung

| Muốn đổi | Sửa ở | Lưu ý |
|---|---|---|
| Chữ trên giao diện | `messages/vi.json` trước (bản gốc), rồi `messages/en.json` | Hai tệp phải cùng tập khoá. Mô tả meta (`*.description`) dài 140 tới 160 ký tự. Tiêu đề meta (`*.meta.title`) không lặp "EduFlow" vì template đã thêm. Bản tiếng Anh không được lẫn chữ Việt. |
| Hướng dẫn cài đặt | `content/install/vi/*.mdx` rồi `content/install/en/*.mdx` | `meta.toc` là mục lục, `meta.updated` là ngày cập nhật. Thêm hoặc xoá tệp MDX thì sửa `MDX_TOTAL` và `MDX_ENGLISH` ở `tests/unit/content.test.ts`. |
| Chính sách bảo mật | `content/privacy/vi.mdx` rồi `content/privacy/en.mdx` | Sửa cả `meta.updated`. PO và pháp chế rà soát trước khi công bố. |
| Tên công ty, email, điện thoại, Zalo, địa chỉ, URL công ty | `lib/site.ts` | Điện thoại để trống thì thẻ Điện thoại và Zalo ẩn. Vài chỗ chép tay, xem `docs/van-hanh.md`, mục 4. |
| Năm ở dòng bản quyền của footer | `components/site/Footer.tsx` (`year`) | Đang ghi cứng 2026, đổi tay mỗi năm. |
| Slug trang | `i18n/routing.ts` (`pathnames`) | Cập nhật `tests/unit/i18n.test.ts` và danh sách URL ở `tests/e2e/pages.spec.ts`. |
| Ảnh sản phẩm | `pnpm capture-images` | `docs/van-hanh.md`, mục 3. |

Luật nội dung (spec mục 15): không hứa kết quả kiểm định hay xếp loại, cấp Chương trình là công cụ làm việc nội bộ chứ không phải báo cáo tự đánh giá; không nói AI thay giáo viên, luôn nói máy đề xuất, người duyệt và ký; chỉ dùng con số có trong đặc tả app; trang Cách tính phí không ghi giá; chưa nêu tên nhà cung cấp mô hình và chưa cam kết huấn luyện trên dữ liệu của trường (chờ OQ-L07); không dùng ký tự gạch ngang dài U+2014 ở bất cứ tệp nào; văn bản tiếng Việt gọi người đọc là "thầy cô". `tests/unit/content.test.ts` và test "không có giá" ở e2e kiểm một phần các luật này; riêng tên nhà cung cấp và cam kết huấn luyện chưa có test chặn, nên rà tay khi sửa chữ.

## Biến môi trường

Đặt ở Vercel (Settings, Environment Variables) cho Production và Preview. Mẫu ở `.env.example`.

| Biến | Bắt buộc | Ý nghĩa | Câu hỏi mở |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Có, ở production | Domain chính thức: `metadataBase`, canonical, hreflang, sitemap, robots, JSON-LD. Phải là URL `http://` hay `https://` đầy đủ, ví dụ `https://tên-miền`. Khoảng trắng hai đầu và dấu `/` ở cuối được bỏ khi đọc. Để trống ở máy dev thì là `http://localhost:3000`. **Build production (`VERCEL_ENV=production`) dừng** nếu giá trị trống, không phải URL `http(s)://` đầy đủ, hoặc trỏ về `localhost`, `127.0.0.1`, `[::1]`, `0.0.0.0` hay `*.localhost`. Build preview không bị chặn. | OQ-L01 |
| `DOWNLOAD_FEED_URL` | Có, từ khi có bản phát hành đầu tiên | Feed kênh ổn định mà electron-updater của app đọc: thư mục chứa `latest.yml` và `latest-mac.yml`; code tự thêm `/` ở cuối. Để trống thì dùng snapshot; snapshot rỗng thì là trạng thái sắp phát hành. | OQ-L02 |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Không | Mã GA4 dạng `G-XXXX`. Thiếu thì không có GA4. GA4 chỉ nạp sau khi khách bấm "Đồng ý" ở thanh cookie. | OQ-L03 |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Không | Mã xác minh Google Search Console (chỉ giá trị `content` của thẻ meta). | |
| `NEXT_PUBLIC_CONSENT_BANNER` | Không | `off` tắt thanh cookie (GA4 nạp ngay). Mọi giá trị khác, kể cả không đặt, là bật. Ở production giữ bật: chính sách bảo mật nói GA4 chỉ nạp sau "Đồng ý". | OQ-L03 |

Các biến `NEXT_PUBLIC_*` được nhúng lúc dựng, và biến đặt trên Vercel chỉ áp cho bản deploy tạo sau đó: đổi giá trị xong phải deploy lại. Vercel tự đặt `VERCEL_ENV` và `NEXT_PUBLIC_VERCEL_ENV`; chỉ khi có biến thứ hai site mới nhúng script Vercel Analytics và Speed Insights (ở máy dev và CI không nhúng, để khỏi 404), nên giữ bật "Automatically expose System Environment Variables" của project.

## Cài đặt trên Vercel

1. Import repo vào Vercel. Framework: Next.js. Node.js Version: 24.x (Settings, General). Lệnh dựng mặc định `next build`; pnpm được nhận từ `pnpm-lock.yaml`.
2. Settings, Functions, Function Region: Singapore (`sin1`), để ISR tái tạo trang gần người dùng.
3. Đặt các biến môi trường ở trên cho Production và Preview. Production bắt buộc có `NEXT_PUBLIC_SITE_URL`.
4. Push `main` thì ra production, mỗi pull request có một URL preview. Bật Web Analytics và Speed Insights trong dashboard của project.
5. Gắn domain, phát hành bản app và danh sách kiểm trước production: `docs/van-hanh.md`.

## Trạng thái sắp phát hành và cách kết thúc

Cho tới khi app có bản phát hành đầu tiên, `content/releases.json` là `{ "baseUrl": null, "windows": null, "mac": null }` và `DOWNLOAD_FEED_URL` để trống hoặc trỏ tới feed chưa có `latest*.yml`. Không có bản nào ở cả feed lẫn snapshot thì site ở trạng thái sắp phát hành, không lỗi build:

- Trang Tải về hiện thông báo "EduFlow sắp phát hành" kèm nút "Liên hệ để dùng sớm" tới `/lien-he`, không có link tải nào.
- Hero trang chủ có nút "Liên hệ để dùng sớm" tới `/lien-he`, khối tải ở trang chủ hiện cùng thông báo sắp phát hành; nút "Tải EduFlow" ở header vẫn tới trang Tải về, nơi có thông báo ấy.

Trạng thái này kết thúc như sau:

1. Upload bản phát hành đầu tiên lên máy chủ phân phối, **hai tệp `latest.yml` và `latest-mac.yml` sau cùng**.
2. Đặt `DOWNLOAD_FEED_URL` (OQ-L02) ở Vercel cho Production và Preview, rồi deploy lại.
3. Trong tối đa 10 phút, trang Tải về và trang chủ chuyển sang trạng thái có bản phát hành.
4. Chạy `pnpm sync-releases` rồi commit `content/releases.json`, để snapshot dự phòng có bản đầu tiên.

Từ lúc snapshot chứa bản thật, chạy e2e `oneos` và `prelaunch` ở máy cần snapshot rỗng (xem "Kiểm thử e2e ba chế độ"). Site ra mắt cùng mốc GA của app (OQ-001 của app); trước GA, site có thể chạy ở trạng thái sắp phát hành. Quy trình phát hành các bản sau: `docs/van-hanh.md`, mục 1.

## Canvas thiết kế

Canvas Claude Design "EduFlow Landing" (8 artboard cho 7 bảng thiết kế của spec mục 8.4): https://claude.ai/artifact/WFiyfNT13vwaDbHVTAtaPJ

Đây là artifact riêng tư của tài khoản claude.ai đã phát hành. Muốn PO hay người khác xem, chủ canvas mở menu Share của trang. Nguồn artboard, cách kiểm, cách sửa và phát hành lại: `docs/thiet-ke/README.md`. Chữ trên canvas lấy nguyên văn từ `messages/vi.json` (riêng `HomeEN` lấy từ `messages/en.json`); đổi chữ trên canvas thì phải chép vào cả hai tệp messages.

## Câu hỏi mở cần trả lời trước khi lên production

Nguồn: spec mục 16. Cột "Hiện tại" là cách site xử lý khi chưa có câu trả lời; riêng OQ-L01 làm build production dừng. Cách sửa khi có câu trả lời: `docs/van-hanh.md`, mục 2 và mục 4.

| Mã | Người trả lời | Câu hỏi | Hiện tại |
|---|---|---|---|
| OQ-L01 | PO | Domain chính thức của landing page là gì? | Build production dừng nếu `NEXT_PUBLIC_SITE_URL` trống hoặc trỏ về localhost. |
| OQ-L02 | Tech lead | URL feed kênh ổn định mà electron-updater của app đọc là gì? | `DOWNLOAD_FEED_URL` trống, snapshot rỗng: trạng thái sắp phát hành. |
| OQ-L03 | PO | Có dùng GA4 không; nếu có, measurement ID nào? | Không có GA4; chỉ Vercel Analytics và Speed Insights. |
| OQ-L04 | PO | Email, điện thoại hoặc Zalo, địa chỉ nào ghi trên trang Liên hệ? | Tạm dùng Agentra JSC, Đà Nẵng, info@agentra.io.vn. Điện thoại và Zalo trống nên thẻ ẩn. |
| OQ-L05 | Tech lead | Bộ cài và bản đã cài chiếm bao nhiêu dung lượng khi mang bộ biên dịch TeX? | Dòng yêu cầu hệ thống ghi dung lượng trống sẽ công bố cùng bản phát hành đầu tiên. |
| OQ-L06 | PO | Có công bố ngân sách và số ngày dùng thử trên web không (app còn chờ OQ-002)? | Không công bố con số nào. Con số có kèm đơn vị tiền sẽ làm test "không có giá" ở `tests/e2e/pages.spec.ts` đỏ, nên sửa test cùng lúc. |
| OQ-L07 | PO, pháp chế | Có ghi tên nhà cung cấp mô hình và cam kết không huấn luyện trên dữ liệu của trường không? | Không nêu tên nhà cung cấp, không có cam kết huấn luyện. |
| OQ-L08 | PO | Tên hiển thị là "EduFlow" hay "Agentra EduFlow"? | "EduFlow". |

Giả định đang dùng (spec mục 16): AS-L01 Vercel Analytics, Speed Insights và GA4 sau đồng ý cookie như DocOps; AS-L02 yêu cầu hệ thống theo NFR của app (macOS 12 trở lên, Windows 10 22H2 trở lên), bản thân NFR đó còn là giả định AS-012 của app; AS-L03 người tải mới nhận bản của kênh ổn định bất kể tỷ lệ rollout; AS-L04 bản tiếng Anh do đội dev dịch, PO rà thuật ngữ.
