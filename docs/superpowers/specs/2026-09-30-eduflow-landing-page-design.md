# Thiết kế: Landing page EduFlow

Ngày: 30/09/2026 · Trạng thái: chờ PO duyệt · Repo: `eduflow-landing-page`

## 1. Mục tiêu và bối cảnh

Trang web marketing cho **EduFlow**, app desktop (macOS, Windows) gộp ba cấp nghiệp vụ giáo dục:
Phổ thông (đề kiểm tra, giáo án, slide), Học phần đại học (CLO, kế hoạch tuần, giáo án buổi, slide,
đề cương, đánh giá) và Chương trình đào tạo (bản sao số, rà soát ba tầng, kịch bản nếu). Giao diện
app theo hướng hiện đại: Trợ lý AI luôn có mặt ở Trang chủ và bên phải mọi màn làm việc.

Trang web phải giúp khách truy cập, trong một lần ghé:

- hiểu EduFlow làm gì cho đúng vai của mình (giáo viên phổ thông, giảng viên, Phòng Đảm bảo chất lượng);
- thấy trợ lý AI làm việc thế nào và vì sao an toàn (máy đề xuất, người duyệt và ký);
- hiểu cách tính phí theo mức dùng AI;
- tải bộ cài đúng máy, cài đặt, kích hoạt hoặc dùng thử;
- liên hệ Agentra để nhận báo giá hoặc key cho trường.

Nguồn tham chiếu (đều ở repo `eduflow-application`, trừ mục cuối):

- Đặc tả sản phẩm: `docs/superpowers/specs/2026-09-30-eduflow-application-design.md` (mục 0, 2, 4, 8, 9, 11; AD-21 cho trợ lý).
- Yêu cầu chi tiết: `docs/requirements/generated/` (US, AC của kích hoạt, dùng thử, tính tiền, trợ lý).
- Canvas thiết kế app: `docs/thiet-ke/canvas/project/*.dc.html` (24 artboard) và hệ thống thiết kế Phấn xanh.
- Việc trong WBS: gói 14.1 tới 14.4, milestone M5.
- Mẫu kỹ thuật và quy trình: repo `docops-landing-page` (stack, routing hai ngôn ngữ, feed phát hành, SEO, kiểm thử).

## 2. Phạm vi

Trong phạm vi:

- 12 trang × 2 ngôn ngữ (vi mặc định, en), sinh tĩnh lúc build.
- Ba trang theo cấp, một trang Trợ lý AI, một trang Cách tính phí.
- Trang Tải về đọc feed phát hành của app (ISR 10 phút), có snapshot dự phòng và trạng thái "sắp phát hành".
- Hai hướng dẫn cài đặt (macOS, Windows) dạng MDX theo ngôn ngữ.
- SEO: metadata, hreflang, canonical, sitemap, robots, JSON-LD, ảnh Open Graph.
- Analytics có thanh đồng ý cookie.
- Kiểm thử đơn vị, e2e, Lighthouse CI; deploy Vercel; tài liệu vận hành.
- Canvas thiết kế (Claude Design) làm chuẩn hình ảnh trước khi code.

Ngoài phạm vi V1:

- Form trên web: form liên hệ, form xin key, form dùng thử. Dùng thử và xin key nằm trong app (mục 3, quyết định 4).
- Thanh toán trực tuyến (app không thu tiền trực tuyến, AD-15), bảng giá có con số, tài khoản người dùng.
- Blog, CMS, chế độ tối, bản Linux, ngôn ngữ thứ ba.

## 3. Quyết định

| # | Quyết định | Chọn | Trạng thái |
|---|---|---|---|
| 1 | Ngôn ngữ | Tiếng Việt và tiếng Anh; tiếng Việt là bản gốc | PO chốt 30/09/2026 |
| 2 | Trang giá | Giải thích cách tính theo token, không ghi đơn giá; nút "Liên hệ báo giá cho trường" | PO chốt 30/09/2026 |
| 3 | Stack | Dùng lại stack và cấu trúc của `docops-landing-page` (mục 4) | Đề xuất, duyệt cùng spec |
| 4 | Dùng thử | Chỉ trong app: đơn dùng thử cần mã máy do app sinh (đặc tả app 8.2), web không lấy được mã này | Theo đặc tả app |
| 5 | Liên hệ | Không form; email, điện thoại hoặc Zalo, địa chỉ | Đề xuất, như DocOps |
| 6 | Tracking | Vercel Analytics, Speed Insights; GA4 chỉ nạp sau khi đồng ý cookie `[GIẢ ĐỊNH: AS-L01]` | Chờ PO |
| 7 | Hình ảnh | Hệ thống thiết kế Phấn xanh của app; ảnh sản phẩm chụp từ canvas app | Đề xuất |

