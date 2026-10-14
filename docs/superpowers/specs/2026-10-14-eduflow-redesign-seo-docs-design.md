# Thiết kế: Thiết kế lại landing EduFlow, chuẩn SEO và trung tâm hướng dẫn

Ngày: 14/10/2026 · Trạng thái: chờ PO duyệt · Repo: `eduflow-landing-page`

Spec này nối tiếp `2026-09-30-eduflow-landing-page-design.md` (gọi tắt là "spec 30/09"). Mục nào ở đây không nhắc tới
thì giữ nguyên theo spec 30/09 và phụ lục quyết định (Ruling 1 tới 62) của kế hoạch 30/09: feed phát hành, trạng thái
sắp phát hành, analytics và đồng ý cookie, biến môi trường, xử lý lỗi, luật nội dung. Mục nào ở đây nói khác thì spec
này thắng.

## 1. Mục tiêu và tiêu chí thành công

**Ưu tiên số 1 (PO chốt 14/10/2026): kéo traffic tự nhiên từ Google và từ trợ lý AI** (ChatGPT, Perplexity, Claude,
Gemini, AI Overviews). Tải app và liên hệ tư vấn là chuyển đổi đi sau traffic.

Ba việc lớn, gắn với nhau qua kiến trúc thông tin:

1. **Nhận diện và giao diện mới**: logo mới (mũ tốt nghiệp ghép chữ E, olive và cam), bố cục và trải nghiệm tham khảo
   ladipage.vn, dựng trên Claude Design rồi mới code.
2. **Trung tâm hướng dẫn sử dụng** `/huong-dan` như DocOps: tải app, cài đặt, kích hoạt, dùng từng tính năng của v1.
3. **SEO đạt chuẩn skill `seo-master`**: bản đồ từ khoá, trang chủ đề, entity graph, `llms.txt`, bot AI, và kiểm bằng
   `seo-audit.mjs`.

Xong khi:

- Mọi trang khớp canvas Claude Design đã được PO duyệt, cả hai ngôn ngữ.
- `seo-audit.mjs` trên bản build production thoát 0; sitemap đúng 58 URL và bằng tập URL indexable, tự canonical.
  Cảnh báo còn lại (nếu có) ghi lý do trong README.
- Lighthouse mobile: Performance ≥ 90, SEO 100, Accessibility ≥ 95, Best Practices ≥ 95 cho các trang ở mục 12.3.
- `pnpm verify`, e2e và Lighthouse CI xanh trên CI.
- Site chạy ở `https://eduflow.agentra.io.vn`, đã gửi sitemap cho Google Search Console và Bing Webmaster Tools.

Mục tiêu theo dõi sau ra mắt (không phải điều kiện nghiệm thu): tuần 8 có ≥ 90% URL trong sitemap được index; tháng
3 tới 4 có lượt hiển thị cho các từ khoá đuôi dài ở mục 4.2; mỗi tháng chạy bộ câu hỏi AI ở mục 13.3.

## 2. Hiện trạng (đo ngày 14/10/2026)

- 12 trang × 2 ngôn ngữ = 24 URL, sinh tĩnh. Chưa lên domain thật.
- `seo-audit.mjs` trên build production (domain giả định `https://eduflow.agentra.io.vn`): **0 lỗi, 17 cảnh báo**:
  3 title tiếng Anh dài hơn 60 ký tự (`/en`, `/en/university-courses`, `/en/program-review`); 14 link trỏ vào URL bị
  chuyển hướng (link đổi ngôn ngữ dạng `/vi/...` chuyển sang `/...`). Thông tin: chưa có `llms.txt`, `robots.txt` không
  nêu tên bot AI nào, không có feed RSS.
- JSON-LD chưa có `@id`, nên các trang không nối thành một entity graph. Hai trang cài đặt dùng `HowTo`.
- Không trang nào nhắm vào từ khoá người dùng thật sự tìm. Đây là chỗ thiếu lớn nhất so với mục tiêu ở mục 1.

## 3. Quyết định

| # | Quyết định | Chọn | Trạng thái |
|---|---|---|---|
| R1 | Ưu tiên của site | Traffic tự nhiên từ Google và trợ lý AI | PO chốt 14/10/2026 |
| R2 | Cách làm | Nâng cấp tại chỗ: giữ stack, routing, feed, consent, bộ test; thay giao diện và kiến trúc thông tin; chép khuôn module SEO của `docops-landing-page` (`brand.ts`, `llms.ts`, component trang chủ đề) | PO chốt 14/10/2026 |
| R3 | Domain | `https://eduflow.agentra.io.vn` (đóng OQ-L01; tên này đã giữ cho landing trong kế hoạch R1 của app) | PO chốt 14/10/2026 |
| R4 | Hướng hình ảnh | Hướng A "Sáng và năng động", gần ladipage.vn nhất | PO chốt 14/10/2026 |
| R5 | Phạm vi trung tâm hướng dẫn | Vừa: 12 bài mỗi ngôn ngữ, chỉ tính năng có trong v1 của app | PO chốt 14/10/2026 |
| R6 | Học phần và Chương trình | Giữ cả ba cấp trên site như hiện tại, kể cả khi app v1 chỉ có Phổ thông (xem rủi ro K1 ở mục 15) | PO chốt 14/10/2026 |
| R7 | Kiến trúc thông tin, hệ thiết kế, bố cục trang chủ, khuôn trang, SEO kỹ thuật | Như mục 4 tới 9 | PO duyệt từng phần 14/10/2026 |
| R8 | Tên hiển thị | "EduFlow" như logo; JSON-LD có `alternateName` "Agentra EduFlow" (đóng OQ-L08) | Theo logo mới |
| R9 | Docs | Thư mục con `/huong-dan` (không subdomain), MDX tự dựng trên hệ hướng dẫn cài đặt hiện có; không Fumadocs, Nextra; không ô tìm kiếm ở đợt này | Theo cách làm R2 |

Hai hướng đã cân nhắc và không chọn: dựng lại từ khung `docops-landing-page` (mất các sửa riêng của EduFlow, làm lại
test, kết quả gần như nhau) và dùng framework docs (thêm phụ thuộc lớn, khó khớp next-intl và slug tiếng Việt, chưa
đáng với 12 bài).

## 4. Kiến trúc thông tin

### 4.1 Mô hình

Hub, pillar, spoke: trang chủ là hub (danh mục sản phẩm); ba trang cấp là pillar; sáu trang chủ đề là spoke, mỗi trang
sở hữu một cụm từ khoá; trung tâm hướng dẫn là thư mục con, nối hai chiều với spoke và pillar.

### 4.2 Bảng URL và bản đồ từ khoá

Mỗi URL một từ khoá chính; từ khoá phụ là biến thể cùng ý định. Từ khoá lấy từ gợi ý tìm kiếm Google (hl=vi, gl=vn)
ngày 14/10/2026. Khoá nội bộ của routing giữ như cũ (`/k12`, `/university`, `/program`, ...) để ít đổi mã; chỉ đổi
đường dẫn hiển thị.

