package com.example.aviralbackend.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.FileInputStream;
import java.io.IOException;

@Configuration
public class FirebaseConfig {

    @Bean
    public Firestore firestore() throws IOException {
        String devMode = System.getenv("DEVELOPMENT_MODE");
        String credentialsPath = System.getenv("GCP_AVIRALVIDHYA_CRED");
        if (credentialsPath != null) {
            credentialsPath = credentialsPath.trim();
        }
        
        System.out.println("\n=== FIREBASE INITIALIZATION DEBUG ===");
        System.out.println("DEVELOPMENT_MODE env: " + devMode);
        System.out.println("GCP_AVIRALVIDHYA_CRED env: " + (credentialsPath != null && !credentialsPath.isBlank()
                ? credentialsPath
                : "NOT SET or BLANK"));
        System.out.println("=====================================\n");
        
        boolean hasCredentials = credentialsPath != null && !credentialsPath.isBlank();
        
        try {
            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseOptions.Builder optionsBuilder = FirebaseOptions.builder();

                if (hasCredentials) {
                    System.out.println("\n=== PRODUCTION MODE ===");
                    System.out.println("Initializing Firebase with credentials file");
                    System.out.println("Credentials path: " + credentialsPath);
                    System.out.println("=======================\n");

                    FileInputStream serviceAccount = new FileInputStream(credentialsPath);
                    optionsBuilder.setCredentials(GoogleCredentials.fromStream(serviceAccount));
                } else {
                    System.out.println("\n=== PRODUCTION MODE WITH ADC ===");
                    System.out.println("No GCP_AVIRALVIDHYA_CRED file path set, using Application Default Credentials");
                    System.out.println("Ensure the Cloud Run service account has Firestore access");
                    System.out.println("====================================================\n");

                    optionsBuilder.setCredentials(GoogleCredentials.getApplicationDefault());
                }

                FirebaseApp.initializeApp(optionsBuilder.build());
            }

            FirebaseApp app = FirebaseApp.getInstance();
            Firestore firestore = FirestoreClient.getFirestore(app, "aviralvidhya-firestore-db");
            validateFirestoreConnection(firestore);
            return firestore;
        } catch (Exception e) {
            System.err.println("Failed to initialize Firebase: " + (hasCredentials ? credentialsPath : "Application Default Credentials"));
            e.printStackTrace(System.err);
            throw e;
        }
    }

    private void validateFirestoreConnection(Firestore firestore) {
        try {
            firestore.collection("health_check_status")
                    .document("ping")
                    .get()
                    .get();
            System.out.println("Firestore connection validated successfully.");
        } catch (Exception e) {
            String issue = buildFirestoreFailureMessage(e);
            System.err.println("Firestore validation failed: " + issue);
            e.printStackTrace(System.err);
            throw new RuntimeException("Firestore validation failed: " + issue, e);
        }
    }

    private String buildFirestoreFailureMessage(Exception e) {
        String lower = e.getMessage() == null ? "" : e.getMessage().toLowerCase();
        if (lower.contains("failed precondition") || lower.contains("service not enabled") || lower.contains("project")) {
            return "Firestore may not be enabled in Firebase console for this project.";
        }
        if (lower.contains("permission denied") || lower.contains("unauthenticated") || lower.contains("invalid credentials")) {
            return "The service account credentials appear invalid or do not have Firestore access.";
        }
        return "Check that the service account JSON is valid, the project exists, and Firestore is enabled. Original error: " + e.getMessage();
    }
}
