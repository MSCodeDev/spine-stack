package io.github.mscodedev.spinestack.interfaces

import io.github.mscodedev.spinestack.domain.model.SpineStackUser
import io.github.mscodedev.spinestack.domain.persistence.SpineStackUserRepository
import io.github.mscodedev.spinestack.domain.service.SpineStackUserLifecycle
import org.assertj.core.api.Assertions.assertThat
import org.hamcrest.Matchers.containsString
import org.junit.jupiter.api.AfterAll
import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.HttpHeaders
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic
import org.springframework.test.context.junit.jupiter.SpringExtension
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get

@ExtendWith(SpringExtension::class)
@SpringBootTest
@AutoConfigureMockMvc(printOnlyOnFailure = false)
class SessionTest(
  @Autowired private val mockMvc: MockMvc,
  @Autowired private val userLifecycle: SpineStackUserLifecycle,
  @Autowired private val userRepository: SpineStackUserRepository,
  @Autowired private val sessionHeaderName: String,
  @Autowired private val sessionCookieName: String,
) {

  private lateinit var user: SpineStackUser

  @BeforeAll
  fun setup() {
    user = SpineStackUser("user@example.org", "user", false, "User")
    userLifecycle.createUser(user)
  }

  @AfterAll
  fun tearDown() {
    userRepository.findAll()
      .forEach(userLifecycle::deleteUser)
  }

  @Test
  fun `it should return the session cookie when hitting an endpoint with valid basic credentials`() {
    mockMvc
      .get("/api/v1/users/me") {
        with(httpBasic(user.email, user.password))
      }
      .andExpect {
        header {
          string(HttpHeaders.SET_COOKIE, containsString("$sessionCookieName="))
        }
        cookie {
          exists(sessionCookieName)
          httpOnly(sessionCookieName, true)
        }
      }
  }

  @Test
  fun `it should return the session when providing the auth header with valid basic credentials`() {
    mockMvc
      .get("/api/v1/users/me") {
        with(httpBasic(user.email, user.password))
        header(sessionHeaderName, "")
      }
      .andExpect {
        header {
          exists(sessionHeaderName)
        }
      }
  }

  @Test
  fun `it should return the session in the cookies given an existing session`() {
    val sessionId = mockMvc
      .get("/api/v1/users/me") {
        with(httpBasic(user.email, user.password))
        header(sessionHeaderName, "")
      }
      .andReturn()
      .response.getHeader(sessionHeaderName)

    assertThat(sessionId).isNotNull

    mockMvc
      .get("/api/v1/login/set-cookie") {
        header(sessionHeaderName, sessionId!!)
      }
      .andExpect {
        header {
          string(HttpHeaders.SET_COOKIE, containsString("$sessionCookieName="))
          doesNotExist(sessionHeaderName)
        }
        cookie {
          exists(sessionCookieName)
          httpOnly(sessionCookieName, true)
        }
      }
  }

  @Test
  fun `it should clear the session cookie when logging out from an existing session`() {
    val sessionId = mockMvc
      .get("/api/v1/users/me") {
        with(httpBasic(user.email, user.password))
        header(sessionHeaderName, "")
      }
      .andReturn()
      .response.getHeader(sessionHeaderName)

    assertThat(sessionId).isNotNull

    mockMvc
      .get("/api/v1/sign-out") {
        header(sessionHeaderName, sessionId!!)
      }
      .andExpect {
        header {
          string(HttpHeaders.SET_COOKIE, containsString("$sessionCookieName=;"))
        }
        cookie {
          maxAge(sessionCookieName, 0)
        }
      }
  }
}
