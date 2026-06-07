# ERP Backend Migration Strategy

## Goal

Move the existing `erp-backend` Firebase Functions Express API to a Java Spring Boot service while preserving current API contracts and Firestore data access.

## Scope

- Migrate backend routes exposed under `/api/*`
- Retain Firestore as the data store
- Provide a local Spring Boot service for development
- Support gradual cutover from Firebase Functions to Java service

## Phases

### 1. Analysis and Proof of Concept

- Inventory current routes: `health`, `schools`, `students`, `teachers`, `notices`
- Confirm Firestore collections used: `schools`, `students`, `teachers`, `notices`
- Build a small Spring Boot service that connects to Firestore and exposes the same REST endpoints
- Validate with local requests and a sample Firestore dataset

### 2. Parallel Operation

- Keep the existing `functions` implementation in place
- Run Spring Boot locally or in a container alongside Firebase Functions
- Use a feature flag or frontend rewrite to route some traffic to the Java service for testing

### 3. Incremental Route Migration

- Migrate endpoints in small sets to reduce risk:
  1. `GET /api/health`
  2. `GET /api/schools`, `GET /api/students`
  3. `GET /api/teachers`, `GET /api/notices`
  4. POST/PUT/DELETE for each collection
- Keep the same request/response shapes during migration
- Add automated smoke tests against both old and new implementations if possible

### 4. Deployment Strategy

- Choose a hosting target for the Spring Boot service:
  - Cloud Run
  - Google App Engine
  - Kubernetes / container host
  - Other Java hosting provider
- Configure environment variables for Firestore credentials and service account access
- Migrate traffic once the Java service is stable

### 5. Cutover and Cleanup

- Update frontend API base URL to point to the new service
- Remove or archive the Firebase Functions implementation after final validation
- Keep Firestore security rules and database schema stable during migration

## Implementation Notes

- The new service is implemented under `erp-backend/springboot-service`
- Uses Spring Boot 3.x and Firestore through the Firebase Admin Java SDK
- Provides identical REST endpoints and HTTP status behavior
- Supports dynamic document data using JSON bodies for collection documents

## Local Setup

1. Create or download a Google service account JSON key with Firestore access
2. Set `GOOGLE_APPLICATION_CREDENTIALS` to the key path
3. Run the service with `./mvnw spring-boot:run` or `mvn spring-boot:run`
4. Verify endpoints:
   - `GET http://localhost:8080/api/health`
   - `GET http://localhost:8080/api/schools`

## Next Steps

- Add integration tests for each endpoint
- Add structured domain models and validation as needed
- Configure production deployment and monitoring
