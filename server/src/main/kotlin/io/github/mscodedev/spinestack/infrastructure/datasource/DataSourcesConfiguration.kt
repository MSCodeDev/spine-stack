package io.github.mscodedev.spinestack.infrastructure.datasource

import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import io.github.mscodedev.spinestack.infrastructure.configuration.SpineStackProperties
import org.springframework.boot.jdbc.DataSourceBuilder
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Primary
import javax.sql.DataSource

@Configuration
class DataSourcesConfiguration(
  private val spinestackProperties: SpineStackProperties,
) {

  @Bean("sqliteDataSource")
  @Primary
  fun sqliteDataSource(): DataSource {
    val extraPragmas = spinestackProperties.database.pragmas.let {
      if (it.isEmpty()) {
        ""
      } else {
        "?" + it.entries.joinToString("&") { (key, value) -> "$key=$value" }
      }
    }

    val sqliteUdfDataSource = DataSourceBuilder.create()
      .driverClassName("org.sqlite.JDBC")
      .url("jdbc:sqlite:${spinestackProperties.database.file}$extraPragmas")
      .type(SqliteUdfDataSource::class.java)
      .build()

    sqliteUdfDataSource.setEnforceForeignKeys(true)
    with(spinestackProperties.database) {
      journalMode?.let { sqliteUdfDataSource.setJournalMode(it.name) }
      busyTimeout?.let { sqliteUdfDataSource.config.busyTimeout = it.toMillis().toInt() }
    }

    val poolSize = when {
      spinestackProperties.database.file.contains(":memory:") -> 1
      spinestackProperties.database.poolSize != null -> spinestackProperties.database.poolSize!!
      else -> Runtime.getRuntime().availableProcessors()
        .coerceAtMost(spinestackProperties.database.maxPoolSize)
    }

    return HikariDataSource(
      HikariConfig().apply {
        dataSource = sqliteUdfDataSource
        poolName = "SqliteUdfPool"
        maximumPoolSize = poolSize
      },
    )
  }
}
