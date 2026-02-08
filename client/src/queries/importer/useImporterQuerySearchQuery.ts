import { type UseQueryOptions, useQuery } from '@tanstack/vue-query'
import type { SpineStackApiError } from '@/types/spinestack-response'
import type { MaybeRefDeep } from '@/types/reactivity'
import type { ExternalBookEntity } from '@/types/spinestack-external-book'
import type { SearchByQueryOptions } from '@/services/spinestack-importer'
import { searchByQuery } from '@/services/spinestack-importer'

type UseImporterQuerySearchQueryOptions<S = ExternalBookEntity[]> =
  UseQueryOptions<ExternalBookEntity[], ErrorResponse, S> &
  MaybeRefDeep<SearchByQueryOptions>

type ErrorResponse = SpineStackApiError | Error

export default function useImporterQuerySearchQuery<S = ExternalBookEntity[]>(
  options: UseImporterQuerySearchQueryOptions<S>,
) {
  return useQuery<ExternalBookEntity[], ErrorResponse, S>({
    queryKey: [
      'importer-query-search',
      {
        title: options.title,
        author: options.author,
        language: options.language,
        sources: options.sources,
        includes: options.includes,
      },
    ],
    queryFn: async () => {
      return await searchByQuery({
        title: unref(options.title),
        author: unref(options.author),
        language: unref(options.language),
        sources: unref(options.sources),
        includes: unref(options.includes),
      })
    },
    ...options,
  })
}
