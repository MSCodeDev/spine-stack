import { type UseQueryOptions, useQuery } from '@tanstack/vue-query'
import type { PaginatedResponse, SpineStackApiError } from '@/types/spinestack-response'
import type { TagEntity } from '@/types/spinestack-tag'
import type { GetAllTagsByLibraryParameters } from '@/services/spinestack-tags'
import { getAllTagsByLibrary } from '@/services/spinestack-tags'
import type { MaybeRefDeep } from '@/types/reactivity'

type UseLibraryTagsQueryOptions<S = PaginatedResponse<TagEntity>> =
  UseQueryOptions<PaginatedResponse<TagEntity>, ErrorResponse, S> &
  MaybeRefDeep<GetAllTagsByLibraryParameters>

type ErrorResponse = SpineStackApiError | Error

export default function useLibraryTagsQuery<S = PaginatedResponse<TagEntity>>(
  options: UseLibraryTagsQueryOptions<S>,
) {
  return useQuery<PaginatedResponse<TagEntity>, ErrorResponse, S>({
    queryKey: [
      'tags',
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
      return await getAllTagsByLibrary({
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
