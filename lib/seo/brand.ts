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
      `Soạn đề kiểm tra theo ma trận chủ đề × ${appFacts.matrixLevels} mức (nhận biết, thông hiểu, vận dụng, vận dụng cao), dạng trắc nghiệm hoặc kết hợp trắc nghiệm và tự luận; AI viết câu, thầy cô duyệt từng câu`,
      `Xuất đề tối đa ${appFacts.maxTestVersions} mã đề, xáo trộn câu hỏi và phương án theo khoá cố định, kèm đáp án và hướng dẫn chấm ở tệp riêng`,
      'Giáo án theo Công văn 5512 và slide bài giảng 16:9 có quiz, từ khung chương trình GDPT 2018 có sẵn trong app',
      'Cổng chất lượng chạy tại máy, mỗi cổng in số đơn vị đã kiểm; thầy cô duyệt trước khi xuất',
      'Trợ lý AI ở trang chủ và cạnh mọi màn làm việc, đề xuất vào bản nháp, không duyệt và không ký thay người',
      'Đọc tài liệu và nhận dạng chữ (OCR) ngay tại máy, không tốn tiền',
      'Chi phí AI hiện trước khi chạy, ngân sách tháng theo key; việc chạy tại máy không tốn tiền',
      'Ứng dụng desktop cho macOS (Apple Silicon, Intel) và Windows 64-bit; dữ liệu dự án nằm ở máy thầy cô',
    ],
    en: [
      `Tests built from a topic × ${appFacts.matrixLevels}-level matrix (recognition, comprehension, application, advanced application), multiple-choice or multiple-choice plus essay; AI writes the items, you review each one`,
      `Export up to ${appFacts.maxTestVersions} test versions, with questions and options shuffled by a fixed key, and the answer key and marking guide in separate files`,
      'Official Letter 5512 lesson plans and 16:9 lesson slides with quizzes, from the 2018 general education curriculum built into the app',
      'Quality gates run on your computer and each gate reports how many units it checked; you review and approve before exporting',
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
