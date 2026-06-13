package com.example.aviralbackend.controller;

import com.example.aviralbackend.dto.ApiResponse;
import com.example.aviralbackend.security.Role;
import com.example.aviralbackend.security.UserEntity;
import com.example.aviralbackend.security.UserRepository;
import com.example.aviralbackend.service.FirestoreService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final FirestoreService firestoreService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public StudentController(FirestoreService firestoreService, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.firestoreService = firestoreService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAll() throws ExecutionException, InterruptedException {
        List<Map<String, Object>> students = firestoreService.findAll("students");
        return ResponseEntity.ok(ApiResponse.success(students));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getById(@PathVariable("id") String id) throws ExecutionException, InterruptedException {
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
        ensureParentUser(student);
        student.remove("parentPassword");
        Map<String, Object> created = firestoreService.createOrUpdate("students", id, student);
        return new ResponseEntity<>(ApiResponse.success(created, "Student created successfully"), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> update(@PathVariable("id") String id, @RequestBody Map<String, Object> updates) throws ExecutionException, InterruptedException {
        if (updates.containsKey("parentPassword")) {
            Map<String, Object> existingStudent = firestoreService.findById("students", id);
            if (existingStudent != null) {
                if (!updates.containsKey("parentUsername") && existingStudent.containsKey("parentUsername")) {
                    updates.put("parentUsername", existingStudent.get("parentUsername"));
                }
                if (!updates.containsKey("schoolId") && existingStudent.containsKey("schoolId")) {
                    updates.put("schoolId", existingStudent.get("schoolId"));
                }
                ensureParentUser(updates);
            }
            updates.remove("parentPassword");
        }
        firestoreService.update("students", id, updates);
        Map<String, Object> updated = firestoreService.findById("students", id);
        return ResponseEntity.ok(ApiResponse.success(updated, "Student updated successfully"));
    }

    private void ensureParentUser(Map<String, Object> student) {
        String username = sanitize(student.get("parentUsername"));
        String password = sanitize(student.get("parentPassword"));
        String schoolId = sanitize(student.get("schoolId"));
        if (username.isBlank() || password.isBlank() || schoolId.isBlank()) {
            return;
        }

        Optional<UserEntity> existing = userRepository.findByUsernameOrEmailAndSchoolId(username, schoolId);
        UserEntity parentalUser = UserEntity.builder()
                .id(existing.map(UserEntity::getId).orElse(null))
                .username(username)
                .passwordHash(passwordEncoder.encode(password))
                .schoolId(schoolId)
                .role(Role.PARENT)
                .email(null)
                .active(true)
                .build();
        userRepository.save(parentalUser);
    }

    private String sanitize(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable("id") String id) throws ExecutionException, InterruptedException {
        firestoreService.delete("students", id);
        return ResponseEntity.ok(ApiResponse.success(null, "Student deleted successfully"));
    }
}
