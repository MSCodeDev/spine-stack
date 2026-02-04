import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { SpineStackApiError } from '@/types/spinestack-response'
import { type UploadUserAvatarOptions, uploadUserAvatar } from '@/services/spinestack-users'

type ErrorResponse = SpineStackApiError | Error

export default function useUploadUserAvatarMutation() {
  const queryClient = useQueryClient()
  const userStore = useUserStore()

  return useMutation<void, ErrorResponse, UploadUserAvatarOptions>({
    mutationFn: uploadUserAvatar,
    async onSuccess(_, { userId }) {
      queryClient.invalidateQueries(['users'])
      queryClient.invalidateQueries(['user', { id: userId }])

      if (userId === userStore.me?.id) {
        await userStore.checkSession()
      }
    },
  })
}
