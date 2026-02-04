import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { SpineStackApiError } from '@/types/spinestack-response'
import { type UploadPublisherPictureOptions, uploadPublisherPicture } from '@/services/spinestack-publishers'

type ErrorResponse = SpineStackApiError | Error

export default function useUploadPublisherPictureMutation() {
  const queryClient = useQueryClient()

  return useMutation<void, ErrorResponse, UploadPublisherPictureOptions>({
    mutationFn: uploadPublisherPicture,
    async onSuccess(_, { publisherId }) {
      queryClient.invalidateQueries(['publishers'])
      queryClient.invalidateQueries(['publisher', { id: publisherId }])
    },
  })
}
