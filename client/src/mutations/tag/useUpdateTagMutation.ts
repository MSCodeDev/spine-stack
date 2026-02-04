import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { SpineStackApiError } from '@/types/spinestack-response'
import type { TagUpdate } from '@/types/spinestack-tag'
import { updateOneTag } from '@/services/spinestack-tags'

type ErrorResponse = SpineStackApiError | Error

export default function useUpdateTagMutation() {
  const queryClient = useQueryClient()

  return useMutation<void, ErrorResponse, TagUpdate>({
    mutationFn: updateOneTag,
    async onSuccess(_, { id }) {
      queryClient.invalidateQueries(['tags'])
      queryClient.invalidateQueries(['tag', { id }])
    },
  })
}
