import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { SpineStackApiError } from '@/types/spinestack-response'
import { deletePersonPicture } from '@/services/spinestack-people'

type ErrorResponse = SpineStackApiError | Error

export default function useDeletePersonPictureMutation() {
  const queryClient = useQueryClient()

  return useMutation<void, ErrorResponse, string>({
    mutationFn: deletePersonPicture,
    async onSuccess(_, personId) {
      queryClient.invalidateQueries(['people'])
      queryClient.invalidateQueries(['person', { id: personId }])
    },
  })
}
