package com.example.aviralbackend.security;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.CollectionReference;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.QuerySnapshot;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Repository;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ExecutionException;

@Repository
public class UserRepository {

    private final Firestore firestore;
    private final boolean isAvailable;
    private static final String COLLECTION_NAME = "users";

    public UserRepository(@Nullable Firestore firestore) {
        this.firestore = firestore;
        this.isAvailable = firestore != null;
    }

    public Optional<UserEntity> findByUsernameAndSchoolId(String username, String schoolId) {
        if (!isAvailable) return Optional.empty();

        try {
            CollectionReference users = firestore.collection(COLLECTION_NAME);
            ApiFuture<QuerySnapshot> query = users.whereEqualTo("username", username)
                                                  .whereEqualTo("schoolId", schoolId)
                                                  .get();
            QuerySnapshot snapshot = query.get();
            if (snapshot.isEmpty()) {
                return Optional.empty();
            }

            DocumentSnapshot doc = snapshot.getDocuments().get(0);
            return Optional.of(mapToEntity(doc));
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Error fetching user from Firestore", e);
        }
    }

    public Optional<UserEntity> findByUsernameOrEmailAndSchoolId(String usernameOrEmail, String schoolId) {
        if (!isAvailable) return Optional.empty();

        try {
            CollectionReference users = firestore.collection(COLLECTION_NAME);
            ApiFuture<QuerySnapshot> query = users.whereEqualTo("username", usernameOrEmail)
                                                  .whereEqualTo("schoolId", schoolId)
                                                  .get();
            QuerySnapshot snapshot = query.get();
            if (!snapshot.isEmpty()) {
                return Optional.of(mapToEntity(snapshot.getDocuments().get(0)));
            }

            query = users.whereEqualTo("email", usernameOrEmail)
                         .whereEqualTo("schoolId", schoolId)
                         .get();
            snapshot = query.get();
            if (snapshot.isEmpty()) {
                return Optional.empty();
            }

            return Optional.of(mapToEntity(snapshot.getDocuments().get(0)));
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Error fetching user from Firestore", e);
        }
    }

    public Optional<UserEntity> findByUsernameOrEmail(String usernameOrEmail) {
        if (!isAvailable) return Optional.empty();

        try {
            CollectionReference users = firestore.collection(COLLECTION_NAME);
            ApiFuture<QuerySnapshot> query = users.whereEqualTo("username", usernameOrEmail).get();
            QuerySnapshot snapshot = query.get();
            if (!snapshot.isEmpty()) {
                return Optional.of(mapToEntity(snapshot.getDocuments().get(0)));
            }

            query = users.whereEqualTo("email", usernameOrEmail).get();
            snapshot = query.get();
            if (snapshot.isEmpty()) {
                return Optional.empty();
            }

            return Optional.of(mapToEntity(snapshot.getDocuments().get(0)));
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Error fetching user from Firestore", e);
        }
    }

    public void save(UserEntity user) {
        if (!isAvailable) throw new RuntimeException("Firestore is not available");

        Map<String, Object> data = new HashMap<>();
        data.put("username", user.getUsername());
        data.put("passwordHash", user.getPasswordHash());
        data.put("schoolId", user.getSchoolId());
        data.put("role", user.getRole().getValue());
        data.put("email", user.getEmail());
        data.put("active", user.isActive());

        try {
            if (user.getId() == null || user.getId().isEmpty()) {
                firestore.collection(COLLECTION_NAME).add(data).get();
            } else {
                firestore.collection(COLLECTION_NAME).document(user.getId()).set(data).get();
            }
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Error saving user to Firestore", e);
        }
    }
    
    public boolean hasAnyUsers() {
        if (!isAvailable) return false;
        try {
            ApiFuture<QuerySnapshot> query = firestore.collection(COLLECTION_NAME).limit(1).get();
            return !query.get().isEmpty();
        } catch (Exception e) {
            return false;
        }
    }

    private UserEntity mapToEntity(DocumentSnapshot doc) {
        return UserEntity.builder()
                .id(doc.getId())
                .username(doc.getString("username"))
                .passwordHash(doc.getString("passwordHash"))
                .schoolId(doc.getString("schoolId"))
                .role(Role.fromString(doc.getString("role")))
                .email(doc.getString("email"))
                .active(Boolean.TRUE.equals(doc.getBoolean("active")))
                .build();
    }
}
