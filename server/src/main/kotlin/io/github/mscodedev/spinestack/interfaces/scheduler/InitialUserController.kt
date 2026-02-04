package io.github.mscodedev.spinestack.interfaces.scheduler

import io.github.mscodedev.spinestack.domain.model.SpineStackUser
import io.github.mscodedev.spinestack.domain.service.SpineStackUserLifecycle
import mu.KotlinLogging
import org.apache.commons.lang3.RandomStringUtils
import org.springframework.boot.context.event.ApplicationReadyEvent
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile
import org.springframework.context.event.EventListener
import org.springframework.stereotype.Component

private val logger = KotlinLogging.logger {}

@Profile("!test & noclaim")
@Component
class InitialUserController(
  private val userLifecycle: SpineStackUserLifecycle,
  private val initialUsers: List<SpineStackUser>,
) {

  @EventListener(ApplicationReadyEvent::class)
  fun createInitialUserOnStartupIfNoneExist() {
    if (userLifecycle.countUsers() == 0L) {
      logger.info { "No users exist in database, creating initial users" }

      initialUsers.forEach {
        userLifecycle.createUser(it)
        logger.info { "Initial user created. Login: ${it.email}, Password: ${it.password}" }
      }
    }
  }
}

@Configuration
@Profile("dev")
class InitialUsersDevConfiguration {
  @Bean
  fun initialUsers(): List<SpineStackUser> = listOf(
    SpineStackUser("admin@example.org", "admin", isAdmin = true, "Administrator"),
    SpineStackUser("user@example.org", "user", isAdmin = false, "User"),
  )
}

@Configuration
@Profile("!dev")
class InitialUsersProdConfiguration {
  @Bean
  fun initialUsers(): List<SpineStackUser> = listOf(
    SpineStackUser(
      email = "admin@example.org",
      password = RandomStringUtils.randomAlphanumeric(12),
      isAdmin = true,
      name = "Administrator",
    ),
  )
}
