import { type UseQueryOptions, useQuery } from '@tanstack/vue-query'
import type { PaginatedResponse, SpineStackApiError } from '@/types/spinestack-response'
import type { SeriesEntity } from '@/types/spinestack-series'
import type { GetAllSeriesByLibraryParameters } from '@/services/spinestack-series'
import { getAllSeriesByLibrary } from '@/services/spinestack-series'
import type { MaybeRefDeep } from '@/types/reactivity'

type UseLibrarySeriesQueryOptions<S = PaginatedResponse<SeriesEntity>> =
  UseQueryOptions<PaginatedResponse<SeriesEntity>, ErrorResponse, S> &
  MaybeRefDeep<GetAllSeriesByLibraryParameters>

type ErrorResponse = SpineStackApiError | Error

export default function useLibrarySeriesQuery<S = PaginatedResponse<SeriesEntity>>(
  options: UseLibrarySeriesQueryOptions<S>,
) {
  return useQuery<PaginatedResponse<SeriesEntity>, ErrorResponse, S>({
    queryKey: [
      'series',
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
      return await getAllSeriesByLibrary({
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
