import { expect, type Locator } from '@playwright/test'

/**
 * Chờ React gắn vào phần tử (Ruling 51). Trước khi hydrate, trang chỉ là HTML tĩnh: kiểm tra "không có X" trên trạng thái do client quyết
 * (hệ điều hành, lựa chọn cookie) qua ngay cả khi X sẽ hiện ra sau đó, và cú click bị mất vì nút chưa có trình xử lý.
 * React ghi khoá `__reactFiber$<mã ngẫu nhiên>` lên nút DOM khi hydrate nút đó.
 */
export async function waitForHydration(locator: Locator): Promise<void> {
  await expect
    .poll(() => locator.evaluate((el) => Object.keys(el).some((key) => key.startsWith('__reactFiber$')), undefined, { timeout: 5_000 }), {
      message: 'React chưa gắn vào phần tử: trang chưa hydrate',
      timeout: 15_000,
    })
    .toBe(true)
  // Khoá fiber xuất hiện ở pha render. Trạng thái do client quyết (useSyncExternalStore đọc hệ điều hành) chỉ đổi ở lượt render lại ngay sau
  // commit, đo được 4,7 tới 8,2 ms sau khi có khoá (40 lần tải, máy này). Chờ hai khung hình để lượt đó chạy xong rồi mới cho kiểm tra:
  // chỉ chờ khoá thì khi CPU chậm 8 lần, kiểm tra "không có nút tải" vẫn qua nhầm 11 trong 12 lần dù nút đã sai; có hai khung hình thì 0 trong 12.
  await locator.evaluate(() => new Promise<void>((done) => requestAnimationFrame(() => requestAnimationFrame(() => done()))))
}
