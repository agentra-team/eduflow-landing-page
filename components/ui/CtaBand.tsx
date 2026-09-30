import type { ComponentProps } from 'react'
import { ButtonAnchor, ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import type { IconName } from '@/components/ui/icons'

type Href = ComponentProps<typeof ButtonLink>['href']

/** Dải kêu gọi cuối trang, nền xanh đậm (tier1). */
export function CtaBand({
  title,
  sub,
  primary,
  secondary,
}: {
  title: string
  sub: string
  // Nút chính: href cho trang nội bộ, externalHref cho liên kết ngoài (mailto hoặc https).
  primary: ({ href: Href } | { externalHref: string }) & { label: string; icon?: IconName }
  secondary: { href: Href; label: string }
}) {
  return (
    <section className="bg-brand-deep py-14 md:py-22">
      <Container className="flex flex-col items-center gap-4 text-center md:gap-5">
        <h2 className="max-w-[820px] font-display text-[28px] leading-[1.18] font-bold text-white text-balance md:text-[38px] md:leading-[1.15]">{title}</h2>
        <p className="max-w-[640px] text-[15.5px] leading-relaxed text-white/80 md:text-[17px]">{sub}</p>
        <div className="mt-2 flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row sm:gap-3">
          {'externalHref' in primary ? (
            <ButtonAnchor href={primary.externalHref} variant="white" size="lg" icon={primary.icon ?? 'mail'} className="w-full sm:w-auto">
              {primary.label}
            </ButtonAnchor>
          ) : (
            <ButtonLink href={primary.href} variant="white" size="lg" icon={primary.icon ?? 'download'} className="w-full sm:w-auto">
              {primary.label}
            </ButtonLink>
          )}
          <ButtonLink href={secondary.href} variant="ghost-white" size="lg" className="w-full sm:w-auto">
            {secondary.label}
          </ButtonLink>
        </div>
      </Container>
    </section>
  )
}
