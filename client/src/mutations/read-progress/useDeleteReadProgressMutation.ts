import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { SpineStackApiError } from '@/types/spinestack-response'
import { deleteOneReadProgress } from '@/services/spinestack-read-progresses'

type ErrorResponse = SpineStackApiError | Error

export default function useDeleteReadProgressMutation() {
  const queryClient = useQueryClient()

  return useMutation<void, ErrorResponse, string>({
    mutationFn: deleteOneReadProgress,
    onSuccess(_, readProgressId) {
      queryClient.invalidateQueries(['read-progresses'])
      queryClient.invalidateQueries(['read-progress', { id: readProgressId }])
    },
  })
}
