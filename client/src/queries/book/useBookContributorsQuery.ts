import { type UseQueryOptions, useQuery } from '@tanstack/vue-query'
import type { CollectionResponse, SpineStackApiError } from '@/types/spinestack-response'
import type { GetAllContributorsByBookParameters } from '@/services/spinestack-book-contributors'
import { getAllContributorsByBook } from '@/services/spinestack-book-contributors'
import type { MaybeRefDeep } from '@/types/reactivity'
import type { ContributorEntity } from '@/types/spinestack-contributor'

type UseBookContributorsQueryOptions<S = CollectionResponse<ContributorEntity>> =
  UseQueryOptions<CollectionResponse<ContributorEntity>, ErrorResponse, S> &
  MaybeRefDeep<GetAllContributorsByBookParameters>

type ErrorResponse = SpineStackApiError | Error

export default function useBookContributorsQuery<S = CollectionResponse<ContributorEntity>>(
  options: UseBookContributorsQueryOptions<S>,
) {
  return useQuery<CollectionResponse<ContributorEntity>, ErrorResponse, S>({
    queryKey: [
      'book-contributors',
      {
        bookId: options.bookId,
        includes: options.includes,
      },
    ],
    queryFn: async () => {
      return await getAllContributorsByBook({
        bookId: unref(options.bookId),
        includes: unref(options.includes),
      })
    },
    ...options,
  })
}
