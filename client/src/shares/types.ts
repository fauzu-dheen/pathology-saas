export type Share = {
  token: string
  expires_at: string | null
}

export type CreateShareInput = {
  reportId: string
  slideId: string
  expiresInHours?: number | null
}

export type SharedSlideMeta = {
  filename: string
  report_title: string
}
