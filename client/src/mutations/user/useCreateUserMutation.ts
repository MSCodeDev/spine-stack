import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { SpineStackApiError } from '@/types/spinestack-response'
import type { UserCreation, UserEntity } from '@/types/spinestack-user'
import { addOneUser } from '@/services/spinestack-users'

type ErrorResponse = SpineStackApiError | Error

export default function useCreateUserMutation() {
  const queryClient = useQueryClient()

  return useMutation<UserEntity, ErrorResponse, UserCreation>({
    mutationFn: addOneUser,
    onSuccess() {
      queryClient.invalidateQueries(['users'])
    },
  })
}
