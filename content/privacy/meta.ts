import type { Locale } from '@/i18n/routing'

/** Chữ meta và ngày cập nhật của Chính sách bảo mật. Hai tệp MDX xuất lại `meta` từ đây; sổ trang (lib/seo/pages.ts) đọc trực tiếp. */
export const PRIVACY_META: Record<Locale, { title: string; description: string; updated: string }> = {
  vi: {
    title: 'Chính sách bảo mật',
    description: 'Trang web EduFlow thu thập gì, dùng cookie phân tích ra sao, cách rút lại đồng ý, liên kết ngoài và quyền của thầy cô theo Nghị định 13/2023/NĐ-CP.',
    updated: '2026-09-30',
  },
  en: {
    title: 'Privacy policy',
    description: 'What the EduFlow website collects, how it uses analytics cookies, how to withdraw consent, external links and your rights under Decree 13/2023/ND-CP.',
    updated: '2026-09-30',
  },
}
