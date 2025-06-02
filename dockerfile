# Stage 1: Build and test the Spring Boot application
FROM maven:3.9.6-eclipse-temurin-17-focal AS build

# Set working directory inside the container
WORKDIR /app

# Copy the Maven project descriptor (pom.xml) to the working directory
COPY pom.xml .

# Download all project dependencies before copying source code to utilize Docker layer caching
RUN mvn dependency:go-offline

# Copy the entire project files (including source code and config files) to the container
COPY . .

# Build the project and run all unit tests (fails build if tests fail)
RUN mvn clean package

# Stage 2: Create a minimal runtime image with just the JRE and packaged app
FROM eclipse-temurin:17.0.10_7-jre-focal

# Set working directory inside the container
WORKDIR /app

# Copy the generated JAR file from the build stage into this new image and rename to app.jar
COPY --from=build /app/target/React.Jwt.Login-0.0.1-SNAPSHOT.jar app.jar

# Set environment variable for the application port (optional but useful)
ENV PORT=8080

# Expose port 8080 to allow external access to the containerized app
EXPOSE 8080

# Define the command to run the application when the container starts
ENTRYPOINT ["java", "-jar", "app.jar"]