| Khoá nội bộ | Tiếng Việt | English | Vai trò | Từ khoá chính; từ khoá phụ |
|---|---|---|---|---|
| `/` | `/` | `/en` | Hub | phần mềm AI cho giáo viên; EduFlow, Agentra EduFlow |
| `/k12` | `/ai-cho-giao-vien` | `/en/ai-for-teachers` | Pillar | AI cho giáo viên; phần mềm soạn đề kiểm tra, AI soạn giáo án |
| `/university` | `/ai-cho-giang-vien` | `/en/ai-for-lecturers` | Pillar | AI cho giảng viên; chuẩn đầu ra học phần (CLO), kế hoạch tuần |
| `/program` | `/ra-soat-chuong-trinh-dao-tao` | `/en/curriculum-review` | Pillar | rà soát chương trình đào tạo; ma trận chuẩn đầu ra của CTĐT, curriculum map |
| `/test-generator` | `/ai-tao-de-kiem-tra-theo-ma-tran` | `/en/ai-test-generator` | Spoke | AI tạo đề kiểm tra; ma trận đề kiểm tra, bản đặc tả đề kiểm tra, AI tạo đề theo ma trận |
| `/test-versions` | `/tron-de-trac-nghiem` | `/en/shuffle-test-versions` | Spoke | trộn đề trắc nghiệm; tạo nhiều mã đề, phần mềm trộn đề |
| `/lesson-plans` | `/ai-soan-giao-an` | `/en/ai-lesson-plan-generator` | Spoke | AI soạn giáo án; giáo án 5512, kế hoạch bài dạy 5512 |
| `/lesson-slides` | `/tao-slide-bai-giang-bang-ai` | `/en/ai-slide-generator` | Spoke | tạo slide bài giảng bằng AI; AI tạo slide bài giảng |
| `/course-syllabus` | `/de-cuong-chi-tiet-hoc-phan` | `/en/course-syllabus` | Spoke | đề cương chi tiết học phần; mẫu đề cương, cấu trúc đề cương |
| `/vs-chatgpt` | `/eduflow-va-chatgpt` | `/en/eduflow-vs-chatgpt` | Spoke so sánh | ChatGPT soạn giáo án; EduFlow và ChatGPT, câu lệnh ChatGPT soạn giáo án |
| `/assistant` | `/tro-ly-ai` | `/en/ai-assistant` | Sản phẩm | trợ lý AI cho giáo viên |
| `/pricing` | `/cach-tinh-phi` | `/en/pricing` | Sản phẩm | chi phí EduFlow, tính phí theo token |
| `/download` | `/tai-ve` | `/en/download` | Sản phẩm | tải EduFlow cho macOS, Windows |
| `/ai-transparency` | `/minh-bach-ai` | `/en/ai-transparency` | Tin cậy | minh bạch AI, dữ liệu của trường |
| `/contact` | `/lien-he` | `/en/contact` | Công ty | liên hệ Agentra EduFlow |
| `/privacy` | `/chinh-sach-bao-mat` | `/en/privacy` | Pháp lý | (không nhắm từ khoá) |
| `/docs` | `/huong-dan` | `/en/docs` | Docs, mục lục | hướng dẫn sử dụng EduFlow |
| `/docs/[slug]` | `/huong-dan/<slug-vi>` | `/en/docs/<slug-en>` | Docs, 12 bài | mỗi bài một tác vụ (mục 7.4) |

Tổng: 17 trang + 12 bài = 29 URL mỗi ngôn ngữ, **58 URL**.

Luật của bản đồ (ghi thành chú thích đầu `lib/seo/brand.ts`, như DocOps):

- Slug là từ khoá chính. Không hai URL cùng từ khoá chính (có test, mục 12.1).
- Anchor text của link nội bộ tới một trang là từ khoá chính của trang đó, và chỉ dùng cho trang đó.
- Bài hướng dẫn nhắm từ khoá dạng tác vụ ("cách soạn đề kiểm tra trên EduFlow"), không lấy từ khoá chính của spoke.

### 4.3 Chuyển hướng

Site chưa lên domain nên không có thứ hạng để mất. Vẫn đặt 308 vĩnh viễn trong `next.config.ts` cho URL cũ, phòng khi
app, tài liệu hoặc tin nhắn đã trỏ tới:

| Cũ | Mới |
|---|---|
| `/pho-thong`, `/en/k12` | `/ai-cho-giao-vien`, `/en/ai-for-teachers` |
| `/hoc-phan`, `/en/university-courses` | `/ai-cho-giang-vien`, `/en/ai-for-lecturers` |
| `/chuong-trinh`, `/en/program-review` | `/ra-soat-chuong-trinh-dao-tao`, `/en/curriculum-review` |
| `/huong-dan-cai-dat/macos`, `/en/install/macos` | `/huong-dan/cai-dat-macos`, `/en/docs/install-macos` |
| `/huong-dan-cai-dat/windows`, `/en/install/windows` | `/huong-dan/cai-dat-windows`, `/en/docs/install-windows` |

Bí danh production `*.vercel.app` chuyển 308 về `https://eduflow.agentra.io.vn` (cấu hình domain của Vercel, hoặc
`redirects()` có điều kiện `has: host`). Báo cho đội app: kế hoạch R1 của app có "trang cài đặt ngắn cho giáo viên";
link trong app nên trỏ thẳng `/huong-dan/cai-dat-macos` và `/huong-dan/cai-dat-windows`.

### 4.4 Điều hướng

**Header** (dính đầu trang, nền trắng mờ khi cuộn):

- Trái: logo.
- Giữa: mega menu kiểu LadiPage.
  - *Sản phẩm* ▾: ba cấp (link pillar), Trợ lý AI, Minh bạch AI; mỗi mục một dòng mô tả ngắn.
  - *Giải pháp* ▾: sáu trang chủ đề.
  - *Hướng dẫn* ▾: Bắt đầu nhanh, Cài đặt, Soạn đề kiểm tra, Soạn giáo án, Dùng trợ lý AI, "Tất cả hướng dẫn".
  - *Cách tính phí* (link thẳng).
- Phải: VI/EN, nút viền "Liên hệ tư vấn" (tới `/lien-he`), nút cam "Tải EduFlow" (tới `/tai-ve`; trạng thái sắp phát
  hành giữ như spec 30/09).
- Link của mega menu luôn nằm trong HTML từ server (bot đọc được). Mở bằng hover có trễ và bằng click; bàn phím: Enter,
  Space mở, Esc đóng và trả focus về nút; `aria-expanded`, `aria-controls`.
- Điện thoại: nút menu mở màn phủ toàn bộ, ba nhóm là `<details>`, hai nút CTA ở đáy.

**Footer** năm cột: Sản phẩm · Giải pháp (mọi trang chủ đề, trên mọi trang) · Hướng dẫn · Tin cậy · Công ty. Nhãn cột
là `<p>`, không phải heading. Dòng cuối: bản quyền, VI/EN.

### 4.5 Link nội bộ

- Hub tới mọi pillar (khối 4 trang chủ) và mọi spoke (khối 5).
- Pillar tới các spoke của nó và các bài hướng dẫn liên quan; spoke tới pillar của nó, tới spoke anh em, tới bài
  hướng dẫn của từng bước; bài hướng dẫn tới spoke tương ứng.
