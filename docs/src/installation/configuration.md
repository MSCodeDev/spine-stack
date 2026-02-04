# Configuring SpineStack

:::tip
SpineStack has sensible default values for all configuration keys.
You only need to configure it if you want to change the default behaviour.

The `application.yml` file does not exist by default, you need to create
one if you want to customize the configuration.
:::

SpineStack relies heavily on [Spring Boot's configuration], leveraging
`profiles` and configuration `properties`.

The easiest way to configure is either via environment variables
(a good fit for `docker` and `docker-compose`) or by using an
`application.yml` file located in the configuration directory:

- The Docker image will load any `application.yml` file located
  in the `/.spinestack` mounted folder.
- The Jar will load any `application.yml` file loaded in the
  `spinestack.config-dir` directory (defaults to `~/.spinestack`).

Each configuration key can have a different format depending if it's
from the environment variable or from the `application.yml` file.
In the following section both formats will be provided.

You can also specify configuration via the command line, when launching
the Jar. Use the `application-property` form, and prefix with `--`.

```console
$ java -jar spinestack-x.y.z.jar --server.servlet.context-path="/spinestack" --server.port=8443
```

[Spring Boot's configuration]: https://docs.spring.io/spring-boot/docs/current/reference/html/boot-features-external-config.html

## Optional configuration

The following are the optional configuration keys.

### spinestack_CONFIGDIR / spinestack.config-dir: `<directory>`

The configuration directory. Will be used to store the logs, database,
and any other file SpineStack needs.

Defaults to `~/.spinestack`. `~` is your home directory on Unix, and your
User profile on Windows.

:::info
When overriding this configuration, you need to use `${user.home}` instead
of `~` (this is a specific Spring Boot variable).
:::

### SERVER_PORT / server.port: `<port>`

Port to listen for the API and web interface.

Defaults to `8080`.

### SERVER_SERVLET_CONTEXT_PATH / server.servlet.context-path: `<baseUrl>`

Base URL, useful if you need to reverse proxy with a subfolder.

Defaults to `/`.

### spinestack_REMEMBERME_KEY / spinestack.remember-me.key: `<key>`

If set, the remember-me auto-login feature will be activated, and will
generate a cookie with encoded login information to perform auto-login.
Set `<key>` to any random string.

Not set by default, you need to set it to enable this feature.

### spinestack_REMEMBERME_VALIDITY / spinestack.remember-me.validity: `<duration>`

The validity of the generated remember-me cookie. You can specify the
time unit, for example `14d` for 14 days, or `24h` for 24 hours. If
no unit is set, seconds will be assumed and used.

Defaults to `2w` (2 weeks).

### spinestack_SESSIONTIMEOUT / spinestack.session-timeout: `<duration>`

The duration after which an inactive session will expire. You can specify the
time unit, for example `14d` for 14 days, or `24h` for 24 hours. If
no unit is set, seconds will be assumed and used.

Defaults to `7d` (7 days).

### spinestack_DATABASE_FILE / spinestack.database.file: `<file path>`

File path for the SQLite database.

If you want to change the directory, it is advised to change
`spinestack.config-dir` instead.

Defaults to:

- `\${spinestack.config-dir}/database.sqlite` for Jar.
- `/.spinestack/database.sqlite` for Docker.

### spinestack_CORS_ALLOWEDORIGINS / spinestack.cors.allowed-origins: `<origins>`

A list of origins to allow for CORS.

Defaults to empty list.

### LOGGING_FILE_NAME / logging.file.name: `<logfile name>`

Name of the log file.

If you want to change the directory, it is advised to change
`spinestack.config-dir` instead.

Defaults to:

- `\${spinestack.config-dir}/spinestack.log` for Jar.
- `/.spinestack/logs/spinestack.log` for Docker.

:::info
When overriding this configuration, you need to use `${user.home}` instead
of `~` (this is a specific Spring Boot variable).
:::

## Sample configuration file

Here is a sample `application.yml` file in case you need to customize it.
Keep only the lines you need.

::: code-group
```yml [application.yml]
# Only keep lines that are relevant to you.
# Lines starting with # are comments.
# Make sure indentation is correct.
spinestack:
  remember-me:
    # Required to activate the remember-me auto-login via cookies.
    key: changeMePlease
    # Validity of the cookie in seconds, here 30 days.
    validity: 30d
  # Session timeout, here 7 days.
  session-timeout: 7d
  database:
    file: ${user.home}/.spinestack/database.sqlite
  cors.allowed-origins:
    - http://localhost:8081
    - http://localhost:8082
server:
  port: 8080
  servlet.context-path: /spinestack
```
:::


