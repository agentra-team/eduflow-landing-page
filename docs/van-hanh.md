# Vận hành landing page EduFlow

Sổ tay cho đội dev và đội vận hành. Lệnh chạy từ gốc repo `eduflow-landing-page`. Cách chạy ở máy, cấu trúc thư mục, biến môi trường và e2e ba chế độ: `README.md`. Quyết định thiết kế: `docs/superpowers/specs/2026-09-30-eduflow-landing-page-design.md`. Số "Ruling" trong ngoặc là quyết định khi thực thi kế hoạch; lý do đầy đủ ở phụ lục "Các quyết định khi thực thi (Ruling)" cuối `docs/superpowers/plans/2026-09-30-eduflow-landing-page.md`.

| Mục | Dùng khi |
|---|---|
| 1 | App có bản phát hành mới |
| 2 | Gắn site vào domain chính thức |
| 3 | App đổi giao diện, cần ảnh sản phẩm mới |
| 4 | Một câu hỏi mở được trả lời (OQ-L04, OQ-L05, OQ-L07, OQ-L08) |
| 5 | Nâng cấp Next.js |
| 6 | Trước khi lên production |
| 7 | Lần chạy CI đầu tiên |
| 8 | Phát hành landing lên production theo phiên bản, quay lại phiên bản trước |

## 1. Phát hành bản app mới

Trang Tải về, khối tải ở trang chủ, hai trang hướng dẫn cài, JSON-LD và sitemap cùng đọc `latest.yml` (Windows) và `latest-mac.yml` (macOS) của kênh ổn định tại `DOWNLOAD_FEED_URL` (giá trị chờ OQ-L02). Mỗi tệp tải với giới hạn 5 giây và được cache 10 phút (ISR `revalidate: 600`), nên phát hành bản mới không cần dựng lại site: production tự lấy feed mới khi trang hết hạn (ISR). Chỉ khi đổi biến môi trường thì mới phải dựng lại, bằng một lần phát hành (mục 8).

1. Build và ký bộ cài theo quy trình phát hành của repo `eduflow-application`.
2. Upload lên máy chủ phân phối: bộ cài (`.exe`, `.dmg`, `.zip`, `.blockmap`) trước, **hai tệp `latest.yml` và `latest-mac.yml` sau cùng**. Đúng thứ tự này thì feed không bao giờ trỏ tới tệp chưa có. Không sửa tay hai tệp `.yml`: để electron-builder ghi.
3. Trong tối đa 10 phút, trang Tải về và khối tải ở trang chủ hiện tên tệp, phiên bản, dung lượng và ngày phát hành mới. SHA-512 chỉ hiện ở trang Tải về (dòng gập "Kiểm tra toàn vẹn tệp (SHA-512)"), khối tải ở trang chủ không có. Site hiện đúng bản ghi trong hai tệp `.yml` của kênh ổn định, bất kể tỷ lệ rollout của app: rollout chỉ áp cho bản tự cập nhật trên máy đã cài, còn người tải mới luôn nhận bản ghi trong tệp mô tả (AS-L03).
4. Chạy `pnpm sync-releases`, rồi `pnpm verify`, rồi commit `content/releases.json` để snapshot (bản dự phòng khi feed lỗi) theo kịp. `pnpm verify` phải chạy **sau** khi snapshot đã ghi, vì CI chạy đúng lệnh đó trên commit đã có snapshot thật:

```bash
# Một trong hai cách đọc nguồn:
DOWNLOAD_FEED_URL=<URL feed> pnpm sync-releases     # hoặc: pnpm sync-releases --from <URL feed>
pnpm sync-releases --from <thư mục release> --base <URL gốc của feed>   # đọc từ thư mục thì cần --base
pnpm verify                                         # sau khi snapshot đã ghi, trước khi commit
git diff content/releases.json                      # kiểm phiên bản, tên tệp, releaseDate
git add content/releases.json
git commit -m "chore(releases): cập nhật snapshot lên bản <phiên bản>"
```

Lệnh in một dòng dạng `content/releases.json ← <nguồn> (Windows 1.0.0, macOS 1.0.0)` khi ghi xong. Các lỗi thường gặp của lệnh:

| Lệnh báo | Nghĩa và việc cần làm |
|---|---|
| `Thiếu nguồn` | Chưa đặt `DOWNLOAD_FEED_URL` và chưa truyền `--from`. |
| `Không thấy latest.yml lẫn latest-mac.yml` | Cả hai tệp đều vắng (HTTP 404 hay không có trong thư mục). Không ghi gì. |
| `<tên tệp> không phải feed của electron-updater` | Tệp có nhưng không hợp lệ (mục sau). Không ghi gì. |
| `<tên tệp> không đọc được` | YAML hỏng, kể cả trang lỗi HTML mà `yaml` không đọc nổi (mục sau). Không ghi gì. |
| `HTTP 403` hay mã khác 404 | Chỉ 404 được coi là "chưa phát hành". Một số kho lưu trữ trả 403 cho tệp không tồn tại; lệnh dừng (an toàn). Đổi máy chủ để trả 404, hoặc đọc từ thư mục bằng `--from <thư mục release> --base <URL>`. |

### Tên tệp và phát hành lệch hệ điều hành

- Giữ mẫu tên của electron-builder, ví dụ `EduFlow Setup <v>.exe` (Windows), `EduFlow-<v>-arm64.dmg` (macOS Apple Silicon), `EduFlow-<v>.dmg` (macOS Intel). Site gán `.exe` cho Windows, `-arm64.dmg` cho Apple Silicon, `.dmg` không chứa `arm64` cho Intel, bỏ `.zip` và `.blockmap`, và mã hoá tên tệp trong URL. Tên thật theo cấu hình electron-builder của app lúc phát hành.
- Được phép phát hành một hệ điều hành trước: chỉ có một trong hai tệp `.yml` (tệp kia trả 404). Site hiện thẻ của hệ điều hành đã phát hành, còn khách ở hệ điều hành kia thấy "Bản cho macOS sắp có" hoặc "Bản cho Windows sắp có". `pnpm sync-releases` ghi `null` cho phía vắng.

### Tệp `.yml` hỏng (Ruling 54)

Một tệp `.yml` không phải feed hợp lệ thì **không bao giờ được coi là một bản phát hành**. Không hợp lệ gồm: trang lỗi HTML do CDN trả mã 200, tệp rỗng, YAML hỏng, thiếu chuỗi `version`, `files` rỗng, hoặc có mục `files` thiếu `url`, `sha512` (chuỗi) hay `size` (số).

- Trên site: phần của hệ điều hành đó rơi về snapshot (còn bản cũ trong snapshot thì hiện bản cũ, snapshot rỗng thì hiện "sắp có") và Vercel ghi một dòng `release_feed_unavailable <URL> <đuôi>`. Không lỗi build. Đuôi tuỳ nội dung tệp:
  - `not a feed`: YAML đọc được nhưng không phải feed (tệp rỗng, thiếu `files`, trang HTML đơn giản như một dòng, hay nhiều dòng không có `: `).
  - Thông báo lỗi YAML, ví dụ `Implicit keys need to be on a single line at line 1, column 1:` (nhiều dòng, trích dòng đầu tệp): `yaml` ném lỗi, thường vì trang lỗi HTML có `: ` ở một dòng sau dòng đầu (CSS, hay tiêu đề kiểu `Error: 404`).
