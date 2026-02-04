import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { addOneTag } from '@/services/spinestack-tags'
import type { TagCreation, TagEntity } from '@/types/spinestack-tag'
import type { SpineStackApiError } from '@/types/spinestack-response'

type ErrorResponse = SpineStackApiError | Error

export default function useCreateTagMutation() {
  const queryClient = useQueryClient()

  return useMutation<TagEntity, ErrorResponse, TagCreation>({
    mutationFn: addOneTag,
    onSuccess(_, creation) {
      queryClient.invalidateQueries(['tags', { libraryId: creation.library }])
    },
  })
}
