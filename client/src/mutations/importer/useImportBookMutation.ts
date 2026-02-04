import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { SpineStackApiError } from '@/types/spinestack-response'
import { importOneBook } from '@/services/spinestack-importer'
import type { BookEntity } from '@/types/spinestack-book'
import type { ImportOneBook } from '@/types/spinestack-importer-source'
import { getRelationship } from '@/utils/api'

type ErrorResponse = SpineStackApiError | Error

export default function useImportBookMutation() {
  const queryClient = useQueryClient()

  return useMutation<BookEntity, ErrorResponse, ImportOneBook>({
    mutationFn: importOneBook,
    onSuccess(book) {
      const library = getRelationship(book, 'LIBRARY')

      queryClient.invalidateQueries(['books', { libraryId: library?.id }])
    },
  })
}
