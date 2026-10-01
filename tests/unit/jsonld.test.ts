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
  expect(organization('vi')).toMatchObject({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Agentra JSC',
    email: 'info@agentra.io.vn',
    url: 'https://agentra.io.vn',
    address: { addressLocality: 'Đà Nẵng', addressCountry: 'VN' },
  })
  expect(organization('en')).toMatchObject({ address: { addressLocality: 'Da Nang', addressCountry: 'VN' } })
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

test('softwareApplication takes the version and date of the newest of two assets, whatever the order', () => {
  const newer = { ...asset, platform: 'macos-arm64' as const, version: '1.0.1', releaseDate: '2026-10-03T02:00:00.000Z' }
  for (const assets of [[asset, newer], [newer, asset]]) {
    expect(softwareApplication(assets, 'vi', 'https://eduflow.test/tai-ve')).toMatchObject({ softwareVersion: '1.0.1', datePublished: '2026-10-03' })
  }
})

test('softwareApplication leaves out datePublished when no asset has a valid date', () => {
  const undated = { ...asset, releaseDate: '' }
  const app = softwareApplication([undated], 'vi', 'https://eduflow.test/tai-ve')
  expect(app).toMatchObject({ softwareVersion: '1.0.0' })
  expect(app).not.toHaveProperty('datePublished')
})

test('an asset without a date does not hide the date of the other one', () => {
  const dated = { ...asset, platform: 'macos-arm64' as const, version: '1.0.1' }
  const undated = { ...asset, releaseDate: '' }
  for (const assets of [[undated, dated], [dated, undated]]) {
    expect(softwareApplication(assets, 'en', 'https://eduflow.test/en/download')).toMatchObject({ softwareVersion: '1.0.1', datePublished: '2026-10-01' })
  }
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
