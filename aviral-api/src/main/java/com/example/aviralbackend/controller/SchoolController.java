package com.example.aviralbackend.controller;

import com.example.aviralbackend.dto.ApiResponse;
import com.example.aviralbackend.service.FirestoreService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/schools")
public class SchoolController {

    private final FirestoreService firestoreService;

    public SchoolController(FirestoreService firestoreService) {
        this.firestoreService = firestoreService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAll() throws ExecutionException, InterruptedException {
        List<Map<String, Object>> schools = firestoreService.findAll("schools");
        return ResponseEntity.ok(ApiResponse.success(schools));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getById(@PathVariable String id) throws ExecutionException, InterruptedException {
        Map<String, Object> school = firestoreService.findById("schools", id);
        if (school == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("SCHOOL_NOT_FOUND", "School not found with ID: " + id));
        }
        return ResponseEntity.ok(ApiResponse.success(school));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> create(@RequestBody Map<String, Object> school) throws ExecutionException, InterruptedException {
        String id = String.valueOf(school.get("id"));
        Map<String, Object> created = firestoreService.createOrUpdate("schools", id, school);
        return new ResponseEntity<>(ApiResponse.success(created, "School created successfully"), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> update(@PathVariable String id, @RequestBody Map<String, Object> updates) throws ExecutionException, InterruptedException {
        firestoreService.update("schools", id, updates);
        Map<String, Object> updated = firestoreService.findById("schools", id);
        return ResponseEntity.ok(ApiResponse.success(updated, "School updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) throws ExecutionException, InterruptedException {
        firestoreService.delete("schools", id);
        return ResponseEntity.ok(ApiResponse.success(null, "School deleted successfully"));
    }
}
