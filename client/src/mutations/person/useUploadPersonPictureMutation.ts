import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { SpineStackApiError } from '@/types/spinestack-response'
import { type UploadPersonPictureOptions, uploadPersonPicture } from '@/services/spinestack-people'

type ErrorResponse = SpineStackApiError | Error

export default function useUploadPersonPictureMutation() {
  const queryClient = useQueryClient()

  return useMutation<void, ErrorResponse, UploadPersonPictureOptions>({
    mutationFn: uploadPersonPicture,
    async onSuccess(_, { personId }) {
      queryClient.invalidateQueries(['people'])
      queryClient.invalidateQueries(['person', { id: personId }])
    },
  })
}
