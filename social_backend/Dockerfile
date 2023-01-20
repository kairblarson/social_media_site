FROM openjdk:17-jdk-alpine
ARG JAR_FILE=target/*.jar
COPY ./target/social-0.0.1-SNAPSHOT.jar social.jar
ENTRYPOINT ["java", "-jar", "/social.jar"]