import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { SpineStackApiError } from '@/types/spinestack-response'
import type { ReadProgressUpdate } from '@/types/spinestack-read-progress'
import { updateOneReadProgress } from '@/services/spinestack-read-progresses'

type ErrorResponse = SpineStackApiError | Error

export default function useUpdateReadProgressMutation() {
  const queryClient = useQueryClient()

  return useMutation<void, ErrorResponse, ReadProgressUpdate>({
    mutationFn: updateOneReadProgress,
    async onSuccess(_, { id }) {
      queryClient.invalidateQueries(['read-progresses'])
      queryClient.invalidateQueries(['read-progress', { id }])
    },
  })
}
