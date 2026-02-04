import { type UseQueryOptions, useQuery } from '@tanstack/vue-query'
import type { MaybeRef } from '@vueuse/core'
import type { SpineStackApiError } from '@/types/spinestack-response'
import type { LibraryEntity, LibraryIncludes } from '@/types/spinestack-library'
import { getOneLibrary } from '@/services/spinestack-libraries'

interface UseLibraryQueryOptions<S = LibraryEntity> extends UseQueryOptions<LibraryEntity, ErrorResponse, S> {
  libraryId: MaybeRef<string>
  includes?: MaybeRef<LibraryIncludes[]>
}

type ErrorResponse = SpineStackApiError | Error

export default function useLibraryQuery<S = LibraryEntity>(
  options: UseLibraryQueryOptions<S>,
) {
  return useQuery<LibraryEntity, ErrorResponse, S>({
    queryKey: ['library', { id: options.libraryId }],
    queryFn: async () => {
      return await getOneLibrary({
        libraryId: unref(options.libraryId),
        includes: unref(options.includes),
      })
    },
    ...options,
  })
}
