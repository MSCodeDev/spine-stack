package io.github.mscodedev.spinestack.infrastructure.image

import io.github.mscodedev.spinestack.application.events.EventPublisher
import io.github.mscodedev.spinestack.domain.model.DomainEvent
import io.github.mscodedev.spinestack.domain.model.Image
import io.github.mscodedev.spinestack.domain.persistence.ImageRepository
import io.github.mscodedev.spinestack.domain.persistence.PublisherRepository
import io.github.mscodedev.spinestack.infrastructure.configuration.SpineStackProperties
import org.springframework.stereotype.Component
import java.nio.file.Path
import java.nio.file.Paths

@Component
class PublisherPictureLifecycle(
  properties: SpineStackProperties,
  imageConverter: ImageConverter,
  eventPublisher: EventPublisher,
  imageRepository: ImageRepository,
  private val publisherRepository: PublisherRepository,
) : EntityImageLifecycle("publisher", eventPublisher, imageConverter, imageRepository) {

  companion object {
    private const val PICTURES_DIR = "publishers"
  }

  override val imagesDirectoryPath: Path = Paths.get(properties.imagesDir, PICTURES_DIR)
  override val thumbnailSizes = arrayOf(64, 128, 256)

  override fun entityExistsById(entityId: String): Boolean {
    return publisherRepository.findByIdOrNull(entityId) != null
  }

  override fun createEvent(imageDetails: Image, type: PublishEventType) = when (type) {
    PublishEventType.CREATED -> DomainEvent.PublisherPictureAdded(imageDetails)
    PublishEventType.UPDATED -> DomainEvent.PublisherPictureUpdated(imageDetails)
    else -> DomainEvent.PublisherPictureDeleted(imageDetails)
  }

  override fun isDeleteEvent(event: DomainEvent) = event is DomainEvent.PublisherDeleted

  override fun getEntityIdFromDeleteEvent(event: DomainEvent) = (event as DomainEvent.PublisherDeleted).publisher.id
}
