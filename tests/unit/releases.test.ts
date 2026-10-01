import { readFileSync } from 'node:fs'
import { describe, expect, test, vi } from 'vitest'
import { parse } from 'yaml'
import { resolveReleases } from '@/lib/releases'
import { fetchFeed } from '@/lib/releases/feed'
import { parseFeeds } from '@/lib/releases/parse'
import { downloadState, hasAssetFor } from '@/lib/releases/state'

const BASE = 'https://feed.example.test/desktop/'
const winYaml = readFileSync('tests/fixtures/latest.yml', 'utf8')
const win = parse(winYaml)
const mac = parse(readFileSync('tests/fixtures/latest-mac.yml', 'utf8'))
const EMPTY = { baseUrl: null, windows: null, mac: null }

describe('parseFeeds', () => {
  test('maps the three platforms and skips zip/blockmap', () => {
    const assets = parseFeeds({ windows: win, mac }, BASE)
    expect(assets.map((a) => a.platform)).toEqual(['windows-x64', 'macos-arm64', 'macos-x64'])
    expect(assets[0]).toMatchObject({ fileName: 'EduFlow Setup 1.0.0.exe', url: `${BASE}EduFlow%20Setup%201.0.0.exe`, sizeBytes: 312456789, version: '1.0.0' })
    expect(assets[1]).toMatchObject({ fileName: 'EduFlow-1.0.0-arm64.dmg', sizeBytes: 301234567 })
    expect(assets[2]).toMatchObject({ fileName: 'EduFlow-1.0.0.dmg', sizeBytes: 309876543 })
    expect(assets.every((a) => a.releaseDate.startsWith('2026-10-01'))).toBe(true)
  })
  test('missing or malformed feed yields no asset for that platform, no throw', () => {
    expect(parseFeeds({ mac }, BASE).map((a) => a.platform)).toEqual(['macos-arm64', 'macos-x64'])
    expect(parseFeeds({ windows: { nonsense: true }, mac: null }, BASE)).toEqual([])
  })
})

describe('resolveReleases', () => {
  test('pre-launch: no feed URL and an empty snapshot give no assets', () => {
    const info = resolveReleases({ base: null, windows: null, mac: null, snapshot: EMPTY })
    expect(info.assets).toEqual([])
    expect(downloadState(info.assets)).toBe('prelaunch')
  })
  test('feed down: the snapshot and its own base URL are used', () => {
    const info = resolveReleases({ base: null, windows: null, mac: null, snapshot: { baseUrl: BASE, windows: win, mac } })
    expect(info.assets).toHaveLength(3)
    expect(info.assets.every((a) => a.url.startsWith(BASE))).toBe(true)
    expect(info.source).toEqual({ windows: 'snapshot', mac: 'snapshot' })
  })
  test('snapshot without a base URL cannot build links, so it gives no assets', () => {
    expect(resolveReleases({ base: null, windows: null, mac: null, snapshot: { baseUrl: null, windows: win, mac } }).assets).toEqual([])
  })
  test('one OS published: Windows from the feed, macOS missing', () => {
    const info = resolveReleases({ base: BASE, windows: win, mac: null, snapshot: EMPTY })
    expect(info.assets.map((a) => a.platform)).toEqual(['windows-x64'])
    expect(info.source).toEqual({ windows: 'feed', mac: 'snapshot' })
    expect(downloadState(info.assets)).toBe('available')
    expect(hasAssetFor(info.assets, 'windows')).toBe(true)
    expect(hasAssetFor(info.assets, 'macos')).toBe(false)
  })
})

describe('fetchFeed', () => {
  const url = `${BASE}latest.yml`
  test('returns parsed YAML on 200 with ISR revalidate 600', async () => {
    const ok = vi.fn().mockResolvedValue(new Response(winYaml, { status: 200 }))
    expect(((await fetchFeed(url, ok)) as { version: string }).version).toBe('1.0.0')
    expect(ok).toHaveBeenCalledWith(url, expect.objectContaining({ next: { revalidate: 600 } }))
  })
  test('returns null on 404, network error and invalid YAML', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(await fetchFeed(url, vi.fn().mockResolvedValue(new Response('nope', { status: 404 })))).toBeNull()
    expect(await fetchFeed(url, vi.fn().mockRejectedValue(new Error('ECONNRESET')))).toBeNull()
    expect(await fetchFeed(url, vi.fn().mockResolvedValue(new Response('a: [b', { status: 200 })))).toBeNull()
    spy.mockRestore()
  })
  test('a 200 answer that is not a feed is treated as unavailable', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const url = 'https://feed.example.test/desktop/latest.yml'
    expect(await fetchFeed(url, vi.fn().mockResolvedValue(new Response('<!doctype html><title>Oops</title>', { status: 200 })))).toBeNull()
    expect(await fetchFeed(url, vi.fn().mockResolvedValue(new Response('', { status: 200 })))).toBeNull()
    expect(await fetchFeed(url, vi.fn().mockResolvedValue(new Response('version: 1.0.0', { status: 200 })))).toBeNull()
    spy.mockRestore()
  })
})
