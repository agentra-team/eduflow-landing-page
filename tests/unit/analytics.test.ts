import { expect, test, vi } from 'vitest'
import { track } from '@/lib/analytics'

test('sends to Vercel always and to GA only when gtag is loaded', () => {
  const ga = vi.fn()
  const vercel = vi.fn()
  track({ name: 'download_click', platform: 'windows-x64', version: '1.0.0', location: 'hero' }, { ga, vercel, gaLoaded: () => false })
  expect(vercel).toHaveBeenCalledWith('download_click', { platform: 'windows-x64', version: '1.0.0', location: 'hero' })
  expect(ga).not.toHaveBeenCalled()
  track({ name: 'faq_open', id: 'q1' }, { ga, vercel, gaLoaded: () => true })
  expect(ga).toHaveBeenCalledWith('event', 'faq_open', { id: 'q1' })
})

test('never throws when a sink throws', () => {
  const boom = () => {
    throw new Error('sink down')
  }
  expect(() => track({ name: 'cta_click', id: 'x', location: 'hero' }, { ga: boom, vercel: boom, gaLoaded: () => true })).not.toThrow()
})
