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
}
