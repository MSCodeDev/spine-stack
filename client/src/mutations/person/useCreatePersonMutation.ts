import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { addOnePerson } from '@/services/spinestack-people'
import type { PersonCreation, PersonEntity } from '@/types/spinestack-person'
import type { SpineStackApiError } from '@/types/spinestack-response'

type ErrorResponse = SpineStackApiError | Error

export default function useCreatePersonMutation() {
  const queryClient = useQueryClient()

  return useMutation<PersonEntity, ErrorResponse, PersonCreation>({
    mutationFn: addOnePerson,
    onSuccess(_, creation) {
      queryClient.invalidateQueries(['people', { libraryId: creation.library }])
    },
  })
}