Hai hướng khác đã cân nhắc và không chọn: site Astro tĩnh (nhẹ hơn nhưng đội phải học stack mới,
không tái dùng được mã feed, SEO, analytics của DocOps) và một trang HTML duy nhất (nhanh nhất nhưng
không có hai ngôn ngữ, MDX, feed tải về).

## 4. Kiến trúc tổng thể

Stack giữ đúng phiên bản của `docops-landing-page` lúc bắt đầu code: Next.js 16 (App Router,
Turbopack), React 19, TypeScript strict, pnpm, Tailwind CSS 4, next-intl 4, `@next/mdx` + `remark-gfm`,
`yaml`, `@vercel/analytics`, `@vercel/speed-insights`, `@next/third-parties` (GA4), Vitest, Playwright,
`@lhci/cli`. Node ≥ 22. Không thư viện component, không Edge runtime.

```
app/
  layout.tsx                  # chỉ trả children; <html>/<body> ở [locale]/layout
  robots.ts  sitemap.ts  manifest.ts
  [locale]/
    layout.tsx                # <html lang>, font, Header, Footer, Analytics, ConsentBar
    [...rest]/page.tsx        # đường dẫn lạ → notFound()
    opengraph-image.tsx       # ảnh OG theo ngôn ngữ (next/og)
    not-found.tsx  error.tsx
    page.tsx                  # Trang chủ
    k12/page.tsx              # /pho-thong
    university/page.tsx       # /hoc-phan
    program/page.tsx          # /chuong-trinh
    assistant/page.tsx        # /tro-ly-ai
    pricing/page.tsx          # /cach-tinh-phi
    ai-transparency/page.tsx  # /minh-bach-ai
    download/page.tsx         # /tai-ve
    install/[os]/page.tsx     # os ∈ {macos, windows}
    contact/page.tsx          # /lien-he
    privacy/page.tsx          # /chinh-sach-bao-mat
proxy.ts                      # routing next-intl (quy ước Next 16)
i18n/routing.ts  i18n/request.ts  i18n/navigation.ts
messages/vi.json  messages/en.json
content/install/{vi,en}/{macos,windows}.mdx
content/privacy/{vi,en}.mdx
content/releases.json         # snapshot feed phát hành
lib/releases/                 # feed.ts, parse.ts, snapshot.ts, index.ts
lib/seo/                      # metadata.ts, jsonld.ts
lib/analytics.ts  lib/platform.ts  lib/site.ts
components/ui/                # Button, Container, Section, Card, Callout, Badge, Icon
components/site/              # Header, MobileNav, Footer, LocaleSwitcher, ConsentBar, SkipLink
components/home/              # Hero, LevelCards, AssistantShowcase, PipelineStrip, TrustGrid,
                              # CostTeaser, DownloadBlock, Faq, FinalCta
components/level/             # LevelHero, OutcomeList, ScreenShowcase, GateStrip
components/pricing/           # BillingSteps, TokenClasses, BudgetStates, CostFormula
components/download/          # PlatformCard, ChecksumField, SystemRequirements, PrelaunchNotice
components/guide/             # Steps, Step, Toc, mdx-components
scripts/sync-releases.ts      # cập nhật content/releases.json
scripts/capture-product-images.mjs  # chụp ảnh sản phẩm từ canvas app
public/images/product/*.webp
public/brand/
tests/unit/**  tests/e2e/**  lighthouserc.json
```

Mọi trang là Server Component. Chỉ các mảnh tương tác là Client Component: menu mobile,
LocaleSwitcher, ConsentBar, nút tải theo hệ điều hành, ChecksumField, Faq.

## 5. Đa ngôn ngữ và routing

- next-intl, `localePrefix: 'as-needed'`: tiếng Việt không tiền tố, tiếng Anh dưới `/en`; `localeDetection: false`.
- Slug dịch qua `pathnames`; khoá nội bộ là tên tiếng Anh:

| Khoá nội bộ | Tiếng Việt | English |
|---|---|---|
| `/` | `/` | `/en` |
| `/k12` | `/pho-thong` | `/en/k12` |
| `/university` | `/hoc-phan` | `/en/university-courses` |
| `/program` | `/chuong-trinh` | `/en/program-review` |
| `/assistant` | `/tro-ly-ai` | `/en/ai-assistant` |
| `/pricing` | `/cach-tinh-phi` | `/en/pricing` |
| `/ai-transparency` | `/minh-bach-ai` | `/en/ai-transparency` |
| `/download` | `/tai-ve` | `/en/download` |
| `/install/[os]` | `/huong-dan-cai-dat/macos`, `/huong-dan-cai-dat/windows` | `/en/install/macos`, `/en/install/windows` |
| `/contact` | `/lien-he` | `/en/contact` |
| `/privacy` | `/chinh-sach-bao-mat` | `/en/privacy` |

