import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { SpineStackApiError } from '@/types/spinestack-response'
import { deleteOnePerson } from '@/services/spinestack-people'

type ErrorResponse = SpineStackApiError | Error

export default function useDeletePersonMutation() {
  const queryClient = useQueryClient()

  return useMutation<void, ErrorResponse, string>({
    mutationFn: deleteOnePerson,
    onSuccess(_, personId) {
      queryClient.invalidateQueries(['people'])
      queryClient.invalidateQueries(['person', { id: personId }])
    },
  })
}
