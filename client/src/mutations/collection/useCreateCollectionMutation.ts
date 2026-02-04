import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { addOneCollection } from '@/services/spinestack-collections'
import type { CollectionCreation, CollectionEntity } from '@/types/spinestack-collection'
import type { SpineStackApiError } from '@/types/spinestack-response'

type ErrorResponse = SpineStackApiError | Error

export default function useCreateCollectionMutation() {
  const queryClient = useQueryClient()

  return useMutation<CollectionEntity, ErrorResponse, CollectionCreation>({
    mutationFn: addOneCollection,
    onSuccess(_, creation) {
      queryClient.invalidateQueries(['collections', { libraryId: creation.library }])
    },
  })
}