- Mọi trang indexable có ít nhất một link từ trang khác và cách trang chủ ≤ 3 lần bấm.
- Không link nội bộ nào trỏ vào URL chuyển hướng. Sửa luôn link đổi ngôn ngữ: trỏ thẳng URL cuối, không qua `/vi/...`.

## 5. Hệ thiết kế (hướng A)

### 5.1 Màu

Thay hệ "Phấn xanh" của spec 30/09 §8.1. Tỷ lệ tương phản tính theo WCAG trên nền trắng, hoặc với màu chữ ghi kèm.

```
--brand        #567F2E  nút phụ, link, số liệu; chữ trắng trên nền này 4,7:1
--brand-strong #3F5F1F  hover, chữ link trên nền nhạt 7,3:1
--accent       #F2A541  nền nút chính, chữ ink trên nền này 7,3:1; KHÔNG BAO GIỜ làm màu chữ (2,05:1 trên trắng)
--accent-ink   #8A5310  chữ eyebrow, nhãn cam 6,3:1
--ink          #1E2A14  chữ chính; nền dải CTA đậm
--ink-2        #4A5440  chữ phụ 7,0:1        --ink-3 #5E6857  chữ mờ 5,8:1
--surface      #FFFFFF  nền chính, thẻ       --paper #F7F9F3  nền khối xen kẽ
--brand-tint   #EEF4E6  chip, nền icon       --accent-tint #FDF1DE  mảng loang, highlight
--line         #E1E6DA  viền thẻ, kẻ
--tier1 #1E2B23  --tier3 #6D28D9  --warn-bg #FEF3C7  --warn-ink #9A4A06  --crit #B42318   (giữ từ spec 30/09 cho minh hoạ ba tầng và cảnh báo)
```

Mảng loang (radial gradient `--accent-tint` và olive nhạt) chỉ dùng ở hero và dải CTA. Không chế độ tối ở đợt này.

### 5.2 Chữ

- Be Vietnam Pro cho mọi tiêu đề và thân bài (subsets `latin`, `vietnamese`; 400, 500, 600, 700, 800), qua `next/font`.
  Bỏ Fraunces.
- JetBrains Mono cho checksum, key, mã.
- Sora (chữ của logo) **không có** các chữ tiếng Việt có dấu thanh (Google Fonts chỉ cấp `latin`, `latin-ext`; thiếu dải
  U+1EA0 tới U+1EF1), nên không dùng cho chữ trên web. Chữ "EduFlow" trong logo là path SVG, không nạp font Sora.
- Thang chữ desktop: H1 48/56 (800, letter-spacing -0,025em), H2 36/44 (700), H3 20/28 (600), thân 17/28. Điện thoại: H1
  34/42, H2 28/36. Chữ thân `text-wrap: pretty`.

### 5.3 Logo và icon

Nguồn: `~/Downloads/agentra-test/eduflow-logo/` (PNG 512 và wordmark 2002×632, tệp `Lockups.dc.html` có hình học SVG của
dấu hiệu, viewBox 120).

- `public/brand/eduflow-mark.svg`: dấu hiệu, `currentColor` cho phần olive, cam cho tua.
- `public/brand/eduflow-wordmark.svg`: dấu hiệu + chữ "EduFlow" (Sora 700 "Edu", Sora 400 "Flow") đã chuyển thành path.
- Bản một màu (trắng) cho nền đậm, theo các lockup trong `Lockups.dc.html`.
- `app/icon.svg`, `app/icon.png`, `app/apple-icon.png` (180×180, cũng là logo JSON-LD), `manifest.ts`: dấu hiệu trắng
  và tua cam trên ô vuông bo góc nền `--brand`, theo lockup app icon. Ở cỡ 32 px trở xuống dùng bản rút gọn của lockup
  (bỏ đường dây tua, như ô 48 px trong `Lockups.dc.html`).
- `components/ui/Logo.tsx` viết lại theo SVG mới; test icon hiện có cập nhật theo.

### 5.4 Thành phần

Mới: `MegaMenu`, `MobileMenu` (thay `MobileNav`), `FactStrip` (dải dữ kiện), `FeatureRow` (khối xen trái phải có tag),
`RoleTabs` (tab theo vai trò), `Breadcrumb`, `TopicLayout` và các khối của nó (`InShort`, `CompareTable`,
`HowToSteps`, `Limits`, `RelatedTopics`), `DocsLayout` (`DocsSidebar`, `DocsDrawer`, `DocsToc`, `DocsPager`),
`Figure` (ảnh MDX bắt buộc `src`, `alt`, `width`, `height`).

Đổi giao diện, giữ hành vi: `Button` (chính cam chữ ink; phụ nền olive chữ trắng; viền olive; link có mũi tên), `Card`
(bo 16, viền `--line`, bóng mềm ngả olive), `Section` (xen `--surface` và `--paper`), `CtaBand` (nền `--ink`, mảng
loang, nút cam), `Callout`, `WindowFrame`, `Header`, `Footer`, các khối trang chủ và trang cấp hiện có, các thành phần
tải về.

Bo góc: nút 10 px, ảnh 12 px, thẻ 16 px, chip tròn. Icon nét SVG, không emoji.

### 5.5 Chuyển động

Chỉ CSS. Hiện dần khi cuộn bằng scroll-driven animation (`animation-timeline: view()`) trong `@supports` và
`@media (prefers-reduced-motion: no-preference)`; trình duyệt không hỗ trợ thì nội dung hiện sẵn. Hero và mọi thứ trên
màn đầu **không** có hiệu ứng vào: hiện đủ ngay từ HTML (LCP, và bot AI không chạy JS). Ảnh hero nghiêng nhẹ bằng
`transform`, hai thẻ số nổi cạnh ảnh.

### 5.6 Truy cập

Giữ các luật của spec 30/09 §8.3: skip link, focus ring rõ, `aria-current`, vùng bấm ≥ 44 px trên điện thoại, không
cuộn ngang ở 390 và 768 px. Thêm: mega menu và tab theo vai trò đúng mẫu ARIA; tab dùng `hidden` (nội dung vẫn trong
HTML).

## 6. Trang chủ

Mười bốn khối, theo thứ tự. Chữ là bản nháp định hướng; bản cuối viết vào `messages/*.json` trước khi dựng canvas.

1. **Header** (mục 4.4).
2. **Hero**:
   - Eyebrow "Ứng dụng desktop cho macOS và Windows".
   - H1 là câu danh mục chứa từ khoá chính: "Phần mềm AI cho giáo viên: soạn đề kiểm tra, giáo án và đề cương học phần".
   - Lead nêu đối tượng (giáo viên phổ thông, giảng viên, Phòng Đảm bảo chất lượng) và cách làm (máy dựng khung, AI
     điền, thầy cô duyệt và ký).
   - Nút cam tải theo hệ điều hành, nút viền "Xem hướng dẫn".
   - Dòng tin cậy: "Dữ liệu ở máy thầy cô · Chi phí hiện trước khi chạy · Người duyệt, người ký".
   - Ảnh Trang chủ có trợ lý, nghiêng nhẹ, hai thẻ số nổi lấy từ `app-facts`.
