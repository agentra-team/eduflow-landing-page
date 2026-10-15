import { expect, test } from 'vitest'
import { appFacts } from '@/lib/seo/app-facts'
import { brand } from '@/lib/seo/brand'

test('the canonical description is 110 to 160 characters and starts with the definition', () => {
  expect(brand.description.vi.startsWith('EduFlow là phần mềm AI cho giáo viên và giảng viên')).toBe(true)
  expect(brand.description.en.startsWith('EduFlow is AI software for teachers and lecturers')).toBe(true)
  for (const d of Object.values(brand.description)) {
    expect([...d].length).toBeGreaterThanOrEqual(110)
    expect([...d].length).toBeLessThanOrEqual(160)
  }
})

test('the disambiguation names the other Eduflow so assistants do not mix them up', () => {
  expect(brand.disambiguation.vi).toContain('eduflow.com')
  expect(brand.disambiguation.en).toContain('eduflow.com')
  expect(brand.alternateName).toBe('Agentra EduFlow')
})

test('features list only what the first release ships, the same in both languages', () => {
  expect(brand.features.vi).toHaveLength(brand.features.en.length)
  // R6: site nói ba cấp, nhưng featureList chỉ gồm tính năng v1 (Phổ thông, trợ lý, đọc tài liệu, chi phí).
  // Ruling: "curriculum" chỉ cấm khi đi với review hoặc map (tính năng v2); khung GDPT 2018 là tính năng v1.
  for (const f of [...brand.features.vi, ...brand.features.en]) expect(f).not.toMatch(/CLO|đề cương|syllab|curriculum (?:review|map)|chương trình đào tạo|degree program/i)
  expect(brand.features.vi.join(' ')).toContain(`${appFacts.maxTestVersions} mã đề`)
  expect(brand.features.en.join(' ')).toContain(`${appFacts.maxTestVersions} test versions`)
})

test('no external profile is listed until the product owner confirms it (OQ-R3)', () => {
  expect(brand.sameAs).toEqual([])
})
