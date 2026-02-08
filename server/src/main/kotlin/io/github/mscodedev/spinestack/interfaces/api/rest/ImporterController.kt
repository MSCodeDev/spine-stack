package io.github.mscodedev.spinestack.interfaces.api.rest

import io.github.mscodedev.spinestack.domain.model.IdDoesNotExistException
import io.github.mscodedev.spinestack.domain.model.RelationIdDoesNotExistException
import io.github.mscodedev.spinestack.domain.model.UserDoesNotHaveAccessException
import io.github.mscodedev.spinestack.domain.persistence.CollectionRepository
import io.github.mscodedev.spinestack.domain.persistence.LibraryRepository
import io.github.mscodedev.spinestack.infrastructure.importer.ImporterBookResult
import io.github.mscodedev.spinestack.infrastructure.importer.ImporterLifecycle
import io.github.mscodedev.spinestack.infrastructure.importer.ImporterProvider
import io.github.mscodedev.spinestack.infrastructure.importer.ImporterSource
import io.github.mscodedev.spinestack.infrastructure.security.SpineStackPrincipal
import io.github.mscodedev.spinestack.interfaces.api.rest.dto.BookEntityDto
import io.github.mscodedev.spinestack.interfaces.api.rest.dto.ImportDto
import io.github.mscodedev.spinestack.interfaces.api.rest.dto.ImporterEntityDto
import io.github.mscodedev.spinestack.interfaces.api.rest.dto.ImporterSourceEntityDto
import io.github.mscodedev.spinestack.interfaces.api.rest.dto.ReferenceExpansionImporter
import io.github.mscodedev.spinestack.interfaces.api.rest.dto.SuccessCollectionResponseDto
import io.github.mscodedev.spinestack.interfaces.api.rest.dto.SuccessEntityResponseDto
import io.github.mscodedev.spinestack.interfaces.api.rest.dto.toAttributesDto
import io.github.mscodedev.spinestack.interfaces.api.rest.dto.toDto
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.security.SecurityRequirement
import io.swagger.v3.oas.annotations.tags.Tag
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.coroutineScope
import mu.KotlinLogging
import org.hibernate.validator.constraints.ISBN
import org.springframework.http.MediaType
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

private val logger = KotlinLogging.logger {}

