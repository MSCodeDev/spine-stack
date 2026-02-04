import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { SpineStackApiError } from '@/types/spinestack-response'
import { updateUser } from '@/services/spinestack-users'
import type { UserUpdate } from '@/types/spinestack-user'

type ErrorResponse = SpineStackApiError | Error

export default function useUpdateUserMutation() {
  const queryClient = useQueryClient()
  const userStore = useUserStore()

  return useMutation<void, ErrorResponse, UserUpdate>({
    mutationFn: updateUser,
    async onSuccess(_, { id }) {
      queryClient.invalidateQueries(['users'])
      queryClient.invalidateQueries(['user', { id }])

      if (id === userStore.me?.id) {
        await userStore.checkSession()
      }
    },
  })
}
