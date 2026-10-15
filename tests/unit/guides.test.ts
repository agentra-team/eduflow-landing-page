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
        // Bộ cài chưa ký (app-facts.installerSigned): bài phải chỉ đường mở qua Gatekeeper.
        expect(src).toContain(locale === 'vi' ? 'Quyền riêng tư & Bảo mật' : 'Privacy & Security')
        expect(src).toContain(locale === 'vi' ? 'Vẫn mở' : 'Open Anyway')
      }
      if (os === 'windows') {
        expect(src).toContain('SmartScreen')
        expect(src).toContain('More info')
        expect(src).toContain('Run anyway')
        expect(src).toContain('Unknown publisher')
        expect(src).toContain('certutil -hashfile')
      }
    })
  }
}

test('isGuideOs', () => {
  expect(isGuideOs('macos')).toBe(true)
  expect(isGuideOs('linux')).toBe(false)
})