- Mọi trang gọi `setRequestLocale(locale)` và khai `generateStaticParams` cho hai locale. Locale lạ → `notFound()`.
- Chuyển ngôn ngữ giữ nguyên trang. Chuỗi giao diện ở `messages/*.json` có kiểu; test bắt hai tệp cùng tập khoá.
- Nội dung dài (hướng dẫn cài đặt, chính sách bảo mật) là MDX theo ngôn ngữ, chọn bằng bảng import tĩnh.

## 6. Nội dung từng trang

Tiếng Việt là bản gốc, xưng "thầy cô". Tiếng Anh dịch sát nghĩa, cùng cấu trúc. Câu chữ dưới đây là
bản nháp định hướng; BA viết bản cuối ở gói WBS 14.1 và theo luật nội dung ở mục 15.

### 6.1 Trang chủ

1. **Header**: logo EduFlow (khối chữ E nền xanh, chữ Fraunces, gạch lime); menu Phổ thông · Học phần ·
   Chương trình · Trợ lý AI · Cách tính phí; chuyển VI/EN; nút chính "Tải EduFlow".
2. **Hero**: eyebrow "Ứng dụng desktop cho macOS và Windows". H1 nháp "Soạn đề, giáo án, đề cương và rà
   soát chương trình cùng một trợ lý AI". Phụ đề nháp "Trò chuyện với trợ lý ngay cạnh màn đang làm. Máy
   dựng khung chuẩn, AI điền nội dung, thầy cô duyệt và ký." Nút chính tải theo hệ điều hành nhận được;
   nút phụ "Xem trợ lý làm việc" (cuộn tới mục 4). Hình: artboard Trang chủ đang trò chuyện trong khung
   cửa sổ. Dòng tin cậy: "Dữ liệu nằm ở máy thầy cô · Chi phí hiện trước khi chạy · Người duyệt, người ký".
3. **Ba cấp, một app**: ba thẻ, mỗi thẻ 3 kết quả và link sang trang cấp.
   - Phổ thông: đề kiểm tra theo ma trận bốn mức, nhiều mã đề; giáo án CV5512; slide có quiz.
   - Học phần đại học: CLO, kế hoạch tuần, giáo án buổi 90 hoặc 150 phút; đề cương 10 mục; 12 cổng G1..G12.
   - Chương trình đào tạo: bản sao số CTĐT; rà hiệu lực pháp lý tại ngày xét; kịch bản "nếu".
4. **Trợ lý AI luôn có mặt**: ảnh một màn làm việc có panel trợ lý, bốn ý:
   hiểu màn đang mở và cho thầy cô thấy thứ được gửi đi; thẻ hành động (việc tại máy 0 đồng, tác vụ AI
   hiện chi phí trước); đề xuất sửa dạng trước và sau, áp vào bản nháp; không duyệt, không ký thay người.
   Link "Tìm hiểu trợ lý".
5. **Quy trình 5 bước**: Thiết lập → Trợ lý đề xuất, AI điền nội dung có cấu trúc → Cổng chất lượng kiểm
   và in số đơn vị đã kiểm → Thầy cô duyệt và ký → Xuất PDF, DOCX, PPTX hoặc gói đã ký gửi đồng nghiệp.
6. **Minh bạch và an toàn** (lưới 6 ô): dữ liệu ở máy, server không lưu nội dung · ba tầng kết luận không
   trộn · cổng kiểm 0 đơn vị không bao giờ báo đạt · chữ ký và công chứng mã băm · làm việc khi mất mạng ·
   chi phí minh bạch. Link Minh bạch AI.
7. **Chi phí theo mức dùng**: khối ngắn "Trả theo token AI đã dùng. Phần chạy tại máy (cổng chất lượng,
   trộn mã đề, biên dịch, kịch bản nếu) không tốn tiền. Ngân sách tháng theo key, cảnh báo khi dùng tới 80%."
   Link Cách tính phí.
8. **Khối tải về**: ba thẻ nền tảng (macOS Apple Silicon · macOS Intel · Windows x64), dùng chung dữ liệu với trang Tải về.
9. **FAQ** (8 câu, `<details>`, JSON-LD FAQPage): Key kích hoạt là gì, lấy ở đâu? · Dùng thử thế nào? ·
   Có cần Internet không? · Dữ liệu lưu ở đâu, trợ lý gửi gì đi? · Tính phí thế nào? · Một key dùng cho
   mấy máy? · Trường tắt AI cho một dự án được không? · Cập nhật bản mới thế nào?
