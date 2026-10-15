import { beforeAll, expect, test } from 'vitest'
import { indexablePages, pageUrl } from '@/lib/seo/pages'
import { PAGES } from '../e2e/pages'

beforeAll(() => {
  process.env.NEXT_PUBLIC_SITE_URL = 'https://eduflow.test'
})

// Danh sách trang của e2e phải đúng bằng sổ trang: thêm trang mà quên e2e thì test này đỏ.
test('the e2e page list is exactly the indexable pages', () => {
  const expected = indexablePages().flatMap((p) => (['vi', 'en'] as const).map((l) => `${new URL(pageUrl(p, l)).pathname} ${l}`))
  expect(PAGES.map(([path, lang]) => `${path} ${lang}`).sort()).toEqual(expected.sort())
})
