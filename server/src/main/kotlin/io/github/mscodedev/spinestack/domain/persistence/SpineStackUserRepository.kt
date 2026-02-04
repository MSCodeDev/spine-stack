package io.github.mscodedev.spinestack.domain.persistence

import io.github.mscodedev.spinestack.domain.model.SpineStackUser
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable

interface SpineStackUserRepository {
  fun findByIdOrNull(userId: String): SpineStackUser?
  fun findByEmailIgnoreCaseOrNull(email: String): SpineStackUser?

  fun findAll(): Collection<SpineStackUser>
  fun findAll(pageable: Pageable): Page<SpineStackUser>
  fun findAllByIds(userIds: Collection<String>): Collection<SpineStackUser>

  fun existsByEmailIgnoreCase(email: String): Boolean

  fun insert(user: SpineStackUser)
  fun update(user: SpineStackUser)

  fun delete(userId: String)
  fun deleteAll()

  fun count(): Long
}