10. **CTA cuối**: "Mang EduFlow về tổ chuyên môn, bộ môn hay phòng đảm bảo chất lượng" + "Tải EduFlow" và "Liên hệ báo giá".
11. **Footer**: cột Sản phẩm (ba trang cấp, Trợ lý AI, Tải về); cột Hướng dẫn (Cài đặt macOS, Cài đặt
    Windows, Cách tính phí); cột Tin cậy (Minh bạch AI, Chính sách bảo mật); cột Công ty (Agentra JSC,
    Liên hệ, email); dòng cuối bản quyền và chuyển ngôn ngữ.

### 6.2 Trang Phổ thông (`/pho-thong`)

Cho giáo viên phổ thông, tổ trưởng chuyên môn, Ban giám hiệu. Nội dung theo đặc tả app 9.1:
đề kiểm tra theo ma trận NB, TH, VD, VDC; nhiều mã đề trộn tất định; bản đặc tả, đáp án, hướng dẫn chấm;
giám khảo AI độc lập kiểm lại đáp án và giáo viên xác nhận từng cảnh báo; giáo án CV5512; slide có quiz;
sinh cả bộ cho một tiết; thư viện mẫu offline; 12 cổng P1..P12; dấu chìm DÙNG THỬ tới khi ký; gửi tổ
trưởng duyệt bằng gói đã ký. Ảnh: Soạn đề kiểm tra, Kết quả và cổng, Soạn slide. CTA tải về.

### 6.3 Trang Học phần (`/hoc-phan`)

Cho giảng viên và trưởng bộ môn. Theo đặc tả app 9.2: nạp bài giảng (bóc tách tại máy, không gửi nội
dung đi); CLO theo Bloom; kế hoạch tuần và LLO; giáo án buổi 90 hoặc 150 phút; slide Beamer PDF và PPTX;
thiết kế đánh giá và assessment brief có mức AI; đề cương 10 mục; 12 cổng G1..G12; trưởng bộ môn ký duyệt
qua gói. Ảnh: Bàn làm việc học phần, Cổng chất lượng học phần, Duyệt ký và xuất.

### 6.4 Trang Chương trình (`/chuong-trinh`)

Cho Phòng Đảm bảo chất lượng, Hội đồng CTĐT, Ban giám hiệu. Theo đặc tả app 9.3: dựng bản sao số của
CTĐT từ hồ sơ và gói đề cương; rà hiệu lực pháp lý tại một ngày xét, ba loại cảnh báo đếm riêng; bảy phép
kiểm curriculum map; lớp phủ tiêu chí theo TT 04/2025; đề xuất tầng 3 cần người duyệt; kịch bản "nếu";
báo cáo ký, Ban giám hiệu mở chỉ đọc. Ghi rõ: đây là tài liệu làm việc nội bộ, không phải báo cáo tự
đánh giá (mục 15). Ảnh: Bản sao số, Rà soát ba tầng, Kịch bản nếu.

### 6.5 Trợ lý AI (`/tro-ly-ai`)

Theo AD-21 và block yêu cầu TL của app:

- Trợ lý ở đâu: Trang chủ là ô trò chuyện; mọi màn làm việc có panel bên phải; mở rộng toàn màn khi cần.
- Trợ lý biết gì: chip "Đang xem" cho thấy từng mục ngữ cảnh; chỉ gửi bản tóm tắt có cấu trúc, không gửi tệp gốc; bỏ chip là mục đó không được gửi.
- Trợ lý trả lời thế nào: ba tầng kết luận; khối tầng 1 chỉ dẫn kết quả tất định của app; trích dẫn mở được nguồn.
- Trợ lý làm được gì: thẻ hành động tại máy (0 đồng) và thẻ tác vụ AI (hiện chi phí trước); đề xuất sửa áp vào bản nháp mới.
- Trợ lý không bao giờ làm gì: duyệt, ký, xác nhận cảnh báo, xuất bản chính thức, gửi gói.
- Chi phí: mỗi câu trả lời hiện chi phí thật; ô soạn hiện khoảng chi phí mỗi tin.
- Khi mất mạng, Tắt AI, key bị khoá, hết ngân sách: trợ lý nói rõ lý do; việc tại máy vẫn chạy.
- Lịch sử trò chuyện nằm ở máy, không lên server.

Ảnh: Trang chủ đang trò chuyện, bốn trạng thái của panel, một màn có đề xuất sửa.

### 6.6 Cách tính phí (`/cach-tinh-phi`)

Theo quyết định 2: không ghi đơn giá. Nội dung theo đặc tả app mục 8:

1. **Key theo đơn vị**: mỗi trường, khoa hoặc cá nhân nhận một key dùng trên số thiết bị đã thoả thuận.
2. **Dùng thử**: đăng ký ngay trong app; key dùng thử 1 thiết bị, ngân sách dùng thử, có ngày hết hạn. Con số cụ thể không ghi trên web `[CẦN LÀM RÕ: OQ-L06]`.
3. **Tính theo token**: mỗi lời gọi AI đo bốn lớp token (đầu vào, đầu ra, ghi cache, đọc cache); mỗi lớp
   một đơn giá VND trên một triệu token theo mô hình; số tiền chốt lúc ghi sổ. Minh hoạ bằng công thức
   ký hiệu, không số: chi phí một bước = tổng (token lớp × đơn giá lớp) / 1.000.000.
