import { API_BASE, apiFetch } from '../lib/api'
import type { Slide, UploadFileProgress, UploadProgress, UploadSlidesInput } from './types'

export function listSlides(reportId: string) {
  return apiFetch<Slide[]>(`/reports/${reportId}/slides`)
}

function emitUploadProgress(
  files: UploadFileProgress[],
  onProgress?: (progress: UploadProgress) => void,
) {
  const totalLoaded = files.reduce((sum, file) => sum + file.loaded, 0)
  const totalSize = files.reduce((sum, file) => sum + file.total, 0)

  onProgress?.({
    files: files.map((file) => ({ ...file })),
    totalLoaded,
    totalSize,
    percent: totalSize === 0 ? 0 : Math.round((totalLoaded / totalSize) * 100),
  })
}

function uploadSlideFile(
  reportId: string,
  file: File,
  onProgress: (loaded: number) => void,
) {
  const token = localStorage.getItem('access_token')
  const formData = new FormData()
  formData.append('file', file)

  return new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest()

    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(event.loaded)
    }

    request.onload = () => {
      if (request.status >= 200 && request.status < 300) {
        onProgress(file.size)
        resolve()
      } else {
        reject(new Error(`API error: ${request.status}`))
      }
    }

    request.onerror = () => {
      reject(new Error('Network error during upload'))
    }

    request.open('POST', `${API_BASE}/reports/${reportId}/slides`)
    if (token) request.setRequestHeader('Authorization', `Bearer ${token}`)
    request.send(formData)
  })
}

export async function uploadSlides({ reportId, files, onProgress }: UploadSlidesInput) {
  const progressFiles: UploadFileProgress[] = files.map((file) => ({
    name: file.name,
    loaded: 0,
    total: file.size,
    percent: 0,
    status: 'pending',
  }))

  emitUploadProgress(progressFiles, onProgress)

  for (const [index, file] of files.entries()) {
    progressFiles[index] = {
      ...progressFiles[index],
      status: 'uploading',
    }
    emitUploadProgress(progressFiles, onProgress)

    await uploadSlideFile(reportId, file, (loaded) => {
      progressFiles[index] = {
        ...progressFiles[index],
        loaded,
        percent: file.size === 0 ? 100 : Math.round((loaded / file.size) * 100),
        status: loaded >= file.size ? 'complete' : 'uploading',
      }
      emitUploadProgress(progressFiles, onProgress)
    })

    progressFiles[index] = {
      ...progressFiles[index],
      loaded: file.size,
      percent: 100,
      status: 'complete',
    }
    emitUploadProgress(progressFiles, onProgress)
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
