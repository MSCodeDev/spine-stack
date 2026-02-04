package io.github.mscodedev.spinestack.infrastructure.security

import io.github.mscodedev.spinestack.domain.persistence.SpineStackUserRepository
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.stereotype.Component

@Component
class SpineStackUserDetailsService(
  private val userRepository: SpineStackUserRepository,
) : UserDetailsService {

  override fun loadUserByUsername(username: String): UserDetails {
    val user = userRepository.findByEmailIgnoreCaseOrNull(username)
      ?: throw UsernameNotFoundException(username)

    return SpineStackPrincipal(user)
  }
}
