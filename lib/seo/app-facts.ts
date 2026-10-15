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
  /** Dạng câu của đề ở v1: chỉ nhiều lựa chọn. Đúng sai, trả lời ngắn, tự luận có ý là E2a (V2-05). */
  testQuestionTypes: ['multiple-choice'],
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
