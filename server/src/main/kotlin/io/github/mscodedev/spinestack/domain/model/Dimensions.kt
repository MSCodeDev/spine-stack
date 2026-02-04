package io.github.mscodedev.spinestack.domain.model

import java.io.Serializable

data class Dimensions(
  val width: Float,
  val height: Float,
  val depth: Float,
  val unit: LengthUnit = LengthUnit.CENTIMETER,
) : Serializable
