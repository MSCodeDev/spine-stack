package io.github.mscodedev.spinestack.application.tasks

import io.github.mscodedev.spinestack.infrastructure.jms.QUEUE_FACTORY
import io.github.mscodedev.spinestack.infrastructure.jms.QUEUE_TASKS
import io.github.mscodedev.spinestack.infrastructure.search.SearchIndexLifecycle
import io.github.mscodedev.spinestack.interfaces.scheduler.METER_TASKS_EXECUTION
import io.github.mscodedev.spinestack.interfaces.scheduler.METER_TASKS_FAILURE
import io.micrometer.core.instrument.MeterRegistry
import mu.KotlinLogging
import org.springframework.jms.annotation.JmsListener
import org.springframework.stereotype.Service
import kotlin.time.measureTime
import kotlin.time.toJavaDuration

private val logger = KotlinLogging.logger {}

@Service
class TaskHandler(
  private val taskEmitter: TaskEmitter,
  private val searchIndexLifecycle: SearchIndexLifecycle,
  private val meterRegistry: MeterRegistry,
) {

  @JmsListener(
    destination = QUEUE_TASKS,
    containerFactory = QUEUE_FACTORY,
    concurrency = "#{@spinestackProperties.taskConsumers}-#{@spinestackProperties.taskConsumersMax}",
  )
  fun handleTask(task: Task) {
    logger.info { "Executing task: $task" }
    try {
      val duration = measureTime {
        when (task) {
          is Task.RebuildIndex -> searchIndexLifecycle.rebuildIndex(task.entities)
        }
      }

      logger.info { "Task $task executed in $duration" }
      meterRegistry
        .timer(METER_TASKS_EXECUTION, "type", task.javaClass.simpleName)
        .record(duration.toJavaDuration())
    } catch (e: Exception) {
      logger.error(e) { "Task $task execution failed" }
      meterRegistry
        .counter(METER_TASKS_FAILURE, "type", task.javaClass.simpleName)
        .increment()
    }
  }
}
