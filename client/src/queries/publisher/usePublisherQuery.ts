import { type UseQueryOptions, useQuery } from '@tanstack/vue-query'
import type { MaybeRef } from '@vueuse/core'
import type { SpineStackApiError } from '@/types/spinestack-response'
import { getOnePublisher } from '@/services/spinestack-publishers'
import type { PublisherEntity, PublisherIncludes } from '@/types/spinestack-publisher'

interface UsePublisherQueryOptions<S = PublisherEntity> extends UseQueryOptions<PublisherEntity, ErrorResponse, S> {
  publisherId: MaybeRef<string>
  includes?: MaybeRef<PublisherIncludes[]>
}

type ErrorResponse = SpineStackApiError | Error

export default function usePublisherQuery<S = PublisherEntity>(
  options: UsePublisherQueryOptions<S>,
) {
  return useQuery<PublisherEntity, ErrorResponse, S>({
    queryKey: ['publisher', { id: options.publisherId }],
    queryFn: async () => {
      return await getOnePublisher({
        publisherId: unref(options.publisherId),
        includes: unref(options.includes),
      })
    },
    ...options,
  })
}
