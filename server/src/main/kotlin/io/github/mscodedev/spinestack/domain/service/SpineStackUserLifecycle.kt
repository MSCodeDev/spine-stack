package io.github.mscodedev.spinestack.domain.service

import io.github.mscodedev.spinestack.application.events.EventPublisher
import io.github.mscodedev.spinestack.domain.model.DomainEvent
import io.github.mscodedev.spinestack.domain.model.SpineStackUser
import io.github.mscodedev.spinestack.domain.model.UserEmailAlreadyExistsException
import io.github.mscodedev.spinestack.domain.persistence.AuthenticationActivityRepository
import io.github.mscodedev.spinestack.domain.persistence.SpineStackUserRepository
import io.github.mscodedev.spinestack.infrastructure.security.SpineStackPrincipal
import mu.KotlinLogging
import org.springframework.security.core.session.SessionRegistry
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.support.TransactionTemplate

private val logger = KotlinLogging.logger {}

@Service
class SpineStackUserLifecycle(
  private val userRepository: SpineStackUserRepository,
  private val authenticationActivityRepository: AuthenticationActivityRepository,
  private val passwordEncoder: PasswordEncoder,
  private val sessionRegistry: SessionRegistry,
  private val transactionTemplate: TransactionTemplate,
  private val eventPublisher: EventPublisher,
) {

  fun updatePassword(user: SpineStackUser, newPassword: String, expireSessions: Boolean) {
    logger.info { "Changing password for user ${user.email}" }
    val updatedUser = user.copy(password = passwordEncoder.encode(newPassword))
    userRepository.update(updatedUser)

    if (expireSessions) {
      expireSessions(updatedUser)
    }

    eventPublisher.publishEvent(DomainEvent.UserUpdated(updatedUser))
  }

  fun updateUser(user: SpineStackUser) {
    val existing = userRepository.findByIdOrNull(user.id)
    requireNotNull(existing) { "User doesn't exist, cannot update: $user" }

    val toUpdate = user.copy(password = existing.password)
    logger.info { "Update user: $toUpdate" }
    userRepository.update(toUpdate)

    val expireSessions = existing.isAdmin != user.isAdmin

    if (expireSessions) {
      expireSessions(toUpdate)
    }

    eventPublisher.publishEvent(DomainEvent.UserUpdated(toUpdate))
  }

  fun countUsers() = userRepository.count()

  @Throws(UserEmailAlreadyExistsException::class)
  fun createUser(spinestackUser: SpineStackUser): SpineStackUser {
    if (userRepository.existsByEmailIgnoreCase(spinestackUser.email)) {
      throw UserEmailAlreadyExistsException("A user with the same email already exists: ${spinestackUser.email}")
    }

    val toCreate = spinestackUser.copy(password = passwordEncoder.encode(spinestackUser.password))
    userRepository.insert(toCreate)

    val createdUser = userRepository.findByIdOrNull(spinestackUser.id)!!
    logger.info { "User created: $createdUser" }

    eventPublisher.publishEvent(DomainEvent.UserAdded(toCreate))

    return createdUser
  }

  fun deleteUser(user: SpineStackUser) {
    logger.info { "Deleting user: $user" }

    transactionTemplate.executeWithoutResult {
      authenticationActivityRepository.deleteByUser(user)
      userRepository.delete(user.id)
    }

    expireSessions(user)

    eventPublisher.publishEvent(DomainEvent.UserDeleted(user))
  }

  fun expireSessions(user: SpineStackUser) {
    logger.info { "Expiring all sessions for user: ${user.email}" }
    sessionRegistry
      .getAllSessions(SpineStackPrincipal(user), false)
      .forEach {
        logger.info { "Expiring session: ${it.sessionId}" }
        it.expireNow()
      }
  }
}
