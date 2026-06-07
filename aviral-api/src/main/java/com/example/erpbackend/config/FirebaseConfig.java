package com.example.erpbackend.config;

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
        
        if (hasCredentials) {
            // Production: Use real Firebase credentials
            System.out.println("\n=== PRODUCTION MODE ===");
            System.out.println("Initializing Firebase with credentials");
            System.out.println("Credentials path: " + credentialsPath);
            System.out.println("=======================\n");
            
            try {
                if (FirebaseApp.getApps().isEmpty()) {
                    FileInputStream serviceAccount = new FileInputStream(credentialsPath);
                    FirebaseOptions options = FirebaseOptions.builder()
                            .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                            .build();
                    FirebaseApp.initializeApp(options);
                }

                FirebaseApp app = FirebaseApp.getInstance();
                Firestore firestore = FirestoreClient.getFirestore(app, "aviralvidhya-firestore-db");
                validateFirestoreConnection(firestore);
                return firestore;
            } catch (Exception e) {
                System.err.println("Failed to initialize Firebase with credentials at: " + credentialsPath);
                e.printStackTrace(System.err);
                throw e;
            }
        } else {
            // Development: Return null, will be handled by FirestoreService
            System.out.println("\n=== DEVELOPMENT MODE - NO CREDENTIALS ===");
            System.out.println("Firebase is NOT initialized (no credentials provided)");
            System.out.println("Data operations will fail - API is read-only");
            System.out.println("");
            System.out.println("TO USE REAL FIRESTORE:");
            System.out.println("1. Download service account JSON from Firebase Console");
            System.out.println("2. Set environment variable:");
            System.out.println("   $env:GCP_AVIRALVIDHYA_CRED=\"C:\\path\\to\\service-account.json\"");
            System.out.println("3. Restart the application");
            System.out.println("=========================================\n");
            
            return null;
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
