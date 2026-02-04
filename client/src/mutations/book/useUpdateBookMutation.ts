import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { SpineStackApiError } from '@/types/spinestack-response'
import type { BookUpdate } from '@/types/spinestack-book'
import { updateOneBook } from '@/services/spinestack-books'

type ErrorResponse = SpineStackApiError | Error

export default function useUpdateBookMutation() {
  const queryClient = useQueryClient()

  return useMutation<void, ErrorResponse, BookUpdate>({
    mutationFn: updateOneBook,
    async onSuccess(_, { id }) {
      queryClient.invalidateQueries(['books'])
      queryClient.invalidateQueries(['book', { id }])
    },
  })
}
