package io.github.mscodedev.spinestack.domain.model

import java.io.Serializable

data class Weight(
  val value: Float,
  val unit: MassUnit = MassUnit.KILOGRAM,
) : Serializable
