export type Report = {
  id: string
  title: string
  description: string | null
  owner_id: string
  created_at: string
  updated_at: string
}

export type CreateReportInput = {
  title: string
  description?: string | null
}

export type UpdateReportInput = {
  id: string
  title?: string | null
  description?: string | null
}
