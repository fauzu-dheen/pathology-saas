import { API_BASE, apiFetch } from '../lib/api'
import type { CreateShareInput, Share, SharedSlideMeta } from './types'

export function createShare({ reportId, slideId, expiresInHours = null }: CreateShareInput) {
  return apiFetch<Share>(`/reports/${reportId}/slides/${slideId}/share`, {
    method: 'POST',
    body: JSON.stringify({ expires_in_hours: expiresInHours }),
  })
}

export async function getSharedSlideMeta(token: string) {
  const response = await fetch(`${API_BASE}/shared/${token}`)
  if (!response.ok) throw new Error(`API error: ${response.status}`)
  return response.json() as Promise<SharedSlideMeta>
}

export function getSharedDziUrl(token: string) {
  return `${API_BASE}/shared/${token}/dzi.xml`
}

export function getSharedTileUrl(token: string, level: number, col: number, row: number) {
  return `${API_BASE}/shared/${token}/tiles/${level}/${col}_${row}.jpeg`
}
