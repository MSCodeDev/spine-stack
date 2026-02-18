import { useMutation } from '@tanstack/vue-query'
import type { SpineStackApiError } from '@/types/spinestack-response'
import { updatePassword } from '@/services/spinestack-users'
import type { PasswordUpdate } from '@/types/spinestack-user'

type ErrorResponse = SpineStackApiError | Error

export default function useUpdatePasswordMutation() {
  return useMutation<void, ErrorResponse, PasswordUpdate>({
    mutationFn: updatePassword,
  })
}
