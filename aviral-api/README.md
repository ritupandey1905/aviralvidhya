# ERP Backend Spring Boot Service

This directory contains a Java Spring Boot implementation of the existing ERP backend API.

## What is included

- REST endpoints for `schools`, `students`, `teachers`, and `notices`
- Firestore connectivity using Firebase Admin SDK
- Health check endpoint at `/api/health`

## Requirements

- Java 17 or newer
- Maven
- Firestore access via Google service account JSON

## Setup

1. Download a Firebase service account JSON key with Firestore access.
2. Set the environment variable:

```bash
set GOOGLE_APPLICATION_CREDENTIALS=C:\path\to\service-account.json
```

3. Run the service:

```bash
cd erp-backend\springboot-service
mvn spring-boot:run
```

## API Endpoints

- `GET /api/health`
- `GET /api/schools`
- `POST /api/schools`
- `PUT /api/schools/{id}`
- `DELETE /api/schools/{id}`

- `GET /api/students`
- `POST /api/students`
- `PUT /api/students/{id}`
- `DELETE /api/students/{id}`

- `GET /api/teachers`
- `POST /api/teachers`
- `PUT /api/teachers/{id}`
- `DELETE /api/teachers/{id}`

- `GET /api/notices`
- `POST /api/notices`
- `PUT /api/notices/{id}`
- `DELETE /api/notices/{id}`

## Next steps

- Add validation and typed domain models
- Add integration tests for Firestore and controller behavior
- Add deployment configuration for Cloud Run or chosen Java host
