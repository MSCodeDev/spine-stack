package io.github.mscodedev.spinestack.domain.model

open class TagSearch(
  val libraryIds: kotlin.collections.Collection<String>? = null,
  val userId: String? = null,
  val searchTerm: String? = null,
)
