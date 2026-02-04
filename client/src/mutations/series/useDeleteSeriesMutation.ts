import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { SpineStackApiError } from '@/types/spinestack-response'
import { deleteOneSeries } from '@/services/spinestack-series'

type ErrorResponse = SpineStackApiError | Error

export default function useDeleteSeriesMutation() {
  const queryClient = useQueryClient()

  return useMutation<void, ErrorResponse, string>({
    mutationFn: deleteOneSeries,
    onSuccess(_, seriesId) {
      queryClient.invalidateQueries(['series'])
      queryClient.invalidateQueries(['series', { id: seriesId }])
    },
  })
}
