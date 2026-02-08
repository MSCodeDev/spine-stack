import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { SpineStackApiError } from '@/types/spinestack-response'
import type { DownloadBookCoverOptions } from '@/services/spinestack-books'
import { downloadBookCover } from '@/services/spinestack-books'

type ErrorResponse = SpineStackApiError | Error

export default function useDownloadBookCoverMutation() {
  const queryClient = useQueryClient()

  return useMutation<void, ErrorResponse, DownloadBookCoverOptions>({
    mutationFn: downloadBookCover,
    async onSuccess(_, { bookId }) {
      queryClient.invalidateQueries(['books'])
      queryClient.invalidateQueries(['book', { id: bookId }])
    },
  })
}
