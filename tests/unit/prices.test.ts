import { expect, test } from 'vitest'
import { PRICE_PATTERNS, priceHits } from '../e2e/prices'

// Bảng cho test "trang Cách tính phí không công bố giá" (tests/e2e/pages.spec.ts): dạng nào phải bị bắt, dạng nào phải còn được viết.
const MUST_MATCH = [
  '5.000 ₫', 'VNĐ 5.000', '50,000₫', '99 đ', '$19', 'US$19 / month', 'USD 19', '19 USD', 'VND 299,000', '299.000 đồng', '299k', '299 nghìn', '1.200.000 VNĐ',
  // Ngoài bảng bắt buộc: biến thể gần.
  '€19', '£ 19', 'EUR 19', '19 EUR', '299K', '10 ngàn', '5 triệu', '2 tỷ', '99 Đ', '50 000 ₫', '0,5 triệu', '0.5 nghìn', '0 VND',
]
const MUST_NOT_MATCH = [
  '0 đồng', '÷ 1.000.000', 'in VND per million tokens', '5 đề', '10 điểm', '3 đồng nghiệp',
  // Ngoài bảng bắt buộc: từ thường gặp sau con số.
  '5 đến 10', '5 km', '2 kg', '3 kế hoạch', '2 kết quả', 'cấp K12', '÷ 1,000,000)', 'số token × đơn giá', '10 điểm, 3 đề, 2 đồng nghiệp',
]

test.each(MUST_MATCH)('the price detector catches %j', (text) => {
  expect(priceHits(text), `no pattern matched ${JSON.stringify(text)}`).not.toEqual([])
})

test.each(MUST_NOT_MATCH)('the price detector allows %j', (text) => {
  expect(priceHits(text), `a pattern matched ${JSON.stringify(text)}`).toEqual([])
})

test('every pattern is exercised: each one catches at least one of the must-match rows', () => {
  for (const [name, re] of Object.entries(PRICE_PATTERNS)) {
    expect(MUST_MATCH.some((text) => re.test(text)), `pattern "${name}" matches nothing in the table`).toBe(true)
  }
})
