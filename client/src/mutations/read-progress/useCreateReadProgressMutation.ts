import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { SpineStackApiError } from '@/types/spinestack-response'
import type { ReadProgressCreation, ReadProgressEntity } from '@/types/spinestack-read-progress'
import { addOneReadProgress } from '@/services/spinestack-read-progresses'

type ErrorResponse = SpineStackApiError | Error

export default function useCreateReadProgressMutation() {
  const queryClient = useQueryClient()

  return useMutation<ReadProgressEntity, ErrorResponse, ReadProgressCreation>({
    mutationFn: addOneReadProgress,
    onSuccess(_, creation) {
      queryClient.invalidateQueries(['read-progresses', { bookId: creation.book }])
    },
  })
}
