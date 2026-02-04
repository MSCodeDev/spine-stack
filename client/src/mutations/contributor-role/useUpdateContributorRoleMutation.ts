import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { SpineStackApiError } from '@/types/spinestack-response'
import type { ContributorRoleUpdate } from '@/types/spinestack-contributor-role'
import { updateOneContributorRole } from '@/services/spinestack-contributor-roles'

type ErrorResponse = SpineStackApiError | Error

export default function useUpdateContributorRoleMutation() {
  const queryClient = useQueryClient()

  return useMutation<void, ErrorResponse, ContributorRoleUpdate>({
    mutationFn: updateOneContributorRole,
    async onSuccess(_, { id }) {
      queryClient.invalidateQueries(['contributor-roles'])
      queryClient.invalidateQueries(['contributor-role', { id }])
    },
  })
}