3. **Dải dữ kiện** (thay cho "770.000+ khách hàng" của LadiPage): bốn ô từ `app-facts`, ví dụ "3 cấp trong một app",
   "24 mã đề tối đa mỗi đề", "0 đồng cho việc chạy tại máy", "macOS và Windows: Apple Silicon, Intel, x64". Không số
   khách hàng, số giờ tiết kiệm, chứng nhận.
4. **Một app cho ba cấp**: ba thẻ tới ba pillar, mỗi thẻ ba kết quả (nội dung cũ), anchor là từ khoá pillar.
5. **Khối tính năng xen trái phải có tag**, bốn khối, mỗi khối link xuống spoke:
   - Đề kiểm tra theo ma trận và trộn mã đề → `/ai-tao-de-kiem-tra-theo-ma-tran`, `/tron-de-trac-nghiem`.
   - Giáo án 5512 và slide có quiz → `/ai-soan-giao-an`, `/tao-slide-bai-giang-bang-ai`.
   - Trợ lý AI luôn có mặt → `/tro-ly-ai`.
   - Đề cương học phần và rà soát chương trình → `/de-cuong-chi-tiet-hoc-phan`, `/ra-soat-chuong-trinh-dao-tao`.
6. **Tab theo vai trò**: Giáo viên phổ thông · Tổ trưởng chuyên môn · Giảng viên · Phòng Đảm bảo chất lượng. Mỗi tab có
   ba gạch đầu dòng việc hằng ngày, một ảnh, link bài hướng dẫn phù hợp. Mọi tab nằm trong HTML.
7. **Quy trình 5 bước** (giữ từ spec 30/09): Thiết lập → Trợ lý đề xuất → Cổng chất lượng → Duyệt và ký → Xuất tệp.
8. **Minh bạch và an toàn**, lưới 6 ô, link Minh bạch AI (giữ).
9. **Chi phí theo mức dùng**, link Cách tính phí (giữ).
10. **Hướng dẫn nổi bật** (mới): bốn thẻ tới bài hướng dẫn (Bắt đầu, Soạn đề kiểm tra, Soạn giáo án 5512, Dùng trợ lý
    AI) và link "Tất cả hướng dẫn".
11. **Tải về**: ba thẻ nền tảng, dùng chung dữ liệu feed với trang Tải về; trạng thái sắp phát hành như cũ.
12. **Hỏi đáp 10 câu**: 8 câu cũ cộng "EduFlow là gì?" (trả lời bằng câu mô tả chuẩn, mục 8.1) và "EduFlow khác ChatGPT
    thế nào?" (link `/eduflow-va-chatgpt`). `<details>`, câu trả lời luôn trong DOM, FAQPage dựng từ cùng mảng.
13. **Dải CTA cuối** nền `--ink`: "Mang EduFlow về tổ chuyên môn, bộ môn hay phòng đảm bảo chất lượng" · Tải EduFlow ·
    Liên hệ tư vấn.
14. **Footer** (mục 4.4).

## 7. Khuôn trang

### 7.1 Pillar (ba trang cấp)

Giữ nội dung của `LevelPage` hiện có, khoác hệ thiết kế mới, theo thứ tự:

1. Breadcrumb, chip cấp, H1 chứa từ khoá chính, lead, hai nút.
2. Ảnh màn chính.
3. Kết quả thầy cô nhận được.
4. Khối tính năng xen trái phải (ba ảnh hiện có).
5. Dải cổng chất lượng.
6. **Trang chủ đề của cấp này** (mới): `/k12` có bốn spoke Phổ thông; `/university` có `/de-cuong-chi-tiet-hoc-phan`;
   `/program` dẫn lại `/de-cuong-chi-tiet-hoc-phan` và `/eduflow-va-chatgpt`.
7. **Hướng dẫn liên quan** (mới).
8. Hỏi đáp 5 câu (mới, FAQPage).
9. Dải CTA.

JSON-LD: WebPage (`about`, `mentions` → phần mềm), BreadcrumbList, FAQPage.

### 7.2 Trang chủ đề (6 trang)

Bài 1.200 tới 1.800 chữ, viết để được trích (seo-master `strategy.md` §4, `ai-search.md` §3). Thứ tự:

1. Breadcrumb · eyebrow (từ khoá phụ) · H1 chứa từ khoá chính · lead trả lời ngay trong 2 tới 3 câu · nút Tải EduFlow, Đọc
   hướng dẫn.
2. Ô **Tóm tắt**: câu trả lời gọn, từ khoá in đậm.
3. H2 "<Từ khoá> là gì?" mở bằng câu định nghĩa in đậm, tự đủ nghĩa.
4. H2 so sánh: `<table>` thật (làm tay, ChatGPT hay công cụ chung, EduFlow) theo các tiêu chí của chủ đề.
5. H2 cách làm bằng EduFlow: các bước có ảnh; mỗi bước link bài hướng dẫn.
6. H2 **"EduFlow chưa làm gì"**: giới hạn thật, lấy từ `v2-scope` của app.
7. Chủ đề liên quan và link lên pillar.
8. Hỏi đáp 5 câu.
9. Dải CTA. Màn rộng có mục lục "Trong trang" bám phải.

Nội dung là module có kiểu `content/topics/{vi,en}.ts` (như DocOps), một mảng dẫn routes, sitemap, footer, mega menu,
`llms.txt`, JSON-LD `keywords`. JSON-LD: WebPage (`about` là chủ đề, `keywords`, `mentions` → phần mềm, `isPartOf` →
website), BreadcrumbList, FAQPage. Ảnh chia sẻ riêng mỗi trang.

Điểm riêng từng trang:

- `/ai-tao-de-kiem-tra-theo-ma-tran`:
  - Giải thích ma trận và bản đặc tả.
  - Nói đúng là app dùng bốn mức NB, TH, VD, VDC; ba mức Biết, Hiểu, Vận dụng của Công văn 7991 nằm trong lộ trình
    (OQ-218 của app).
  - Nói đúng là v1 chỉ có câu nhiều lựa chọn; đúng sai, trả lời ngắn, tự luận có ý thuộc E2a của v2.
- `/tron-de-trac-nghiem`: nhiều mã đề, xáo trộn tất định, tối đa 24 mã (E1 của app); không nói tới trộn đề "cấu trúc
  2025" ba phần nếu v1 chưa có.
- `/ai-soan-giao-an`: giáo án theo CV5512, các môn có trong v1 (môn chỉ có ở gói đầy đủ như Ngữ văn, Tiếng Việt thì ghi
  là chưa có, theo câu hỏi 25 của `v2-scope`).
- `/tao-slide-bai-giang-bang-ai`: mẫu slide S1 tới S3b của app, quiz trong slide; xuất PPTX sửa được là v2 (OQ-142).
- `/de-cuong-chi-tiet-hoc-phan`: cấu trúc đề cương, CLO, cách viết; phần "cách làm bằng EduFlow" theo R6.
- `/eduflow-va-chatgpt`: so sánh trung thực, không chê; khi nào ChatGPT đủ dùng, khi nào cần EduFlow; bảng có ngày
  kiểm tra. Title tuyệt đối "EduFlow và ChatGPT: soạn đề, giáo án khác gì?" (không thêm hậu tố, tránh lặp tên).

### 7.3 Mục lục hướng dẫn `/huong-dan`

