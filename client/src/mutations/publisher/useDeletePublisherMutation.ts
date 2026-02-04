import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { SpineStackApiError } from '@/types/spinestack-response'
import { deleteOnePublisher } from '@/services/spinestack-publishers'

type ErrorResponse = SpineStackApiError | Error

export default function useDeletePublisherMutation() {
  const queryClient = useQueryClient()

  return useMutation<void, ErrorResponse, string>({
    mutationFn: deleteOnePublisher,
    onSuccess(_, publisherId) {
      queryClient.invalidateQueries(['publishers'])
      queryClient.invalidateQueries(['publisher', { id: publisherId }])
    },
  })
}
