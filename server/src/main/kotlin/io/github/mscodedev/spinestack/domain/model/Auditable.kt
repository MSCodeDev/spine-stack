package io.github.mscodedev.spinestack.domain.model

import java.time.LocalDateTime

interface Auditable {
  val createdAt: LocalDateTime
  val modifiedAt: LocalDateTime
}