@Validated
@RestController
@RequestMapping("api", produces = [MediaType.APPLICATION_JSON_VALUE])
@Tag(
  name = "Importer",
  description = """
SpineStack provides an easy way to import book metadata from external sources such as
[Open Library](https://openlibrary.org/). The search is done by using the book
[ISBN](https://en.wikipedia.org/wiki/ISBN), which can be either in the ISBN-10 
or in the ISBN-13 format.

Books can be imported to an existing user library specified through the
collection ID in the request. The book created will contains the metadata from the
source without any special and additional data processing, and the cover will
be downloaded to the file system as well if available in the source. Missing
information such as the store, series, paid price, and billing dates will need
to be set manually later as the sources can't provide these metadata.

Imported books will contain the source information saved, so the metadata can be
synced eventually if needed in the future.

## Available sources

You can find below a relation of the existing sources. They can also be retrieved
programmatically by the API if needed, with extra metadata such as a multi language description.

| Key            | URL                     | Description                                         |
| -------------- | ----------------------- | --------------------------------------------------- |
| `CBL`          | https://cblservicos.org | Official Brazilian ISBN agency.                     |
| `OPEN_LIBRARY` | https://openlibrary.org | Book cataloging archive by Internet Archive.        |
| `SKOOB`        | https://skoob.com.br    | Collaborative social network for Brazilian readers. | 
  """,
)
class ImporterController(
  private val importerProviders: List<ImporterProvider>,
  private val collectionRepository: CollectionRepository,
  private val libraryRepository: LibraryRepository,
  private val importerLifecycle: ImporterLifecycle,
) {

  @GetMapping("v1/importer/sources")
  @Operation(summary = "Get all external sources", security = [SecurityRequirement(name = "Basic Auth")])
  fun getAllSources(): SuccessCollectionResponseDto<ImporterSourceEntityDto> {
    val sources = importerProviders.map { it.toDto() }
      .sortedBy { it.attributes.name }

    return SuccessCollectionResponseDto(sources)
  }

  @GetMapping("v1/importer/sources/{sourceId}")
  @Operation(summary = "Get a source by its id", security = [SecurityRequirement(name = "Basic Auth")])
  fun getOneSource(@PathVariable sourceId: String): SuccessEntityResponseDto<ImporterSourceEntityDto> {
    val source = importerProviders.firstOrNull { it.key.name == sourceId }
      ?: throw IdDoesNotExistException("Source not found")

    return SuccessEntityResponseDto(source.toDto())
  }

  @GetMapping("v1/importer/search/{isbn}")
  @Operation(
    summary = "Search a book by its ISBN in the external sources",
    security = [SecurityRequirement(name = "Basic Auth")],
  )
  suspend fun searchByIsbn(
    @PathVariable
    @ISBN(type = ISBN.Type.ANY)
    @Parameter(description = "Can be a ISBN-13 or ISBN-10 code, with or without dashes")
    @Schema(format = "isbn")
    isbn: String,
    @RequestParam(required = false, defaultValue = "") sources: Set<ImporterSource>,
    @RequestParam(required = false, defaultValue = "") includes: Set<ReferenceExpansionImporter>,
  ): SuccessCollectionResponseDto<ImporterEntityDto> {
    val results = coroutineScope {
      importerProviders
        .filter { it.key in sources }
        .ifEmpty { importerProviders }
        .map { source ->
          async(Dispatchers.IO) {
            runCatching { source.searchByIsbn(isbn) }
          }
        }
        .awaitAll()
        .flatMap { it.getOrElse { emptyList() } }
    }

    val expanded = if (includes.contains(ReferenceExpansionImporter.IMPORTER_SOURCE)) {
      results.map { book ->
        book.toDto(importerProviders.first { it.key == book.provider }.toAttributesDto())
      }
    } else {
      results.map { it.toDto() }
    }

    return SuccessCollectionResponseDto(expanded)
  }

  @GetMapping("v1/importer/search")
  @Operation(
    summary = "Search a book by title and/or author in the external sources",
    security = [SecurityRequirement(name = "Basic Auth")],
  )
  suspend fun searchByQuery(
    @RequestParam(required = false)
    @Parameter(description = "The book title to search for")
    title: String?,
    @RequestParam(required = false)
    @Parameter(description = "The author name to search for")
    author: String?,
    @RequestParam(required = false)
    @Parameter(description = "BCP-47 language tag to filter results (e.g., en-US, pt-BR)")
    language: String?,
    @RequestParam(required = false, defaultValue = "") sources: Set<ImporterSource>,
    @RequestParam(required = false, defaultValue = "") includes: Set<ReferenceExpansionImporter>,
  ): SuccessCollectionResponseDto<ImporterEntityDto> {
    if (title.isNullOrBlank() && author.isNullOrBlank()) {
      return SuccessCollectionResponseDto(emptyList())
    }

    val results = coroutineScope {
      importerProviders
        .filter { it.supportsQuerySearch }
        .filter { it.key in sources }
        .ifEmpty { importerProviders.filter { it.supportsQuerySearch } }
        .map { source ->
          async(Dispatchers.IO) {
            runCatching { source.searchByQuery(title, author, language) }
          }
        }
        .awaitAll()
        .flatMap { it.getOrElse { emptyList() } }
    }

    val expanded = if (includes.contains(ReferenceExpansionImporter.IMPORTER_SOURCE)) {
      results.map { book ->
        book.toDto(importerProviders.first { it.key == book.provider }.toAttributesDto())
      }
    } else {
      results.map { it.toDto() }
    }

    return SuccessCollectionResponseDto(expanded)
  }

  @PostMapping("v1/importer/import")
  @Operation(
    summary = "Import an external book into a collection",
    security = [SecurityRequirement(name = "Basic Auth")],
  )
  suspend fun importOneBook(
    @AuthenticationPrincipal principal: SpineStackPrincipal,
    @RequestBody import: ImportDto,
  ): SuccessEntityResponseDto<BookEntityDto> {
    val libraryId = collectionRepository.getLibraryIdOrNull(import.collection)
      ?: throw RelationIdDoesNotExistException("Collection not found")
    val library = libraryRepository.findById(libraryId)

    if (!principal.user.canAccessLibrary(library)) {
      throw UserDoesNotHaveAccessException()
    }

    val provider = importerProviders.first { it.key == import.source }

    // If book data is provided in the request, use it directly (for title/author search)
    // Otherwise, fetch from the source by ISBN (for ISBN search backward compatibility)
    val bookResult = if (import.title != null && import.contributors != null && import.publisher != null) {
      ImporterBookResult(
        id = import.id,
        provider = import.source,
        isbn = import.isbn,
        title = import.title,
        contributors = import.contributors.map {
          io.github.mscodedev.spinestack.infrastructure.importer.ImporterBookContributor(it.name, it.role)
        },
        publisher = import.publisher,
        synopsis = import.synopsis.orEmpty(),
        dimensions = import.dimensions?.let {
          io.github.mscodedev.spinestack.domain.model.Dimensions(
            width = it.width,
            height = it.height,
            depth = it.depth,
            unit = it.unit,
          )
        },
        coverUrl = import.coverUrl,
        pageCount = import.pageCount ?: 0,
        url = import.url,
      )
    } else {
      // Fallback to fetching from source
      val result = coroutineScope {
        runCatching {
          provider.searchByIsbn(import.isbn)
        }
      }

      if (result.isFailure) {
        throw result.exceptionOrNull()!!
      }

      result.getOrNull()
        ?.firstOrNull { it.id == import.id }
        ?: result.getOrNull()?.firstOrNull()
        ?: throw IdDoesNotExistException("Book not found in the source")
    }

    val book = importerLifecycle.importToCollection(
      collectionId = import.collection,
      import = bookResult,
      user = principal.user,
    )

    return SuccessEntityResponseDto(book)
  }
}
