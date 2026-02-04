import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { SpineStackApiError } from '@/types/spinestack-response'
import type { CollectionUpdate } from '@/types/spinestack-collection'
import { updateOneCollection } from '@/services/spinestack-collections'

type ErrorResponse = SpineStackApiError | Error

export default function useUpdateCollectionMutation() {
  const queryClient = useQueryClient()

  return useMutation<void, ErrorResponse, CollectionUpdate>({
    mutationFn: updateOneCollection,
    async onSuccess(_, { id }) {
      queryClient.invalidateQueries(['collections'])
      queryClient.invalidateQueries(['collection', { id }])
    },
  })
}
