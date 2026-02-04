import { type UseQueryOptions, useQuery } from '@tanstack/vue-query'
import type { SpineStackApiError } from '@/types/spinestack-response'
import type { MaybeRefDeep } from '@/types/reactivity'
import type { ExternalBookEntity } from '@/types/spinestack-external-book'
import type { SearchByIsbnOptions } from '@/services/spinestack-importer'
import { searchByIsbn } from '@/services/spinestack-importer'

type UseImporterSearchQueryOptions<S = ExternalBookEntity[]> =
  UseQueryOptions<ExternalBookEntity[], ErrorResponse, S> &
  MaybeRefDeep<SearchByIsbnOptions>

type ErrorResponse = SpineStackApiError | Error

export default function useImporterSearchQuery<S = ExternalBookEntity[]>(
  options: UseImporterSearchQueryOptions<S>,
) {
  return useQuery<ExternalBookEntity[], ErrorResponse, S>({
    queryKey: [
      'importer-search',
      {
        isbn: options.isbn,
        sources: options.sources,
        includes: options.includes,
      },
    ],
    queryFn: async () => {
      return await searchByIsbn({
        isbn: unref(options.isbn),
        sources: unref(options.sources),
        includes: unref(options.includes),
      })
    },
    ...options,
  })
}
