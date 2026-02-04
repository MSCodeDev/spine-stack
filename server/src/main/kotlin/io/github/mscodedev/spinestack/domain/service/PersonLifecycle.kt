package io.github.mscodedev.spinestack.domain.service

import io.github.mscodedev.spinestack.application.events.EventPublisher
import io.github.mscodedev.spinestack.domain.model.DomainEvent
import io.github.mscodedev.spinestack.domain.model.DuplicateNameException
import io.github.mscodedev.spinestack.domain.model.IdDoesNotExistException
import io.github.mscodedev.spinestack.domain.model.Person
import io.github.mscodedev.spinestack.domain.persistence.PersonRepository
import mu.KotlinLogging
import org.springframework.stereotype.Service
import org.springframework.transaction.support.TransactionTemplate

private val logger = KotlinLogging.logger {}

@Service
class PersonLifecycle(
  private val personRepository: PersonRepository,
  private val eventPublisher: EventPublisher,
  private val transactionTemplate: TransactionTemplate,
) {

  @Throws(DuplicateNameException::class)
  fun addPerson(person: Person): Person {
    logger.info { "Adding new person: $person" }

    if (personRepository.existsByNameInLibrary(person.name, person.libraryId)) {
      throw DuplicateNameException("Person name already exists in the library specified")
    }

    personRepository.insert(person)
    eventPublisher.publishEvent(DomainEvent.PersonAdded(person))

    return personRepository.findByIdOrNull(person.id)!!
  }

  fun updatePerson(toUpdate: Person) {
    logger.info { "Updating person: $toUpdate" }

    val existing = personRepository.findByIdOrNull(toUpdate.id)
      ?: throw IdDoesNotExistException("Cannot update person that does not exist")

    if (
      !existing.name.equals(toUpdate.name, true) &&
      personRepository.existsByNameInLibrary(toUpdate.name, toUpdate.libraryId)
    ) {
      throw DuplicateNameException("Person name already exists in the library specified")
    }

    personRepository.update(toUpdate)
    eventPublisher.publishEvent(DomainEvent.PersonUpdated(toUpdate))
  }

  fun deletePerson(person: Person) {
    transactionTemplate.executeWithoutResult {
      personRepository.delete(person.id)
    }

    eventPublisher.publishEvent(DomainEvent.PersonDeleted(person))
  }
}
