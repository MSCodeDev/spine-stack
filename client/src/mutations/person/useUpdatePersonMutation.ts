import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { SpineStackApiError } from '@/types/spinestack-response'
import type { PersonUpdate } from '@/types/spinestack-person'
import { updateOnePerson } from '@/services/spinestack-people'

type ErrorResponse = SpineStackApiError | Error

export default function useUpdatePersonMutation() {
  const queryClient = useQueryClient()

  return useMutation<void, ErrorResponse, PersonUpdate>({
    mutationFn: updateOnePerson,
    async onSuccess(_, { id }) {
      queryClient.invalidateQueries(['people'])
      queryClient.invalidateQueries(['person', { id }])
    },
  })
}
