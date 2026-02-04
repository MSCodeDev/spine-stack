package io.github.mscodedev.spinestack.infrastructure.importer

import io.github.mscodedev.spinestack.domain.model.Dimensions
import io.github.mscodedev.spinestack.domain.model.Weight
import io.github.mscodedev.spinestack.interfaces.api.rest.dto.BookLinksDto
import javax.money.MonetaryAmount

data class ImporterBookResult(
  val id: String,
  val provider: ImporterSource,
  val isbn: String,
  val title: String,
  val contributors: List<ImporterBookContributor>,
  val publisher: String,
  val number: String = "",
  val subtitle: String = "",
  val synopsis: String = "",
  val dimensions: Dimensions? = null,
  val labelPrice: MonetaryAmount? = null,
  val coverUrl: String? = null,
  val pageCount: Int = 0,
  val url: String? = null,
  val weight: Weight? = null,
  val links: BookLinksDto = BookLinksDto(),
)

data class ImporterBookContributor(
  val name: String,
  val role: String,
)
