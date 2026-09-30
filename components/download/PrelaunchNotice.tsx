import { ButtonLink } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'

/** Trạng thái sắp phát hành: chưa có bản cài nào (spec §6.8). Mọi lối tải dẫn về đây và về trang Liên hệ. */
export function PrelaunchNotice({ title, body, cta, headingLevel = 'h2' }: { title: string; body: string; cta: string; headingLevel?: 'h2' | 'h3' }) {
  const Heading = headingLevel
  return (
    <div data-testid="prelaunch" className="mx-auto flex max-w-[760px] flex-col items-center gap-4 rounded-card border border-accent-line bg-accent-soft px-6 py-10 text-center">
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-card text-accent-strong">
        <Icon name="clock" size={24} />
      </span>
      <Heading className="font-display text-2xl font-bold">{title}</Heading>
      <p className="max-w-[560px] text-[15.5px] leading-relaxed text-ink2">{body}</p>
      <ButtonLink href="/contact" icon="mail">
        {cta}
      </ButtonLink>
    </div>
  )
}
