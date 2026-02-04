package io.github.mscodedev.spinestack.infrastructure.image

import io.github.mscodedev.spinestack.application.events.EventPublisher
import io.github.mscodedev.spinestack.domain.model.DomainEvent
import io.github.mscodedev.spinestack.domain.model.Image
import io.github.mscodedev.spinestack.domain.persistence.ImageRepository
import io.github.mscodedev.spinestack.domain.persistence.SeriesRepository
import io.github.mscodedev.spinestack.infrastructure.configuration.SpineStackProperties
import org.springframework.stereotype.Component
import java.nio.file.Path
import java.nio.file.Paths

@Component
class SeriesCoverLifecycle(
  properties: SpineStackProperties,
  imageConverter: ImageConverter,
  eventPublisher: EventPublisher,
  imageRepository: ImageRepository,
  private val seriesRepository: SeriesRepository,
) : EntityImageLifecycle("series", eventPublisher, imageConverter, imageRepository) {

  companion object {
    private const val PICTURES_DIR = "series"
  }

  override val imagesDirectoryPath: Path = Paths.get(properties.imagesDir, PICTURES_DIR)
  override val thumbnailSizes = arrayOf(128, 256, 512)

  override fun entityExistsById(entityId: String): Boolean {
    return seriesRepository.findByIdOrNull(entityId) != null
  }

  override fun createEvent(imageDetails: Image, type: PublishEventType) = when (type) {
    PublishEventType.CREATED -> DomainEvent.SeriesCoverAdded(imageDetails)
    PublishEventType.UPDATED -> DomainEvent.SeriesCoverUpdated(imageDetails)
    else -> DomainEvent.SeriesCoverDeleted(imageDetails)
  }

  override fun isDeleteEvent(event: DomainEvent) = event is DomainEvent.SeriesDeleted

  override fun getEntityIdFromDeleteEvent(event: DomainEvent) = (event as DomainEvent.SeriesDeleted).series.id
}
