import { readFileSync } from 'node:fs'
import { expect, test } from 'vitest'
import { parse } from 'yaml'

// Gốc repo tính từ vị trí tệp này, không phụ thuộc thư mục đang chạy lệnh.
const read = (path: string) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8')

test('the CI token is read-only; a newer push cancels the older run on a pull request, never on main', () => {
  const ci = parse(read('.github/workflows/ci.yml'))
  expect(ci.permissions).toEqual({ contents: 'read' })
  // Trên main mỗi commit một nhóm (theo sha): workflow Release đòi CI xanh của đúng commit được gắn tag, nên không lần chạy nào của main bị huỷ.
  expect(ci.concurrency).toEqual({ group: "ci-${{ github.ref == 'refs/heads/main' && github.sha || github.ref }}", 'cancel-in-progress': true })
})

test('Lighthouse CI measures the home page, a level page, Pricing and Download in both languages (spec §13)', () => {
  const urls: string[] = JSON.parse(read('lighthouserc.json')).ci.collect.url
  const base = 'http://localhost:3200'
  expect(urls).toEqual(
    expect.arrayContaining(
      ['/', '/pho-thong', '/cach-tinh-phi', '/tai-ve', '/en', '/en/k12', '/en/pricing', '/en/download'].map((path) => `${base}${path}`),
    ),
  )
})
