import { type UseQueryOptions, useQuery } from '@tanstack/vue-query'
import type { MaybeRef } from '@vueuse/core'
import type { SpineStackApiError } from '@/types/spinestack-response'
import { getOneSeries } from '@/services/spinestack-series'
import type { SeriesEntity, SeriesIncludes } from '@/types/spinestack-series'

interface UseSeriesQueryOptions<S = SeriesEntity> extends UseQueryOptions<SeriesEntity, ErrorResponse, S> {
  seriesId: MaybeRef<string>
  includes?: MaybeRef<SeriesIncludes[]>
}

type ErrorResponse = SpineStackApiError | Error

export default function useSeriesQuery<S = SeriesEntity>(
  options: UseSeriesQueryOptions<S>,
) {
  return useQuery<SeriesEntity, ErrorResponse, S>({
    queryKey: ['series', { id: options.seriesId }],
    queryFn: async () => {
      return await getOneSeries({
        seriesId: unref(options.seriesId),
        includes: unref(options.includes),
      })
    },
    ...options,
  })
}
