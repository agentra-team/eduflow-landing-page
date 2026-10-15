# Thiết kế landing page EduFlow

Hai canvas Claude Design cho site: canvas v2 (hướng A, logo mới) là bản đang dùng cho đợt thiết kế lại của spec
`docs/superpowers/specs/2026-10-14-eduflow-redesign-seo-docs-design.md`; canvas v1 (Phấn xanh) là bản cũ, giữ lại để đối chiếu.

## Canvas v2 (hướng A, logo mới)

Nguồn của canvas "EduFlow Landing v2 (hướng A)": 14 artboard ở `v2/canvas/project/`. Hệ thiết kế theo spec mục 5 (màu, chữ Be Vietnam
Pro, logo `public/brand/eduflow-wordmark.svg`, bo góc, không chế độ tối), bố cục tham khảo ladipage.vn (R4). Chữ trên mọi artboard lấy
nguyên văn từ repo: `messages/vi.json`, `content/topics/vi.ts`, sổ bài `content/docs/index.ts` và `content/docs/vi/soan-de-kiem-tra.mdx`,
`content/home.ts` (`HOME_FACTS`, `HOME_LINKS`) và tên trang ở `lib/seo/pages.ts`. Con số lấy từ `lib/seo/app-facts.ts`.

### Artboard

| Tệp | Kích thước | Nội dung |
|---|---|---|
| `v2/canvas/project/Home.dc.html` | 1440 × 5429 | Trang chủ tiếng Việt, desktop, phần 1/2: header, hero (hai thẻ số nổi), dải dữ kiện, ba cấp, bốn khối tính năng xen trái phải, tab vai trò (Giáo viên phổ thông), quy trình 5 bước. Trạng thái có bản phát hành |
| `v2/canvas/project/Home2.dc.html` | 1440 × 5479 | Trang chủ desktop, phần 2/2: minh bạch và an toàn, chi phí, hướng dẫn nổi bật, tải về, hỏi đáp 10 câu (mở hết để duyệt chữ), dải CTA, footer |
| `v2/canvas/project/HomeMobile.dc.html` | 390 × 7495 | Trang chủ trên điện thoại, phần 1/2: header, hero, dải dữ kiện, ba cấp, bốn khối tính năng, tab vai trò (Giảng viên), quy trình 5 bước. Trạng thái sắp phát hành |
| `v2/canvas/project/HomeMobile2.dc.html` | 390 × 6642 | Trang chủ trên điện thoại, phần 2/2: minh bạch và an toàn, chi phí, hướng dẫn nổi bật, khối sắp phát hành, hỏi đáp, dải CTA, footer |
| `v2/canvas/project/MegaMenu.dc.html` | 1440 × 900 | Header với menu Sản phẩm đang mở (spec mục 4.4) |
| `v2/canvas/project/MegaMenuSolutions.dc.html` | 1440 × 620 | Header với menu Giải pháp đang mở (sáu trang chủ đề) |
| `v2/canvas/project/MegaMenuDocs.dc.html` | 1440 × 620 | Header với menu Hướng dẫn đang mở |
| `v2/canvas/project/MobileMenu.dc.html` | 390 × 844 | Menu điện thoại mở: ba nhóm `<details>` (Sản phẩm mở), Cách tính phí, đổi ngôn ngữ, hai nút ở đáy |
| `v2/canvas/project/LevelK12.dc.html` | 1440 × 6784 | Trang "AI cho giáo viên" theo spec mục 7.1 (9 khối), hỏi đáp mở hết |
| `v2/canvas/project/TopicTestGenerator.dc.html` | 1440 × 7352 | Trang chủ đề "AI tạo đề kiểm tra theo ma trận" theo spec mục 7.2, mục lục bám phải |
| `v2/canvas/project/DocsIndex.dc.html` | 1440 × 2655 | Mục lục hướng dẫn theo spec mục 7.3 |
| `v2/canvas/project/DocArticle.dc.html` | 1440 × 6533 | Bài "Soạn đề kiểm tra theo ma trận", ba cột từ 1024 px |
| `v2/canvas/project/DocArticleMobile.dc.html` | 390 × 844 | Bài hướng dẫn trên điện thoại, ngăn kéo "Mục lục hướng dẫn" mở |
| `v2/canvas/project/Download.dc.html` | 1440 × 3170 | Tải về: nửa trên có bản phát hành (khách dùng macOS), nửa dưới sắp phát hành, phần dùng chung; câu ký số theo `download.signing.unsigned` |
| `v2/canvas/project/canvas.json` | | Chỉ mục canvas: vị trí, kích thước, tiêu đề từng artboard, tiêu đề ba hàng và ghi chú |

### Quy ước của canvas v2

- Chữ đổi trên canvas phải chép về repo: `messages/*.json` (cả `vi` và `en`), `content/topics/{vi,en}.ts`, sổ bài `content/docs/index.ts`
  hoặc MDX ở `content/docs/{vi,en}/`, rồi chạy `pnpm verify`.
