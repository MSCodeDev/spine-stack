package io.github.mscodedev.spinestack.infrastructure.image

import io.github.mscodedev.spinestack.application.events.EventPublisher
import io.github.mscodedev.spinestack.domain.model.DomainEvent
import io.github.mscodedev.spinestack.domain.model.Image
import io.github.mscodedev.spinestack.domain.persistence.ImageRepository
import io.github.mscodedev.spinestack.domain.persistence.PersonRepository
import io.github.mscodedev.spinestack.infrastructure.configuration.SpineStackProperties
import org.springframework.stereotype.Component
import java.nio.file.Path
import java.nio.file.Paths

@Component
class PersonPictureLifecycle(
  properties: SpineStackProperties,
  imageConverter: ImageConverter,
  eventPublisher: EventPublisher,
  imageRepository: ImageRepository,
  private val personRepository: PersonRepository,
) : EntityImageLifecycle("person", eventPublisher, imageConverter, imageRepository) {

  companion object {
    private const val PICTURES_DIR = "people"
  }

  override val imagesDirectoryPath: Path = Paths.get(properties.imagesDir, PICTURES_DIR)
  override val thumbnailSizes = arrayOf(64, 128, 256)

  override fun entityExistsById(entityId: String): Boolean {
    return personRepository.findByIdOrNull(entityId) != null
  }

  override fun createEvent(imageDetails: Image, type: PublishEventType) = when (type) {
    PublishEventType.CREATED -> DomainEvent.PersonPictureAdded(imageDetails)
    PublishEventType.UPDATED -> DomainEvent.PersonPictureUpdated(imageDetails)
    else -> DomainEvent.PersonPictureDeleted(imageDetails)
  }

  override fun isDeleteEvent(event: DomainEvent) = event is DomainEvent.PersonDeleted

  override fun getEntityIdFromDeleteEvent(event: DomainEvent) = (event as DomainEvent.PersonDeleted).person.id
}