4. **Biết trước khi chạy**: mỗi tác vụ AI hiện khoảng ước tính trước khi chạy và chi phí thật sau khi chạy;
   tin nhắn trợ lý hiện chi phí dưới mỗi câu trả lời.
5. **Ngân sách tháng**: đặt theo key, chế độ cảnh báo hoặc chặn; cảnh báo ở 80% và 100%; khi chặn, OCR và
   sửa lỗi biên dịch vẫn chạy.
6. **Phần 0 đồng**: cổng chất lượng, trộn mã đề, dựng ma trận, biên dịch lại, tầng 1 và tầng 2, kịch bản nếu, ký, xuất tệp.
7. **Đối soát**: bảng kê tháng theo đơn vị (CSV, PDF), ghi rõ không phải hoá đơn. Không thanh toán trực tuyến.
8. **CTA**: "Liên hệ báo giá cho trường" (mailto có tiêu đề soạn sẵn) và "Tải EduFlow để dùng thử".

### 6.7 Minh bạch AI (`/minh-bach-ai`)

Khớp trang Minh bạch AI trong app (US của module nt-cai-dat): skill nào dùng AI; tầng mô hình của từng
skill; dữ liệu gửi đi theo từng loại tác vụ; dữ liệu không bao giờ rời máy. Thêm các nguyên tắc của đặc
tả app 2.4: máy đề xuất, người quyết định; kiểm 0 đơn vị không phải là sạch; không đoán; mọi dòng truy
vết được; ba tầng không trộn; dữ liệu ở máy; chi phí minh bạch. Tên nhà cung cấp mô hình và cam kết
không huấn luyện trên dữ liệu của trường chỉ ghi khi PO và pháp chế xác nhận `[CẦN LÀM RÕ: OQ-L07]`.

### 6.8 Tải về (`/tai-ve`)

- Tiêu đề, phiên bản mới nhất và ngày phát hành của kênh ổn định.
- Ba `PlatformCard`, thẻ khớp hệ điều hành nhận được xếp đầu. Mỗi thẻ: nền tảng, tên tệp, phiên bản,
  dung lượng, ngày phát hành, nút tải (link thẳng tới máy chủ phân phối), link hướng dẫn, `ChecksumField` SHA-512.
- macOS: ghi chú chọn Apple Silicon hay Intel theo dòng Chip trong "Giới thiệu về máy Mac này".
- Yêu cầu hệ thống theo NFR của app: macOS 12 trở lên (arm64, x64), Windows 10 22H2 trở lên (x64)
  `[GIẢ ĐỊNH: AS-L02]`; dung lượng trống `[CẦN LÀM RÕ: OQ-L05]` vì bộ cài mang bộ biên dịch TeX; Internet
  để kích hoạt và cho các bước AI.
- Bộ cài có ký số (AD-17): macOS ký Developer ID và notarize, Windows ký mã. Vẫn ghi một dòng cho cảnh
  báo SmartScreen có thể gặp ở bản mới, link hướng dẫn.
- "Đã cài rồi? App tự báo bản mới: tải về, rồi khởi động lại để cài."
- **Trạng thái sắp phát hành**: khi feed và snapshot đều chưa có bản nào, trang hiện `PrelaunchNotice`
  "EduFlow sắp phát hành" kèm nút "Liên hệ để dùng sớm"; khối tải về ở trang chủ và nút tải ở header đổi theo.

### 6.9 Hướng dẫn cài đặt (`/huong-dan-cai-dat/macos`, `/huong-dan-cai-dat/windows`)

Chuyển thể từ đặc tả app 11.4 và các US kích hoạt (NT-A US-101 tới US-108): chọn đúng tệp; cài đặt; mở
lần đầu; kích hoạt bằng key `EDU-XXXX-...` hoặc bấm Dùng thử; chọn hồ sơ làm việc; cập nhật trong app
(tải về, rồi khởi động lại để cài); gỡ cài và dữ liệu nằm ở đâu. Bố cục như DocOps: mục lục nổi, bước
đánh số, khối lưu ý, khối lệnh sao chép được. Cuối trang: nút tải đúng nền tảng. JSON-LD `HowTo`.

### 6.10 Liên hệ (`/lien-he`)