- Ô viền đứt màu tím là ghi chú của canvas, không phải chữ của trang. Ô ghi "Chữ: chưa có trong repo, cần viết ở Kế hoạch 2" đánh dấu
  chỗ spec cần chữ mà repo chưa có (nhãn mục lục của trang chủ đề, chữ thay thế ảnh của tab vai trò).
- Gạch đầu dòng có dấu kiểm là việc app v1 làm được; gạch đầu dòng có biểu tượng đồng hồ là việc thuộc lộ trình. Công cụ Học phần và
  Chương trình chưa có trong v1: ảnh của chúng ghi "(dự kiến)" theo chữ thay thế của repo.
- Ảnh sản phẩm là khung giữ chỗ ghi "Ảnh: <tên artboard của canvas app>" kèm chữ thay thế. Ảnh thật chụp lại ở Kế hoạch 2 (spec mục 10.5).
- Màu là token của spec mục 5.1, khai báo một lần trong `<helmet>` của từng tệp (`:root { --brand: ...; --ink: ...; }`) và dùng bằng
  `var(--token)`. Ngoài bảng 5.1, canvas thêm `--on-ink-2` (chữ phụ trên nền `--ink` của dải CTA), `--ph-bg`, `--ph-line` (khung ảnh
  giữ chỗ) và `--note`, `--note-bg` (ghi chú canvas). `--accent` không bao giờ là màu chữ.
- Phiên bản 1.0.0, ngày 01/10/2026, tên tệp, dung lượng và mã SHA-512 là dữ liệu mẫu từ fixture `tests/fixtures/latest*.yml`.
- Chiều rộng 1440 px (desktop) và 390 px (điện thoại); chiều cao là chiều cao thật của trang. Trang dài hơn 8000 px cắt thành hai
  artboard nối tiếp.

### Kiểm và xem trước

Chạy từ gốc repo, với repo `eduflow-application` nằm cạnh:

```bash
python3 ../eduflow-application/docs/thiet-ke/tools/check_dc.py docs/thiet-ke/v2/canvas/project/*.dc.html
python3 ../eduflow-application/docs/thiet-ke/tools/preview_dc.py docs/thiet-ke/v2/canvas/project/Home.dc.html macOS /tmp/v2-home.png
```

Với artboard landing, bốn mục "$preview missing", "os prop missing", "root size/overflow missing" và "os chrome sc-if missing" là
bình thường (`MegaMenu.dc.html` đúng 1440 × 900 nên chỉ báo "os prop missing" và "os chrome sc-if missing"). Mọi luật còn lại
phải qua. Luật "màu chữ theo token" của `check_dc.py` liệt kê
bảng Phấn xanh; canvas v2 không dùng mã hex cho màu chữ mà dùng `var(--token)` của spec mục 5.1, nên luật này qua.

### Sửa chữ và cập nhật canvas

- PO sửa trực tiếp trên canvas. Trước khi sửa một tệp ở đây, đọc lại bản trên canvas để không ghi đè thay đổi của PO.
- Sửa tệp trong `v2/canvas/project/` rồi phát hành lại lên cùng URL bằng công cụ Artifact: thư mục gốc là `v2/canvas`, chỉ gửi các tệp
  đã đổi; chỉ gửi `canvas.json` khi thêm, bớt, di chuyển hay đổi kích thước artboard.

## Canvas v1 (Phấn xanh, đã thay)

Nguồn của canvas Claude Design "EduFlow Landing": 8 artboard cho 7 bảng thiết kế của spec 30/09 mục 8.4 (trang chủ trên điện thoại cắt
làm hai artboard). Chữ trên mọi artboard lấy nguyên văn từ `messages/vi.json` lúc đó, riêng `HomeEN.dc.html` lấy từ `messages/en.json`.
Màu, chữ và thành phần theo hệ thống thiết kế Phấn xanh của app (spec mục 8,
`../eduflow-application/docs/thiet-ke/canvas/project/DesignSystem.dc.html`) và theo component của kế hoạch triển khai (Task 4 tới Task 10).
Chữ và logo trên canvas v1 đã cũ; chỉ dùng để đối chiếu.

### Canvas đã phát hành

https://claude.ai/artifact/WFiyfNT13vwaDbHVTAtaPJ

Canvas là artifact riêng tư của tài khoản claude.ai đã phát hành. Muốn PO hay người khác xem, chủ canvas mở menu Share của trang.

### Artboard

