package io.github.mscodedev.spinestack.domain.persistence

import io.github.mscodedev.spinestack.domain.model.AuthenticationActivity
import io.github.mscodedev.spinestack.domain.model.SpineStackUser
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import java.time.LocalDateTime

interface AuthenticationActivityRepository {
  fun findAll(pageable: Pageable): Page<AuthenticationActivity>
  fun findAllByUser(user: SpineStackUser, pageable: Pageable): Page<AuthenticationActivity>
  fun findMostRecentByUser(user: SpineStackUser): AuthenticationActivity?

  fun insert(activity: AuthenticationActivity)

  fun deleteByUser(user: SpineStackUser)
  fun deleteOlderThan(dateTime: LocalDateTime)
}
