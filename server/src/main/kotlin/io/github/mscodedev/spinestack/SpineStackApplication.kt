package io.github.mscodedev.spinestack

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class SpineStackApplication

fun main(args: Array<String>) {
  System.setProperty("org.jooq.no-logo", "true")
  System.setProperty("org.jooq.no-tips", "true")
  runApplication<SpineStackApplication>(*args)
}
