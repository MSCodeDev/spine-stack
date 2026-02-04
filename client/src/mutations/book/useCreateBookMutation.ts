import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { SpineStackApiError } from '@/types/spinestack-response'
import type { BookEntity, BookUpdate } from '@/types/spinestack-book'
import { addOneBook } from '@/services/spinestack-books'

type ErrorResponse = SpineStackApiError | Error

export default function useCreateBookMutation() {
  const queryClient = useQueryClient()

  return useMutation<BookEntity, ErrorResponse, BookUpdate>({
    mutationFn: addOneBook,
    async onSuccess() {
      queryClient.invalidateQueries(['books'])
    },
  })
}
