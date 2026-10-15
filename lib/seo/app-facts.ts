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
  /**
   * Dạng câu của đề ở v1: nhiều lựa chọn (bốn phương án, một đáp án) và bài tự luận có điểm kèm hướng dẫn chấm. Đề có hai hình thức:
   * "Trắc nghiệm" và "Kết hợp trắc nghiệm và tự luận" (eduflow-application exam/examLabels.ts:9; SetupStep.tsx:363,379 có "Số bài tự luận",
   * "Điểm tự luận"; contracts/src/examSkills.ts:37 có essays). Đúng sai, trả lời ngắn, tự luận có ý (nhiều ý nhỏ có điểm) là E2a (V2-05).
   */
  testQuestionTypes: ['multiple-choice', 'essay'],
  /** Giới hạn ma trận và đề. Nguồn: eduflow-application packages/contracts/src/exam.ts:60 (MATRIX_ROWS_MAX), :62 (EXAM_QUESTIONS_MAX), examSkills.ts:10 (EXAM_ITEMS_CALL_MAX). */
  matrixMaxRows: 40,
  testMaxItems: 200,
  topicMaxItems: 120,
  /**
   * Giáo án và slide (bài soạn giáo án 5512, tạo slide). Nguồn: eduflow-application packages/contracts/src/teach.ts:19 (TEN_BAI_MAX 120),
   * :21 (LESSON_MINUTES 45), :23 (LESSON_MIN_CHARS 4500), :63-64 (QUIZ_TOTAL 3..10), :138-139 (DECK_CONTENT 20..28); core/src/lesson.ts:13
   * (bốn hoạt động); desktop teach/ActivityEditor.tsx:21 (YCCD_MAX 6); contracts/src/deckTheme.ts:16 (tám mẫu có sẵn).
   */
  lessonActivities: 4,
  lessonMinutes: 45,
  lessonNameMaxChars: 120,
  lessonShortBodyChars: 4500,
  quizTotalRange: [3, 10],
  deckContentSlidesRange: [20, 28],
  deckStarterThemes: 8,
  /**
   * Tài liệu nguồn (bài nạp tài liệu). Nguồn: eduflow-application packages/contracts/src/document.ts:85 (DOCUMENT_PAGE_MAX 300 trang hay slide),
   * :88 (DOCUMENT_BYTES_MAX: Phổ thông 12 MB, Học phần và Chương trình 80 MB); contracts/src/retrieval.ts:37 (ASSISTANT_DOCUMENT_BUDGET_KB 16).
   */
  documentMaxPages: 300,
  documentMaxMb: { k12: 12, course: 80, program: 80 },
  assistantDocumentBudgetKb: 16,
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
