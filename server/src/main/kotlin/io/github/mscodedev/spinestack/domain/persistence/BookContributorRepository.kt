package io.github.mscodedev.spinestack.domain.persistence

import io.github.mscodedev.spinestack.domain.model.BookContributor
import io.github.mscodedev.spinestack.interfaces.api.rest.dto.BookContributorEntityDto

interface BookContributorRepository {
  fun findByIdOrNull(bookContributorId: String): BookContributor?
  fun findByIdAsDtoOrNull(bookContributorId: String): BookContributorEntityDto?

  fun findAllByIds(bookContributorIds: Collection<String>): Collection<BookContributor>
  fun findAllByIdsAsDto(bookContributorIds: Collection<String>): Collection<BookContributorEntityDto>
  fun findAllByBookId(bookId: String): Collection<BookContributor>
  fun findAllAsDtoByBookId(bookId: String): Collection<BookContributorEntityDto>

  fun insert(bookContributor: BookContributor)
  fun insert(bookContributors: Collection<BookContributor>)

  fun delete(bookContributorId: String)
  fun deleteAll()
  fun deleteAllByBookId(bookId: String)
}
