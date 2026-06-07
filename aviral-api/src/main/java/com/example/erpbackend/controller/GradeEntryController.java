package com.example.erpbackend.controller;

import com.example.erpbackend.dto.GradeEntryDTO;
import com.example.erpbackend.dto.ApiResponse;
import com.example.erpbackend.service.FirestoreService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/grades")
public class GradeEntryController {

    private final FirestoreService firestoreService;

    public GradeEntryController(FirestoreService firestoreService) {
        this.firestoreService = firestoreService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAll() throws ExecutionException, InterruptedException {
        List<Map<String, Object>> grades = firestoreService.findAll("grades");
        return ResponseEntity.ok(ApiResponse.success(grades));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getById(@PathVariable String id) throws ExecutionException, InterruptedException {
        Map<String, Object> grade = firestoreService.findById("grades", id);
        if (grade == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("GRADE_NOT_FOUND", "Grade entry not found with ID: " + id));
        }
        return ResponseEntity.ok(ApiResponse.success(grade));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> create(@Valid @RequestBody GradeEntryDTO gradeDTO) throws ExecutionException, InterruptedException {
        String id = UUID.randomUUID().toString();
        Map<String, Object> data = new HashMap<>();
        data.put("schoolId", gradeDTO.getSchoolId());
        data.put("studentId", gradeDTO.getStudentId());
        data.put("studentName", gradeDTO.getStudentName());
        data.put("class", gradeDTO.getClass_());
        data.put("subject", gradeDTO.getSubject());
        data.put("marksObtained", gradeDTO.getMarksObtained());
        data.put("maxMarks", gradeDTO.getMaxMarks());
        data.put("grade", gradeDTO.getGrade());
        data.put("examName", gradeDTO.getExamName());
        data.put("createdAt", LocalDateTime.now().toString());

        Map<String, Object> created = firestoreService.createOrUpdate("grades", id, data);
        return new ResponseEntity<>(ApiResponse.success(created, "Grade entry created successfully"), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> update(@PathVariable String id, @Valid @RequestBody GradeEntryDTO gradeDTO) throws ExecutionException, InterruptedException {
        Map<String, Object> updates = new HashMap<>();
        updates.put("schoolId", gradeDTO.getSchoolId());
        updates.put("studentId", gradeDTO.getStudentId());
        updates.put("studentName", gradeDTO.getStudentName());
        updates.put("class", gradeDTO.getClass_());
        updates.put("subject", gradeDTO.getSubject());
        updates.put("marksObtained", gradeDTO.getMarksObtained());
        updates.put("maxMarks", gradeDTO.getMaxMarks());
        updates.put("grade", gradeDTO.getGrade());
        updates.put("examName", gradeDTO.getExamName());
        updates.put("updatedAt", LocalDateTime.now().toString());

        firestoreService.update("grades", id, updates);
        Map<String, Object> updated = firestoreService.findById("grades", id);
        return ResponseEntity.ok(ApiResponse.success(updated, "Grade entry updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) throws ExecutionException, InterruptedException {
        firestoreService.delete("grades", id);
        return ResponseEntity.ok(ApiResponse.success(null, "Grade entry deleted successfully"));
    }
}
