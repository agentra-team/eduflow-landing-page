import { expect, test } from 'vitest'
import { DOCS } from '@/content/docs'
import { TOPICS } from '@/content/topics'
import en from '@/messages/en.json'
import vi from '@/messages/vi.json'

// Những điều v1 của app KHÔNG có (thư viện mẫu, tự cập nhật, OCR, áp vào bản nháp). Câu phủ định đúng như
// "không tự cập nhật" hay "chờ OCR" không dính mẫu này.
export const FALSE_CLAIMS =
  /thư viện mẫu|template library|bản mới trong app|new versions in the app|(?<!(?:không|chưa) )tự cập nhật|(?<!not )updates itself|nhận dạng chữ \(OCR\)|apply\b[^.]{0,40} to (the )?draft|áp [^.]{0,40}vào bản nháp/i

const values = (o: unknown, p = ''): Array<[string, string]> =>
  typeof o === 'object' && o !== null
    ? Object.entries(o).flatMap(([k, v]) => values(v, p ? `${p}.${k}` : k))
    : typeof o === 'string'
      ? [[p, o]]
      : []

test('the false-claim pattern fails known lies and passes the correct negatives', () => {
  for (const bad of ['Thư viện mẫu dùng được khi mất mạng', 'the template library works offline', 'nhận bản mới trong app', 'get new versions in the app', 'App tự cập nhật', 'The app updates itself', 'nhận dạng chữ (OCR)', 'apply the result to the draft', 'áp kết quả vào bản nháp'])
    expect(FALSE_CLAIMS.test(bad), bad).toBe(true)
  for (const ok of ['App không tự cập nhật', 'Bản này chưa tự cập nhật', 'The app does not update itself', 'not updates itself', 'chưa đọc thành chữ, chờ OCR', 'Tải bản mới và cài đè'])
    expect(FALSE_CLAIMS.test(ok), ok).toBe(false)
})

test('no site copy states something the v1 app does not do', () => {
  const all = [
    ...values(vi, 'messages/vi'),
    ...values(en, 'messages/en'),
    ...values(DOCS, 'DOCS'),
    ...values(TOPICS, 'TOPICS'),
  ]
  expect(all.length).toBeGreaterThan(500)
  expect(all.filter(([, v]) => FALSE_CLAIMS.test(v)).map(([k, v]) => `${k}: ${v.slice(0, 80)}`)).toEqual([])
})
