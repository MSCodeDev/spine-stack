import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { SpineStackApiError } from '@/types/spinestack-response'
import { deleteUserAvatar } from '@/services/spinestack-users'

type ErrorResponse = SpineStackApiError | Error

export default function useDeleteUserAvatarMutation() {
  const queryClient = useQueryClient()
  const userStore = useUserStore()

  return useMutation<void, ErrorResponse, string>({
    mutationFn: deleteUserAvatar,
    async onSuccess(_, userId) {
      queryClient.invalidateQueries(['users'])
      queryClient.invalidateQueries(['user', { id: userId }])

      if (userId === userStore.me?.id) {
        await userStore.checkSession()
      }
    },
  })
}
