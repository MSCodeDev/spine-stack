import { type UseQueryOptions, useQuery } from '@tanstack/vue-query'
import type { PaginatedResponse, SpineStackApiError } from '@/types/spinestack-response'
import type { BookEntity } from '@/types/spinestack-book'
import type { GetAllBooksByPublisherParameters } from '@/services/spinestack-books'
import { getAllBooksByPublisher } from '@/services/spinestack-books'
import type { MaybeRefDeep } from '@/types/reactivity'

type UsePublisherBooksQueryOptions<S = PaginatedResponse<BookEntity>> =
  UseQueryOptions<PaginatedResponse<BookEntity>, ErrorResponse, S> &
  MaybeRefDeep<GetAllBooksByPublisherParameters>

type ErrorResponse = SpineStackApiError | Error

export default function useSeriesBooksQuery<S = PaginatedResponse<BookEntity>>(
  options: UsePublisherBooksQueryOptions<S>,
) {
  return useQuery<PaginatedResponse<BookEntity>, ErrorResponse, S>({
    queryKey: [
      'books',
      {
        publisherId: options.publisherId,
        page: options.page,
        sort: options.sort,
        size: options.size,
        includes: options.includes,
      },
    ],
    queryFn: async () => {
      return await getAllBooksByPublisher({
        publisherId: unref(options.publisherId),
        page: unref(options.page),
        sort: unref(options.sort),
        size: unref(options.size),
        includes: unref(options.includes),
      })
    },
    ...options,
  })
}
