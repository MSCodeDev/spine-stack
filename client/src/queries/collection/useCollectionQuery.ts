import { type UseQueryOptions, useQuery } from '@tanstack/vue-query'
import type { MaybeRef } from '@vueuse/core'
import type { SpineStackApiError } from '@/types/spinestack-response'
import { getOneCollection } from '@/services/spinestack-collections'
import type { CollectionEntity, CollectionIncludes } from '@/types/spinestack-collection'

interface UseCollectionQueryOptions<S = CollectionEntity> extends UseQueryOptions<CollectionEntity, ErrorResponse, S> {
  collectionId: MaybeRef<string>
  includes?: MaybeRef<CollectionIncludes[]>
}

type ErrorResponse = SpineStackApiError | Error

export default function useCollectionQuery<S = CollectionEntity>(
  options: UseCollectionQueryOptions<S>,
) {
  return useQuery<CollectionEntity, ErrorResponse, S>({
    queryKey: ['collection', { id: options.collectionId }],
    queryFn: async () => {
      return await getOneCollection({
        collectionId: unref(options.collectionId),
        includes: unref(options.includes),
      })
    },
    ...options,
  })
}
