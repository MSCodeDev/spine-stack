import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { SpineStackApiError } from '@/types/spinestack-response'
import { deleteOneContributorRole } from '@/services/spinestack-contributor-roles'

type ErrorResponse = SpineStackApiError | Error

export default function useDeleteContributorRoleMutation() {
  const queryClient = useQueryClient()

  return useMutation<void, ErrorResponse, string>({
    mutationFn: deleteOneContributorRole,
    onSuccess(_, contributorRoleId) {
      queryClient.invalidateQueries(['contributor-roles'])
      queryClient.invalidateQueries(['contributor-role', { id: contributorRoleId }])
    },
  })
}