- Với `pnpm sync-releases`: lệnh dừng với mã 1 và **không ghi gì** vào `content/releases.json`.

**Sau khi sửa tệp hỏng:** bản preview do Vercel dựng dùng cache dữ liệu build của Next (`.next/cache/fetch-cache`, `revalidate` 600 giây, Vercel khôi phục giữa các lần dựng), nên một bản preview dựng ngay sau khi sửa vẫn có thể lấy phản hồi cũ của feed trong khoảng 10 phút. Bản production do workflow Release dựng trên GitHub Actions từ thư mục sạch, không có cache đó. Production đang chạy tự lấy feed mới khi trang hết hạn sau 10 phút (ISR), không cần làm gì; muốn dựng lại ngay thì chạy tay workflow Release với tag đang chạy (mục 8.4, cách 2).

### Khi trang chưa đổi sau 10 phút

1. Xem tệp thật: `curl -fsS <URL feed>latest.yml | head -20` (`<URL feed>` là giá trị của `DOWNLOAD_FEED_URL`, kết thúc bằng `/`). Phải có `version` và `files`, mỗi mục có `url`, `sha512`, `size`; `releaseDate` là chuỗi ISO 8601.
2. Vercel, project, Logs: tìm `release_feed_unavailable`. Đuôi dòng là mã HTTP (404 cho hệ điều hành chưa phát hành là bình thường), `not a feed` (tệp có nhưng không hợp lệ), thông báo lỗi YAML (ví dụ `Implicit keys need to be on a single line`, thường từ một trang lỗi HTML) hoặc thông báo lỗi mạng và hết giờ.
3. Tên tệp trong feed phải khớp tệp thật trên máy chủ phân phối. Thiếu tệp thì khách gặp 404 ở máy chủ đó; site không biết điều này, và trang Tải về chỉ có dòng "Không tải được? Gửi email".

## 2. Lên domain

Domain chính thức là `eduflow.agentra.io.vn`; `<tên-miền>` dưới đây là tên đó. Lần đầu, bước 2 tới 4 nằm trong mục 8.1 (thiết lập một lần), bước 5 tới 8 làm sau khi phát hành `v1.0.0` (mục 8.2). Production chỉ lên bằng workflow Release, nên "dựng lại production" ở mục này nghĩa là chạy tay workflow Release với tag đang chạy (mục 8.4, cách 2).

1. Kiểm bản preview trước: `/` và `/en`, trang Tải về tải được tệp thật, `/sitemap.xml`, `/robots.txt`. Build preview không bị chặn khi thiếu `NEXT_PUBLIC_SITE_URL`, nhưng khi đó canonical và sitemap của preview trỏ về `http://localhost:3000`; vì vậy nên đặt biến này cho cả Preview (bước 2).
2. Vercel, Settings, Environment Variables: `NEXT_PUBLIC_SITE_URL=https://<tên-miền>` cho **Production** (bắt buộc) và cho **Preview** (nên đặt, để canonical của preview trỏ về domain chính thức).
   - **Chốt chặn (Ruling 49).** Build production (`VERCEL_ENV=production`) dừng nếu giá trị trống, không phải URL `http://` hay `https://` đầy đủ, hoặc trỏ về `localhost`, `127.0.0.1`, `[::1]`, `0.0.0.0` hay `*.localhost`. Thông báo lỗi nêu OQ-L01. Dán nhầm `http://localhost:3000` hay chỉ `eduflow.vn` (thiếu `https://`) đều bị chặn. Chốt chặn dựa vào `VERCEL_ENV`: bản production do workflow Release tự đặt biến này; bản preview do Vercel dựng cần công tắc "Enable access to System Environment Variables" bật (mục 6).
   - Khoảng trắng hai đầu và dấu `/` ở cuối được bỏ khi đọc (`site.siteUrl()`).
   - `NEXT_PUBLIC_*` được nhúng lúc dựng: đặt xong phải dựng lại (preview: lần push sau; production: mục 8.4, cách 2).
3. Settings, Domains: thêm `<tên-miền>` vào project. Vercel hiện bản ghi DNS cần đặt.
4. Đặt bản ghi DNS đúng như Vercel hiện (CNAME cho tên miền con, A cho tên miền gốc), rồi chờ Vercel cấp chứng chỉ HTTPS. Hiện `eduflow.agentra.io.vn` có bản ghi A trỏ VPS `42.115.41.70` (VPS chung của app EduFlow và DocOps, không phục vụ tên này): xoá bản ghi đó rồi mới đặt bản ghi của Vercel; kiểm bằng `dig +short eduflow.agentra.io.vn`, không còn `42.115.41.70`.
5. Kiểm sau khi trỏ:

```bash
curl -sI https://<tên-miền>/ | head -1          # trả 200
curl -sI http://<tên-miền>/ | head -1           # chuyển sang https (Vercel trả 308)
curl -sI https://<tên-miền>/ | grep -i -E 'strict-transport-security|x-frame-options|x-content-type-options|referrer-policy|permissions-policy'   # đủ 5 header bảo mật
curl -s https://<tên-miền>/robots.txt           # có dòng Sitemap: https://<tên-miền>/sitemap.xml
curl -s https://<tên-miền>/sitemap.xml | grep -o '<loc>[^<]*</loc>' | wc -l            # 24 (12 trang × 2 ngôn ngữ)
curl -s https://<tên-miền>/sitemap.xml | grep -o '<loc>[^<]*</loc>' | grep -v '<loc>https://<tên-miền>'   # không in gì: mọi URL đúng tên miền
curl -s https://<tên-miền>/pho-thong | grep -o '<link rel="canonical"[^>]*>'           # canonical đúng tên miền
```

6. Google Search Console: thêm property cho `<tên-miền>` và xác minh. Xác minh bằng thẻ meta thì đặt giá trị `content` vào `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` rồi dựng lại production (mục 8.4, cách 2); bằng bản ghi DNS TXT thì không cần biến. Sau đó gửi `https://<tên-miền>/sitemap.xml`.
7. Vercel dashboard: bật Web Analytics và Speed Insights (script chỉ được nhúng khi chạy trên Vercel, nhờ `NEXT_PUBLIC_VERCEL_ENV`).
8. Chạy danh sách kiểm ở mục 6.

## 3. Làm mới ảnh sản phẩm sau khi app đổi giao diện

13 ảnh WebP ở `public/images/product/` được chụp từ artboard canvas của app (`../eduflow-application/docs/thiet-ke/canvas/project/*.dc.html`). Khi app đổi giao diện, chụp lại:

