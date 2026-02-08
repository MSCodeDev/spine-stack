package io.github.mscodedev.spinestack.infrastructure.importer.openlibrary

import io.github.mscodedev.spinestack.domain.model.Dimensions
import io.github.mscodedev.spinestack.domain.model.LengthUnit
import io.github.mscodedev.spinestack.infrastructure.importer.ImporterBookContributor
import io.github.mscodedev.spinestack.infrastructure.importer.ImporterBookResult
import io.github.mscodedev.spinestack.infrastructure.importer.ImporterProvider
import io.github.mscodedev.spinestack.infrastructure.importer.ImporterSource
import io.github.mscodedev.spinestack.interfaces.api.rest.dto.BookLinksDto
import org.springframework.boot.info.BuildProperties
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.stereotype.Component
import org.springframework.web.reactive.function.client.WebClient
import org.springframework.web.reactive.function.client.awaitBodyOrNull

@Component("openLibraryImporterProvider")
class OpenLibraryImporterProvider(
  private val webClient: WebClient,
  private val buildProperties: BuildProperties,
) : ImporterProvider() {

  override val key: ImporterSource = ImporterSource.OPEN_LIBRARY

  override val name: String = "Open Library"

  final override val url: String = "https://openlibrary.org"

  override val baseUrl: String = url

  override val description: Map<String, String> = mapOf(
    "en-US" to """
      Open Library is an online project intended to create "one web page for every
      book ever published". It's a project of the Internet Archive, a non-profit organization.
    """.trimIndent(),
    "pt-BR" to """
      O Open Library é um projeto online com o objetivo de criar "uma página na internet
      para cada livro já publicado". É um projeto do Internet Archive, uma organização
      sem fins lucrativos.
    """.trimIndent(),
  )

  override val language: String = "all"

  override val supportsQuerySearch: Boolean = true

  override suspend fun searchByIsbn(isbn: String): Collection<ImporterBookResult> {
    val bibKey = "ISBN:$isbn"

    val results = webClient.get()
      .uri("$baseUrl/api/books") {
        it.queryParam("bibkeys", bibKey)
          .queryParam("jscmd", "data")
          .queryParam("format", "json")
          .build()
      }
      .headers {
        it[HttpHeaders.ACCEPT] = MediaType.APPLICATION_JSON_VALUE
        it[HttpHeaders.USER_AGENT] = "SpineStack/${buildProperties.version}"
      }
      .retrieve()
      .awaitBodyOrNull<OpenLibraryResultDto>()

    if (results.orEmpty().isEmpty() || !results!!.containsKey(bibKey)) {
      return emptyList()
    }

    val details = runCatching {
      webClient.get()
        .uri("$baseUrl/isbn/$isbn.json")
        .headers {
          it[HttpHeaders.ACCEPT] = MediaType.APPLICATION_JSON_VALUE
          it[HttpHeaders.USER_AGENT] = "SpineStack/${buildProperties.version}"
        }
        .retrieve()
        .awaitBodyOrNull<OpenLibraryBookDetailsDto>()
    }

    return listOf(results[bibKey]!!.toDomain(details.getOrNull()))
  }

  override suspend fun searchByQuery(title: String?, author: String?, language: String?): Collection<ImporterBookResult> {
    if (title.isNullOrBlank() && author.isNullOrBlank()) {
      return emptyList()
    }

    // Always filter by English for consistent results
    val langCode = "eng"

    val results = webClient.get()
      .uri("$baseUrl/search.json") {
        it.queryParam("limit", 12)
        it.queryParam("fields", SEARCH_FIELDS)
        it.queryParam("language", langCode)
        if (!title.isNullOrBlank()) {
          it.queryParam("title", title)
        }
        if (!author.isNullOrBlank()) {
          it.queryParam("author", author)
        }
        it.build()
      }
      .headers {
        it[HttpHeaders.ACCEPT] = MediaType.APPLICATION_JSON_VALUE
        it[HttpHeaders.USER_AGENT] = "SpineStack/${buildProperties.version}"
      }
      .retrieve()
      .awaitBodyOrNull<OpenLibrarySearchResultDto>()

    return results?.docs
      ?.filter { !it.isbn.isNullOrEmpty() }
      ?.map { it.toDomain() }
      .orEmpty()
  }

  private fun OpenLibrarySearchDocDto.toDomain(): ImporterBookResult {
    val isbn13 = isbn?.firstOrNull { it.length == 13 }
    val isbn10 = isbn?.firstOrNull { it.length == 10 }
    val selectedIsbn = isbn13 ?: isbn10 ?: isbn?.firstOrNull().orEmpty()

    return ImporterBookResult(
      id = key.removePrefix("/works/"),
      isbn = selectedIsbn,
      title = title.trim(),
      contributors = authorName.orEmpty().map { ImporterBookContributor(it, "Author") },
      publisher = publisher?.firstOrNull().orEmpty(),
      synopsis = "",
      pageCount = pageCount ?: 0,
      coverUrl = coverId?.let { "https://covers.openlibrary.org/b/id/$it-L.jpg" },
      url = this@OpenLibraryImporterProvider.url + key,
      links = BookLinksDto(openLibrary = this@OpenLibraryImporterProvider.url + key),
      provider = ImporterSource.OPEN_LIBRARY,
    )
  }

  private fun OpenLibraryBookDto.toDomain(details: OpenLibraryBookDetailsDto?): ImporterBookResult {
    val dimensions = details?.physicalDimensions
      ?.replace(UNIT_REGEX, "")
      ?.split(" x ")
      ?.mapNotNull(String::toFloatOrNull)
      .orEmpty()

    return ImporterBookResult(
      id = key.removePrefix("/books/"),
      isbn = identifiers["isbn_13"]?.get(0) ?: identifiers["isbn_10"]!![0],
      title = title.trim(),
      contributors = authors.orEmpty().map { ImporterBookContributor(it.name, "Author") } +
        details?.contributors.orEmpty().map { ImporterBookContributor(it.name, it.role.orEmpty().ifEmpty { "Author" }) },
      publisher = publishers[0].name,
      dimensions = if (dimensions.size == 3) {
        Dimensions(
          width = dimensions[1],
          height = dimensions[0],
          depth = dimensions[2],
          unit = if (details!!.physicalDimensions!!.contains("centimeters")) LengthUnit.CENTIMETER else LengthUnit.INCH,
        )
      } else {
        null
      },
      synopsis = details?.description?.value.orEmpty(),
      pageCount = pageCount ?: 0,
      coverUrl = cover?.large,
      url = this@OpenLibraryImporterProvider.url + key,
      links = BookLinksDto(openLibrary = this@OpenLibraryImporterProvider.url + key),
      provider = ImporterSource.OPEN_LIBRARY,
    )
  }

  companion object {
    private val UNIT_REGEX = "\\s(?:centimeters|inches)$".toRegex()
    private const val SEARCH_FIELDS = "key,title,author_name,isbn,publisher,number_of_pages_median,cover_i,first_publish_year"

    // Map ISO 639-1 codes to Open Library's ISO 639-2/B codes
    private val iso639_1ToOpenLibrary = mapOf(
      "en" to "eng",
      "es" to "spa",
      "fr" to "fre",
      "de" to "ger",
      "it" to "ita",
      "pt" to "por",
      "ru" to "rus",
      "ja" to "jpn",
      "zh" to "chi",
      "ko" to "kor",
      "ar" to "ara",
      "nl" to "dut",
      "pl" to "pol",
      "sv" to "swe",
      "da" to "dan",
      "no" to "nor",
      "fi" to "fin",
      "cs" to "cze",
      "hu" to "hun",
      "tr" to "tur",
      "he" to "heb",
      "el" to "gre",
      "th" to "tha",
      "vi" to "vie",
      "id" to "ind",
      "uk" to "ukr",
      "ro" to "rum",
      "bg" to "bul",
      "hr" to "hrv",
      "sk" to "slo",
      "ca" to "cat",
    )
  }
}
