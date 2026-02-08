package io.github.mscodedev.spinestack.infrastructure.importer

abstract class ImporterProvider {

  abstract val key: ImporterSource

  abstract val name: String

  abstract val url: String

  abstract val baseUrl: String

  abstract val description: Map<String, String>

  abstract val language: String

  abstract val supportsQuerySearch: Boolean

  abstract suspend fun searchByIsbn(isbn: String): Collection<ImporterBookResult>

  abstract suspend fun searchByQuery(title: String?, author: String?, language: String? = null): Collection<ImporterBookResult>
}