H1 "Hướng dẫn sử dụng EduFlow", lead, khối "Bắt đầu trong 5 phút" (cài, kích hoạt, soạn đề đầu tiên), bốn nhóm thẻ bài
theo mục 7.4, khối "Không tìm thấy?" (Liên hệ, Tải về). JSON-LD: CollectionPage, BreadcrumbList.

### 7.4 Bài hướng dẫn (12 bài)

Bố cục ba cột từ 1024 px: thanh bên theo nhóm (bài đang đọc có `aria-current`), nội dung, mục lục trong bài. Dưới 1024
px: nút "Mục lục hướng dẫn" mở ngăn kéo; mục lục bài thu vào đầu bài (`<details>`).

Trong bài:
- Breadcrumb "Hướng dẫn › Nhóm › Bài", H1, lead (bằng `description`), dòng "Cập nhật <ngày>".
- Bước đánh số, ảnh trong `Figure`, khối lưu ý, khối lệnh sao chép được (component có sẵn của hướng dẫn cài đặt).
- Bài trước, bài sau. Khối "Đọc thêm" tới spoke tương ứng. Khối "Không giải được? Liên hệ · Tải EduFlow".

JSON-LD: TechArticle (`headline`, `description`, `dateModified`, `articleSection`, `image`, `isPartOf` website,
`publisher` đủ tên và logo), BreadcrumbList. Bỏ `HowTo` (Google ngừng rich result HowTo từ 2023).

| Nhóm | Bài | Slug vi | Slug en | Nguồn trong `eduflow-application` |
|---|---|---|---|---|
| Bắt đầu | Cài trên macOS | `cai-dat-macos` | `install-macos` | MDX cài đặt hiện có; kế hoạch R1 (bản chưa ký, Gatekeeper) |
| Bắt đầu | Cài trên Windows | `cai-dat-windows` | `install-windows` | MDX cài đặt hiện có; R1 (NSIS, SmartScreen) |
| Bắt đầu | Kích hoạt key và dùng thử | `kich-hoat-va-dung-thu` | `activation-and-trial` | RK1, M1c1, US-101 tới US-108 |
| Bắt đầu | Làm quen giao diện | `lam-quen-giao-dien` | `interface-tour` | vỏ macOS 26, onboarding |
| Phổ thông | Soạn đề kiểm tra | `soan-de-kiem-tra` | `create-a-test` | M2b lean |
| Phổ thông | Xuất nhiều mã đề | `xuat-nhieu-ma-de` | `export-test-versions` | E1 |
| Phổ thông | Soạn giáo án 5512 | `soan-giao-an-5512` | `lesson-plans` | M2c lean |
| Phổ thông | Tạo slide bài giảng | `tao-slide-bai-giang` | `lesson-slides` | M2c, slide S1 tới S3b |
| Trợ lý và tài liệu | Dùng trợ lý AI | `dung-tro-ly-ai` | `using-the-assistant` | M1g (phạm vi đã thu hẹp) |
| Trợ lý và tài liệu | Nạp tài liệu | `nap-tai-lieu` | `adding-documents` | DR1, DR1b, DR2a (đọc và OCR tại máy) |
| Chi phí và vận hành | Chi phí và ngân sách | `chi-phi-va-ngan-sach` | `costs-and-budget` | M1f, spec app §8 |
| Chi phí và vận hành | Xử lý sự cố | `xu-ly-su-co` | `troubleshooting` | R1 (cập nhật, gỡ cài, dữ liệu nằm ở đâu, Gatekeeper, SmartScreen) |

Mọi chi tiết thao tác (tên nút, đường đi màn, giới hạn) lấy từ `main` của app tại lúc viết bài, không từ spec gốc
30/09 của app, vì v1 đã cắt bớt.

**Nội dung là MDX** `content/docs/{vi,en}/<slug>.mdx`, thêm `content/docs/index.ts` (bảng import tĩnh và sổ đăng ký:
`id`, nhóm, thứ tự, slug theo ngôn ngữ). Sổ đăng ký dẫn `generateStaticParams`, thanh bên, bài trước và bài sau, sitemap,
`llms.txt`, và link đổi ngôn ngữ: slug hai ngôn ngữ khác nhau, nên `LocaleSwitcher` nhận URL đích từ trang, không tự
suy. Frontmatter được kiểm khi build, sai thì build dừng và báo tên tệp, tên trường:

| Trường | Luật |
|---|---|
| `title` | H1; `title` + hậu tố (" · Hướng dẫn EduFlow", tiếng Anh " · EduFlow Docs") ≤ 60 ký tự, nếu dài hơn thì bắt buộc `metaTitle` |
| `description` | 110 tới 160 ký tự; là meta description và lead |
| `group`, `order` | nhóm thuộc bốn nhóm ở trên; thứ tự không trùng trong nhóm |
| `updatedAt` | `YYYY-MM-DD` thật, không ở tương lai |
| `topic` | khoá một trang chủ đề có thật, hoặc bỏ trống |

Thân bài: heading bắt đầu từ `##`, không sâu hơn `####`, không link trong heading, không cú pháp ảnh Markdown (dùng
`Figure`).

`/huong-dan/x` lạ trả 404 thật trong khung docs (`dynamicParams` và `notFound()` trước mọi Suspense; không có
`loading.tsx` ở nhánh này).

### 7.5 Các trang còn lại

Trợ lý AI, Cách tính phí, Tải về, Minh bạch AI, Liên hệ, Bảo mật, 404, lỗi: giữ nội dung và hành vi theo spec 30/09,
khoác hệ thiết kế mới, viết lại title và description theo mục 9.2, thêm breadcrumb. Trang Tải về:
- Bỏ mọi câu khẳng định bộ cài "đã ký số". Theo kế hoạch R1 của app, bộ cài chỉ ký và notarize khi có chứng thư; chưa có
  thì là bản ad-hoc kèm cảnh báo.
- Câu chữ về ký số đọc từ một cờ trong `app-facts`. Bài cài đặt nói rõ Gatekeeper, SmartScreen hiện gì và cách mở.

## 8. Nội dung

### 8.1 Định danh thương hiệu (`lib/seo/brand.ts`)

Chép khuôn của DocOps. Các trường (bản nháp, PO duyệt ở OQ-R1):

- `name`: "EduFlow"; `alternateName`: "Agentra EduFlow".
- `category`: vi "Phần mềm AI cho giáo viên và giảng viên"; en "AI software for teachers and lecturers".
- `description` (**câu mô tả chuẩn**, dùng nguyên văn ở meta trang chủ, `Organization` và `SoftwareApplication`,
  `llms.txt`, mọi hồ sơ ngoài):
  - vi (146 ký tự): "EduFlow là phần mềm AI cho giáo viên và giảng viên: soạn đề kiểm tra theo ma trận, giáo án, slide, đề cương học
    phần, có trợ lý AI và người duyệt."
  - en (150 ký tự): "EduFlow is AI software for teachers and lecturers: matrix-based tests, lesson plans, slides and course syllabi,
    with an AI assistant and human review."
