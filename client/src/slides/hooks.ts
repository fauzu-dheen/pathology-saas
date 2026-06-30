import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deleteSlide, listSlides, uploadSlides } from './api'

export function slidesQueryKey(reportId: string) {
  return ['reports', reportId, 'slides'] as const
}

export function useSlides(reportId: string | undefined) {
  return useQuery({
    queryKey: slidesQueryKey(reportId ?? ''),
    queryFn: () => listSlides(reportId ?? ''),
    enabled: Boolean(reportId),
  })
}

export function useUploadSlides(reportId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: uploadSlides,
    onSuccess: () => {
      if (reportId) queryClient.invalidateQueries({ queryKey: slidesQueryKey(reportId) })
    },
  })
}

export function useDeleteSlide(reportId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (slideId: string) => deleteSlide(reportId ?? '', slideId),
    onSuccess: () => {
      if (reportId) queryClient.invalidateQueries({ queryKey: slidesQueryKey(reportId) })
    },
  })
}
