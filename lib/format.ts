import type { Locale } from '@/i18n/routing'
import type { ReleaseAsset } from '@/lib/releases/types'

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

/** Dòng chi tiết của thẻ tải: "150 MB · v1.0.0 · 15/09/2026". Không có ngày hợp lệ thì bỏ cả ngày lẫn dấu phân cách đứng trước nó. */
export function formatAssetMeta(asset: Pick<ReleaseAsset, 'sizeBytes' | 'version' | 'releaseDate'>, locale: Locale): string {
  return [formatBytes(asset.sizeBytes, locale), `v${asset.version}`, formatDate(asset.releaseDate, locale)].filter(Boolean).join(' · ')
}

/**
 * Câu dẫn của khối tải: có ngày phát hành hợp lệ thì khoá `lead` ("Phiên bản 1.0.0, phát hành 15/09/2026."), không thì khoá `leadNoDate`
 * (chỉ nêu phiên bản, không để lại "phát hành ."). Trả khoá và giá trị để gọi `t(key, values)` ở nơi có hàm dịch của đúng namespace.
 */
export function releaseLead(
  latest: { version: string; releaseDate: string } | null,
  locale: Locale,
): { key: 'lead'; values: { version: string; date: string } } | { key: 'leadNoDate'; values: { version: string } } | null {
  if (!latest) return null
  const date = formatDate(latest.releaseDate, locale)
  return date ? { key: 'lead', values: { version: latest.version, date } } : { key: 'leadNoDate', values: { version: latest.version } }
}
