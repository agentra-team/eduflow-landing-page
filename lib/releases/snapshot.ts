import snapshot from '@/content/releases.json'

export interface ReleaseSnapshot {
  baseUrl: string | null
  windows: unknown
  mac: unknown
}

/** Bản chụp feed commit trong repo. Ban đầu rỗng (chưa phát hành). Cập nhật bằng `pnpm sync-releases`. */
export const releaseSnapshot = snapshot as ReleaseSnapshot
