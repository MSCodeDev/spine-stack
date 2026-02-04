import { type UseQueryOptions, useQuery } from '@tanstack/vue-query'
import type {
  GetAuthenticationActivityFromUserOptions,
} from '@/services/spinestack-users'
import {
  getAuthenticationActivityFromUser,
} from '@/services/spinestack-users'
import type { PaginatedResponse, SpineStackApiError } from '@/types/spinestack-response'
import type { MaybeRefDeep } from '@/types/reactivity'
import type { AuthenticationActivityEntity } from '@/types/spinestack-authentication-activity'

type UseUserAuthenticationActivityQueryOptions<S = PaginatedResponse<AuthenticationActivityEntity>> =
  UseQueryOptions<PaginatedResponse<AuthenticationActivityEntity>, ErrorResponse, S>
  & MaybeRefDeep<GetAuthenticationActivityFromUserOptions>

type ErrorResponse = SpineStackApiError | Error

export default function useUserAuthenticationActivityQuery<S = PaginatedResponse<AuthenticationActivityEntity>>(
  options: UseUserAuthenticationActivityQueryOptions<S>,
) {
  return useQuery<PaginatedResponse<AuthenticationActivityEntity>, ErrorResponse, S>({
    queryKey: [
      'authentication-activity',
      {
        userId: options.userId,
        page: options.page,
        sort: options.sort,
        size: options.size,
        includes: options.includes,
      },
    ],
    queryFn: async () => {
      return await getAuthenticationActivityFromUser({
        userId: unref(options.userId),
        page: unref(options.page),
        sort: unref(options.sort),
        size: unref(options.size),
        includes: unref(options.includes),
      })
    },
    keepPreviousData: true,
    ...options,
  })
}
