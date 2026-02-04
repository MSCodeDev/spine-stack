import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { SpineStackApiError } from '@/types/spinestack-response'
import { deleteBookCover } from '@/services/spinestack-books'

type ErrorResponse = SpineStackApiError | Error

export default function useDeleteBookCoverMutation() {
  const queryClient = useQueryClient()

  return useMutation<void, ErrorResponse, string>({
    mutationFn: deleteBookCover,
    async onSuccess(_, bookId) {
      queryClient.invalidateQueries(['books'])
      queryClient.invalidateQueries(['book', { id: bookId }])
    },
  })
}