```bash
# repo eduflow-application nằm cạnh repo này; cần mạng (Google Fonts) và Chromium của Playwright
pnpm exec playwright install chromium                                  # một lần
node scripts/capture-product-images.mjs                                # hoặc: pnpm capture-images
node scripts/capture-product-images.mjs <thư mục artboard> --os Windows   # nguồn khác; --os mặc định macOS
```

Mỗi ảnh in một dòng `public/images/product/<tên>.webp  <rộng>×<cao>  <KB>`. Script dừng với thông báo rõ nếu artboard còn lỗ `{{...}}` chưa điền hoặc font web chưa nạp (cần mạng). Sau khi chụp:

1. **Kiểm dung lượng:** mỗi ảnh tối đa 200 KB (spec mục 8.3; `tests/unit/images.test.ts` kiểm và còn đòi tối thiểu 10 KB). Ảnh quá 200 KB thì giảm `quality` của ảnh đó trong mảng `SHOTS` ở đầu script rồi chụp lại.
2. **Kiểm kích thước:** hiện là 1600×1000, riêng `assistant-home` 2000×1250. Artboard không còn 1440×900 thì kích thước đổi, và phải sửa chỗ khai báo: mặc định `width = 1600`, `height = 1000` của `components/ui/WindowFrame.tsx`, hàm `shot()` ở `components/level/levels.ts`, và `width={2000} height={1250}` của `assistant-home` ở `components/home/Hero.tsx` và `app/[locale]/assistant/page.tsx`.
3. Artboard của app đổi tên hoặc bỏ: sửa `SHOTS` trong script và `PRODUCT_IMAGES` trong `tests/unit/images.test.ts`.
4. Xem bằng mắt: `pnpm build && pnpm start -p 3200`, mở `/`, `/tro-ly-ai`, `/cach-tinh-phi`, `/pho-thong`, `/hoc-phan`, `/chuong-trinh`. Câu "Số liệu trên ảnh là dữ liệu mẫu minh hoạ" dưới ảnh vẫn phải đúng; chữ thay thế (`alt`) của ảnh ở `messages/*.json` phải khớp nội dung ảnh mới.
5. `pnpm verify`, rồi commit `public/images/product/*.webp`, ví dụ `chore(images): làm mới ảnh sản phẩm theo canvas app`.

## 4. Khi các câu hỏi mở được trả lời

OQ-L01, OQ-L02 và OQ-L03 chỉ cần đặt biến môi trường (mục 2, mục 1 và README). OQ-L06 không đổi gì cho tới khi PO quyết; nếu công bố con số có kèm đơn vị tiền thì test "không có giá" ở `tests/e2e/pages.spec.ts` (bộ bắt dạng giá ở `tests/e2e/prices.ts`) sẽ đỏ, nên sửa test cùng lúc. Bốn câu còn lại đổi như sau.

### OQ-L04: email, điện thoại hoặc Zalo, địa chỉ

Sửa `lib/site.ts`:

- `email`: một nơi này đủ cho thẻ Email ở trang Liên hệ, footer, nút "Liên hệ báo giá" (`lib/contact.ts`), dòng "Không tải được? Gửi email" ở trang Tải về, khối "Báo lỗi và góp ý" và JSON-LD `Organization` (`email`, `contactPoint`).
- `phone`: điền thì thẻ Điện thoại hiện (link `tel:`); để trống thì thẻ ẩn. `zalo` là URL đầy đủ (ví dụ `https://zalo.me/<số>`); link Zalo nằm **trong** thẻ Điện thoại nên chỉ hiện khi `phone` cũng có. Khi điền `zalo`, mục 4 "Liên kết ngoài" của chính sách bảo mật (cả hai ngôn ngữ) phải thêm Zalo.
- `address`: địa chỉ đường phố; trang Liên hệ ghép `address, city, country`, để trống thì chỉ có thành phố và quốc gia. `city` và `country` có hai ngôn ngữ. `mapsUrl` (đang tìm "Agentra JSC Đà Nẵng" trên Google Maps) đổi theo địa chỉ thật.
- Email dài hơn có thể làm footer tràn ngang khoảng 1024 tới 1100 px: chạy e2e (test `no horizontal overflow at 1024 px`); đỏ thì thêm `[overflow-wrap:anywhere]` cho link email ở `components/site/Footer.tsx`.

Chép tay ngoài `lib/site.ts`, phải sửa theo:

- `content/privacy/vi.mdx` và `content/privacy/en.mdx`: mục 7 "Liên hệ" ghi tên công ty, thành phố và email; mục 4 nhắc `agentra.io.vn`; sửa cả `meta.updated`.
- `messages/vi.json` và `messages/en.json`: `footer.copyright` (tên công ty, thành phố), `footer.tagline` và `download.signed.body` (tên công ty).
- Test ghim giá trị cũ: `tests/unit/contact.test.ts`, `tests/unit/jsonld.test.ts`, `tests/unit/guides.test.ts`.
- Tên công ty đổi thì kiểm thêm điều kiện chữ ký số ở mục 6.

### OQ-L05: dung lượng trống khi mang bộ biên dịch TeX

Sửa bốn chuỗi: khoá `download.req.windows.disk` và `download.req.macos.disk` ở `messages/vi.json` và `messages/en.json` (hiện ghi "Dung lượng trống: công bố cùng bản phát hành đầu tiên" và "Free disk space: announced with the first release"). Chỉ dùng con số do Tech lead trả lời. Trang Tải về dựng dòng này ở `components/download/SystemRequirements.tsx`; không còn chỗ nào khác nói về dung lượng ổ đĩa. Chạy `pnpm verify` rồi commit.

### OQ-L07: nhà cung cấp mô hình và cam kết huấn luyện

Hiện site không nêu tên nhà cung cấp và không cam kết gì về huấn luyện. Chỉ thêm khi PO và pháp chế đã duyệt từng chữ (nếu câu trả lời là không ghi, giữ nguyên).

1. Thêm một mục mới vào trang Minh bạch AI: khoá `transparency.p9` với `title` và `body` trong `messages/vi.json` và `messages/en.json`; thêm `'p9'` vào mảng `ITEMS` và đổi hằng `UPDATED` ở `app/[locale]/ai-transparency/page.tsx`. Số thứ tự hiển thị tính theo vị trí trong `ITEMS`, nên muốn mục nằm ngay sau `p2` ("Tầng mô hình") chỉ cần chèn `'p9'` ở đó, không phải đánh lại tên khoá.
2. Rà các chỗ nói về mô hình cho khớp: `transparency.p2` và `transparency.p5`, `home.trust.t1.desc`, và mục 5 của chính sách bảo mật (`content/privacy/vi.mdx`, `en.mdx`, cùng `meta.updated`). Mô tả trang đổi thì giữ `transparency.meta.description` dài 140 tới 160 ký tự.
3. `tests/unit/content.test.ts` chưa có luật nào về tên nhà cung cấp hay cam kết huấn luyện. Sau khi có câu chữ đã duyệt, thêm một test ghim đúng câu chữ ấy ở cả hai ngôn ngữ.