Ba thẻ: email, điện thoại hoặc Zalo (ẩn khi chưa có), địa chỉ `[CẦN LÀM RÕ: OQ-L04]`. Khối "Nhận key cho
trường": gửi yêu cầu ngay trong app, hoặc email kèm tên đơn vị và số máy. Khối "Dùng thử": tải app, bấm
Dùng thử ở màn đầu. Khối "Báo lỗi và góp ý": dùng mục Phản hồi trong app (gửi kèm chẩn đoán đã làm sạch)
hoặc email. JSON-LD `Organization` có `contactPoint`.

### 6.11 Chính sách bảo mật (`/chinh-sach-bao-mat`)

MDX theo ngôn ngữ: phạm vi (trang web này); dữ liệu thu thập (số liệu truy cập ẩn danh; GA4 chỉ khi đồng
ý); cookie và cách rút lại; liên kết ngoài (máy chủ phân phối bộ cài); dữ liệu trong app (dẫn sang Minh
bạch AI); quyền của người dùng theo Nghị định 13/2023/NĐ-CP; liên hệ; ngày cập nhật. PO và pháp chế rà
soát trước khi công bố.

### 6.12 404 và lỗi

`not-found` theo ngôn ngữ với nút về Trang chủ và Tải về; `error.tsx` có nút "Thử lại". Đường dẫn lạ không có `/en` rơi vào 404 tiếng Việt.

## 7. Dữ liệu phát hành (feed)

### 7.1 Nguồn

App tự cập nhật bằng electron-updater đọc feed tĩnh theo kênh (đặc tả app 11.4, US-110 tới US-112,
web admin SCR-A-13). Trang web đọc **kênh ổn định** của cùng feed: `DOWNLOAD_FEED_URL` `[CẦN LÀM RÕ: OQ-L02]`.

- `latest.yml` (Windows): `version`, `path`, `sha512`, `releaseDate`, `files[].size`.
- `latest-mac.yml` (macOS): `version`, `releaseDate`, `files[]` gồm `url`, `sha512`, `size` cho `.zip` và `.dmg` hai kiến trúc.

Tỷ lệ rollout của app chỉ áp cho bản tự cập nhật trên máy đã cài. Người tải mới luôn nhận bản ghi trong
tệp mô tả của kênh ổn định `[GIẢ ĐỊNH: AS-L03]`.

### 7.2 Kiểu dữ liệu và quy tắc gán nền tảng

Giữ nguyên của DocOps: `Platform = 'windows-x64' | 'macos-arm64' | 'macos-x64'`, `ReleaseAsset`,
`ReleaseInfo` có `source` theo từng tệp. `windows-x64` ← `.exe`; `macos-arm64` ← `-arm64.dmg`;
`macos-x64` ← `.dmg` không chứa `arm64`; bỏ `.zip`, `.blockmap`; thiếu mục thì ẩn thẻ, không ném lỗi;
`url` mã hoá tên tệp. Tên tệp thật lấy theo cấu hình electron-builder của app lúc phát hành.

### 7.3 Tải, dự phòng, trạng thái sắp phát hành

- Tải hai tệp song song, timeout 5 giây, `revalidate: 600`.
- Tệp lỗi (không 2xx, hết giờ, YAML hỏng) → phần tương ứng trong `content/releases.json`, ghi một dòng log có nhãn cố định.
- `content/releases.json` ban đầu rỗng (`{"windows": null, "mac": null}`): chưa có bản phát hành nào.
- Không có mục nào ở cả feed và snapshot → `assets = []` → trạng thái sắp phát hành (mục 6.8).
- Một nguồn dữ liệu cho trang chủ, Tải về, hai trang cài đặt, JSON-LD và sitemap, qua `React.cache`.
- `pnpm sync-releases` ghi snapshot từ feed hoặc thư mục `release/` cục bộ, chạy khi phát hành bản mới.

## 8. Thiết kế hình ảnh

### 8.1 Token (hệ Phấn xanh của app)

```
--paper #F6F7F2   --surface #FFFFFF   --ink #16201A   --ink-2 #3F4A43   --ink-3 #5B675F
--line #DDE3DA    --brand-strong #237A31 (nút chính, chữ trắng trên nền này)
--brand #2F8F3C (hình, biểu đồ, không dùng cho chữ)   --brand-tint #E8F3E7
--lime #9BCB3C (gạch nhấn dưới logo và tiêu đề, không dùng cho chữ)
--tier1 #1E2B23   --tier3 #6D28D9   --warn-bg #FEF3C7 --warn-ink #9A4A06   --crit #B42318
```

Nút chính dùng `--brand-strong`. Chữ đạt tương phản ≥ 4,5:1.

### 8.2 Chữ

Fraunces cho H1, H2 (như tiêu đề trong app); Be Vietnam Pro cho thân (subsets `latin`, `vietnamese`);
JetBrains Mono cho số liệu, mã, checksum. Tất cả qua `next/font/google`, `display: swap`.

### 8.3 Bố cục và thành phần

