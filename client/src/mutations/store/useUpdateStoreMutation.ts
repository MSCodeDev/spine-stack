import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { SpineStackApiError } from '@/types/spinestack-response'
import type { StoreUpdate } from '@/types/spinestack-store'
import { updateOneStore } from '@/services/spinestack-stores'

type ErrorResponse = SpineStackApiError | Error

export default function useUpdateStoreMutation() {
  const queryClient = useQueryClient()

  return useMutation<void, ErrorResponse, StoreUpdate>({
    mutationFn: updateOneStore,
    async onSuccess(_, { id }) {
      queryClient.invalidateQueries(['stores'])
      queryClient.invalidateQueries(['store', { id }])
    },
  })
}
