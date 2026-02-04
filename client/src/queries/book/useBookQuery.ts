import { type UseQueryOptions, useQuery } from '@tanstack/vue-query'
import type { MaybeRef } from '@vueuse/core'
import type { SpineStackApiError } from '@/types/spinestack-response'
import { getOneBook } from '@/services/spinestack-books'
import type { BookEntity, BookIncludes } from '@/types/spinestack-book'

interface UseBookQueryOptions<S = BookEntity> extends UseQueryOptions<BookEntity, ErrorResponse, S> {
  bookId: MaybeRef<string>
  includes?: MaybeRef<BookIncludes[]>
}

type ErrorResponse = SpineStackApiError | Error

export default function useBookQuery<S = BookEntity>(
  options: UseBookQueryOptions<S>,
) {
  return useQuery<BookEntity, ErrorResponse, S>({
    queryKey: ['book', { id: options.bookId, includes: options.includes }],
    queryFn: async () => {
      return await getOneBook({
        bookId: unref(options.bookId),
        includes: unref(options.includes),
      })
    },
    ...options,
  })
}
