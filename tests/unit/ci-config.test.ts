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

test('Lighthouse CI measures the pages of spec §12.3 in both languages', () => {
  const urls: string[] = JSON.parse(read('lighthouserc.json')).ci.collect.url
  const paths = ['/', '/ai-cho-giao-vien', '/ai-tao-de-kiem-tra-theo-ma-tran', '/huong-dan/soan-de-kiem-tra', '/tai-ve', '/en', '/en/ai-for-teachers', '/en/ai-test-generator', '/en/docs/create-a-test', '/en/download']
  expect(urls).toEqual(paths.map((p) => `http://localhost:3200${p}`))
})

test('CI gates a production build with seo-audit on the canonical domain (spec §12.3)', () => {
  const ci = read('.github/workflows/ci.yml')
  expect(ci).toContain('node scripts/seo-audit.mjs --base http://localhost:3400 --canonical https://eduflow.agentra.io.vn --next-manifest .next/prerender-manifest.json')
  expect(ci).toMatch(/VERCEL_ENV: production, NEXT_PUBLIC_SITE_URL: 'https:\/\/eduflow\.agentra\.io\.vn'/)
  expect(read('scripts/seo-audit.mjs')).toContain('Exit code 1 when any error is found')
})
