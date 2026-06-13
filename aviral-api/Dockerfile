# Build stage
FROM maven:3.9.0-eclipse-temurin-17 AS builder

WORKDIR /app

# Copy pom.xml and download dependencies
COPY pom.xml .
RUN mvn dependency:go-offline

# Copy source code
COPY src src

# Build application
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:17-jre

WORKDIR /app

# Install curl for health checks
RUN apt-get update && apt-get install -y curl ca-certificates && rm -rf /var/lib/apt/lists/*

# Copy jar from builder
COPY --from=builder /app/target/aviral-api-0.1.0.jar app.jar

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/api/health || exit 1

# Run application
ENTRYPOINT ["sh", "-c", "java -Xmx512m -Xms256m -jar app.jar"]
