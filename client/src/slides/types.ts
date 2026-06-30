export type Slide = {
  id: string
  report_id: string
  owner_id: string
  filename: string
  status: string
  file_size_bytes: number | null
  created_at: string
}

export type UploadSlidesInput = {
  reportId: string
  files: File[]
  onProgress?: (progress: UploadProgress) => void
}

export type UploadFileProgress = {
  name: string
  loaded: number
  total: number
  percent: number
  status: 'pending' | 'uploading' | 'complete'
}

export type UploadProgress = {
  files: UploadFileProgress[]
  totalLoaded: number
  totalSize: number
  percent: number
}
