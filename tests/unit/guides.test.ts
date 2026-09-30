import { readFileSync } from 'node:fs'
import { expect, test } from 'vitest'
import { GUIDE_OS, isGuideOs } from '@/content/install'

for (const locale of ['vi', 'en']) {
  for (const os of GUIDE_OS) {
    test(`${locale}/${os} guide exports meta and carries the key facts`, () => {
      const src = readFileSync(`content/install/${locale}/${os}.mdx`, 'utf8')
      expect(src).toMatch(/export const meta = \{/)
      expect(src).toMatch(/toc: \[/)
      expect(src).not.toMatch(/nội bộ|internal note|người gửi|DocOps/i)
      expect(src).toContain('EDU-')
      if (os === 'macos') {
        expect(src).toContain('Applications')
        expect(src).toContain('Apple Silicon')
        expect(src).not.toContain('xattr')
      }
      if (os === 'windows') {
        expect(src).toContain('SmartScreen')
        expect(src).toContain('Agentra JSC')
        expect(src).toContain('Run anyway')
      }
    })
  }
}

test('isGuideOs', () => {
  expect(isGuideOs('macos')).toBe(true)
  expect(isGuideOs('linux')).toBe(false)
})
