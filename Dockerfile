FROM ubuntu:noble AS spinestack-base

# Install base dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    gnupg \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Zulu JDK
RUN curl -s https://repos.azul.com/azul-repo.key | gpg --dearmor -o /usr/share/keyrings/azul.gpg \
    && echo "deb [signed-by=/usr/share/keyrings/azul.gpg] https://repos.azul.com/zulu/deb stable main" | tee /etc/apt/sources.list.d/zulu.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends zulu17-jdk \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js
RUN curl -sL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install pnpm
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="${PATH}:${PNPM_HOME}"
RUN npm install --global pnpm

FROM spinestack-base AS spinestack-build
ENV DOCKER_PIPELINE=true
WORKDIR /build
COPY . ./
RUN ./gradlew copyWebDist bootJar

FROM azul/zulu-openjdk-alpine:17-jre-latest AS spinestack-deploy
WORKDIR /deploy
COPY --from=spinestack-build /build/server/build/libs/spinestack.jar .
CMD ["java", "-jar", "spinestack.jar"]
