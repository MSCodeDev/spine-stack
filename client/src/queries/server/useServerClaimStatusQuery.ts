import { type UseQueryOptions, useQuery } from '@tanstack/vue-query'
import { getClaimStatus } from '@/services/spinestack-claim'
import type { SpineStackApiError } from '@/types/spinestack-response'
import type { ClaimStatus } from '@/types/spinestack-claim'

type ErrorResponse = SpineStackApiError | Error

export default function useServerClaimStatusQuery(options?: UseQueryOptions<ClaimStatus, ErrorResponse>) {
  return useQuery<ClaimStatus, ErrorResponse>({
    queryKey: ['claim-status'],
    queryFn: getClaimStatus,
    initialData: { isClaimed: false },
    ...options,
  })
}
