import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { SpineStackApiError } from '@/types/spinestack-response'
import { deleteOneCollection } from '@/services/spinestack-collections'

type ErrorResponse = SpineStackApiError | Error

export default function useDeleteCollectionMutation() {
  const queryClient = useQueryClient()

  return useMutation<void, ErrorResponse, string>({
    mutationFn: deleteOneCollection,
    onSuccess(_, collectionId) {
      queryClient.invalidateQueries(['collections'])
      queryClient.invalidateQueries(['collection', { id: collectionId }])
    },
  })
}
