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
@RequestMapping("/api/schools")
public class SchoolController {

    private final FirestoreService firestoreService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public SchoolController(FirestoreService firestoreService, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.firestoreService = firestoreService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
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
        ensureSchoolAdminUser(id, school);
        school.remove("adminPassword");
        Map<String, Object> created = firestoreService.createOrUpdate("schools", id, school);
        return new ResponseEntity<>(ApiResponse.success(created, "School created successfully"), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> update(@PathVariable String id, @RequestBody Map<String, Object> updates) throws ExecutionException, InterruptedException {
        if (updates.containsKey("adminPassword")) {
            Map<String, Object> existingSchool = firestoreService.findById("schools", id);
            if (existingSchool != null) {
                if (!updates.containsKey("adminUsername") && existingSchool.containsKey("adminUsername")) {
                    updates.put("adminUsername", existingSchool.get("adminUsername"));
                }
                updates.put("contactEmail", existingSchool.getOrDefault("contactEmail", updates.get("contactEmail")));
                ensureSchoolAdminUser(id, updates);
            }
            updates.remove("adminPassword");
        }
        firestoreService.update("schools", id, updates);
        Map<String, Object> updated = firestoreService.findById("schools", id);
        return ResponseEntity.ok(ApiResponse.success(updated, "School updated successfully"));
    }

    private void ensureSchoolAdminUser(String schoolId, Map<String, Object> school) {
        String username = sanitize(school.get("adminUsername"));
        String password = sanitize(school.get("adminPassword"));
        if (username.isBlank() || password.isBlank()) {
            return;
        }

        String email = sanitize(school.get("contactEmail"));
        Optional<UserEntity> existing = userRepository.findByUsernameOrEmailAndSchoolId(username, schoolId);

        UserEntity adminUser = UserEntity.builder()
                .id(existing.map(UserEntity::getId).orElse(null))
                .username(username)
                .passwordHash(passwordEncoder.encode(password))
                .schoolId(schoolId)
                .role(Role.SCHOOL_ADMIN)
                .email(email)
                .active(true)
                .build();

        userRepository.save(adminUser);
    }

    private String sanitize(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) throws ExecutionException, InterruptedException {
        firestoreService.delete("schools", id);
        return ResponseEntity.ok(ApiResponse.success(null, "School deleted successfully"));
    }
}
