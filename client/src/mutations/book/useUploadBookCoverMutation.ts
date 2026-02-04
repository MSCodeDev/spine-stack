import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { SpineStackApiError } from '@/types/spinestack-response'
import type { UploadBookCoverOptions } from '@/services/spinestack-books'
import { uploadBookCover } from '@/services/spinestack-books'

type ErrorResponse = SpineStackApiError | Error

export default function useUploadBookCoverMutation() {
  const queryClient = useQueryClient()

  return useMutation<void, ErrorResponse, UploadBookCoverOptions>({
    mutationFn: uploadBookCover,
    async onSuccess(_, { bookId }) {
      queryClient.invalidateQueries(['books'])
      queryClient.invalidateQueries(['book', { id: bookId }])
    },
  })
}
