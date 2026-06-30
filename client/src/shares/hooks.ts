import { useMutation, useQuery } from '@tanstack/react-query'
import { createShare, getSharedSlideMeta } from './api'

export function useCreateShare() {
  return useMutation({
    mutationFn: createShare,
  })
}

export function useSharedSlideMeta(token: string | undefined) {
  return useQuery({
    queryKey: ['shared-slide', token],
    queryFn: () => getSharedSlideMeta(token ?? ''),
    enabled: Boolean(token),
  })
}
