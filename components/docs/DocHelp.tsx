import { getTranslations } from 'next-intl/server'
import { ButtonLink } from '@/components/ui/Button'

/**
 * Khối "Không giải được? Liên hệ · Tải EduFlow" cuối bài (spec §7.4). Mục lục hướng dẫn dùng lại khối này với câu riêng
 * ("Không tìm thấy điều cần tìm?"), nên title và body thay được; hai nút giữ nguyên.
 */
export async function DocHelp({ title, body }: { title?: string; body?: string } = {}) {
  const t = await getTranslations('docs.help')
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-accent-line bg-accent-soft p-5 md:flex-row md:items-center md:justify-between md:p-6">
      <div className="flex flex-col gap-1">
        <b className="text-base">{title ?? t('title')}</b>
        <span className="text-[14.5px] text-ink2">{body ?? t('body')}</span>
      </div>
      <div className="flex flex-col gap-2.5 sm:flex-row">
        <ButtonLink href="/contact" variant="secondary">{t('contact')}</ButtonLink>
        <ButtonLink href="/download" icon="download">{t('download')}</ButtonLink>
      </div>
    </div>
  )
}
