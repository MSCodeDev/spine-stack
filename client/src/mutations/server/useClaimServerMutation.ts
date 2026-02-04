import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { claimAdmin } from '@/services/spinestack-claim'
import type { UserEntity } from '@/types/spinestack-user'
import type { SpineStackApiError } from '@/types/spinestack-response'
import type { ClaimAdmin } from '@/types/spinestack-claim'

type ErrorResponse = SpineStackApiError | Error

export default function useClaimServerMutation() {
  const queryClient = useQueryClient()

  return useMutation<UserEntity, ErrorResponse, ClaimAdmin>({
    mutationFn: claimAdmin,
    onSuccess() {
      queryClient.setQueryData(['claim-status'], { isClaimed: true })
    },
  })
}
