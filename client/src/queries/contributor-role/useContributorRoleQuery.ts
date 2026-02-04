import { type UseQueryOptions, useQuery } from '@tanstack/vue-query'
import type { MaybeRef } from '@vueuse/core'
import type { SpineStackApiError } from '@/types/spinestack-response'
import { getOneContributorRole } from '@/services/spinestack-contributor-roles'
import type { ContributorRoleEntity, ContributorRoleIncludes } from '@/types/spinestack-contributor-role'

interface UseContributorRoleQueryOptions<S = ContributorRoleEntity> extends UseQueryOptions<ContributorRoleEntity, ErrorResponse, S> {
  contributorRoleId: MaybeRef<string>
  includes?: MaybeRef<ContributorRoleIncludes[]>
}

type ErrorResponse = SpineStackApiError | Error

export default function useContributorRoleQuery<S = ContributorRoleEntity>(
  options: UseContributorRoleQueryOptions<S>,
) {
  return useQuery<ContributorRoleEntity, ErrorResponse, S>({
    queryKey: ['contributor-role', { id: options.contributorRoleId }],
    queryFn: async () => {
      return await getOneContributorRole({
        contributorRoleId: unref(options.contributorRoleId),
        includes: unref(options.includes),
      })
    },
    ...options,
  })
}
