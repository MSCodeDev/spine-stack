import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { addOneContributorRole } from '@/services/spinestack-contributor-roles'
import type { ContributorRoleCreation, ContributorRoleEntity } from '@/types/spinestack-contributor-role'
import type { SpineStackApiError } from '@/types/spinestack-response'

type ErrorResponse = SpineStackApiError | Error

export default function useCreateContributorRoleMutation() {
  const queryClient = useQueryClient()

  return useMutation<ContributorRoleEntity, ErrorResponse, ContributorRoleCreation>({
    mutationFn: addOneContributorRole,
    onSuccess(_, creation) {
      queryClient.invalidateQueries(['contributor-roles', { libraryId: creation.library }])
    },
  })
}
