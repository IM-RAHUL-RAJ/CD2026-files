# Java service built with Maven: any folder with pom.xml and src/ that
# produces one runnable jar. Explained in GUIDE.html, step 5.

# Stage 1: compile
ARG RUNTIME_VERSION=21
FROM maven:3.9.9-eclipse-temurin-${RUNTIME_VERSION} AS builder
WORKDIR /app

COPY pom.xml .
RUN mvn -B dependency:go-offline -q

COPY src ./src
RUN mvn -B package -DskipTests -q

# Stage 2: run
ARG RUNTIME_VERSION=21
FROM eclipse-temurin:${RUNTIME_VERSION}-jre-alpine AS runtime
WORKDIR /app

RUN addgroup -S app && adduser -S app -G app
COPY --from=builder --chown=app:app /app/target/*.jar /app/app.jar

ARG APP_PORT=8080
ENV APP_PORT=${APP_PORT} SERVER_PORT=${APP_PORT}
EXPOSE ${APP_PORT}
ENV JAVA_OPTS=""

USER app

ARG HEALTH_PATH=/actuator/health
ENV HEALTH_PATH=${HEALTH_PATH}
HEALTHCHECK --interval=15s --timeout=5s --start-period=40s --retries=5 \
    CMD [ -z "$HEALTH_PATH" ] || wget -qO- "http://localhost:${SERVER_PORT}${HEALTH_PATH}" >/dev/null || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