### OQ-L08: tên hiển thị

Sửa `common.siteName` ở `messages/vi.json` và `messages/en.json` (tiêu đề trang `%s · <tên>`, `applicationName`, breadcrumb). Đổi thêm:

- `lib/site.ts`: `name` và `shortName` (Open Graph `siteName`, JSON-LD `SoftwareApplication.name`).
- `app/manifest.ts`: `name` và `short_name`.
- `components/ui/Logo.tsx`: chữ logo.
- `lib/seo/og.tsx`: chữ trên ảnh OG; `alt` ở `app/[locale]/opengraph-image.tsx` và `app/[locale]/download/opengraph-image.tsx`.
- `lib/contact.ts`: tiêu đề thư báo giá.
- Chữ "EduFlow" trong lời văn của `messages/*.json` (gần 50 chỗ mỗi ngôn ngữ) và `content/**/*.mdx`: tìm bằng `grep -rn "EduFlow" app components lib messages content`.
- Test ghim tên: `tests/unit/seo.test.ts`, `tests/unit/jsonld.test.ts`, `tests/unit/contact.test.ts`, luật "tiêu đề trang không lặp tên" ở `tests/unit/content.test.ts`, và e2e tìm nút "Tải EduFlow" (`tests/e2e/mobile.spec.ts`, `tests/e2e/prelaunch.spec.ts`).

Tên tệp bộ cài (`EduFlow Setup <v>.exe`, `EduFlow-<v>.dmg`) do app đặt ở cấu hình electron-builder: chỉ đổi trong fixture (`tests/fixtures/`) và hướng dẫn cài khi app đổi. Canvas thiết kế ở `docs/thiet-ke/` còn tên cũ, cập nhật theo `docs/thiet-ke/README.md` nếu PO cần.

## 5. Nâng cấp Next.js

Hiện ghim `16.3.7` (nâng từ 16.3.5 vì bản sửa lỗi bảo mật của `next/og` ở 16.3.6). Bốn gói phải nâng cùng một phiên bản, ghim đúng số (không dấu `^`):

```bash
pnpm add -E next@<phiên bản> @next/mdx@<phiên bản> @next/third-parties@<phiên bản>
pnpm add -E -D eslint-config-next@<phiên bản>
pnpm verify
```

Sau đó dựng và chạy **cả ba chế độ e2e** (`feed`, `oneos`, `prelaunch`), lệnh đầy đủ ở `README.md`, mục "Kiểm thử e2e ba chế độ". Ba điều dễ quên:

- Cổng 3200 phải trống trước mỗi chế độ (ở máy cục bộ Playwright dùng lại máy chủ đang chạy). Kiểm: `lsof -nP -iTCP:3200 -sTCP:LISTEN`; có thì dừng đúng tiến trình đó theo PID.
- `export NEXT_PUBLIC_GA_MEASUREMENT_ID=G-TEST` trước khi dựng, nếu không `consent.spec.ts` đỏ.
- Sau khi `content/releases.json` có bản thật, `oneos` và `prelaunch` phải dựng từ snapshot rỗng: ghi snapshot rỗng trước lúc dựng, khôi phục sau khi chạy xong, bằng đúng đoạn lệnh ở `README.md`, mục "Kiểm thử e2e ba chế độ" (đoạn bắt đầu "Khi `content/releases.json` đã chứa bản thật"). Đó là bản duy nhất của đoạn lệnh; kiểm lại bằng `git status --short content/releases.json` sau cùng.

