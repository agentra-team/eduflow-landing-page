import { readdirSync, readFileSync } from 'node:fs'
import { expect, test } from 'vitest'
import { docFile } from '@/content/docs'
import { DOC_IDS } from '@/content/docs/slugs'
import { checkDocBody } from '@/lib/docs/validate'

const LOCALES = ['vi', 'en'] as const
const read = (locale: (typeof LOCALES)[number], id: (typeof DOC_IDS)[number]) => readFileSync(docFile(locale, id), 'utf8')

test('every registered article has its two MDX files, and no file is orphaned', () => {
  for (const locale of LOCALES) {
    const files = readdirSync(`content/docs/${locale}`).filter((f) => f.endsWith('.mdx')).map((f) => `content/docs/${locale}/${f}`).sort()
    expect(files).toEqual(DOC_IDS.map((id) => docFile(locale, id)).sort())
  }
})

test('every article body follows the body rules and keeps metadata in the registry', () => {
  for (const locale of LOCALES) {
    for (const id of DOC_IDS) {
      const src = read(locale, id)
      expect(checkDocBody(docFile(locale, id), src)).toEqual([])
      expect(src, docFile(locale, id)).not.toMatch(/export const meta/)
      expect(src, docFile(locale, id)).not.toMatch(/nội bộ|internal note|người gửi|DocOps/i)
    }
  }
})

for (const locale of LOCALES) {
  test(`${locale} install articles carry the key facts of an unsigned installer`, () => {
    const mac = read(locale, 'install-macos')
    expect(mac).toContain('EDU-')
    expect(mac).toContain('Applications')
    expect(mac).toContain('Apple Silicon')
    expect(mac).not.toContain('xattr')
    expect(mac).toContain(locale === 'vi' ? 'Quyền riêng tư & Bảo mật' : 'Privacy & Security')
    expect(mac).toContain(locale === 'vi' ? 'Vẫn mở' : 'Open Anyway')
    const win = read(locale, 'install-windows')
    expect(win).toContain('EDU-')
    for (const s of ['SmartScreen', 'More info', 'Run anyway', 'Unknown publisher', 'certutil -hashfile']) expect(win).toContain(s)
  })
}
