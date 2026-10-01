// Spec §15: trang Cách tính phí không công bố đơn giá. Mỗi dạng ghi giá có một regex riêng, đặt tên để biết dạng nào bắt được.
// Cờ `iu` ở mọi regex: "đ" phải nhận cả "Đ", và \b của JS chỉ hiểu chữ ASCII nên ranh giới từ viết bằng \p{L}\p{N} (vd. "5 kế hoạch" không phải "5k").
export const PRICE_PATTERNS: Record<string, RegExp> = {
  // Một con số đi liền đơn vị tiền: 5.000 ₫, 50,000₫, 299.000 VNĐ, 99 đ. "đ" theo sau bởi chữ cái (đề, điểm, đến, đồng) không tính.
  'number then ₫, VNĐ, VND or đ': /\d[\d.,]*\s?(?:₫|VNĐ|VND|đ(?!\p{L}))/iu,
  // Ký hiệu tiền đứng trước con số: $19, US$19, €19, £19.
  'currency sign then number': /[$€£]\s?\d/iu,
  // Mã ISO đứng trước con số: USD 19, VND 299,000, VNĐ 5.000, EUR 19. "in VND per million tokens" không có số liền sau nên được phép.
  'ISO code then number': /(?<![\p{L}\p{N}])(?:USD|VND|VNĐ|EUR)\s?\d/iu,
  // Mã ISO đứng sau con số: 19 USD, 19 EUR (VND đã nằm ở dạng đầu).
  'number then USD or EUR': /\d[\d.,]*\s?(?:USD|EUR)(?![\p{L}\p{N}])/iu,
  // Đơn vị đọc thành lời sau con số: 299.000 đồng, 299 nghìn, 5 triệu, 2 tỷ, 299k ("k" phải là một từ riêng, km hay kế hoạch không tính).
  // Số phải mở đầu bằng 1-9, hoặc là 0,5 và 0.5; "0 đồng" là nhãn miễn phí ở đầu trang nên được phép, "đồng nghiệp" là từ khác.
  'number then spelled unit': /(?<![\d.,])(?:[1-9]|0[.,]\d)[\d.,]*\s?(?:nghìn|ngàn|triệu|tỷ|đồng(?!\s*nghiệp)|k)(?![\p{L}\p{N}])/iu,
}

export function priceHits(text: string): Array<{ pattern: string; match: string; context: string }> {
  return Object.entries(PRICE_PATTERNS).flatMap(([pattern, re]) => {
    const m = re.exec(text)
    if (!m) return []
    const context = text.slice(Math.max(0, m.index - 24), m.index + m[0].length + 24).replace(/\s+/g, ' ')
    return [{ pattern, match: m[0], context }]
  })
}
