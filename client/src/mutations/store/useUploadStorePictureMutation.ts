import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { SpineStackApiError } from '@/types/spinestack-response'
import type { UploadStorePictureOptions } from '@/services/spinestack-stores'
import { uploadStorePicture } from '@/services/spinestack-stores'

type ErrorResponse = SpineStackApiError | Error

export default function useUploadStorePictureMutation() {
  const queryClient = useQueryClient()

  return useMutation<void, ErrorResponse, UploadStorePictureOptions>({
    mutationFn: uploadStorePicture,
    async onSuccess(_, { storeId }) {
      queryClient.invalidateQueries(['stores'])
      queryClient.invalidateQueries(['store', { id: storeId }])
    },
  })
}
