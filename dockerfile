# Stage 1: Build and test
FROM maven:3.9.6-eclipse-temurin-17-focal AS build
WORKDIR /app

# Copy pom.xml and download dependencies first for caching
COPY pom.xml .
RUN mvn dependency:go-offline

# Copy full project (not just src — includes configs, etc.)
COPY . .

# Build the app (runs tests by default)
RUN mvn clean package

# Stage 2: Minimal runtime image
FROM eclipse-temurin:17.0.10_7-jre-focal
WORKDIR /app

# Copy the packaged JAR from the build stage
COPY --from=build /app/target/React.Jwt.Login-0.0.1-SNAPSHOT.jar app.jar

ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]