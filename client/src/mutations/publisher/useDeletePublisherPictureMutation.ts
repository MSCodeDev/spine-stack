import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { SpineStackApiError } from '@/types/spinestack-response'
import { deletePublisherPicture } from '@/services/spinestack-publishers'

type ErrorResponse = SpineStackApiError | Error

export default function useDeletePublisherPictureMutation() {
  const queryClient = useQueryClient()

  return useMutation<void, ErrorResponse, string>({
    mutationFn: deletePublisherPicture,
    async onSuccess(_, publisherId) {
      queryClient.invalidateQueries(['publishers'])
      queryClient.invalidateQueries(['publisher', { id: publisherId }])
    },
  })
}
