import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { SpineStackApiError } from '@/types/spinestack-response'
import type { SeriesUpdate } from '@/types/spinestack-series'
import { updateOneSeries } from '@/services/spinestack-series'

type ErrorResponse = SpineStackApiError | Error

export default function useUpdateSeriesMutation() {
  const queryClient = useQueryClient()

  return useMutation<void, ErrorResponse, SeriesUpdate>({
    mutationFn: updateOneSeries,
    async onSuccess(_, { id }) {
      queryClient.invalidateQueries(['series'])
      queryClient.invalidateQueries(['series', { id }])
    },
  })
}
