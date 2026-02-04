package io.github.mscodedev.spinestack.domain.model

data class Preference(
  val userId: String,
  val key: String,
  val value: String,
)
