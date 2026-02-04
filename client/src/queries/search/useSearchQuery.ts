import { type UseQueryOptions, useQuery } from '@tanstack/vue-query'
import type { SpineStackApiError } from '@/types/spinestack-response'
import type { MaybeRefDeep } from '@/types/reactivity'
import type { SearchObject } from '@/types/spinestack-search'
import type { SearchParameters } from '@/services/spinestack-search'
import { search } from '@/services/spinestack-search'

type UseSearchQueryOptions<S = SearchObject> =
  UseQueryOptions<SearchObject, ErrorResponse, S>
  & MaybeRefDeep<SearchParameters>

type ErrorResponse = SpineStackApiError | Error

export default function useSearchQuery<S = SearchObject>(
  options: UseSearchQueryOptions<S>,
) {
  return useQuery<SearchObject, ErrorResponse, S>({
    queryKey: [
      'search',
      {
        search: options.search,
        libraryId: options.libraryId,
      },
    ],
    queryFn: async () => {
      return await search({
        search: unref(options.search),
        libraryId: unref(options.libraryId),
      })
    },
    ...options,
  })
}
