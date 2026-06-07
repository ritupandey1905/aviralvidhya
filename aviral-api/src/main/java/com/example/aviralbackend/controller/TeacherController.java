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
@RequestMapping("/api/teachers")
public class TeacherController {

    private final FirestoreService firestoreService;

    public TeacherController(FirestoreService firestoreService) {
        this.firestoreService = firestoreService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAll() throws ExecutionException, InterruptedException {
        List<Map<String, Object>> teachers = firestoreService.findAll("teachers");
        return ResponseEntity.ok(ApiResponse.success(teachers));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getById(@PathVariable String id) throws ExecutionException, InterruptedException {
        Map<String, Object> teacher = firestoreService.findById("teachers", id);
        if (teacher == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("TEACHER_NOT_FOUND", "Teacher not found with ID: " + id));
        }
        return ResponseEntity.ok(ApiResponse.success(teacher));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> create(@RequestBody Map<String, Object> teacher) throws ExecutionException, InterruptedException {
        String id = String.valueOf(teacher.get("id"));
        Map<String, Object> created = firestoreService.createOrUpdate("teachers", id, teacher);
        return new ResponseEntity<>(ApiResponse.success(created, "Teacher created successfully"), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> update(@PathVariable String id, @RequestBody Map<String, Object> updates) throws ExecutionException, InterruptedException {
        firestoreService.update("teachers", id, updates);
        Map<String, Object> updated = firestoreService.findById("teachers", id);
        return ResponseEntity.ok(ApiResponse.success(updated, "Teacher updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) throws ExecutionException, InterruptedException {
        firestoreService.delete("teachers", id);
        return ResponseEntity.ok(ApiResponse.success(null, "Teacher deleted successfully"));
    }
}
