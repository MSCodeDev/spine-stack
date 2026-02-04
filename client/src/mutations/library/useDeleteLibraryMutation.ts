import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { SpineStackApiError } from '@/types/spinestack-response'
import { deleteOneLibrary } from '@/services/spinestack-libraries'

type ErrorResponse = SpineStackApiError | Error

export default function useDeleteLibraryMutation() {
  const queryClient = useQueryClient()

  return useMutation<void, ErrorResponse, string>({
    mutationFn: deleteOneLibrary,
    onSuccess(_, libraryId) {
      queryClient.invalidateQueries(['libraries'])
      queryClient.invalidateQueries(['libraries-owned'])
      queryClient.invalidateQueries(['library', { id: libraryId }])
    },
  })
}