- Container 1200px, section 96px desktop, 64px mobile; mobile gutter 16px, không cuộn ngang.
- Nền giấy sáng, thẻ trắng viền mảnh; ba tầng kết luận dùng đúng kiểu của app khi minh hoạ.
- Icon SVG nét, không emoji. Chuyển động nhẹ, tôn trọng `prefers-reduced-motion`.
- Ảnh sản phẩm: chụp từ artboard canvas app (`docs/thiet-ke/canvas/project/*.dc.html` của repo
  `eduflow-application`) bằng `docs/thiet-ke/tools/preview_dc.py` ở 2x, xuất WebP ≤ 200 KB vào
  `public/images/product/`; script chụp giữ trong `scripts/` để làm lại khi app đổi giao diện.
  Ảnh chọn trước: Trang chủ đang trò chuyện, Soạn đề kiểm tra, Kết quả và cổng, Bàn làm việc học phần,
  Rà soát ba tầng, Kịch bản nếu, Sử dụng và chi phí, bốn trạng thái trợ lý.
- Truy cập: skip link, focus ring rõ, `aria-current` cho menu, hit target ≥ 44px trên mobile.

### 8.4 Canvas thiết kế

Dựng trên Claude Design trước khi code, PO chỉnh trực tiếp trên canvas. Artboard: Trang chủ desktop 1440
(VI), Trang chủ mobile 390 (VI), Home desktop (EN), Phổ thông (VI), Trợ lý AI (VI), Cách tính phí (VI),
Tải về (VI, có trạng thái sắp phát hành). Code bám canvas đã duyệt.

## 9. SEO

- `generateMetadata` mỗi trang, mỗi ngôn ngữ: title template `%s · EduFlow`, description 140 tới 160 ký
  tự, canonical, `alternates.languages` (`vi`, `en`, `x-default` = vi), Open Graph `vi_VN`/`en_US`, ảnh
  1200×630, Twitter `summary_large_image`. `metadataBase` = `NEXT_PUBLIC_SITE_URL`.
- Từ khoá chính theo trang cấp (BA chốt ở 14.1): soạn đề kiểm tra theo ma trận, giáo án CV5512; đề cương
  chi tiết học phần, CLO và PLO; rà soát chương trình đào tạo, curriculum map.
- `sitemap.ts` mọi trang × 2 ngôn ngữ; `robots.ts`; `manifest.ts`.
- JSON-LD: `Organization` mọi trang; `SoftwareApplication` (EduFlow, `operatingSystem` theo mục 6.8,
  `applicationCategory` EducationalApplication, `softwareVersion` từ feed, `downloadUrl`) ở trang chủ và
  Tải về, không khai `offers` vì không công bố giá; `FAQPage` trang chủ; `BreadcrumbList` trang con;
  `HowTo` hai trang cài đặt.
- Ảnh OG bằng `next/og`, nền `--tier1`, logo, tiêu đề theo ngôn ngữ.
- Mục tiêu Lighthouse mobile: Performance ≥ 90, SEO 100, Accessibility ≥ 95, Best Practices ≥ 95.

## 10. Analytics và đồng ý cookie

Như DocOps: `<Analytics />`, `<SpeedInsights />` luôn bật; GA4 chỉ nạp trong `AnalyticsGate` khi đồng ý
và có `NEXT_PUBLIC_GA_MEASUREMENT_ID`. Sự kiện kiểu đóng: `download_click` (`platform`, `version`,
`location`), `cta_click` (`id`, `location`), `contact_click` (`channel`), `locale_switch`, `faq_open`,
`consent_change`. ConsentBar lưu `localStorage` khoá `eduflow.consent` trong `try/catch`.

## 11. Cấu hình và biến môi trường

| Biến | Bắt buộc | Ý nghĩa |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | có | Domain chính thức `[CẦN LÀM RÕ: OQ-L01]` |
| `DOWNLOAD_FEED_URL` | có | Feed kênh ổn định của app `[CẦN LÀM RÕ: OQ-L02]` |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | không | Thiếu thì không có GA4 `[CẦN LÀM RÕ: OQ-L03]` |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | không | Xác minh Search Console |
| `NEXT_PUBLIC_CONSENT_BANNER` | không | `off` để tắt thanh cookie |

Thông tin công ty (tên, email, điện thoại hoặc Zalo, địa chỉ) ở `lib/site.ts`; `.env.example` liệt kê đủ biến.

## 12. Xử lý lỗi

- Feed lỗi từng tệp → snapshot cho tệp đó; cả hai lỗi và snapshot rỗng → trạng thái sắp phát hành, không lỗi build.
- Máy chủ phân phối thiếu tệp → người dùng gặp 404 ở đó; trang Tải về có dòng "Không tải được? Liên hệ" để không cụt đường.
- Locale hoặc `os` lạ → `notFound()`. MDX lỗi → build fail. `localStorage` bị chặn → ConsentBar vẫn chạy trong phiên.
- Không có Route Handler, không có dữ liệu người dùng gửi lên máy chủ.

