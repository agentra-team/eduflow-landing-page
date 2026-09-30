import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { expect, test } from 'vitest'
import en from '@/messages/en.json'
import vi from '@/messages/vi.json'

const values = (o: unknown, p = ''): Array<[string, string]> =>
  typeof o === 'object' && o !== null
    ? Object.entries(o).flatMap(([k, v]) => values(v, p ? `${p}.${k}` : k))
    : [[p, String(o)]]

const mdxFiles = (dir: string): string[] => {
  try {
    return readdirSync(dir).flatMap((f) => {
      const p = join(dir, f)
      if (statSync(p).isDirectory()) return mdxFiles(p)
      return p.endsWith('.mdx') ? [p] : []
    })
  } catch {
    return []
  }
}

// Luật nội dung của spec §15.
const FORBIDDEN = [/\u2014/, /đạt kiểm định/i, /thay (thế )?giáo viên/i, /replaces? teachers/i]

test('copy rules: no em-dash, no promised accreditation, no "AI replaces teachers"', () => {
  const texts: Array<[string, string]> = [
    ...values(vi).map(([k, v]) => [`vi:${k}`, v] as [string, string]),
    ...values(en).map(([k, v]) => [`en:${k}`, v] as [string, string]),
    ...mdxFiles('content').map((f) => [f, readFileSync(f, 'utf8')] as [string, string]),
  ]
  const hits = texts.flatMap(([where, text]) => FORBIDDEN.filter((r) => r.test(text)).map((r) => `${where} ${r}`))
  expect(hits).toEqual([])
})

test('English copy carries no untranslated Vietnamese', () => {
  const VIETNAMESE = /[ăâđêôơưàáảãạằắẳẵặầấẩẫậèéẻẽẹềếểễệìíỉĩịòóỏõọồốổỗộờớởỡợùúủũụừứửữựỳýỷỹỵ]/i
  const ALLOWED = ['DÙNG THỬ']
  const offenders = values(en)
    .map(([k, v]) => [k, ALLOWED.reduce((s, a) => s.split(a).join(''), v)] as const)
    .filter(([, v]) => VIETNAMESE.test(v))
    .map(([k]) => k)
  expect(offenders).toEqual([])
})
