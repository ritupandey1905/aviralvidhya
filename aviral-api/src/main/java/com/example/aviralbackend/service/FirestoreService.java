package com.example.aviralbackend.service;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.QuerySnapshot;
import com.google.cloud.firestore.WriteResult;
import com.google.cloud.firestore.SetOptions;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

@Service
public class FirestoreService {

    private final Firestore firestore;
    private final boolean isAvailable;

    public FirestoreService(@Nullable Firestore firestore) {
        this.firestore = firestore;
        this.isAvailable = firestore != null;
    }

    private void checkAvailability() {
        if (!isAvailable) {
            throw new RuntimeException(
                "Firestore is not initialized. Set GCP_AVIRALVIDHYA_CRED environment variable and restart."
            );
        }
    }

    public List<Map<String, Object>> findAll(String collectionName) throws ExecutionException, InterruptedException {
        checkAvailability();
        QuerySnapshot snapshot = firestore.collection(collectionName).get().get();
        return snapshot.getDocuments().stream()
                .map(doc -> {
                    Map<String, Object> data = new HashMap<>(doc.getData());
                    data.put("id", doc.getId());
                    return data;
                })
                .collect(Collectors.toList());
    }

    public Map<String, Object> createOrUpdate(String collectionName, String id, Map<String, Object> payload) throws ExecutionException, InterruptedException {
        checkAvailability();
        DocumentReference docRef = firestore.collection(collectionName).document(id);
        ApiFuture<WriteResult> writeResult = docRef.set(payload);
        writeResult.get();
        Map<String, Object> data = new HashMap<>(payload);
        data.put("id", id);
        return data;
    }

    public void update(String collectionName, String id, Map<String, Object> updates) throws ExecutionException, InterruptedException {
        checkAvailability();
        DocumentReference docRef = firestore.collection(collectionName).document(id);
        // Use set with merge to apply a Map update reliably across firebase-admin versions
        docRef.set(updates, SetOptions.merge()).get();
    }

    public void delete(String collectionName, String id) throws ExecutionException, InterruptedException {
        checkAvailability();
        firestore.collection(collectionName).document(id).delete().get();
    }

    public Map<String, Object> findById(String collectionName, String id) throws ExecutionException, InterruptedException {
        checkAvailability();
        DocumentSnapshot snapshot = firestore.collection(collectionName).document(id).get().get();
        if (!snapshot.exists()) {
            return null;
        }
        Map<String, Object> data = new HashMap<>(snapshot.getData());
        data.put("id", snapshot.getId());
        return data;
    }
}


