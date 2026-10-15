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

## 1. Phát hành bản app mới

Trang Tải về, khối tải ở trang chủ, hai trang hướng dẫn cài, JSON-LD và sitemap cùng đọc `latest.yml` (Windows) và `latest-mac.yml` (macOS) của kênh ổn định tại `DOWNLOAD_FEED_URL` (giá trị chờ OQ-L02). Mỗi tệp tải với giới hạn 5 giây và được cache 10 phút (ISR `revalidate: 600`), nên phát hành bản mới không cần deploy lại site.

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

**Sau khi sửa tệp hỏng:** cache dữ liệu build của Next (`.next/cache/fetch-cache`, `revalidate` 600 giây, Vercel khôi phục giữa các lần deploy) có thể trả cho một lần build phản hồi cũ của feed trong khoảng 10 phút sau đó, nên một deploy ngay sau khi sửa vẫn có thể dựng từ tệp hỏng. Chờ 10 phút rồi mới deploy, hoặc redeploy không dùng build cache: Vercel, Deployments, menu của bản deploy mới nhất, Redeploy, bỏ chọn "Use existing Build Cache". Từ CLI thì `vercel deploy --prod --force` (lệnh này deploy từ thư mục cục bộ, nên chạy trên nhánh `main` đã cập nhật). Trang đã sinh tự hết hạn sau 10 phút, không cần làm gì thêm.

### Khi trang chưa đổi sau 10 phút

1. Xem tệp thật: `curl -fsS <URL feed>latest.yml | head -20` (`<URL feed>` là giá trị của `DOWNLOAD_FEED_URL`, kết thúc bằng `/`). Phải có `version` và `files`, mỗi mục có `url`, `sha512`, `size`; `releaseDate` là chuỗi ISO 8601.
2. Vercel, project, Logs: tìm `release_feed_unavailable`. Đuôi dòng là mã HTTP (404 cho hệ điều hành chưa phát hành là bình thường), `not a feed` (tệp có nhưng không hợp lệ), thông báo lỗi YAML (ví dụ `Implicit keys need to be on a single line`, thường từ một trang lỗi HTML) hoặc thông báo lỗi mạng và hết giờ.
3. Tên tệp trong feed phải khớp tệp thật trên máy chủ phân phối. Thiếu tệp thì khách gặp 404 ở máy chủ đó; site không biết điều này, và trang Tải về chỉ có dòng "Không tải được? Gửi email".

## 2. Lên domain

Thay `<tên-miền>` bằng domain chính thức (OQ-L01).

1. Kiểm bản preview trước: `/` và `/en`, trang Tải về tải được tệp thật, `/sitemap.xml`, `/robots.txt`. Build preview không bị chặn khi thiếu `NEXT_PUBLIC_SITE_URL`, nhưng khi đó canonical và sitemap của preview trỏ về `http://localhost:3000`; vì vậy nên đặt biến này cho cả Preview (bước 2).
2. Vercel, Settings, Environment Variables: `NEXT_PUBLIC_SITE_URL=https://<tên-miền>` cho **Production** (bắt buộc) và cho **Preview** (nên đặt, để canonical của preview trỏ về domain chính thức).
   - **Chốt chặn (Ruling 49).** Build production (`VERCEL_ENV=production`) dừng nếu giá trị trống, không phải URL `http://` hay `https://` đầy đủ, hoặc trỏ về `localhost`, `127.0.0.1`, `[::1]`, `0.0.0.0` hay `*.localhost`. Thông báo lỗi nêu OQ-L01. Dán nhầm `http://localhost:3000` hay chỉ `eduflow.vn` (thiếu `https://`) đều bị chặn. Chốt chặn dựa vào `VERCEL_ENV`, nên cần công tắc "Enable access to System Environment Variables" của Vercel bật (mục 6).
   - Khoảng trắng hai đầu và dấu `/` ở cuối được bỏ khi đọc (`site.siteUrl()`).
   - `NEXT_PUBLIC_*` được nhúng lúc dựng: đặt xong phải deploy lại.
3. Settings, Domains: thêm `<tên-miền>` vào project. Vercel hiện bản ghi DNS cần đặt.
4. Đặt bản ghi DNS đúng như Vercel hiện (CNAME cho tên miền con, A cho tên miền gốc), rồi chờ Vercel cấp chứng chỉ HTTPS.
5. Kiểm sau khi trỏ:

