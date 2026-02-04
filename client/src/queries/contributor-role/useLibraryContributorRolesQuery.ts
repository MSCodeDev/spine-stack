import { type UseQueryOptions, useQuery } from '@tanstack/vue-query'
import type { PaginatedResponse, SpineStackApiError } from '@/types/spinestack-response'
import type { ContributorRoleEntity } from '@/types/spinestack-contributor-role'
import type { GetAllContributorRolesByLibraryParameters } from '@/services/spinestack-contributor-roles'
import { getAllContributorRolesByLibrary } from '@/services/spinestack-contributor-roles'
import type { MaybeRefDeep } from '@/types/reactivity'

type UseLibraryContributorRolesQueryOptions<S = PaginatedResponse<ContributorRoleEntity>> =
  UseQueryOptions<PaginatedResponse<ContributorRoleEntity>, ErrorResponse, S> &
  MaybeRefDeep<GetAllContributorRolesByLibraryParameters>

type ErrorResponse = SpineStackApiError | Error

export default function useLibraryContributorRolesQuery<S = PaginatedResponse<ContributorRoleEntity>>(
  options: UseLibraryContributorRolesQueryOptions<S>,
) {
  return useQuery<PaginatedResponse<ContributorRoleEntity>, ErrorResponse, S>({
    queryKey: [
      'contributor-roles',
      {
        libraryId: options.libraryId,
        search: options.search,
        page: options.page,
        sort: options.sort,
        size: options.size,
        includes: options.includes,
        unpaged: options.unpaged,
      },
    ],
    queryFn: async () => {
      return await getAllContributorRolesByLibrary({
        libraryId: unref(options.libraryId),
        search: unref(options.search),
        page: unref(options.page),
        sort: unref(options.sort),
        size: unref(options.size),
        includes: unref(options.includes),
        unpaged: unref(options.unpaged),
      })
    },
    ...options,
  })
}
