# syntax=docker/dockerfile:1

FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

ARG SERVICE_MODULE
ENV SERVICE_MODULE=${SERVICE_MODULE}

COPY pom.xml .
COPY common-library/pom.xml common-library/pom.xml
COPY api-gateway/pom.xml api-gateway/pom.xml
COPY marketplace-service/pom.xml marketplace-service/pom.xml
COPY payment-service/pom.xml payment-service/pom.xml
COPY notification-service/pom.xml notification-service/pom.xml
COPY ai-service/pom.xml ai-service/pom.xml
COPY food-service/pom.xml food-service/pom.xml
COPY laundry-service/pom.xml laundry-service/pom.xml
COPY print-service/pom.xml print-service/pom.xml
COPY medical-service/pom.xml medical-service/pom.xml
COPY chat-service/pom.xml chat-service/pom.xml
COPY lost-found-service/pom.xml lost-found-service/pom.xml

RUN --mount=type=cache,target=/root/.m2 \
    mvn -pl ${SERVICE_MODULE} -am dependency:go-offline -DskipTests

COPY common-library/ common-library/
COPY ${SERVICE_MODULE}/ ${SERVICE_MODULE}/

RUN --mount=type=cache,target=/root/.m2 \
    mvn -pl ${SERVICE_MODULE} -am package -DskipTests

FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

ARG SERVICE_MODULE
COPY --from=build /app/${SERVICE_MODULE}/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
