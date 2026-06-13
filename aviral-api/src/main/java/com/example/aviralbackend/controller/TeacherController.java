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
@RequestMapping("/api/teachers")
public class TeacherController {

    private final FirestoreService firestoreService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public TeacherController(FirestoreService firestoreService, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.firestoreService = firestoreService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
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
        ensureTeacherUser(teacher);
        teacher.remove("teacherPassword");
        Map<String, Object> created = firestoreService.createOrUpdate("teachers", id, teacher);
        return new ResponseEntity<>(ApiResponse.success(created, "Teacher created successfully"), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> update(@PathVariable String id, @RequestBody Map<String, Object> updates) throws ExecutionException, InterruptedException {
        if (updates.containsKey("teacherPassword")) {
            Map<String, Object> existingTeacher = firestoreService.findById("teachers", id);
            if (existingTeacher != null) {
                if (!updates.containsKey("teacherUsername") && existingTeacher.containsKey("teacherUsername")) {
                    updates.put("teacherUsername", existingTeacher.get("teacherUsername"));
                }
                if (!updates.containsKey("schoolId") && existingTeacher.containsKey("schoolId")) {
                    updates.put("schoolId", existingTeacher.get("schoolId"));
                }
                ensureTeacherUser(updates);
            }
            updates.remove("teacherPassword");
        }
        firestoreService.update("teachers", id, updates);
        Map<String, Object> updated = firestoreService.findById("teachers", id);
        return ResponseEntity.ok(ApiResponse.success(updated, "Teacher updated successfully"));
    }

    private void ensureTeacherUser(Map<String, Object> teacher) {
        String username = sanitize(teacher.get("teacherUsername"));
        String password = sanitize(teacher.get("teacherPassword"));
        String schoolId = sanitize(teacher.get("schoolId"));
        if (username.isBlank() || password.isBlank() || schoolId.isBlank()) {
            return;
        }

        String email = sanitize(teacher.get("email"));
        String designation = sanitize(teacher.get("designation")).toLowerCase();
        Role userRole = Role.TEACHER;
        if (designation.equals("accountant")) {
            userRole = Role.ACCOUNTANT;
        } else if (designation.equals("principle") || designation.equals("principal")) {
            userRole = Role.PRINCIPLE;
        }

        Optional<UserEntity> existing = userRepository.findByUsernameOrEmailAndSchoolId(username, schoolId);
        UserEntity teacherUser = UserEntity.builder()
                .id(existing.map(UserEntity::getId).orElse(null))
                .username(username)
                .passwordHash(passwordEncoder.encode(password))
                .schoolId(schoolId)
                .role(userRole)
                .email(email)
                .active(true)
                .build();
        userRepository.save(teacherUser);
    }

    private String sanitize(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) throws ExecutionException, InterruptedException {
        firestoreService.delete("teachers", id);
        return ResponseEntity.ok(ApiResponse.success(null, "Teacher deleted successfully"));
    }
}
