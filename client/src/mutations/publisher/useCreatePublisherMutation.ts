import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { addOnePublisher } from '@/services/spinestack-publishers'
import type { PublisherCreation, PublisherEntity } from '@/types/spinestack-publisher'
import type { SpineStackApiError } from '@/types/spinestack-response'

type ErrorResponse = SpineStackApiError | Error

export default function useCreatePublisherMutation() {
  const queryClient = useQueryClient()

  return useMutation<PublisherEntity, ErrorResponse, PublisherCreation>({
    mutationFn: addOnePublisher,
    onSuccess(_, creation) {
      queryClient.invalidateQueries(['publishers', { libraryId: creation.library }])
    },
  })
}
