import { type UseQueryOptions, useQuery } from '@tanstack/vue-query'
import type { MaybeRef } from '@vueuse/core'
import type { SpineStackApiError } from '@/types/spinestack-response'
import type { ReadProgressEntity, ReadProgressIncludes } from '@/types/spinestack-read-progress'
import { getOneReadProgress } from '@/services/spinestack-read-progresses'

interface UseReadProgressQueryOptions<S = ReadProgressEntity> extends UseQueryOptions<ReadProgressEntity, ErrorResponse, S> {
  readProgressId: MaybeRef<string>
  includes?: MaybeRef<ReadProgressIncludes[]>
}

type ErrorResponse = SpineStackApiError | Error

export default function useReadProgressQuery<S = ReadProgressEntity>(
  options: UseReadProgressQueryOptions<S>,
) {
  return useQuery<ReadProgressEntity, ErrorResponse, S>({
    queryKey: ['read-progress', { id: options.readProgressId }],
    queryFn: async () => {
      return await getOneReadProgress({
        readProgressId: unref(options.readProgressId),
        includes: unref(options.includes),
      })
    },
    ...options,
  })
}
