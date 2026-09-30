import type { Locale } from '@/i18n/routing'

/** Thông tin công ty và biến môi trường (spec §11). Liên hệ là giá trị tạm của Agentra, chờ PO xác nhận (OQ-L04). */
export const site = {
  name: 'EduFlow',
  shortName: 'EduFlow',
  company: 'Agentra JSC',
  email: 'info@agentra.io.vn',
  city: { vi: 'Đà Nẵng', en: 'Da Nang' } satisfies Record<Locale, string>,
  country: { vi: 'Việt Nam', en: 'Vietnam' } satisfies Record<Locale, string>,
  companyUrl: 'https://agentra.io.vn',
  phone: '',
  zalo: '',
  address: '',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Agentra+JSC+%C4%90%C3%A0+N%E1%BA%B5ng',
  siteUrl(): string {
    return (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '')
  },
  /** Feed kênh ổn định của app (OQ-L02). Chưa đặt → null → dùng snapshot; snapshot rỗng → trạng thái sắp phát hành. */
  feedUrl(): string | null {
    const url = (process.env.DOWNLOAD_FEED_URL ?? '').trim()
    if (!url) return null
    return url.endsWith('/') ? url : `${url}/`
  },
}