```bash
curl -sI https://<tên-miền>/ | head -1          # trả 200
curl -sI http://<tên-miền>/ | head -1           # chuyển sang https (Vercel trả 308)
curl -sI https://<tên-miền>/ | grep -i -E 'strict-transport-security|x-frame-options|x-content-type-options|referrer-policy|permissions-policy'   # đủ 5 header bảo mật
curl -s https://<tên-miền>/robots.txt           # có dòng Sitemap: https://<tên-miền>/sitemap.xml
curl -s https://<tên-miền>/sitemap.xml | grep -o '<loc>[^<]*</loc>' | wc -l            # 24 (12 trang × 2 ngôn ngữ)
curl -s https://<tên-miền>/sitemap.xml | grep -o '<loc>[^<]*</loc>' | grep -v '<loc>https://<tên-miền>'   # không in gì: mọi URL đúng tên miền
curl -s https://<tên-miền>/ai-cho-giao-vien | grep -o '<link rel="canonical"[^>]*>'           # canonical đúng tên miền
```

6. Google Search Console: thêm property cho `<tên-miền>` và xác minh. Xác minh bằng thẻ meta thì đặt giá trị `content` vào `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` rồi deploy lại; bằng bản ghi DNS TXT thì không cần biến. Sau đó gửi `https://<tên-miền>/sitemap.xml`.
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
4. Xem bằng mắt: `pnpm build && pnpm start -p 3200`, mở `/`, `/tro-ly-ai`, `/cach-tinh-phi`, `/ai-cho-giao-vien`, `/ai-cho-giang-vien`, `/ra-soat-chuong-trinh-dao-tao`. Câu "Số liệu trên ảnh là dữ liệu mẫu minh hoạ" dưới ảnh vẫn phải đúng; chữ thay thế (`alt`) của ảnh ở `messages/*.json` phải khớp nội dung ảnh mới.
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

