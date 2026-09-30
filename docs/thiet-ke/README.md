# Thiết kế landing page EduFlow

Nguồn của canvas Claude Design "EduFlow Landing": 8 artboard cho 7 bảng thiết kế của spec mục 8.4 (trang chủ trên điện thoại cắt làm hai artboard). Chữ trên mọi artboard lấy nguyên văn từ `messages/vi.json`, riêng `HomeEN.dc.html` lấy từ `messages/en.json`. Màu, chữ và thành phần theo hệ thống thiết kế Phấn xanh của app (spec mục 8, `../eduflow-application/docs/thiet-ke/canvas/project/DesignSystem.dc.html`) và theo component của kế hoạch triển khai (Task 4 tới Task 10).

## Canvas đã phát hành

https://claude.ai/artifact/WFiyfNT13vwaDbHVTAtaPJ

Canvas là artifact riêng tư của tài khoản claude.ai đã phát hành. Muốn PO hay người khác xem, chủ canvas mở menu Share của trang.

## Artboard

| Tệp | Kích thước | Nội dung |
|---|---|---|
| `canvas/project/Main.dc.html` | 1440 × 7659 | Trang chủ tiếng Việt, desktop: header, 9 khối của spec mục 6.1, footer. Trạng thái có bản phát hành. Phần Hỏi đáp mở cả 8 câu để duyệt chữ (trang thật chỉ mở câu đầu) |
| `canvas/project/HomeMobile.dc.html` | 390 × 4568 | Trang chủ tiếng Việt trên điện thoại, phần 1: header, hero, ba cấp, trợ lý AI, quy trình 5 bước |
| `canvas/project/HomeMobile2.dc.html` | 390 × 4886 | Trang chủ trên điện thoại, phần 2: minh bạch và an toàn, chi phí, tải về, hỏi đáp, CTA cuối, footer. Cả hai phần ở trạng thái sắp phát hành |
| `canvas/project/HomeEN.dc.html` | 1440 × 7586 | Trang chủ tiếng Anh, desktop, trạng thái có bản phát hành |
| `canvas/project/LevelK12.dc.html` | 1440 × 4294 | Trang Phổ thông |
| `canvas/project/Assistant.dc.html` | 1440 × 5142 | Trang Trợ lý AI |
| `canvas/project/Pricing.dc.html` | 1440 × 3413 | Trang Cách tính phí, không có đơn giá |
| `canvas/project/Download.dc.html` | 1440 × 2796 | Trang Tải về: nửa trên khi feed có bản phát hành (khách dùng macOS), nửa dưới khi feed và snapshot đều rỗng (sắp phát hành); yêu cầu hệ thống, bộ cài đã ký và footer dùng chung |
| `canvas/project/canvas.json` | | Chỉ mục canvas: vị trí, kích thước, tiêu đề từng artboard, tiêu đề hàng và ghi chú |

## Quy ước

- Ảnh sản phẩm là khung giữ chỗ ghi "Ảnh: <tên artboard của canvas app>" ("Image: ..." trên bảng tiếng Anh) kèm chữ thay thế của ảnh. Task 5 thay bằng WebP chụp từ canvas app.
- Phiên bản 1.0.0, ngày 01/10/2026, tên tệp, dung lượng và mã SHA-512 trên thẻ tải về là dữ liệu mẫu lấy từ fixture `tests/fixtures/latest*.yml` của kế hoạch. Tên công ty, thành phố và email lấy từ `lib/site.ts`, còn tạm tới khi có câu trả lời OQ-L04.
- Chiều rộng giữ đúng 1440 px (desktop) và 390 px (điện thoại). Chiều cao là chiều cao thật của trang ở nhịp spec mục 8.3 (section 96 px trên desktop, 64 px trên điện thoại): các con số kế hoạch ước (3600, 5200, 2600, 2800, 2600, 1800 px) không chứa đủ chữ. Trang chủ trên điện thoại cao khoảng 9450 px, vượt giới hạn 8000 px của một artboard, nên cắt làm hai artboard nối tiếp.
- Chữ thân dùng `text-wrap: pretty` (Tailwind `text-pretty`) để tránh một chữ đứng riêng ở dòng cuối.
- Artboard landing là trang web, không có khung cửa sổ macOS hay Windows. Khung quanh ảnh sản phẩm là `WindowFrame` của site (ba chấm xám và tiêu đề).

## Kiểm và xem trước

Chạy từ gốc repo, với repo `eduflow-application` nằm cạnh:

```bash
python3 ../eduflow-application/docs/thiet-ke/tools/check_dc.py docs/thiet-ke/canvas/project/*.dc.html
python3 ../eduflow-application/docs/thiet-ke/tools/preview_dc.py docs/thiet-ke/canvas/project/Main.dc.html macOS /tmp/landing-main.png
```

`check_dc.py` viết cho artboard app desktop 1440 × 900 có khung hệ điều hành. Với artboard landing, bốn mục "$preview missing", "os prop missing", "root size/overflow missing" và "os chrome sc-if missing" là bình thường, cùng "too many lines" nếu một tệp vượt 450 dòng. Mọi luật còn lại phải qua: thẻ đóng đủ, lỗ `{{...}}` đơn giản, màu chữ theo token, không gạch ngang dài hay gạch nối en, không emoji, thuộc tính có ngoặc kép, svg có `aria-hidden`.

`preview_dc.py` dùng Chrome headless ở đường dẫn ghi đầu tệp và cần mạng để nạp font Google.

## Sửa chữ và cập nhật canvas

- PO sửa trực tiếp trên canvas. Trước khi sửa một tệp ở đây, đọc lại bản trên canvas để không ghi đè thay đổi của PO.
- Mọi chữ đổi trên canvas phải chép vào cả `messages/vi.json` và `messages/en.json`, rồi chạy lại lệnh kiểm tra khoá và luật nội dung ở Task 1 bước 3 của kế hoạch.
- Sửa tệp trong `canvas/project/` rồi phát hành lại lên cùng URL bằng công cụ Artifact: thư mục gốc là `canvas`, chỉ gửi các tệp đã đổi; chỉ gửi `canvas.json` khi thêm, bớt, di chuyển hay đổi kích thước artboard.