| Tệp | Kích thước | Nội dung |
|---|---|---|
| `v1/canvas/project/Main.dc.html` | 1440 × 7659 | Trang chủ tiếng Việt, desktop: header, 9 khối của spec mục 6.1, footer. Trạng thái có bản phát hành. Phần Hỏi đáp mở cả 8 câu để duyệt chữ (trang thật chỉ mở câu đầu) |
| `v1/canvas/project/HomeMobile.dc.html` | 390 × 4568 | Trang chủ tiếng Việt trên điện thoại, phần 1: header, hero, ba cấp, trợ lý AI, quy trình 5 bước |
| `v1/canvas/project/HomeMobile2.dc.html` | 390 × 4886 | Trang chủ trên điện thoại, phần 2: minh bạch và an toàn, chi phí, tải về, hỏi đáp, CTA cuối, footer. Cả hai phần ở trạng thái sắp phát hành |
| `v1/canvas/project/HomeEN.dc.html` | 1440 × 7586 | Trang chủ tiếng Anh, desktop, trạng thái có bản phát hành |
| `v1/canvas/project/LevelK12.dc.html` | 1440 × 4294 | Trang Phổ thông |
| `v1/canvas/project/Assistant.dc.html` | 1440 × 5142 | Trang Trợ lý AI |
| `v1/canvas/project/Pricing.dc.html` | 1440 × 3413 | Trang Cách tính phí, không có đơn giá |
| `v1/canvas/project/Download.dc.html` | 1440 × 2796 | Trang Tải về: nửa trên khi feed có bản phát hành (khách dùng macOS), nửa dưới khi feed và snapshot đều rỗng (sắp phát hành); yêu cầu hệ thống, bộ cài đã ký và footer dùng chung |
| `v1/canvas/project/canvas.json` | | Chỉ mục canvas: vị trí, kích thước, tiêu đề từng artboard, tiêu đề hàng và ghi chú |

### Quy ước

- Ảnh sản phẩm là khung giữ chỗ ghi "Ảnh: <tên artboard của canvas app>" ("Image: ..." trên bảng tiếng Anh) kèm chữ thay thế của ảnh. Task 5 thay bằng WebP chụp từ canvas app.
- Phiên bản 1.0.0, ngày 01/10/2026, tên tệp, dung lượng và mã SHA-512 trên thẻ tải về là dữ liệu mẫu lấy từ fixture `tests/fixtures/latest*.yml` của kế hoạch. Tên công ty, thành phố và email lấy từ `lib/site.ts`, còn tạm tới khi có câu trả lời OQ-L04.
- Chiều rộng giữ đúng 1440 px (desktop) và 390 px (điện thoại). Chiều cao là chiều cao thật của trang ở nhịp spec mục 8.3 (section 96 px trên desktop, 64 px trên điện thoại): các con số kế hoạch ước (3600, 5200, 2600, 2800, 2600, 1800 px) không chứa đủ chữ. Trang chủ trên điện thoại cao khoảng 9450 px, vượt giới hạn 8000 px của một artboard, nên cắt làm hai artboard nối tiếp.
- Chữ thân dùng `text-wrap: pretty` (Tailwind `text-pretty`) để tránh một chữ đứng riêng ở dòng cuối.
- Artboard landing là trang web, không có khung cửa sổ macOS hay Windows. Khung quanh ảnh sản phẩm là `WindowFrame` của site (ba chấm xám và tiêu đề).

### Kiểm và xem trước

Chạy từ gốc repo, với repo `eduflow-application` nằm cạnh:

```bash
python3 ../eduflow-application/docs/thiet-ke/tools/check_dc.py docs/thiet-ke/v1/canvas/project/*.dc.html
python3 ../eduflow-application/docs/thiet-ke/tools/preview_dc.py docs/thiet-ke/v1/canvas/project/Main.dc.html macOS /tmp/landing-main.png
```

`check_dc.py` viết cho artboard app desktop 1440 × 900 có khung hệ điều hành. Với artboard landing, bốn mục "$preview missing", "os prop missing", "root size/overflow missing" và "os chrome sc-if missing" là bình thường, cùng "too many lines" nếu một tệp vượt 450 dòng. Mọi luật còn lại phải qua: thẻ đóng đủ, lỗ `{{...}}` đơn giản, màu chữ theo token, không gạch ngang dài hay gạch nối en, không emoji, thuộc tính có ngoặc kép, svg có `aria-hidden`.

`preview_dc.py` dùng Chrome headless ở đường dẫn ghi đầu tệp và cần mạng để nạp font Google.

### Sửa chữ và cập nhật canvas

- PO sửa trực tiếp trên canvas. Trước khi sửa một tệp ở đây, đọc lại bản trên canvas để không ghi đè thay đổi của PO.
- Mọi chữ đổi trên canvas phải chép vào cả `messages/vi.json` và `messages/en.json`, rồi chạy lại lệnh kiểm tra khoá và luật nội dung ở Task 1 bước 3 của kế hoạch.
- Sửa tệp trong `v1/canvas/project/` rồi phát hành lại lên cùng URL bằng công cụ Artifact: thư mục gốc là `v1/canvas`, chỉ gửi các tệp đã đổi; chỉ gửi `canvas.json` khi thêm, bớt, di chuyển hay đổi kích thước artboard.
