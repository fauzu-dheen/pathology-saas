import { API_BASE, apiFetch } from '../lib/api'
import type { Slide, UploadSlidesInput } from './types'

export function listSlides(reportId: string) {
  return apiFetch<Slide[]>(`/reports/${reportId}/slides`)
}

export async function uploadSlides({ reportId, files }: UploadSlidesInput) {
  for (const file of files) {
    const formData = new FormData()
    formData.append('file', file)

    await apiFetch<void>(`/reports/${reportId}/slides`, {
      method: 'POST',
      body: formData,
    })
  }
}

export function deleteSlide(reportId: string, slideId: string) {
  return apiFetch<void>(`/reports/${reportId}/slides/${slideId}`, {
    method: 'DELETE',
  })
}

export function getSlideDziUrl(reportId: string, slideId: string) {
  return `${API_BASE}/reports/${reportId}/slides/${slideId}/dzi.xml`
}

export function getSlideTileUrl(
  reportId: string,
  slideId: string,
  level: number,
  col: number,
  row: number,
) {
  return `${API_BASE}/reports/${reportId}/slides/${slideId}/tiles/${level}/${col}_${row}.jpeg`
}
