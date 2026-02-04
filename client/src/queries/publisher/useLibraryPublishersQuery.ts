import { type UseQueryOptions, useQuery } from '@tanstack/vue-query'
import type { PaginatedResponse, SpineStackApiError } from '@/types/spinestack-response'
import type { PublisherEntity } from '@/types/spinestack-publisher'
import type { GetAllPublishersByLibraryParameters } from '@/services/spinestack-publishers'
import { getAllPublishersByLibrary } from '@/services/spinestack-publishers'
import type { MaybeRefDeep } from '@/types/reactivity'

type UseLibraryPublishersQueryOptions<S = PaginatedResponse<PublisherEntity>> =
  UseQueryOptions<PaginatedResponse<PublisherEntity>, ErrorResponse, S> &
  MaybeRefDeep<GetAllPublishersByLibraryParameters>

type ErrorResponse = SpineStackApiError | Error

export default function useLibraryPublishersQuery<S = PaginatedResponse<PublisherEntity>>(
  options: UseLibraryPublishersQueryOptions<S>,
) {
  return useQuery<PaginatedResponse<PublisherEntity>, ErrorResponse, S>({
    queryKey: [
      'publishers',
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
      return await getAllPublishersByLibrary({
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
