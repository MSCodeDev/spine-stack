import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { SpineStackApiError } from '@/types/spinestack-response'
import type { LibraryUpdate } from '@/types/spinestack-library'
import { updateOneLibrary } from '@/services/spinestack-libraries'

type ErrorResponse = SpineStackApiError | Error

export default function useUpdateLibraryMutation() {
  const queryClient = useQueryClient()

  return useMutation<void, ErrorResponse, LibraryUpdate>({
    mutationFn: updateOneLibrary,
    async onSuccess(_, { id }) {
      queryClient.invalidateQueries(['libraries'])
      queryClient.invalidateQueries(['libraries-owned'])
      queryClient.invalidateQueries(['library', { id }])
    },
  })
}
