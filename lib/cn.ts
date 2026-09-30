/** Ghép class, bỏ giá trị rỗng. Không cần clsx cho một site tĩnh. */
export const cn = (...xs: Array<string | false | null | undefined>) => xs.filter(Boolean).join(' ')