- `disambiguation`: "EduFlow của Agentra JSC (Đà Nẵng, Việt Nam) là ứng dụng desktop cho giáo viên và giảng viên, không
  phải nền tảng học tập cộng tác Eduflow (eduflow.com, nay thuộc Multiverse)." Lý do: tên "Eduflow" đã có chủ trên
  mạng; thiếu câu này, trợ lý AI và Google dễ nhầm hai sản phẩm.
- `organization`, `audience`, `features` (chỉ tính năng có thật), `sameAs` (chỉ hồ sơ có thật, OQ-R3).

### 8.2 Dữ kiện sản phẩm (`lib/seo/app-facts.ts`)

Nguồn duy nhất cho mọi con số và khẳng định về app trên site (dải dữ kiện, thẻ số nổi ở hero, trang chủ đề, hỏi đáp,
JSON-LD `featureList`). Mỗi dữ kiện ghi nguồn trong app và một dòng chú thích "giữ cho đúng sự thật". Danh sách ban đầu,
**kiểm lại với `main` của app trước khi dùng**:

| Dữ kiện | Giá trị dự kiến | Nguồn |
|---|---|---|
| Số mã đề tối đa | 24 | E1 (`v2-scope` §2) |
| Mức của ma trận | 4 (NB, TH, VD, VDC) | spec app; OQ-218 còn mở |
| Việc chạy tại máy | 0 đồng (cổng, trộn đề, đọc và OCR tại máy) | spec app §8, DR2a |
| Hệ điều hành | macOS (Apple Silicon, Intel), Windows x64 | R1 |
| Bộ cài đã ký | `false` tới khi có chứng thư | R1, M1c2 |
| Số cổng chất lượng của đề Phổ thông | kiểm lại M2b lean trước khi ghi "12 cổng" | M2b |

### 8.3 Luật nội dung

Giữ spec 30/09 §15 (không hứa kiểm định, không nói AI thay giáo viên, không bịa số, không ký tự gạch ngang dài U+2014,
thuật ngữ theo glossary của app). Thêm:

- Mọi con số và khẳng định về app đi qua `app-facts` (có test, mục 12.1).
- Câu định nghĩa in đậm và ô Tóm tắt viết để đứng một mình vẫn đúng khi bị trích riêng.
- Mỗi trang chủ đề có mục "EduFlow chưa làm gì".
- Bảng so sánh có ngày kiểm tra; không nhận xét tiêu cực về công cụ khác khi không có nguồn.
- Bản tiếng Anh dịch sát, cùng cấu trúc, cùng câu hỏi trong hỏi đáp.

## 9. SEO kỹ thuật

### 9.1 Đủ bảng "Required deliverables" của seo-master

| Hạng mục | Làm gì |
|---|---|
| Gốc canonical | Một hằng từ `NEXT_PUBLIC_SITE_URL` = `https://eduflow.agentra.io.vn`; giữ chốt chặn build production khi thiếu hay sai |
| Module chữ SEO | `brand.ts` (mục 8.1) và chữ SEO từng trang; chú thích bản đồ từ khoá ở đầu |
| `pageMetadata` | Mọi trang indexable dùng; trả đủ `openGraph`, `twitter` kèm ảnh; không canonical, không `og:url` ở layout |
| robots | Cho phép tất cả; nhóm riêng `Allow: /` cho OAI-SearchBot, ChatGPT-User, GPTBot, Claude-SearchBot, Claude-User, ClaudeBot, PerplexityBot, Perplexity-User, Google-Extended, Applebot-Extended, CCBot; chú thích "nhóm có tên bỏ qua `*`, `Disallow` nào thêm sau phải lặp lại ở mọi nhóm"; `Sitemap` trên gốc canonical |
| sitemap | Đúng 58 URL indexable, có `alternates.languages`; `lastmod` chỉ từ ngày thật (`updatedAt` của bài và chủ đề, ngày cập nhật chính sách, ngày phát hành bản app cho Tải về và trang chủ khi feed có) |
| JSON-LD | Entity graph `@id` ổn định: `/#organization`, `/#website`, `/#software`, `<url>#webpage`; Organization (`logo` PNG 180×180, `sameAs` thật), WebSite, SoftwareApplication (`applicationCategory` EducationalApplication, `operatingSystem`, `featureList` từ `app-facts`, `softwareVersion` và `downloadUrl` từ feed, `softwareHelp` → `/huong-dan`, không `offers`, không `aggregateRating`), FAQPage dựng từ mảng đang hiển thị, BreadcrumbList, WebPage, TechArticle, CollectionPage; builder có test `toEqual` |
| Ảnh chia sẻ | 1200×630 cho mọi trang indexable: tệp quy ước `opengraph-image` cho trang tĩnh; route handler theo slug `/og/docs/[slug]` (`force-static`, `generateStaticParams`, `dynamicParams = false`) cho bài hướng dẫn; font Be Vietnam Pro từ `assets/fonts`; chữ lấy từ module nội dung |
| Ma trận index | 404 thật ở gốc và trong `/huong-dan`; 308 ở mục 4.3; preview gắn `X-Robots-Tag: noindex` khi `VERCEL_ENV === 'preview'`; bí danh `*.vercel.app` 308 về domain chính; 404 có `robots: noindex, follow` |
| Một URL mỗi trang | Không dấu `/` cuối; framework routing không có `*.html` |
| `llms.txt`, `llms-full.txt` | Route tĩnh, sinh từ `brand.ts`, `content/topics`, `content/docs` (chép khuôn `lib/seo/llms.ts` của DocOps); `text/plain; charset=utf-8`; RSS không áp dụng vì chưa có blog |
| Kiểm nội dung khi build | Frontmatter docs, độ dài chữ SEO, khoá `app-facts` |

### 9.2 Title và description

- Template `%s · EduFlow`; trang chủ dùng `title.absolute`. Title ≤ 60 ký tự **kể cả** hậu tố; description 110 tới 160
  ký tự; mỗi trang một giá trị riêng. Trang nào đã có "EduFlow" trong title thì dùng `absolute` để không lặp.
- Bản nháp đã đếm ký tự:
  - Trang chủ: "EduFlow · Phần mềm AI cho giáo viên soạn đề, giáo án" (52); "EduFlow · AI software for teachers: tests,
    lesson plans" (55).
  - Pillar Phổ thông: "AI cho giáo viên phổ thông: đề kiểm tra, giáo án · EduFlow" (58).
  - Trang chủ đề ma trận: "AI tạo đề kiểm tra theo ma trận và bản đặc tả · EduFlow" (55).
  - Bài hướng dẫn: "<Bài> · Hướng dẫn EduFlow" qua `titleSuffix` của helper.
- Sửa ba title tiếng Anh đang quá dài (mục 2).

### 9.3 Hiệu năng

- Trang nội dung sinh tĩnh (không phụ thuộc `htmlLimitedBots` cho bot AI).
- Ảnh qua `next/image`, đủ `width`, `height`, `sizes`. Ảnh hero `priority`. Ảnh sản phẩm WebP ≤ 200 KB như cũ.
- Font qua `next/font`, `display: swap`.
- Không thư viện chuyển động.
- JS phía client chỉ cho: mega menu, menu điện thoại, tab vai trò, ngăn kéo docs, đổi ngôn ngữ, nút tải theo hệ điều
  hành, sao chép checksum, thanh cookie.

## 10. Quy trình Claude Design