**Cờ `experimental.optimisticRouting: false` ở `next.config.ts` (Ruling 27).** Next 16.3 đoán sai tuyến của các slug tiếng Anh do proxy viết lại (ví dụ `/en/ai-for-teachers` ứng với `/ai-cho-giao-vien`) và gửi lại yêu cầu `_rsc` không dứt; trang 404 tiếng Anh gửi hàng trăm yêu cầu mỗi giây (vercel/next.js#96893). `next dev` không tái hiện được, nên chỉ test trên bản dựng mới thấy. Giữ cờ cho tới khi lỗi này được sửa ở Next. Gỡ cờ chỉ khi ba test "no runaway prefetch" ở `tests/e2e/pages.spec.ts` (`/`, `/en`, `/en/no-such-page`, mỗi trang dưới 60 yêu cầu `_rsc` trong 2 giây) qua mà **không có** cờ: thử gỡ ở một nhánh riêng, dựng, chạy cả ba chế độ. Qua thì gỡ cờ cùng dòng chú thích; đỏ thì giữ cờ.

## 6. Danh sách kiểm trước khi lên production

Cấu hình:

- [ ] `NEXT_PUBLIC_SITE_URL` là URL `https://` đầy đủ của domain chính thức (OQ-L01), đặt ở **Production** (bắt buộc) và ở **Preview** (nên đặt, để canonical của preview trỏ về domain chính thức). Build production dừng nếu trống, thiếu `http(s)://`, hoặc trỏ về `localhost`, `127.0.0.1`, `[::1]`, `0.0.0.0`, `*.localhost` (Ruling 49). Sau khi deploy, canonical của trang chủ và `/ai-cho-giao-vien` phải mang domain đó.
- [ ] `DOWNLOAD_FEED_URL` (OQ-L02) đã đặt nếu đã có bản phát hành, và `content/releases.json` đã có snapshot thật (mục 1). Cố ý ra mắt ở trạng thái sắp phát hành thì để trống cả hai.
- [ ] `NEXT_PUBLIC_CONSENT_BANNER` **giữ bật** ở production (không đặt, hoặc `on`). Chính sách bảo mật nói Google Analytics chỉ nạp sau khi khách bấm "Đồng ý"; tắt thanh cookie (`off`) thì GA4 nạp ngay, nên phải viết lại chính sách (`content/privacy/*.mdx`, mục 2 và 3) và được PO cùng pháp chế duyệt **trước** khi tắt.
- [ ] `NEXT_PUBLIC_GA_MEASUREMENT_ID` (OQ-L03) đã đặt, hoặc cố ý để trống (không có GA4).
- [ ] Web Analytics và Speed Insights đã bật ở dashboard Vercel.
- [ ] Gói Vercel là Pro hoặc Enterprise: sự kiện tuỳ chỉnh (`track()`) chỉ chạy ở hai gói này. Không có thì sáu sự kiện của spec (`download_click`, `cta_click`, `contact_click`, `locale_switch`, `faq_open`, `consent_change`) không đi đâu cả, nên xác nhận gói trước khi ra mắt.
- [ ] Settings, Functions, **Function Regions** là Singapore (`sin1`).
- [ ] Node.js: log build của lần deploy gần nhất có `node -v` ra 24.x. Ô Node.js Version nằm ở Settings, Build and Deployment, nhưng `engines.node` trong `package.json` (hiện `>=22.18`) **thắng** ô đó, nên chỉ tin log build. Log không in sẵn thì đặt tạm Build Command thành `node -v && pnpm build`, deploy, đọc log, rồi bỏ. Không ra 24.x thì chỉnh `engines.node`.
- [ ] Settings, Environment Variables: **"Enable access to System Environment Variables"** đang bật (trước đây ghi là "Automatically expose System Environment Variables"). Công tắc này cấp `VERCEL_ENV` lúc dựng: không có biến đó thì chốt chặn production ở trên không chạy và build vẫn qua với URL sai. Nó cũng cấp `NEXT_PUBLIC_VERCEL_ENV`: không có biến đó thì site không nhúng Vercel Analytics và Speed Insights.

Điều kiện mà chữ trên site đang dựa vào:

- [ ] **Chữ ký số.** Hướng dẫn cài Windows bảo khách kiểm dòng nhà phát hành ghi "Agentra JSC" (và dừng nếu khác), trang Tải về nói bản Windows "ký mã của Agentra JSC". Vậy tên (subject) trong chứng chỉ ký mã phải đúng là Agentra JSC (AD-17, OQ-003, OQ-L04). Chứng chỉ mang tên khác thì sửa chữ trước khi lên: `content/install/vi/windows.mdx` và `content/install/en/windows.mdx` (bước cài và bước kiểm nhà phát hành), `download.signed.body` ở `messages/*.json`, và `tests/unit/guides.test.ts` (đang đòi chuỗi "Agentra JSC").
- [ ] **Mốc hệ điều hành tối thiểu** (macOS 12, Windows 10 22H2) theo giả định AS-012 của app, còn chờ xác nhận. Ghi ở: `download.req.windows.os` và `download.req.macos.os`, `home.download.platforms.windows-x64.sub` (cả ba ở `messages/*.json`); `content/install/{vi,en}/macos.mdx` và `windows.mdx`; `operatingSystem` ở `lib/seo/jsonld.ts` (và `tests/unit/jsonld.test.ts`). AS-012 đổi thì sửa đủ các chỗ này.
- [ ] Thông tin công ty ở `lib/site.ts` đã được PO xác nhận (OQ-L04, mục 4).

Đo trên Vercel (Ruling 50):

- [ ] **Lighthouse mobile trên URL preview của Vercel, cho 8 URL: `/`, `/ai-cho-giao-vien`, `/cach-tinh-phi`, `/tai-ve`, `/en`, `/en/ai-for-teachers`, `/en/pricing`, `/en/download`. Trên preview đọc Performance, yêu cầu từ 90 trở lên** (mục tiêu của spec); đọc thêm Accessibility ≥ 95 và Best Practices ≥ 95 nếu muốn. **Không đọc SEO ở preview** (Ruling 55): Vercel gửi header `X-Robots-Tag: noindex` cho bản preview, và kiểm tra "Page isn't blocked from indexing" (`is-crawlable`) của Lighthouse đỏ vì header đó. SEO 100 chỉ đọc trên URL production (mục "Kiểm trên domain thật" bên dưới). CI chỉ *cảnh báo* Performance vì `next start` phục vụ HTTP/1.1 với 6 kết nối (đo ở đó 0,84 tới 0,99 qua các lần đo ở máy dev, lần gần nhất, ở 8 URL: 0,86 tới 0,99), còn ước lượng ngoại tuyến với HTTP/2 của Vercel cho 0,94 tới 0,98; con số thật chỉ có ở bước này. Cách đo: PageSpeed Insights (tab Mobile) hoặc Lighthouse trong Chrome DevTools (chế độ Mobile, hạng mục Performance); mỗi URL đo 3 lần, lấy lần giữa vì điểm dao động vài điểm. PageSpeed Insights chỉ đo được URL công khai; preview có Deployment Protection thì dùng DevTools khi đã đăng nhập Vercel.
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

**Khi lần chạy CI đầu tiên xanh và cả năm mục trên đều đạt, xoá mục 7 này.** Xoá cùng lúc: hàng 7 của bảng đầu tài liệu; chữ "(mục 7)" ở ô "CI xanh trên `main`" của mục 6; và các chỗ nhắc mục này ở `README.md` (dòng "CI chưa chạy lần nào" cuối mục "CI", cụm "lần chạy CI đầu tiên" ở danh sách liên kết đầu trang).
