package io.github.mscodedev.spinestack.domain.service

import io.github.mscodedev.spinestack.application.events.EventPublisher
import io.github.mscodedev.spinestack.domain.model.DomainEvent
import io.github.mscodedev.spinestack.domain.model.DuplicateNameException
import io.github.mscodedev.spinestack.domain.model.IdDoesNotExistException
import io.github.mscodedev.spinestack.domain.model.Library
import io.github.mscodedev.spinestack.domain.persistence.LibraryRepository
import mu.KotlinLogging
import org.springframework.stereotype.Service
import org.springframework.transaction.support.TransactionTemplate

private val logger = KotlinLogging.logger {}

@Service
class LibraryLifecycle(
  private val libraryRepository: LibraryRepository,
  private val eventPublisher: EventPublisher,
  private val transactionTemplate: TransactionTemplate,
) {

  @Throws(DuplicateNameException::class)
  fun addLibrary(library: Library): Library {
    logger.info { "Adding new library: ${library.name}" }

    if (libraryRepository.existsByNameFromSameOwner(library.name, library.ownerId)) {
      throw DuplicateNameException("Library name already exists from the same owner")
    }

    libraryRepository.insert(library)
    eventPublisher.publishEvent(DomainEvent.LibraryAdded(library))

    return libraryRepository.findById(library.id)
  }

  @Throws(DuplicateNameException::class)
  fun updateLibrary(toUpdate: Library) {
    logger.info { "Updating library: ${toUpdate.id}" }

    val existing = libraryRepository.findByIdOrNull(toUpdate.id)
      ?: throw IdDoesNotExistException("Cannot update library that does not exist")

    if (
      !existing.name.equals(toUpdate.name, true) &&
      libraryRepository.existsByNameFromSameOwner(toUpdate.name, toUpdate.ownerId)
    ) {
      throw DuplicateNameException("Library name already exists from the same owner")
    }

    libraryRepository.update(toUpdate)
    eventPublisher.publishEvent(DomainEvent.LibraryUpdated(toUpdate))
  }

  fun deleteLibrary(library: Library) {
    logger.info { "Deleting library: $library" }

    transactionTemplate.executeWithoutResult {
      libraryRepository.delete(library.id)
    }

    eventPublisher.publishEvent(DomainEvent.LibraryDeleted(library))
  }
}
