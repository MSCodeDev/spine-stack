package io.github.mscodedev.spinestack.application.events

import io.github.mscodedev.spinestack.domain.model.DomainEvent
import io.github.mscodedev.spinestack.infrastructure.jms.JMS_PROPERTY_TYPE
import io.github.mscodedev.spinestack.infrastructure.jms.TOPIC_EVENTS
import jakarta.jms.ConnectionFactory
import org.springframework.jms.core.JmsTemplate
import org.springframework.stereotype.Service

@Service
class EventPublisher(connectionFactory: ConnectionFactory) {
  private val jmsTemplate = JmsTemplate(connectionFactory).apply {
    isPubSubDomain = true
  }

  fun publishEvent(event: DomainEvent) {
    jmsTemplate.convertAndSend(TOPIC_EVENTS, event) {
      it.apply {
        setStringProperty(JMS_PROPERTY_TYPE, event.javaClass.simpleName)
      }
    }
  }
}
