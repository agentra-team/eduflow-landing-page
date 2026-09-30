import type { Locale } from '@/i18n/routing'

/** Dung lượng đọc được: MB làm tròn, một chữ số thập phân khi dưới 10 MB; KB dưới 1 MB. */
export function formatBytes(bytes: number, locale: Locale): string {
  const mb = bytes / (1024 * 1024)
  if (mb < 1) return `${Math.round(bytes / 1024)} KB`
  const digits = mb < 10 ? 1 : 0
  const n = new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(mb)
  return `${n} MB`
}

/** Ngày phát hành theo múi giờ Việt Nam: vi 15/09/2026, en 15 Sep 2026. Chuỗi không hợp lệ → ''. */
export function formatDate(iso: string, locale: Locale): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Ho_Chi_Minh',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).formatToParts(d)
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
  const day = get('day')
  const year = get('year')
  if (locale === 'vi') {
    const month = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Ho_Chi_Minh', month: '2-digit' }).format(d)
    return `${day}/${month}/${year}`
  }
  return `${day} ${get('month')} ${year}`
}
