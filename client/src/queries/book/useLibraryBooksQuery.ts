import { type UseQueryOptions, useQuery } from '@tanstack/vue-query'
import type { PaginatedResponse, SpineStackApiError } from '@/types/spinestack-response'
import type { BookEntity } from '@/types/spinestack-book'
import type { GetAllBooksByLibraryParameters } from '@/services/spinestack-books'
import { getAllBooksByLibrary } from '@/services/spinestack-books'
import type { MaybeRefDeep } from '@/types/reactivity'

type UseLibraryBooksQueryOptions<S = PaginatedResponse<BookEntity>> =
  UseQueryOptions<PaginatedResponse<BookEntity>, ErrorResponse, S> &
  MaybeRefDeep<GetAllBooksByLibraryParameters>

type ErrorResponse = SpineStackApiError | Error

export default function useLibraryBooksQuery<S = PaginatedResponse<BookEntity>>(
  options: UseLibraryBooksQueryOptions<S>,
) {
  return useQuery<PaginatedResponse<BookEntity>, ErrorResponse, S>({
    queryKey: [
      'books',
      {
        libraryId: options.libraryId,
        search: options.search,
        page: options.page,
        sort: options.sort,
        size: options.size,
        includes: options.includes,
      },
    ],
    queryFn: async () => {
      return await getAllBooksByLibrary({
        libraryId: unref(options.libraryId),
        search: unref(options.search),
        page: unref(options.page),
        sort: unref(options.sort),
        size: unref(options.size),
        includes: unref(options.includes),
      })
    },
    ...options,
  })
}
