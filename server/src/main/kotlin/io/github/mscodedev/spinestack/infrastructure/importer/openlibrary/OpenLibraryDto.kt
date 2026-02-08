package io.github.mscodedev.spinestack.infrastructure.importer.openlibrary

import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.core.JsonParser
import com.fasterxml.jackson.core.JsonToken
import com.fasterxml.jackson.databind.DeserializationContext
import com.fasterxml.jackson.databind.JsonDeserializer
import com.fasterxml.jackson.databind.annotation.JsonDeserialize

typealias OpenLibraryResultDto = Map<String, OpenLibraryBookDto>

data class OpenLibraryBookDto(
  val key: String,
  val authors: List<OpenLibraryContributorDto>? = emptyList(),
  val cover: OpenLibraryCoverDto? = null,
  val identifiers: Map<String, List<String>> = emptyMap(),
  @field:JsonProperty("number_of_pages") val pageCount: Int? = 0,
  val publishers: List<OpenLibraryPublisherDto> = emptyList(),
  val title: String,
  val url: String,
)

data class OpenLibraryBookDetailsDto(
  @field:JsonProperty("physical_dimensions") val physicalDimensions: String? = "",
  val contributors: List<OpenLibraryContributorDto>? = emptyList(),
  @set:JsonDeserialize(using = OpenLibraryTextDeserializer::class)
  var description: OpenLibraryTextDto? = null,
)

data class OpenLibraryTextDto(val value: String)

data class OpenLibraryContributorDto(
  val name: String,
  val role: String? = null,
)

data class OpenLibraryPublisherDto(val name: String)

data class OpenLibraryCoverDto(val large: String? = "")

// Search API DTOs
data class OpenLibrarySearchResultDto(
  val docs: List<OpenLibrarySearchDocDto> = emptyList(),
  val numFound: Int = 0,
)

data class OpenLibrarySearchDocDto(
  val key: String,
  val title: String,
  @field:JsonProperty("author_name") val authorName: List<String>? = emptyList(),
  val isbn: List<String>? = emptyList(),
  val publisher: List<String>? = emptyList(),
  @field:JsonProperty("number_of_pages_median") val pageCount: Int? = 0,
  @field:JsonProperty("cover_i") val coverId: Int? = null,
  @field:JsonProperty("first_publish_year") val firstPublishYear: Int? = null,
)

class OpenLibraryTextDeserializer : JsonDeserializer<OpenLibraryTextDto>() {
  override fun deserialize(p: JsonParser, ctxt: DeserializationContext): OpenLibraryTextDto? {
    return when (p.currentToken) {
      JsonToken.VALUE_NULL -> null
      JsonToken.VALUE_STRING -> OpenLibraryTextDto(p.text)
      else -> p.readValueAs(OpenLibraryTextDto::class.java)
    }
  }
}
