import type { Locale } from '@/i18n/routing'
import { site } from '@/lib/site'

const COPY: Record<Locale, { subject: string; body: string }> = {
  vi: {
    subject: 'Báo giá EduFlow cho trường',
    body: 'Tên đơn vị:\nNgười liên hệ:\nSố máy dự kiến:\nCấp dùng chính (Phổ thông, Học phần, Chương trình):\n',
  },
  en: {
    subject: 'EduFlow quote for our institution',
    body: 'Institution:\nContact person:\nNumber of computers:\nMain level (K-12, university courses, degree program):\n',
  },
}

/** Nút "Liên hệ báo giá": mở thư soạn sẵn, không có form trên web (spec §2, quyết định 5). */
export function contactSalesHref(locale: Locale): string {
  const { subject, body } = COPY[locale]
  return `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}
