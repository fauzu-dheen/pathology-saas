import { apiFetch } from '../lib/api'
import type { CreateReportInput, Report, UpdateReportInput } from './types'

export function listReports() {
  return apiFetch<Report[]>('/reports')
}

export function createReport(input: CreateReportInput) {
  return apiFetch<void>('/reports', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function updateReport({ id, ...input }: UpdateReportInput) {
  return apiFetch<void>(`/reports/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

export function deleteReport(id: string) {
  return apiFetch<void>(`/reports/${id}`, {
    method: 'DELETE',
  })
}
