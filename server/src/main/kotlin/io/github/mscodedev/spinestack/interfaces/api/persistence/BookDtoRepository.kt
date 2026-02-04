package io.github.mscodedev.spinestack.interfaces.api.persistence

import io.github.mscodedev.spinestack.domain.model.BookSearch
import io.github.mscodedev.spinestack.domain.model.SpineStackUser
import io.github.mscodedev.spinestack.interfaces.api.rest.dto.BookCreationDto
import io.github.mscodedev.spinestack.interfaces.api.rest.dto.BookEntityDto
import io.github.mscodedev.spinestack.interfaces.api.rest.dto.BookUpdateDto
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable

interface BookDtoRepository {
  fun findByIdOrNull(bookId: String): BookEntityDto?
  fun findAll(search: BookSearch, pageable: Pageable): Page<BookEntityDto>
  fun findAllByIsbnInLibraries(isbn: String, librariesIds: Collection<String>): Collection<BookEntityDto>

  fun findAllByIds(bookIds: Collection<String>, libraryId: String): Collection<BookEntityDto>

  fun insert(book: BookCreationDto, user: SpineStackUser): String
  fun update(bookId: String, book: BookUpdateDto, user: SpineStackUser)
}
