import { type UseQueryOptions, useQuery } from '@tanstack/vue-query'
import type { PaginatedResponse, SpineStackApiError } from '@/types/spinestack-response'
import type { PersonEntity } from '@/types/spinestack-person'
import type { GetAllPeopleByLibraryParameters } from '@/services/spinestack-people'
import { getAllPeopleByLibrary } from '@/services/spinestack-people'
import type { MaybeRefDeep } from '@/types/reactivity'

type UseLibraryPeopleQueryOptions<S = PaginatedResponse<PersonEntity>> =
  UseQueryOptions<PaginatedResponse<PersonEntity>, ErrorResponse, S> &
  MaybeRefDeep<GetAllPeopleByLibraryParameters>

type ErrorResponse = SpineStackApiError | Error

export default function useLibraryPeopleQuery<S = PaginatedResponse<PersonEntity>>(
  options: UseLibraryPeopleQueryOptions<S>,
) {
  return useQuery<PaginatedResponse<PersonEntity>, ErrorResponse, S>({
    queryKey: [
      'people',
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
      return await getAllPeopleByLibrary({
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
