package com.example.erpbackend.controller;

import com.example.erpbackend.dto.ApiResponse;
import com.example.erpbackend.service.FirestoreService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final FirestoreService firestoreService;

    public StudentController(FirestoreService firestoreService) {
        this.firestoreService = firestoreService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAll() throws ExecutionException, InterruptedException {
        List<Map<String, Object>> students = firestoreService.findAll("students");
        return ResponseEntity.ok(ApiResponse.success(students));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getById(@PathVariable String id) throws ExecutionException, InterruptedException {
        Map<String, Object> student = firestoreService.findById("students", id);
        if (student == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("STUDENT_NOT_FOUND", "Student not found with ID: " + id));
        }
        return ResponseEntity.ok(ApiResponse.success(student));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> create(@RequestBody Map<String, Object> student) throws ExecutionException, InterruptedException {
        String id = String.valueOf(student.get("id"));
        Map<String, Object> created = firestoreService.createOrUpdate("students", id, student);
        return new ResponseEntity<>(ApiResponse.success(created, "Student created successfully"), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> update(@PathVariable String id, @RequestBody Map<String, Object> updates) throws ExecutionException, InterruptedException {
        firestoreService.update("students", id, updates);
        Map<String, Object> updated = firestoreService.findById("students", id);
        return ResponseEntity.ok(ApiResponse.success(updated, "Student updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) throws ExecutionException, InterruptedException {
        firestoreService.delete("students", id);
        return ResponseEntity.ok(ApiResponse.success(null, "Student deleted successfully"));
    }
}
