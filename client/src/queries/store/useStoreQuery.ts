import { type UseQueryOptions, useQuery } from '@tanstack/vue-query'
import type { MaybeRef } from '@vueuse/core'
import type { SpineStackApiError } from '@/types/spinestack-response'
import { getOneStore } from '@/services/spinestack-stores'
import type { StoreEntity, StoreIncludes } from '@/types/spinestack-store'

interface UseStoreQueryOptions<S = StoreEntity> extends UseQueryOptions<StoreEntity, ErrorResponse, S> {
  storeId: MaybeRef<string>
  includes?: MaybeRef<StoreIncludes[]>
}

type ErrorResponse = SpineStackApiError | Error

export default function useStoreQuery<S = StoreEntity>(
  options: UseStoreQueryOptions<S>,
) {
  return useQuery<StoreEntity, ErrorResponse, S>({
    queryKey: ['store', { id: options.storeId }],
    queryFn: async () => {
      return await getOneStore({
        storeId: unref(options.storeId),
        includes: unref(options.includes),
      })
    },
    ...options,
  })
}