**Cờ `experimental.optimisticRouting: false` ở `next.config.ts` (Ruling 27).** Next 16.3 đoán sai tuyến của các slug tiếng Anh do proxy viết lại (ví dụ `/en/k12` ứng với `/pho-thong`) và gửi lại yêu cầu `_rsc` không dứt; trang 404 tiếng Anh gửi hàng trăm yêu cầu mỗi giây (vercel/next.js#96893). `next dev` không tái hiện được, nên chỉ test trên bản dựng mới thấy. Giữ cờ cho tới khi lỗi này được sửa ở Next. Gỡ cờ chỉ khi ba test "no runaway prefetch" ở `tests/e2e/pages.spec.ts` (`/`, `/en`, `/en/no-such-page`, mỗi trang dưới 60 yêu cầu `_rsc` trong 2 giây) qua mà **không có** cờ: thử gỡ ở một nhánh riêng, dựng, chạy cả ba chế độ. Qua thì gỡ cờ cùng dòng chú thích; đỏ thì giữ cờ.

## 6. Danh sách kiểm trước khi lên production

Cấu hình:

- [ ] `NEXT_PUBLIC_SITE_URL` là URL `https://` đầy đủ của domain chính thức (OQ-L01), đặt ở **Production** (bắt buộc) và ở **Preview** (nên đặt, để canonical của preview trỏ về domain chính thức). Build production dừng nếu trống, thiếu `http(s)://`, hoặc trỏ về `localhost`, `127.0.0.1`, `[::1]`, `0.0.0.0`, `*.localhost` (Ruling 49). Sau khi deploy, canonical của trang chủ và `/pho-thong` phải mang domain đó.
- [ ] `DOWNLOAD_FEED_URL` (OQ-L02) đã đặt nếu đã có bản phát hành, và `content/releases.json` đã có snapshot thật (mục 1). Cố ý ra mắt ở trạng thái sắp phát hành thì để trống cả hai.
- [ ] `NEXT_PUBLIC_CONSENT_BANNER` **giữ bật** ở production (không đặt, hoặc `on`). Chính sách bảo mật nói Google Analytics chỉ nạp sau khi khách bấm "Đồng ý"; tắt thanh cookie (`off`) thì GA4 nạp ngay, nên phải viết lại chính sách (`content/privacy/*.mdx`, mục 2 và 3) và được PO cùng pháp chế duyệt **trước** khi tắt.
- [ ] `NEXT_PUBLIC_GA_MEASUREMENT_ID` (OQ-L03) đã đặt, hoặc cố ý để trống (không có GA4).
- [ ] Web Analytics và Speed Insights đã bật ở dashboard Vercel.
- [ ] Gói Vercel là Pro hoặc Enterprise: sự kiện tuỳ chỉnh (`track()`) chỉ chạy ở hai gói này. Không có thì sáu sự kiện của spec (`download_click`, `cta_click`, `contact_click`, `locale_switch`, `faq_open`, `consent_change`) không đi đâu cả, nên xác nhận gói trước khi ra mắt.
- [ ] Settings, Functions, **Function Regions** là Singapore (`sin1`).
- [ ] Node.js: ô Node.js Version (Settings, Build and Deployment) là 24.x. Bản production dựng trên GitHub Actions bằng Node 24 (`actions/setup-node` trong `release.yml`); bản preview dựng trên Vercel theo ô này và `engines.node` trong `package.json` (hiện `>=22.18`, **thắng** ô cài đặt). Muốn chắc, đặt tạm Build Command thành `node -v && pnpm build`, đọc `node -v` trong log của một bản preview (phải 24.x), rồi bỏ.
- [ ] Settings, Environment Variables: **"Enable access to System Environment Variables"** đang bật (trước đây ghi là "Automatically expose System Environment Variables"). Bản preview cần công tắc này để có `VERCEL_ENV=preview` và `NEXT_PUBLIC_VERCEL_ENV` (script Vercel Analytics, Speed Insights); tắt công tắc thì mọi bản dựng trên Vercel đỏ ở chốt chặn. Bản production không phụ thuộc công tắc lúc dựng: workflow Release tự đặt các biến đó. Không đặt `RELEASE_TAG`, `VERCEL_ENV`, `NEXT_PUBLIC_VERCEL_ENV`, `VERCEL_GIT_COMMIT_SHA` trong Environment Variables, và không đánh dấu Sensitive cho `DOWNLOAD_FEED_URL` hay biến `NEXT_PUBLIC_*`.
- [ ] Phát hành (mục 8.1): nhánh production của project là `production-from-tags-only`; Deployment Protection là Standard Protection (domain production công khai); environment `production` trên GitHub có ba secret và chỉ nhận `main` cùng tag `v*`; ruleset cho tag `v*` chặn tạo (chỉ admin hoặc maintainer), cập nhật và xoá. `https://<tên-miền>/version.json` trả đúng phiên bản vừa phát hành, `"environment": "production"`.

Điều kiện mà chữ trên site đang dựa vào:

- [ ] **Chữ ký số.** Hướng dẫn cài Windows bảo khách kiểm dòng nhà phát hành ghi "Agentra JSC" (và dừng nếu khác), trang Tải về nói bản Windows "ký mã của Agentra JSC". Vậy tên (subject) trong chứng chỉ ký mã phải đúng là Agentra JSC (AD-17, OQ-003, OQ-L04). Chứng chỉ mang tên khác thì sửa chữ trước khi lên: `content/install/vi/windows.mdx` và `content/install/en/windows.mdx` (bước cài và bước kiểm nhà phát hành), `download.signed.body` ở `messages/*.json`, và `tests/unit/guides.test.ts` (đang đòi chuỗi "Agentra JSC").
- [ ] **Mốc hệ điều hành tối thiểu** (macOS 12, Windows 10 22H2) theo giả định AS-012 của app, còn chờ xác nhận. Ghi ở: `download.req.windows.os` và `download.req.macos.os`, `home.download.platforms.windows-x64.sub` (cả ba ở `messages/*.json`); `content/install/{vi,en}/macos.mdx` và `windows.mdx`; `operatingSystem` ở `lib/seo/jsonld.ts` (và `tests/unit/jsonld.test.ts`). AS-012 đổi thì sửa đủ các chỗ này.
- [ ] Thông tin công ty ở `lib/site.ts` đã được PO xác nhận (OQ-L04, mục 4).

Đo trên Vercel (Ruling 50):

- [ ] **Lighthouse mobile trên URL preview của Vercel, cho 8 URL: `/`, `/pho-thong`, `/cach-tinh-phi`, `/tai-ve`, `/en`, `/en/k12`, `/en/pricing`, `/en/download`. Trên preview đọc Performance, yêu cầu từ 90 trở lên** (mục tiêu của spec); đọc thêm Accessibility ≥ 95 và Best Practices ≥ 95 nếu muốn. **Không đọc SEO ở preview** (Ruling 55): Vercel gửi header `X-Robots-Tag: noindex` cho bản preview, và kiểm tra "Page isn't blocked from indexing" (`is-crawlable`) của Lighthouse đỏ vì header đó. SEO 100 chỉ đọc trên URL production (mục "Kiểm trên domain thật" bên dưới). CI chỉ *cảnh báo* Performance vì `next start` phục vụ HTTP/1.1 với 6 kết nối (đo ở đó 0,84 tới 0,99 qua các lần đo ở máy dev, lần gần nhất, ở 8 URL: 0,86 tới 0,99), còn ước lượng ngoại tuyến với HTTP/2 của Vercel cho 0,94 tới 0,98; con số thật chỉ có ở bước này. Cách đo: PageSpeed Insights (tab Mobile) hoặc Lighthouse trong Chrome DevTools (chế độ Mobile, hạng mục Performance); mỗi URL đo 3 lần, lấy lần giữa vì điểm dao động vài điểm. PageSpeed Insights chỉ đo được URL công khai; preview có Deployment Protection thì dùng DevTools khi đã đăng nhập Vercel.
- [ ] Trang nào dưới 90: phương án dự phòng là bớt trọng lượng font ở `app/[locale]/layout.tsx`: Fraunces chỉ còn `700`, và/hoặc gộp Be Vietnam Pro `600` vào `700` (đổi các class `font-semibold` thành `font-bold`). Việc này **đổi kiểu chữ so với canvas đã duyệt nên cần chủ thiết kế (PO) đồng ý trước**; đo lại sau khi đổi.

Kiểm trên domain thật:

- [ ] Các lệnh kiểm ở mục 2 (HTTPS, header bảo mật, `robots.txt`, `sitemap.xml` đủ 24 URL, canonical) đều đạt; Search Console đã xác minh và đã gửi sitemap.
- [ ] **Lighthouse mobile trên URL production, cho cùng 8 URL: SEO phải là 100** (Ruling 55: chỉ đọc được ở đây, vì preview gửi `noindex`). Đọc luôn Performance ≥ 90, Accessibility ≥ 95 và Best Practices ≥ 95 để xác nhận lần cuối. Cách đo như ở mục "Đo trên Vercel" ở trên; PageSpeed Insights dùng được vì URL production công khai.
- [ ] Duyệt tay cả hai ngôn ngữ: trang chủ, ba trang cấp, Trợ lý AI, Cách tính phí, Minh bạch AI, Liên hệ, hai trang cài đặt, Chính sách bảo mật. Trang Tải về đúng trạng thái (có bản phát hành, hoặc sắp phát hành); mỗi link tải mở được (HTTP 200).
- [ ] Chính sách bảo mật và trang Minh bạch AI đã được PO và pháp chế rà soát (spec mục 6.11).
- [ ] CI xanh trên `main` (mục 7).

## 7. Lần chạy CI đầu tiên

Lúc viết tài liệu này (01/10/2026), `.github/workflows/ci.yml` chưa chạy lần nào; xoá mục 7 này sau khi lần chạy CI đầu tiên xanh (cách xoá ở cuối mục). Ba chế độ e2e và `pnpm lhci` đã chạy ở máy dev, nhưng hai điều chỉ một lần chạy thật trên GitHub Actions (Ubuntu) mới chứng minh được: các bước chạy nền (`node scripts/serve-fixtures.mjs &`) còn sống ở các bước sau, và Lighthouse chạy được trên máy chủ đó. Sau lần chạy đầu của workflow `CI` (push `main` hoặc mở pull request), mở log của job `verify` và kiểm:

1. **Feed giả đã sẵn sàng.** Cổng kiểm là bước `curl --retry 10 --retry-connrefused ...` ngay sau mỗi bước khởi động feed giả (cổng 3300, rồi cổng 3301): bước đó xanh nghĩa là feed giả đã trả `latest.yml`. Dòng `fixture feed on http://localhost:3300/` (và `.../3301/`) chỉ là bằng chứng phụ: feed giả chạy nền nên dòng này có thể nằm ở log của một bước khác, hoặc không hiện. Bước `curl` xanh mà thiếu dòng này thì không phải lỗi.
2. **Chế độ feed không in dòng `release_feed_unavailable` nào**, ở cả bước `pnpm build` lẫn bước `pnpm e2e` (ở bước e2e, lỗi của máy chủ `pnpm start` hiện với tiền tố `[WebServer]`). Có dòng này nghĩa là build hay máy chủ không đọc được feed giả.
3. **Chế độ một hệ điều hành chỉ in đúng một loại dòng:** `release_feed_unavailable http://localhost:3301/latest-mac.yml 404`. Dòng nào nhắc `latest.yml` là sai.
4. **Bước `pnpm lhci` thoát với mã 0**, chỉ có cảnh báo (warning) `categories.performance warning for minScore assertion` ở một số URL (0,84 tới 0,99 qua các lần đo ở máy dev, lần gần nhất, ở 8 URL: 0,86 tới 0,99). Lỗi ở `accessibility`, `best-practices` hay `seo` làm bước đỏ, và phải sửa ở nguyên nhân chứ không hạ ngưỡng. Cảnh báo Performance là bình thường: lý do ở mục 6 (Ruling 50). Dòng `GitHub token not set` trong phần healthcheck của lhci cũng bình thường: workflow không dùng token GitHub cho lhci.
5. **Báo cáo.** CI không đăng báo cáo lên kho công cộng (Ruling 53): `lighthouserc.json` ghi vào `.lighthouseci` trên đĩa. Cuối trang của lần chạy, mục Artifacts có `ci-reports`, chứa `.lighthouseci` (báo cáo Lighthouse của 8 URL, kể cả lần chỉ cảnh báo) và `test-results` (vết Playwright khi có test hỏng). Bước đăng artifact chạy cả khi CI đỏ.

Có mục nào sai thì sửa `.github/workflows/ci.yml` hoặc `scripts/serve-fixtures.mjs` thay vì bỏ bước kiểm. Ghi kết quả lần chạy đầu vào pull request.

**Khi lần chạy CI đầu tiên xanh và cả năm mục trên đều đạt, xoá mục 7 này.** Xoá cùng lúc: hàng 7 của bảng đầu tài liệu; chữ "(mục 7)" ở ô "CI xanh trên `main`" của mục 6; và các chỗ nhắc mục này ở `README.md` (dòng "CI chưa chạy lần nào" cuối mục "CI", cụm "lần chạy CI đầu tiên" ở danh sách liên kết đầu trang). **Không đánh số lại mục 8**: mã và test dẫn tới "mục 8" theo số.

## 8. Phát hành landing lên production theo phiên bản

Production chỉ lên bằng workflow `Release` (`.github/workflows/release.yml`), khi đẩy tag `vX.Y.Z` khớp `version` trong `package.json`, như `release.yml` của DocOps application. Push `main` và mọi pull request chỉ ra bản preview. Bản đang chạy tự khai ở `https://eduflow.agentra.io.vn/version.json`:

```json
{"version":"1.0.0","commit":"<sha đủ 40 ký tự của commit được gắn tag>","environment":"production"}
```

Bản preview cũng có `/version.json` (`environment` là `preview`, `version` là số trong `package.json` lúc đó, `commit` là commit của bản preview). Tệp này không có trong sitemap và mang `X-Robots-Tag: noindex`.

Ba lớp giữ production đi đúng một đường:

1. **Nhánh production giả.** Vercel không cho tắt hẳn nhánh production; nhánh production của project là `production-from-tags-only`, một nhánh không ai đẩy, nên `main` và pull request đều thành preview. Không dùng `git.deploymentEnabled` của `vercel.json`: khoá đó tắt mọi deploy của nhánh, kể cả preview của `main`.
2. **Chốt chặn lúc dựng (`lib/env.ts`).** Bản dựng production cho Vercel (`VERCEL=1` và `VERCEL_ENV=production`) dừng nếu thiếu `RELEASE_TAG` dạng `vX.Y.Z`, mà chỉ workflow Release đặt biến này. Các đường production khác đều đỏ: lần dựng production đầu tiên Vercel luôn tự tạo cho project mới (kể cả khi import), nút Redeploy, "Promote to Production" của một bản preview (cả hai dựng lại trên Vercel), `vercel --prod` từ máy cá nhân. Không bao giờ đặt `RELEASE_TAG` trong Environment Variables của Vercel.
3. **Cổng của workflow.** Trước khi dựng: tag đúng dạng, commit của tag nằm trên `main`, `version` trong `package.json` của commit đó khớp tag, và CI (`ci.yml`) của đúng commit đó xanh (chờ nếu còn chạy, tối đa 45 phút).

Instant Rollback, `vercel rollback` và `vercel promote` một bản production cũ không dựng lại nên không qua chốt chặn 2: đó là các đường quay lại hợp lệ (mục 8.4).

### 8.1 Thiết lập một lần (bước tay của người có quyền)

Làm đúng thứ tự; mỗi bước có cách kiểm.

1. **Đẩy `main` lên GitHub.** Lúc viết, `origin/main` là `eff101f` (Initial commit); `main` ở máy đi trước và chứa toàn bộ landing cùng workflow này. `git push origin main`. CI chạy lần đầu: kiểm theo mục 7. Kiểm: trang Actions có lần chạy `CI` cho commit đầu của `main`.
2. **Tạo project Vercel trong team đang chứa landing DocOps** (không phải tài khoản cá nhân; tài khoản `lephus` đăng nhập CLI trên máy dev không thuộc team này). Dashboard Vercel, chọn đúng team ở bộ chọn góc trên trái, Add New, Project, Import `agentra-code/eduflow-landing-page` (cài GitHub app của Vercel cho repo nếu được hỏi). Framework Preset: Next.js; Root Directory: `./`; lệnh dựng và cài để mặc định. **Không thêm biến môi trường ở màn import.** Vercel luôn dựng bản đầu tiên của project mới thành production; bản này đỏ với thông báo `Bản production chỉ được dựng bởi workflow Release`: đúng như mong đợi, không sửa gì.
3. **Nhánh production giả.** Project, Settings, Environments, Production, Branch Tracking: nhập `production-from-tags-only`, Save. Không tạo nhánh này trên GitHub. Nếu dashboard không nhận tên nhánh chưa có: tạo nhánh ở commit `eff101f` (`git push origin eff101f:refs/heads/production-from-tags-only`; commit này chỉ có README nên không dựng được), rồi chặn cập nhật và xoá nhánh đó bằng ruleset (bước 9). Kiểm: lần push tiếp theo lên `main` tạo bản Preview (Deployments, cột Environment). Trước khi có bản production đầu tiên, Vercel có thể vẫn coi lần dựng kế tiếp là production; lần đó cũng đỏ ở chốt chặn, vô hại.
4. **Cài đặt project.**
   - Build and Deployment, Node.js Version: 24.x.
   - Functions, Function Regions: Singapore (`sin1`).
   - Environment Variables: các biến ở README, mục "Biến môi trường", cho **Production** và **Preview**; `NEXT_PUBLIC_SITE_URL=https://eduflow.agentra.io.vn` ở cả hai. **Không đánh dấu Sensitive** cho `DOWNLOAD_FEED_URL` hay bất kỳ biến `NEXT_PUBLIC_*` nào: biến Sensitive có thể về trống khi `vercel pull`, và bản dựng production sẽ mất feed và GA4 mà không báo lỗi. Nếu chính sách của team ép mọi biến thành Sensitive, xem lại trước khi phát hành. Không đặt `RELEASE_TAG`, `VERCEL_ENV`, `NEXT_PUBLIC_VERCEL_ENV`, `VERCEL_GIT_COMMIT_SHA`.
   - Environment Variables: giữ bật "Enable access to System Environment Variables". Tắt công tắc này thì `VERCEL_ENV` vắng mặt và chốt chặn của `lib/env.ts` làm đỏ mọi bản dựng trên Vercel.
   - Deployment Protection: Standard Protection (domain production công khai, các URL còn lại cần đăng nhập Vercel). Không chọn All Deployments: Google không vào được domain và job `verify` đỏ với HTTP 401.
   - Git: giữ bật Git Fork Protection (pull request từ fork chỉ dựng preview khi người trong team duyệt).
   - Analytics và Speed Insights: bật.
   - Chưa kiểm được: biến Sensitive có thật sự về trống khi `vercel pull` hay không. Cho tới khi kiểm, coi đó là rủi ro và làm theo dòng không đánh dấu Sensitive ở trên.
5. **Domain và DNS.** Settings, Domains, Add: `eduflow.agentra.io.vn`, gắn với Production. Ở nơi quản lý DNS của `agentra.io.vn`: xoá bản ghi A `eduflow` đang trỏ VPS `42.115.41.70`, đặt đúng bản ghi Vercel hiện. Chờ Vercel báo cấu hình hợp lệ và cấp chứng chỉ. Tới khi có bản production đầu tiên (mục 8.2), domain trả trang 404 của Vercel: bình thường. Kiểm: `dig +short eduflow.agentra.io.vn` không còn `42.115.41.70`; `curl -sI https://eduflow.agentra.io.vn/ | head -1` có phản hồi qua HTTPS (lúc này 404 là đúng).
6. **Token Vercel.** https://vercel.com/account/tokens (ở tài khoản cá nhân, không phải trang team): Name `github-release-eduflow-landing`; Scope: chọn team, rồi chọn project `eduflow-landing-page` (token chỉ dùng được cho project này); Expiration: 1 năm; Create; chép token ngay (chỉ hiện một lần). Đặt nhắc lịch gia hạn trước ngày hết hạn. Nếu workflow báo HTTP 403 ở `vercel pull`, `vercel deploy` hay `vercel promote` với token theo project, tạo lại token với Scope là team (All Projects).
7. **Hai ID.** Team ID: team Settings, General. Project ID: project Settings, General.
8. **Environment `production` trên GitHub.** Repo Settings, Environments, New environment, tên `production`:
   - Deployment branches and tags: Selected branches and tags; Add deployment branch or tag rule: Ref type Branch, `main`; thêm rule thứ hai: Ref type Tag, `v*`.
   - Environment secrets: `VERCEL_TOKEN` (bước 6), `VERCEL_ORG_ID` (Team ID), `VERCEL_PROJECT_ID`.
   - Tuỳ chọn: Required reviewers, nếu muốn một người bấm duyệt trước mỗi lần lên production.
9. **Ruleset cho tag (bắt buộc).** Repo Settings, Rules, Rulesets, New tag ruleset: Enforcement status Active; Target tags: Include by pattern `v*`; bật **Restrict creations**, Restrict updates và Restrict deletions; thêm Repository admin (hoặc Maintain) vào Bypass list, để chỉ người phát hành gắn được tag. Restrict creations là ranh giới bảo mật: đẩy một tag chạy `release.yml` của chính commit được gắn tag, và workflow đó nhận token Vercel, nên ai tạo được tag `v*` thì lấy được token. Restrict updates và deletions giữ cho tag đã phát hành không dời được sang commit khác, nên chạy lại workflow với một tag cũ luôn dựng đúng mã cũ. Nếu bước 3 phải tạo nhánh giả: thêm branch ruleset cho `production-from-tags-only` với Restrict updates và Restrict deletions.
10. **Tuỳ chọn: bảo vệ `main`.** Branch ruleset cho `main`: Require a pull request before merging, Require status checks to pass với check `verify` (job của CI). Đội đang đẩy thẳng lên `main` thì có thể bỏ qua: workflow Release vẫn đòi CI xanh của commit được gắn tag. Bật ruleset này thì mục 8.2 làm theo cách có pull request.
11. **Fork.** Settings, Actions, General, mục phê duyệt workflow của pull request từ fork: giữ "Require approval for first-time contributors" hoặc chặt hơn. Workflow Release không có trigger cho pull request nên secret không bao giờ tới mã của fork.

### 8.2 Phát hành một phiên bản

Số phiên bản theo SemVer: sửa lỗi, sửa chữ, cập nhật snapshot: tăng PATCH (`1.0.1`); thêm trang, khối hay tính năng: MINOR (`1.1.0`); đổi lớn như giao diện mới hay bản đồ URL mới: MAJOR (`2.0.0`), PO chọn.

Đẩy thẳng lên `main` (khi không có ruleset bắt buộc pull request):

```bash
git fetch origin && git switch main && git pull --ff-only
npm pkg set version=1.0.1                    # chỉ đổi "version" trong package.json, không cài gì
pnpm verify
git add package.json
git commit -m "chore(phat-hanh): EduFlow landing 1.0.1"
git tag -a v1.0.1 -m "EduFlow landing 1.0.1"
git push origin main v1.0.1                  # commit và tag cùng lúc; workflow chờ CI của commit này
```

Khi ruleset bắt buộc pull request trên `main`: làm commit phát hành ở một nhánh, mở pull request, hoà vào `main`, và **chỉ đẩy tag sau khi commit đã nằm trên `main`**. Gắn tag lên `origin/main` sau `git fetch origin`, không bao giờ lên `main` cũ ở máy:

```bash
git fetch origin && git switch -c chore/phat-hanh-1.0.1 origin/main
npm pkg set version=1.0.1 && pnpm verify
git add package.json && git commit -m "chore(phat-hanh): EduFlow landing 1.0.1"
git push origin chore/phat-hanh-1.0.1        # mở pull request, chờ CI xanh, hoà vào main
git fetch origin
git log -1 origin/main                       # phải là commit phát hành (nếu squash: commit gộp)
git tag -a v1.0.1 -m "EduFlow landing 1.0.1" origin/main
git push origin v1.0.1
```

Theo dõi ở GitHub, Actions, `Release`: `gate` (kiểm tag, rồi chờ CI của commit, thường 15 tới 25 phút), `deploy`, `verify`, `github-release`. Xanh cả bốn: production là bản mới và trang Releases có `v1.0.1` với ghi chú tự sinh.

Khi workflow đỏ:

| Job, thông báo | Nghĩa và việc cần làm |
|---|---|
| `gate`: `Tag "..." không có dạng vX.Y.Z` | Tag sai dạng (thiếu `v`, có hậu tố). Gắn tag đúng dạng. Tag sai chỉ xoá được bằng quyền vượt ruleset: `git push origin :refs/tags/<tag>`. |
| `gate`: `không nằm trên main` | Tag gắn lên commit chưa vào `main`. Hoà vào `main`, gắn tag mới lên commit của `main`. |
| `gate`: `không khớp version` | Commit được gắn tag chưa nâng `version`. Làm commit phát hành như trên với số mới, gắn tag mới. |
| `gate`: `CI của ... không xanh` | CI của commit đó đỏ hoặc bị huỷ. Lỗi thoáng qua: chạy lại CI của commit đó (Re-run jobs), rồi Re-run workflow Release. Lỗi thật: sửa trên `main`, phát hành số mới. |
| `gate`: `không có lần chạy CI nào do push lên main` | CI chỉ chạy cho commit đầu của mỗi lần push, nên commit ở giữa không có CI. Gắn tag lên commit đầu của `main`. |
| `gate`: `Hết 45 phút` | CI quá chậm hoặc kẹt hàng chờ. Khi CI xanh, Re-run workflow Release. |
| `deploy`: `Bản production chỉ được dựng bởi workflow Release` | `RELEASE_TAG` không tới bước dựng: `release.yml` bị sửa sai. |
| `deploy`: `NEXT_PUBLIC_SITE_URL phải ...` | Biến Production trên Vercel trống hoặc sai (mục 2). Sửa rồi Re-run. |
| `deploy`: HTTP 401 hay 403 ở `vercel pull`, `deploy`, `promote` | Token hết hạn hoặc thiếu quyền (8.1 bước 6), hoặc secret của environment `production` sai. |
| `deploy`: không lấy được URL `*.vercel.app` từ kết quả `vercel deploy` | Team dùng hậu tố URL preview tuỳ chỉnh (custom preview URL suffix) nên URL không có dạng `.vercel.app`; workflow đỏ rõ ràng chứ không promote nhầm. Sửa biểu thức nhận URL trong `release.yml` cho hậu tố đó, rồi Re-run. |
| `verify`: `chưa đúng sau 20 lần thử` | Domain chưa trỏ Vercel hay chưa có chứng chỉ (8.1 bước 5), hoặc promote chưa xong. Xem log `deploy`, rồi Re-run riêng job `verify` (Re-run failed jobs). |

### 8.3 Kiểm sau mỗi lần phát hành

```bash
curl -s https://eduflow.agentra.io.vn/version.json                              # đúng version, commit, "production"
git rev-parse 'v1.0.1^{commit}'                                                  # phải bằng "commit" ở trên
curl -sI https://eduflow.agentra.io.vn/version.json | grep -i x-robots-tag     # x-robots-tag: noindex
curl -sI https://eduflow.agentra.io.vn/ | grep -i x-robots-tag                 # không in gì: trang chủ cho index
```

Lần phát hành đầu (`1.0.0`): làm thêm mục 2, bước 5 tới 8, và danh sách mục 6.

Bản preview của `main`: Vercel, Deployments, lọc Environment là Preview và nhánh `main`; URL theo nhánh có dạng `<project>-git-main-<team>.vercel.app` và luôn trỏ bản mới nhất của `main`.

### 8.4 Quay lại phiên bản trước

Hai cách; cách 1 nhanh hơn và không dựng lại. Khi một lần chạy Release đang chờ CI (hàng chờ concurrency giữ đường chạy tay), quay lại bằng cách 1.

**Cách 1: Instant Rollback (gán domain về một bản production cũ, không dựng lại).**

- Dashboard: project, ô Production Deployment, Instant Rollback, chọn bản cần về, Confirm. Gói Hobby chỉ về được bản ngay trước; Pro về được mọi bản từng là production.
- CLI (đăng nhập một tài khoản thuộc team; `<team-slug>` ở URL của team trên dashboard):

```bash
vercel list eduflow-landing-page --prod -m releaseTag=v1.0.0 --scope <team-slug>   # URL bản production của v1.0.0
vercel rollback <URL ở trên> --scope <team-slug>
curl -s https://eduflow.agentra.io.vn/version.json                                  # "version": "1.0.0"
```

Sau rollback, Vercel tắt tự gán domain production cho bản mới. Workflow Release không bị ảnh hưởng vì nó luôn dựng ở trạng thái chờ rồi `vercel promote` (lệnh này cũng bật lại tự gán).

**Cách 2: dựng lại một tag.** GitHub, Actions, Release, Run workflow, Use workflow from: `main`, ô `tag`: ví dụ `v1.0.0`, Run. Workflow kiểm lại tag và CI, dựng mã của tag đó với biến môi trường hiện tại trên Vercel, promote và kiểm `/version.json`. Không tạo GitHub Release mới. Dùng khi bản cũ không còn trên Vercel, khi cần dựng lại với biến môi trường đã đổi, hoặc để dựng lại chính phiên bản đang chạy (ví dụ sau khi đổi một biến `NEXT_PUBLIC_*`).

Sau khi quay lại, sửa tiến bằng một số PATCH mới (mục 8.2); không xoá hay dời tag đã phát hành.

### 8.5 Việc định kỳ

- Token Vercel: tạo token mới trước ngày hết hạn (8.1 bước 6), cập nhật secret `VERCEL_TOKEN` của environment `production`, rồi xoá token cũ.
- Vercel CLI ghim ở `VERCEL_CLI` trong `release.yml`, các action ghim theo sha kèm chú thích phiên bản: khi nâng, chọn bản đã ra ít nhất hai tuần, sửa số, sha và chú thích cùng lúc, chạy `pnpm verify` (test `release-workflow`), rồi phát hành một bản PATCH để chạy thử.
- `npx vercel@<bản ghim>` ghim phiên bản của chính CLI nhưng các phụ thuộc gián tiếp của nó được giải ở lúc chạy. Đây là rủi ro đã chấp nhận (quyết định Q8 của kế hoạch phát hành).
- Các action trong `ci.yml` chưa ghim theo sha (`release.yml` đã ghim): ghim là việc làm sau.