Như spec 30/09 §8.4 và `docs/thiet-ke/README.md`: canvas `.dc.html` phát hành bằng công cụ Artifact (riêng tư), PO
chỉnh trên canvas, code bám canvas đã duyệt. Đợt này:

1. **Chữ trước**: chữ tiếng Việt của trang chủ, pillar, một trang chủ đề, mục lục và một bài hướng dẫn viết vào
   `messages/vi.json`, `content/topics/vi.ts`, MDX, rồi mới dựng artboard. Chữ trên artboard lấy nguyên văn từ đó.
2. **Canvas mới** ở `docs/thiet-ke/v2/canvas/project/`. Canvas cũ (Phấn xanh) chuyển vào `docs/thiet-ke/v1/`.
   README ghi cả hai URL.
3. **Artboard**. Artboard dài hơn 8.000 px thì cắt nối tiếp như lần trước.

   | Artboard | Kích thước |
   |---|---|
   | Trang chủ desktop VI | 1440, cắt hai |
   | Trang chủ điện thoại VI | 390, cắt hai hoặc ba |
   | Mega menu đang mở | 1440 × 900 |
   | Menu điện thoại đang mở | 390 × 844 |
   | Pillar "AI cho giáo viên" | 1440 |
   | Trang chủ đề "AI tạo đề kiểm tra theo ma trận" | 1440 |
   | Mục lục hướng dẫn | 1440 |
   | Bài "Soạn đề kiểm tra" | 1440 và 390 (ngăn kéo mở) |
   | Tải về, hai trạng thái (có bản phát hành, sắp phát hành) | 1440 |

4. **Cổng duyệt**: PO duyệt canvas trước khi code giao diện. Tài sản thương hiệu và chữ SEO có thể làm song song trước cổng
   này.
5. Ảnh sản phẩm trên canvas: chụp lại từ canvas app mới nhất (vỏ macOS 26), không dùng bộ 13 ảnh chụp ngày 30/09.

## 11. Thay đổi mã (bản đồ)

| Vùng | Thay đổi |
|---|---|
| `i18n/routing.ts` | Đường dẫn mới ở mục 4.2; thêm khoá sáu trang chủ đề, `/docs`, `/docs/[slug]`; bỏ `/install/[os]` |
| `next.config.ts` | `redirects()` mục 4.3; header `X-Robots-Tag` cho preview |
| `app/[locale]/...` | Thư mục cho sáu trang chủ đề (mỗi trang gọi `TopicPage` chung, mỗi trang một `opengraph-image`); `docs/page.tsx`, `docs/[slug]/page.tsx`; xoá `install/[os]` |
| `app/og/docs/[slug]/route.tsx` | Ảnh chia sẻ bài hướng dẫn |
| `app/llms.txt/route.ts`, `app/llms-full.txt/route.ts` | Mới |
| `app/robots.ts`, `app/sitemap.ts`, `app/manifest.ts`, icon | Mục 5.3, 9.1 |
| `lib/seo/` | `brand.ts`, `app-facts.ts`, `llms.ts` mới; `jsonld.ts` thêm `@id` và các builder mới, bỏ `HowTo`; `metadata.ts` thêm `titleSuffix`, ảnh tường minh |
| `content/` | `topics/{vi,en}.ts`; `docs/{vi,en}/*.mdx` và `docs/index.ts`; chuyển hai MDX cài đặt vào `docs/` |
| `components/` | Mục 5.4; `site/` (Header, MegaMenu, MobileMenu, Footer, LocaleSwitcher nhận URL đích); `home/` thêm FactStrip, FeatureRow, RoleTabs, DocsHighlights; `topic/`, `docs/` mới; `level/` thêm hai khối link và hỏi đáp |
| `app/globals.css` | Token mục 5.1, chuyển động mục 5.5 |
| `public/brand/`, `public/images/product/` | Logo SVG; ảnh chụp lại |
| `messages/*.json` | Chữ mới, cùng tập khoá hai ngôn ngữ |
| `scripts/capture-product-images.mjs` | Chụp từ canvas app mới; thêm ảnh cho bài hướng dẫn |
| `.github/workflows/ci.yml` | Thêm bước `seo-audit.mjs` trên build production |
| `README.md`, `docs/van-hanh.md`, `docs/thiet-ke/README.md` | Cấu trúc, cách thêm bài hướng dẫn và trang chủ đề, quy trình SEO sau ra mắt |

## 12. Kiểm thử và chất lượng

### 12.1 Unit (Vitest)

Giữ test hiện có, sửa theo đường dẫn mới. Thêm:
- Title ≤ 60 ký tự kể cả hậu tố, description 110 tới 160 ký tự, mọi trang, hai ngôn ngữ.
- Không hai URL trùng từ khoá chính.
- Builder JSON-LD so khớp `toEqual` toàn bộ object, `@id` ổn định.
- FAQPage dựng từ đúng mảng mà trang hiển thị.
- Frontmatter docs: mọi luật ở mục 7.4, cả trường hợp báo lỗi.
- Sổ đăng ký docs: slug hợp lệ `^[a-z0-9]+(?:-[a-z0-9]+)*$`, đủ hai ngôn ngữ, không trùng.
- Sitemap đúng 58 URL và bằng tập trang indexable; `llms.txt` liệt kê đúng tập đó; `lastmod` không bao giờ là ngày build.
- robots có đủ nhóm bot AI.
- Không link nội bộ nào trỏ vào nguồn của một chuyển hướng ở mục 4.3 hoặc vào `/vi/...`.
- Dữ kiện app khớp `app-facts`: test quét `messages/*.json`, `content/topics`, `content/docs` tìm các mẫu đã biết
  ("<số> mã đề", "<số> cổng", "<số> mức", "đã ký số", "notarize"; bản tiếng Anh tương ứng) và bắt giá trị phải khớp
  `app-facts`. Cách quét như test giá hiện có.
- Khoá vi và en khớp; không ký tự U+2014.

### 12.2 E2E (Playwright, trên `next build && next start`)

- Mỗi trang × 2 ngôn ngữ: 200, đúng `<html lang>`, một H1, canonical tự trỏ, hreflang đủ, JSON-LD parse được.
- 308 cho từng URL cũ ở mục 4.3; 404 thật cho `/x`, `/huong-dan/x`, `/en/docs/x`.
- Mega menu: mở và đóng bằng chuột và bàn phím, focus trả về nút. Menu điện thoại ở 390 px.
- Ngăn kéo docs ở 390 px. Tab vai trò bằng phím mũi tên.
- Đổi ngôn ngữ ở một bài hướng dẫn tới đúng slug tiếng Anh.
- Không cuộn ngang ở 390 và 768 px. Không lỗi console.
- Giữ nguyên bộ test feed: ba chế độ feed, một hệ điều hành, sắp phát hành, consent.

### 12.3 Lighthouse CI và cổng SEO

- Lighthouse preset mobile: trang chủ, `/ai-cho-giao-vien`, `/ai-tao-de-kiem-tra-theo-ma-tran`,
  `/huong-dan/soan-de-kiem-tra`, `/tai-ve`, cả hai ngôn ngữ; ngưỡng ở mục 1.
