import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { addOneLibrary } from '@/services/spinestack-libraries'
import type { LibraryCreation, LibraryEntity } from '@/types/spinestack-library'
import type { SpineStackApiError } from '@/types/spinestack-response'

type ErrorResponse = SpineStackApiError | Error

export default function useCreateLibraryMutation() {
  const queryClient = useQueryClient()

  return useMutation<LibraryEntity, ErrorResponse, LibraryCreation>({
    mutationFn: addOneLibrary,
    onSuccess() {
      queryClient.invalidateQueries(['libraries'])
      queryClient.invalidateQueries(['libraries-owned'])
    },
  })
}
