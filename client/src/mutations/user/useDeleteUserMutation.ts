import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { SpineStackApiError } from '@/types/spinestack-response'
import { deleteOneUser } from '@/services/spinestack-users'

type ErrorResponse = SpineStackApiError | Error

export default function useDeleteUserMutation() {
  const queryClient = useQueryClient()

  return useMutation<void, ErrorResponse, string>({
    mutationFn: deleteOneUser,
    onSuccess(_, userId) {
      queryClient.invalidateQueries(['users'])
      queryClient.invalidateQueries(['user', { id: userId }])
      queryClient.invalidateQueries(['authentication-activity', { userId }])
    },
  })
}
