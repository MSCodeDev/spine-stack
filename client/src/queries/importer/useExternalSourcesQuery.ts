import { type UseQueryOptions, useQuery } from '@tanstack/vue-query'
import type { SpineStackApiError } from '@/types/spinestack-response'
import type { ExternalBookEntity } from '@/types/spinestack-external-book'
import { getAllSources } from '@/services/spinestack-importer'
import type { ImporterSourceEntity } from '@/types/spinestack-importer-source'

type UseImporterSearchQueryOptions<S = ImporterSourceEntity[]> =
  UseQueryOptions<ImporterSourceEntity[], ErrorResponse, S>

type ErrorResponse = SpineStackApiError | Error

export default function useExternalSourcesQuery<S = ExternalBookEntity[]>(
  options?: UseImporterSearchQueryOptions<S>,
) {
  return useQuery<ImporterSourceEntity[], ErrorResponse, S>({
    queryKey: ['external-sources'],
    queryFn: getAllSources,
    staleTime: Infinity,
    ...options,
  })
}
