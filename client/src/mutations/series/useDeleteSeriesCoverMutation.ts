import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { SpineStackApiError } from '@/types/spinestack-response'
import { deleteSeriesCover } from '@/services/spinestack-series'

type ErrorResponse = SpineStackApiError | Error

export default function useDeleteSeriesCoverMutation() {
  const queryClient = useQueryClient()

  return useMutation<void, ErrorResponse, string>({
    mutationFn: deleteSeriesCover,
    async onSuccess(_, seriesId) {
      queryClient.invalidateQueries(['series'])
      queryClient.invalidateQueries(['series', { id: seriesId }])
    },
  })
}
