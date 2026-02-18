import { type UseQueryOptions, useQuery } from '@tanstack/vue-query'
import type { CollectionResponse, SpineStackApiError } from '@/types/spinestack-response'
import type { MaybeRefDeep } from '@/types/reactivity'
import type { ReadProgressEntity } from '@/types/spinestack-read-progress'
import type { GetReadProgressesByUserParameters } from '@/services/spinestack-read-progresses'
import { getReadProgressesByUser } from '@/services/spinestack-read-progresses'

type UseUserReadProgressesQueryOptions<S = CollectionResponse<ReadProgressEntity>> =
  UseQueryOptions<CollectionResponse<ReadProgressEntity>, ErrorResponse, S> &
  MaybeRefDeep<GetReadProgressesByUserParameters>

type ErrorResponse = SpineStackApiError | Error

export default function useUserReadProgressesQuery<S = CollectionResponse<ReadProgressEntity>>(
  options: UseUserReadProgressesQueryOptions<S>,
) {
  return useQuery<CollectionResponse<ReadProgressEntity>, ErrorResponse, S>({
    queryKey: ['read-progresses', { userId: options.userId, includes: options.includes }],
    queryFn: async () => {
      return await getReadProgressesByUser({
        userId: unref(options.userId),
        includes: unref(options.includes),
      })
    },
    ...options,
  })
}
