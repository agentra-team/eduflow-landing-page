'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { ButtonLink } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { usePathname } from '@/i18n/navigation'
import { LocaleSwitcher } from './LocaleSwitcher'
import { NavLinks } from './NavLinks'

export function MobileNav() {
  const t = useTranslations('common')
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  // Header nằm ở layout nên MobileNav không được dựng lại khi điều hướng: bấm logo (nằm ngoài panel) sang trang khác thì menu vẫn mở và body vẫn
  // bị khoá cuộn. Đổi đường dẫn thì đóng menu, theo mẫu "điều chỉnh state khi prop đổi" của React (đặt ngay lúc render, không qua effect).
  const [lastPathname, setLastPathname] = useState(pathname)
  if (pathname !== lastPathname) {
    setLastPathname(pathname)
    setOpen(false)
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={open ? t('closeMenu') : t('openMenu')}
        className="inline-flex h-11 w-11 items-center justify-center rounded-control border border-line bg-card2 text-ink"
      >
        <Icon name={open ? 'close' : 'menu'} size={22} />
      </button>
      {open ? (
        <div id="mobile-nav" className="fixed inset-x-0 top-16 bottom-0 md:top-[72px] z-50 overflow-y-auto border-t border-line bg-page px-4 py-6">
          <nav aria-label={t('mainNav')} className="flex flex-col gap-1 text-lg">
            <NavLinks onNavigate={() => setOpen(false)} className="border-b-0 py-3 text-lg" />
          </nav>
          <div className="mt-6 flex flex-col gap-4 border-t border-line pt-6">
            <LocaleSwitcher className="self-start" />
            <ButtonLink href="/download" size="lg" icon="download" full onClick={() => setOpen(false)}>
              {t('download')}
            </ButtonLink>
          </div>
        </div>
      ) : null}
    </>
  )
}
