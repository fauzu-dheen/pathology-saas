import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createReport, deleteReport, listReports, updateReport } from './api'

export const reportsQueryKey = ['reports'] as const

export function useReports() {
  return useQuery({
    queryKey: reportsQueryKey,
    queryFn: listReports,
  })
}

export function useCreateReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportsQueryKey })
    },
  })
}

export function useUpdateReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportsQueryKey })
    },
  })
}

export function useDeleteReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportsQueryKey })
    },
  })
}
