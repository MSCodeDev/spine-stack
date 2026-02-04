import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { SpineStackApiError } from '@/types/spinestack-response'
import type { UploadSeriesCoverOptions } from '@/services/spinestack-series'
import { uploadSeriesCover } from '@/services/spinestack-series'

type ErrorResponse = SpineStackApiError | Error

export default function useUploadSeriesCoverMutation() {
  const queryClient = useQueryClient()

  return useMutation<void, ErrorResponse, UploadSeriesCoverOptions>({
    mutationFn: uploadSeriesCover,
    async onSuccess(_, { seriesId }) {
      queryClient.invalidateQueries(['series'])
      queryClient.invalidateQueries(['series', { id: seriesId }])
    },
  })
}
