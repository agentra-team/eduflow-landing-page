import { expect, test } from 'vitest'
import { breadcrumb, faqPage, howTo, organization, softwareApplication } from '@/lib/seo/jsonld'

const asset = {
  platform: 'windows-x64' as const,
  version: '1.0.0',
  fileName: 'EduFlow Setup 1.0.0.exe',
  url: 'https://feed.example.test/desktop/EduFlow%20Setup%201.0.0.exe',
  sizeBytes: 157058273,
  sha512: 'abc',
  releaseDate: '2026-10-01T02:00:00.000Z',
}

test('organization', () => {
  expect(organization()).toMatchObject({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Agentra JSC',
    email: 'info@agentra.io.vn',
    url: 'https://agentra.io.vn',
  })
})

test('softwareApplication uses the feed version and both OS families', () => {
  const app = softwareApplication([asset], 'vi', 'https://eduflow.test/tai-ve')
  expect(app).toMatchObject({
    '@type': 'SoftwareApplication',
    name: 'EduFlow',
    softwareVersion: '1.0.0',
    operatingSystem: 'macOS 12+, Windows 10 22H2+',
    applicationCategory: 'EducationalApplication',
    downloadUrl: 'https://eduflow.test/tai-ve',
    inLanguage: 'vi',
  })
  expect(app).not.toHaveProperty('offers')
  expect(softwareApplication([], 'en', 'x')).not.toHaveProperty('softwareVersion')
})

test('faqPage, breadcrumb, howTo', () => {
  expect(faqPage([{ q: 'A?', a: 'B' }])).toMatchObject({
    '@type': 'FAQPage',
    mainEntity: [{ '@type': 'Question', name: 'A?', acceptedAnswer: { '@type': 'Answer', text: 'B' } }],
  })
  expect(breadcrumb([{ name: 'Home', url: 'https://x/' }, { name: 'Download', url: 'https://x/tai-ve' }]).itemListElement).toHaveLength(2)
  const h = howTo({ name: 'Install', description: 'd', steps: [{ name: 's1', text: 't1' }] })
  expect(h).toMatchObject({ '@type': 'HowTo', step: [{ '@type': 'HowToStep', name: 's1', text: 't1', position: 1 }] })
})
