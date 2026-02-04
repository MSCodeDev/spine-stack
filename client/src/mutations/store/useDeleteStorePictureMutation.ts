import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { SpineStackApiError } from '@/types/spinestack-response'
import { deleteStorePicture } from '@/services/spinestack-stores'

type ErrorResponse = SpineStackApiError | Error

export default function useDeleteStorePictureMutation() {
  const queryClient = useQueryClient()

  return useMutation<void, ErrorResponse, string>({
    mutationFn: deleteStorePicture,
    async onSuccess(_, storeId) {
      queryClient.invalidateQueries(['stores'])
      queryClient.invalidateQueries(['store', { id: storeId }])
    },
  })
}
