import { type UseQueryOptions, useQuery } from '@tanstack/vue-query'
import type { PaginatedResponse, SpineStackApiError } from '@/types/spinestack-response'
import type { StoreEntity } from '@/types/spinestack-store'
import type { GetAllStoresByLibraryParameters } from '@/services/spinestack-stores'
import { getAllStoresByLibrary } from '@/services/spinestack-stores'
import type { MaybeRefDeep } from '@/types/reactivity'

type UseLibraryStoresQueryOptions<S = PaginatedResponse<StoreEntity>> =
  UseQueryOptions<PaginatedResponse<StoreEntity>, ErrorResponse, S> &
  MaybeRefDeep<GetAllStoresByLibraryParameters>

type ErrorResponse = SpineStackApiError | Error

export default function useLibraryStoresQuery<S = PaginatedResponse<StoreEntity>>(
  options: UseLibraryStoresQueryOptions<S>,
) {
  return useQuery<PaginatedResponse<StoreEntity>, ErrorResponse, S>({
    queryKey: [
      'stores',
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
      return await getAllStoresByLibrary({
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
