package io.github.mscodedev.spinestack.infrastructure.jooq

import io.github.mscodedev.spinestack.domain.model.SpineStackUser
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.junit.jupiter.SpringExtension
import java.time.LocalDateTime

@ExtendWith(SpringExtension::class)
@SpringBootTest
class SpineStackUserDaoTest(
  @Autowired private val spinestackUserDao: SpineStackUserDao,
) {

  @AfterEach
  fun deleteUsers() {
    spinestackUserDao.deleteAll()
    assertThat(spinestackUserDao.count()).isEqualTo(0)
  }

  @Test
  fun `it should persist the user when saving`() {
    val now = LocalDateTime.now()
    val user = SpineStackUser(
      email = "user@example.org",
      password = "password",
      isAdmin = false,
      name = "User",
    )

    spinestackUserDao.insert(user)
    val created = spinestackUserDao.findByIdOrNull(user.id)!!

    with(created) {
      assertThat(id).isNotEmpty
      assertThat(createdAt).isCloseTo(now, offset)
      assertThat(modifiedAt).isCloseTo(now, offset)
      assertThat(email).isEqualTo("user@example.org")
      assertThat(password).isEqualTo("password")
      assertThat(isAdmin).isFalse
      assertThat(name).isEqualTo("User")
    }
  }

  @Test
  fun `it should persist the user when modifying and saving`() {
    val user = SpineStackUser(
      email = "user@example.org",
      password = "password",
      isAdmin = false,
      name = "User",
    )

    spinestackUserDao.insert(user)
    val created = spinestackUserDao.findByIdOrNull(user.id)!!

    val modified = created.copy(
      email = "user2@example.org",
      password = "password2",
      isAdmin = true,
      name = "User2",
    )
    val modifiedDate = LocalDateTime.now()
    spinestackUserDao.update(modified)
    val modifiedSaved = spinestackUserDao.findByIdOrNull(modified.id)!!

    with(modifiedSaved) {
      assertThat(id).isEqualTo(created.id)
      assertThat(createdAt).isEqualTo(created.createdAt)
      assertThat(modifiedAt)
        .isCloseTo(modifiedDate, offset)
        .isNotEqualTo(modified.createdAt)
      assertThat(email).isEqualTo("user2@example.org")
      assertThat(password).isEqualTo("password2")
      assertThat(isAdmin).isTrue
      assertThat(name).isEqualTo("User2")
    }
  }

  @Test
  fun `it should persist multiple users when saving`() {
    spinestackUserDao.insert(SpineStackUser("user1@example.org", "p", false, "User1"))
    spinestackUserDao.insert(SpineStackUser("user2@example.org", "p", true, "User2"))

    val users = spinestackUserDao.findAll()

    assertThat(users).hasSize(2)
    assertThat(users.map(SpineStackUser::email))
      .containsExactlyInAnyOrder("user1@example.org", "user2@example.org")
  }

  @Test
  fun `it should count properly`() {
    spinestackUserDao.insert(SpineStackUser("user1@example.org", "p", false, "User1"))
    spinestackUserDao.insert(SpineStackUser("user2@example.org", "p", true, "User2"))

    val count = spinestackUserDao.count()
    assertThat(count).isEqualTo(2)
  }

  @Test
  fun `it should find an existing user by its id`() {
    val existing = SpineStackUser("user1@example.org", "p", false, "User1")
    spinestackUserDao.insert(existing)

    val user = spinestackUserDao.findByIdOrNull(existing.id)
    assertThat(user).isNotNull
  }

  @Test
  fun `it should return null when finding a non-existing user`() {
    val user = spinestackUserDao.findByIdOrNull("12345")
    assertThat(user).isNull()
  }

  @Test
  fun `it should persist when deleting the user`() {
    val existing = SpineStackUser("user1@example.org", "p", false, "User1")
    spinestackUserDao.insert(existing)

    spinestackUserDao.delete(existing.id)
    assertThat(spinestackUserDao.count()).isEqualTo(0)
  }

  @Test
  fun `it should check properly if email already exists even with different casing`() {
    spinestackUserDao.insert(
      SpineStackUser("user1@example.org", "p", false, "User1"),
    )

    val exists = spinestackUserDao.existsByEmailIgnoreCase("USER1@EXAMPLE.ORG")
    val notExists = spinestackUserDao.existsByEmailIgnoreCase("USER2@EXAMPLE.ORG")

    assertThat(exists).isTrue
    assertThat(notExists).isFalse
  }

  @Test
  fun `it should find the user by its email if it exists even with different casing`() {
    spinestackUserDao.insert(
      SpineStackUser("user1@example.org", "p", false, "User1"),
    )

    val found = spinestackUserDao.findByEmailIgnoreCaseOrNull("USER1@EXAMPLE.ORG")
    val notFound = spinestackUserDao.findByEmailIgnoreCaseOrNull("USER2@EXAMPLE.ORG")

    assertThat(found).isNotNull
    assertThat(found?.email).isEqualTo("user1@example.org")
    assertThat(notFound).isNull()
  }
}
