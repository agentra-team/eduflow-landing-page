import { useTranslations } from 'next-intl'
import { ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Logo } from '@/components/ui/Logo'
import { Link } from '@/i18n/navigation'
import { LocaleSwitcher } from './LocaleSwitcher'
import { MobileNav } from './MobileNav'
import { NavLinks } from './NavLinks'

export function Header() {
  const t = useTranslations('common')
  return (
    <header className="sticky top-0 z-30 h-16 border-b border-line md:h-[72px]">
      {/* Nền mờ nằm ở lớp riêng. Đặt backdrop-filter lên chính header sẽ biến header thành khung chứa của panel menu `fixed`, làm panel chỉ còn cao 49 px trên Chrome. */}
      <div className="absolute inset-0 -z-10 bg-card/95 backdrop-blur" aria-hidden="true" />
      <Container className="flex h-full items-center gap-8">
        <Link href="/" className="flex min-h-11 items-center">
          <Logo height={30} priority />
        </Link>
        {/* Menu ngang hiện từ 1100 px. Ở 1024 px bản tiếng Anh cần 999 px cho một hàng, trong khi chỉ có 960 px. */}
        <nav aria-label={t('mainNav')} className="ml-auto hidden items-center gap-6 min-[1100px]:flex">
          <NavLinks className="whitespace-nowrap" />
        </nav>
        <div className="hidden items-center gap-3.5 min-[1100px]:flex">
          <LocaleSwitcher />
          <ButtonLink href="/download" size="sm" icon="download">
            {t('download')}
          </ButtonLink>
        </div>
        <div className="ml-auto min-[1100px]:hidden">
          <MobileNav />
        </div>
      </Container>
    </header>
  )
}
