package io.github.mscodedev.spinestack.domain.model

open class SeriesSearch(
  val libraryIds: kotlin.collections.Collection<String>? = null,
  val userId: String? = null,
  val searchTerm: String? = null,
)
