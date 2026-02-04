import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { addOneSeries } from '@/services/spinestack-series'
import type { SeriesCreation, SeriesEntity } from '@/types/spinestack-series'
import type { SpineStackApiError } from '@/types/spinestack-response'

type ErrorResponse = SpineStackApiError | Error

export default function useCreateSeriesMutation() {
  const queryClient = useQueryClient()

  return useMutation<SeriesEntity, ErrorResponse, SeriesCreation>({
    mutationFn: addOneSeries,
    onSuccess(_, creation) {
      queryClient.invalidateQueries(['series', { libraryId: creation.library }])
    },
  })
}
