import { type UseQueryOptions, useQuery } from '@tanstack/vue-query'
import type { MaybeRef } from '@vueuse/core'
import type { SpineStackApiError } from '@/types/spinestack-response'
import { getOnePerson } from '@/services/spinestack-people'
import type { PersonEntity, PersonIncludes } from '@/types/spinestack-person'

interface UsePersonQueryOptions<S = PersonEntity> extends UseQueryOptions<PersonEntity, ErrorResponse, S> {
  personId: MaybeRef<string>
  includes?: MaybeRef<PersonIncludes[]>
}

type ErrorResponse = SpineStackApiError | Error

export default function usePersonQuery<S = PersonEntity>(
  options: UsePersonQueryOptions<S>,
) {
  return useQuery<PersonEntity, ErrorResponse, S>({
    queryKey: ['person', { id: options.personId }],
    queryFn: async () => {
      return await getOnePerson({
        personId: unref(options.personId),
        includes: unref(options.includes),
      })
    },
    ...options,
  })
}
