import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import robots, { AI_BOTS } from '@/app/robots'

beforeEach(() => vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://eduflow.test'))
afterEach(() => vi.unstubAllEnvs())

const REQUIRED = ['OAI-SearchBot', 'ChatGPT-User', 'GPTBot', 'Claude-SearchBot', 'Claude-User', 'ClaudeBot', 'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot-Extended', 'CCBot']

test('robots allows everyone and names every AI bot in its own group (spec §9.1)', () => {
  expect([...AI_BOTS].sort()).toEqual([...REQUIRED].sort())
  expect(robots()).toEqual({
    rules: [
      { userAgent: '*', allow: '/' },
      { userAgent: AI_BOTS, allow: '/' },
    ],
    sitemap: 'https://eduflow.test/sitemap.xml',
  })
})
