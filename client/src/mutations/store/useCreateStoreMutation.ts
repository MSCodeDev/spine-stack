import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { addOneStore } from '@/services/spinestack-stores'
import type { StoreCreation, StoreEntity } from '@/types/spinestack-store'
import type { SpineStackApiError } from '@/types/spinestack-response'

type ErrorResponse = SpineStackApiError | Error

export default function useCreateStoreMutation() {
  const queryClient = useQueryClient()

  return useMutation<StoreEntity, ErrorResponse, StoreCreation>({
    mutationFn: addOneStore,
    onSuccess(_, creation) {
      queryClient.invalidateQueries(['stores', { libraryId: creation.library }])
    },
  })
}
