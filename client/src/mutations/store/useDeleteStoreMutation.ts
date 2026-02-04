import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { SpineStackApiError } from '@/types/spinestack-response'
import { deleteOneStore } from '@/services/spinestack-stores'

type ErrorResponse = SpineStackApiError | Error

export default function useDeleteStoreMutation() {
  const queryClient = useQueryClient()

  return useMutation<void, ErrorResponse, string>({
    mutationFn: deleteOneStore,
    onSuccess(_, storeId) {
      queryClient.invalidateQueries(['stores'])
      queryClient.invalidateQueries(['store', { id: storeId }])
    },
  })
}