## 13. Kiểm thử và chất lượng

- Vitest: parse feed với fixture `latest.yml`, `latest-mac.yml` (đủ 3 nền tảng, bỏ zip và blockmap, mã hoá
  tên tệp); snapshot rỗng → `assets = []`; `vi.json` và `en.json` cùng tập khoá; `pathnames` phủ mọi trang;
  JSON-LD đúng hình dạng; `detectPlatform` với UA mẫu; định dạng dung lượng và ngày theo locale.
- Playwright trên `next build && next start`: mỗi trang × 2 ngôn ngữ trả 200, đúng `<html lang>`, một H1,
  canonical và hreflang, JSON-LD parse được; trang Tải về hiện đúng 3 link khi có feed và hiện
  PrelaunchNotice khi feed rỗng; chuyển ngôn ngữ giữ trang; ConsentBar không nạp GA4 trước khi đồng ý;
  menu mobile 390px; không lỗi console; không trang nào chứa ký tự gạch ngang dài.
- Lighthouse CI preset mobile cho trang chủ, một trang cấp, Cách tính phí, Tải về, cả hai ngôn ngữ.
- GitHub Actions: typecheck, lint, unit, build, e2e, lhci trên mỗi PR và push `main`.

## 14. Triển khai và vận hành

- Vercel Git integration: `main` → production, PR → preview; header bảo mật trong `next.config.ts` như DocOps.
- Ra mắt cùng mốc GA của app `[CẦN LÀM RÕ: OQ-001 của app]`. Trước GA, site có thể chạy ở trạng thái sắp phát hành.
- Quy trình phát hành app → web: upload bộ cài và tệp mô tả lên máy chủ phân phối (tệp mô tả sau cùng);
  trang Tải về cập nhật trong ≤ 10 phút; chạy `pnpm sync-releases` rồi commit để snapshot theo kịp.
- README: cách chạy, cấu trúc, sửa nội dung, biến môi trường, quy trình phát hành, checklist gắn domain.

## 15. Luật nội dung

- Không hứa kết quả kiểm định hay xếp loại. Cấp Chương trình là công cụ làm việc nội bộ, không phải báo
  cáo tự đánh giá; không dùng cụm "đạt kiểm định" ở bất cứ đâu.
- Không nói AI thay giáo viên. Luôn nói máy đề xuất, người duyệt và ký.
- Chỉ dùng con số có trong đặc tả app (ví dụ 12 cổng, 4 mã đề, buổi 90 hoặc 150 phút); không bịa số khách
  hàng, số giờ tiết kiệm hay chứng nhận.
- Số liệu trên ảnh sản phẩm là dữ liệu mẫu; chú thích nhỏ dưới ảnh ghi điều này ở trang Cách tính phí.
- Không dùng ký tự gạch ngang dài (U+2014) trong mọi văn bản, như luật của app.
- Thuật ngữ khớp glossary của app (key, hiện vật, cổng chất lượng, trợ lý AI, thẻ hành động).

## 16. Giả định và câu hỏi mở

Giả định:

- `AS-L01`: Dùng Vercel Analytics, Speed Insights và GA4 sau đồng ý cookie như DocOps.
- `AS-L02`: Yêu cầu hệ thống lấy theo NFR của app (macOS 12+, Windows 10 22H2+), bản thân NFR đó còn là giả định AS-012 của app.
- `AS-L03`: Người tải mới nhận bản của kênh ổn định bất kể tỷ lệ rollout.
- `AS-L04`: Bản tiếng Anh do đội dev dịch, PO rà thuật ngữ.

Câu hỏi mở:

- `OQ-L01` (PO): Domain chính thức của landing page là gì?
- `OQ-L02` (Tech lead): URL feed kênh ổn định mà electron-updater của app đọc là gì?
- `OQ-L03` (PO): Có dùng GA4 không; nếu có, measurement ID nào?
- `OQ-L04` (PO): Email, điện thoại hoặc Zalo, địa chỉ nào ghi trên trang Liên hệ?
- `OQ-L05` (Tech lead): Bộ cài và bản đã cài chiếm bao nhiêu dung lượng khi mang bộ biên dịch TeX?
- `OQ-L06` (PO): Có công bố ngân sách và số ngày dùng thử trên web không (app còn chờ OQ-002)?
- `OQ-L07` (PO, pháp chế): Có ghi tên nhà cung cấp mô hình và cam kết không huấn luyện trên dữ liệu của trường không?
- `OQ-L08` (PO): Tên hiển thị là "EduFlow" hay "Agentra EduFlow"?
