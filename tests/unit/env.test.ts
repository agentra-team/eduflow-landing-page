import { expect, test } from 'vitest'
import { RELEASE_TAG_PATTERN, assertProductionEnv } from '@/lib/env'

const production = (url?: string) => ({ VERCEL_ENV: 'production', NEXT_PUBLIC_SITE_URL: url })

test('production builds need NEXT_PUBLIC_SITE_URL, other builds do not', () => {
  expect(() => assertProductionEnv({ VERCEL_ENV: 'production', NEXT_PUBLIC_SITE_URL: '' })).toThrow(/NEXT_PUBLIC_SITE_URL/)
  expect(() => assertProductionEnv({ VERCEL_ENV: 'production', NEXT_PUBLIC_SITE_URL: 'https://x.test' })).not.toThrow()
  expect(() => assertProductionEnv({ VERCEL_ENV: 'preview' })).not.toThrow()
  expect(() => assertProductionEnv({})).not.toThrow()
})

test('production says the variable must be set when it is missing or blank', () => {
  expect(() => assertProductionEnv(production())).toThrow(/phải được đặt/)
  expect(() => assertProductionEnv(production('   '))).toThrow(/phải được đặt/)
})

test.each(['eduflow.vn', 'http://localhost:3000', 'http://127.0.0.1:3000', 'http://[::1]:3000', 'http://app.localhost', 'ftp://x.test'])(
  'production rejects %s as the site URL',
  (url) => {
    expect(() => assertProductionEnv(production(url))).toThrow(/URL http\(s\) đầy đủ/)
  },
)

test('production accepts a real URL, even with whitespace around it; preview accepts localhost', () => {
  expect(() => assertProductionEnv(production('  https://x.test\n'))).not.toThrow()
  expect(() => assertProductionEnv(production('https://x.test'))).not.toThrow()
  expect(() => assertProductionEnv({ VERCEL_ENV: 'preview', NEXT_PUBLIC_SITE_URL: 'http://localhost:3000' })).not.toThrow()
})

// Workflow Release (docs/van-hanh.md, mục 8) là đường duy nhất lên production: bản dựng cho Vercel thiếu RELEASE_TAG thì dừng.
const vercelProduction = (tag?: string) => ({ VERCEL: '1', VERCEL_ENV: 'production', NEXT_PUBLIC_SITE_URL: 'https://x.test', RELEASE_TAG: tag })

test('a production build for Vercel needs the RELEASE_TAG that only the Release workflow sets', () => {
  expect(() => assertProductionEnv(vercelProduction())).toThrow(/workflow Release/)
  expect(() => assertProductionEnv(vercelProduction('v1.0.0'))).not.toThrow()
  expect(() => assertProductionEnv(vercelProduction('v12.3.40'))).not.toThrow()
})

// Review Focus 5: Vercel luôn dựng bản đầu tiên của project mới thành production, kể cả khi import, lúc chưa có biến nào.
test('the first production build Vercel makes on import fails on the release rule, before any variable is set', () => {
  expect(() => assertProductionEnv({ VERCEL: '1', VERCEL_ENV: 'production' })).toThrow(/workflow Release/)
})

test.each(['1.0.0', 'v1.0', 'v1.0.0-rc.1', ' v1.0.0', 'v01.0.0', 'latest', ''])('a Vercel production build refuses RELEASE_TAG %j', (tag) => {
  expect(() => assertProductionEnv(vercelProduction(tag))).toThrow(/workflow Release/)
})

// Review Focus 5: bước seo-audit trên CI của đợt thiết kế lại dựng với VERCEL_ENV=production nhưng không có VERCEL=1.
test('Vercel previews and production builds outside Vercel do not need RELEASE_TAG', () => {
  expect(() => assertProductionEnv({ VERCEL: '1', VERCEL_ENV: 'preview' })).not.toThrow()
  expect(() => assertProductionEnv({ VERCEL_ENV: 'production', NEXT_PUBLIC_SITE_URL: 'https://x.test' })).not.toThrow()
})

// Đóng kín khi không biết môi trường Vercel: thiếu VERCEL_ENV thì không thể loại trừ production.
test.each([undefined, ''])('a Vercel build with VERCEL_ENV %j fails closed and names the System Environment Variables setting', (value) => {
  expect(() => assertProductionEnv({ VERCEL: '1', VERCEL_ENV: value })).toThrow(/System Environment Variables/)
})

test('local and CI builds without VERCEL pass whatever VERCEL_ENV is missing', () => {
  expect(() => assertProductionEnv({})).not.toThrow()
  expect(() => assertProductionEnv({ VERCEL_ENV: '' })).not.toThrow()
})

test('RELEASE_TAG_PATTERN is the vX.Y.Z pattern shared with the release scripts', () => {
  expect(RELEASE_TAG_PATTERN.source).toBe('^v(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)$')
})