- `node ~/.claude/skills/seo-master/scripts/seo-audit.mjs` trên build production (`VERCEL_ENV=production`,
  `NEXT_PUBLIC_SITE_URL=https://eduflow.agentra.io.vn`) với `--next-manifest .next/prerender-manifest.json`: thoát 0.
- Trên CI, chép script vào `scripts/seo-audit.mjs` (không phụ thuộc thư mục home của máy dev) và chạy sau build.

## 13. Triển khai, vận hành, đo lường

### 13.1 Triển khai

Vercel Git integration như cũ. Gắn `eduflow.agentra.io.vn` (bản ghi DNS ở nhà cung cấp của `agentra.io.vn`). Đặt
`NEXT_PUBLIC_SITE_URL` cho Production và Preview. Đặt `DOWNLOAD_FEED_URL` là feed kênh ổn định. Kế hoạch R1 của app
đặt feed ở `download-eduflow.agentra.io.vn` (thư mục `/opt/eduflow/downloads/desktop` trên VPS), nên giá trị dự kiến
là `https://download-eduflow.agentra.io.vn/desktop/`; xác nhận ở OQ-L02.

### 13.2 Ngày ra mắt (thêm vào `docs/van-hanh.md`)

1. Chạy `seo-audit.mjs` trên domain thật (`--base https://eduflow.agentra.io.vn`), thoát 0. `curl -sI` cho bí danh
   `*.vercel.app`, một URL cũ ở mục 4.3 và `/huong-dan/x`.
2. Google Search Console: xác minh bằng `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`, gửi sitemap, yêu cầu index trang chủ
   và ba pillar.
3. Bing Webmaster Tools: nhập từ Search Console, gửi sitemap. ChatGPT search và Copilot trả lời từ chỉ mục của Bing.
4. Google Rich Results Test và validator.schema.org cho trang chủ, một pillar, một trang chủ đề, một bài hướng dẫn.
5. Cập nhật câu mô tả chuẩn lên các hồ sơ ngoài có thật (trang công ty Agentra, Facebook, LinkedIn nếu có), rồi thêm vào
   `sameAs`.

### 13.3 Theo dõi hằng tháng

- Search Console: số URL được index, lý do không index, truy vấn có lượt hiển thị.
- Bộ 25 câu hỏi cố định chạy trên ChatGPT, Perplexity, Claude, Gemini. Ví dụ: "EduFlow là gì", "phần mềm AI soạn đề
  kiểm tra theo ma trận", "AI soạn giáo án 5512", "EduFlow và ChatGPT". Ghi lại: có nhắc tới EduFlow không, đúng dữ kiện
  không, trích URL nào. Câu nào sai thì sửa trang nguồn.
- GA4 (nếu bật): kênh riêng cho nguồn giới thiệu từ chatgpt.com, perplexity.ai, claude.ai, gemini.google.com,
  copilot.microsoft.com.
- Mỗi tháng thêm 2 tới 4 trang mới (spoke hoặc bài hướng dẫn) theo truy vấn thật trong Search Console.

## 14. Thứ tự triển khai

Mỗi giai đoạn để `main` xanh và site chạy được.

1. **Nền**: tài sản thương hiệu (logo SVG, icon), token và font, `brand.ts`, `app-facts.ts` (đã kiểm với app),
   routing và chuyển hướng, `pageMetadata` mới.
2. **Chữ**: tiếng Việt của trang chủ, pillar, sáu trang chủ đề; khung 12 bài hướng dẫn.
3. **Canvas Claude Design** và **cổng PO duyệt** (mục 10).
4. **Khung site**: các thành phần mục 5.4, Header, mega menu, menu điện thoại, Footer; trang chủ.
5. **Pillar và các trang còn lại** khoác giao diện mới.
6. **Sáu trang chủ đề**.
7. **Trung tâm hướng dẫn**: hệ docs và 12 bài × 2 ngôn ngữ (cần ảnh, OQ-R2).
8. **SEO hoàn chỉnh**: robots, sitemap, entity graph, ảnh chia sẻ, `llms.txt`, kiểm nội dung khi build; cổng
   `seo-audit` trên CI; bản tiếng Anh rà xong.
9. **Ra mắt** theo mục 13.2.

## 15. Giả định, câu hỏi mở, rủi ro

Giả định:

- `AS-R1`: Màu và hình học logo lấy từ `Lockups.dc.html` (ink `#567F2E`, accent `#F2A541`) là bản chốt.
- `AS-R2`: Cho phép cả bot huấn luyện AI (GPTBot, ClaudeBot, Google-Extended, CCBot...). Đây là mặc định của seo-master
  cho thương hiệu mới.
- `AS-R3`: Bản tiếng Anh do đội dev dịch, PO rà thuật ngữ (như AS-L04).

Câu hỏi mở:

- `OQ-R1` (PO): duyệt câu mô tả chuẩn, danh mục và câu phân biệt ở mục 8.1.
- `OQ-R2` (Tech lead app): ai chụp ảnh màn app v1 thật cho bài hướng dẫn (kích hoạt, hộp xuất đề, trợ lý, nạp tài liệu)?
  Canvas app có thể chưa có đủ các màn này.
- `OQ-R3` (PO): những hồ sơ ngoài nào có thật để đưa vào `sameAs` (Facebook, LinkedIn, YouTube của Agentra hay của
  EduFlow)?
- `OQ-L02` (Tech lead): xác nhận `DOWNLOAD_FEED_URL` = `https://download-eduflow.agentra.io.vn/desktop/`.
- Còn mở từ spec 30/09: OQ-L03 (GA4), OQ-L04 (điện thoại, Zalo), OQ-L05 (dung lượng bộ cài), OQ-L06 (số liệu dùng thử),
  OQ-L07 (tên nhà cung cấp mô hình).

Rủi ro:

- `K1` (R6): site quảng bá Học phần và Chương trình trong khi app v1 chỉ có Phổ thông. Người tải về có thể không thấy
  tính năng đã đọc trên site. Trợ lý AI có thể trích các trang này như thể tính năng đã có. Giảm rủi ro trong phạm vi R6:
  - bài hướng dẫn chỉ viết cho v1;
  - trang chủ đề có mục "EduFlow chưa làm gì";
  - hỏi đáp có câu về lộ trình nếu PO đồng ý.

  PO có thể đổi R6 bất cứ lúc nào. Khi đó thêm nhãn "Sắp có" cho hai pillar, không cần đổi cấu trúc.
- `K2`: tên "Eduflow" đã thuộc một sản phẩm khác (eduflow.com), nên truy vấn thương hiệu trần "eduflow" khó lên đầu.
  Giảm: câu phân biệt, `alternateName` "Agentra EduFlow", nhắm từ khoá theo việc thay vì tên thương hiệu.
- `K3`: app đổi giao diện nhanh trước GA, nên ảnh và thao tác trong bài hướng dẫn dễ lệch. Giảm: `updatedAt` thật, ảnh chụp
  bằng script làm lại được, rà bài hướng dẫn trong danh sách phát hành của mỗi bản app.
- `K4`: domain mới không có backlink, nên traffic tới chậm (seo-master: index tháng 1 tới 2, lượt hiển thị đuôi dài tháng 3
  tới 4). Không đánh giá chiến lược trước tháng 4.
