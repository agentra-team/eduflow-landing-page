import { expect, test } from 'vitest'
import { contactSalesHref } from '@/lib/contact'

test('contactSalesHref builds a mailto with a subject and a body per locale', () => {
  const vi = new URL(contactSalesHref('vi'))
  expect(vi.protocol).toBe('mailto:')
  expect(vi.pathname).toBe('info@agentra.io.vn')
  expect(vi.searchParams.get('subject')).toBe('Báo giá EduFlow cho trường')
  expect(vi.searchParams.get('body')).toContain('Số máy dự kiến')
  expect(new URL(contactSalesHref('en')).searchParams.get('subject')).toBe('EduFlow quote for our institution')
})
