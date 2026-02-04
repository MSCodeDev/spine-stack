import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { SpineStackApiError } from '@/types/spinestack-response'
import { deleteOneTag } from '@/services/spinestack-tags'

type ErrorResponse = SpineStackApiError | Error

export default function useDeleteTagMutation() {
  const queryClient = useQueryClient()

  return useMutation<void, ErrorResponse, string>({
    mutationFn: deleteOneTag,
    onSuccess(_, tagId) {
      queryClient.invalidateQueries(['tags'])
      queryClient.invalidateQueries(['tag', { id: tagId }])
    },
  })
}
