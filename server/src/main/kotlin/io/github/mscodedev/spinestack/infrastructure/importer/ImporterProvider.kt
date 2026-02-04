package io.github.mscodedev.spinestack.infrastructure.importer

abstract class ImporterProvider {

  abstract val key: ImporterSource

  abstract val name: String

  abstract val url: String

  abstract val baseUrl: String

  abstract val description: Map<String, String>

  abstract val language: String

  abstract suspend fun searchByIsbn(isbn: String): Collection<ImporterBookResult>
}
