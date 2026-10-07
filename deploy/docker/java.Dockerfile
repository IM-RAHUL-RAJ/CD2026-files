# ==============================================================================
# GENERIC TEMPLATE: Java service built with Maven (Spring Boot, or any single
# runnable jar). Nothing here names a project: point it at any folder that has
# a pom.xml and src/ and produces one runnable jar.
#
# Settings, all as --build-arg (docker-compose and the pipeline pass them from
# config/application.yaml):
#   RUNTIME_VERSION  Java version; must match the pom's <java.version>  (default 21)
#   APP_PORT         port the app listens on                            (default 8080)
#   HEALTH_PATH      HTTP path that answers 200 when the app is up,
#                    or "" for no health check                 (default /actuator/health)
#
#   docker build -f deploy/docker/java.Dockerfile --build-arg APP_PORT=8081 \
#                -t my-service path/to/service
# ==============================================================================

# ---------- Stage 1: compile with Maven --------------------------------------
ARG RUNTIME_VERSION=21
FROM maven:3.9.9-eclipse-temurin-${RUNTIME_VERSION} AS builder
WORKDIR /app

# The pom before the source: Docker reuses this dependency layer until
# pom.xml changes, so editing a .java file does not download everything again.
COPY pom.xml .
RUN mvn -B dependency:go-offline -q

COPY src ./src
# Tests run in the pipeline, not while building the image.
RUN mvn -B package -DskipTests -q

# ---------- Stage 2: run on a JRE, with no Maven and no JDK ------------------
ARG RUNTIME_VERSION=21
FROM eclipse-temurin:${RUNTIME_VERSION}-jre-alpine AS runtime
WORKDIR /app

# Never run as root: it limits what a compromised app can touch.
RUN addgroup -S app && adduser -S app -G app

# A wildcard, so the jar's name and version do not matter. If the build
# produces more than one jar, narrow this to the runnable one.
COPY --from=builder --chown=app:app /app/target/*.jar /app/app.jar

ARG APP_PORT=8080
# Spring Boot reads SERVER_PORT. docker-compose and Kubernetes set it too.
ENV APP_PORT=${APP_PORT} SERVER_PORT=${APP_PORT}
EXPOSE ${APP_PORT}

# Extra JVM flags without editing this file: -e JAVA_OPTS="-Xmx256m"
ENV JAVA_OPTS=""

USER app

ARG HEALTH_PATH=/actuator/health
ENV HEALTH_PATH=${HEALTH_PATH}
HEALTHCHECK --interval=15s --timeout=5s --start-period=40s --retries=5 \
    CMD [ -z "$HEALTH_PATH" ] || wget -qO- "http://localhost:${SERVER_PORT}${HEALTH_PATH}" >/dev/null || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
