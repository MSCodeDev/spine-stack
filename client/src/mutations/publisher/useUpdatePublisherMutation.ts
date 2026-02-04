import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { SpineStackApiError } from '@/types/spinestack-response'
import type { PublisherUpdate } from '@/types/spinestack-publisher'
import { updateOnePublisher } from '@/services/spinestack-publishers'

type ErrorResponse = SpineStackApiError | Error

export default function useUpdatePublisherMutation() {
  const queryClient = useQueryClient()

  return useMutation<void, ErrorResponse, PublisherUpdate>({
    mutationFn: updateOnePublisher,
    async onSuccess(_, { id }) {
      queryClient.invalidateQueries(['publishers'])
      queryClient.invalidateQueries(['publisher', { id }])
    },
  })
}
