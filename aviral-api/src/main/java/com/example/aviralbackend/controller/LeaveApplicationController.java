package com.example.aviralbackend.controller;

import com.example.aviralbackend.dto.LeaveApplicationDTO;
import com.example.aviralbackend.dto.ApiResponse;
import com.example.aviralbackend.service.FirestoreService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/leaves")
public class LeaveApplicationController {

    private final FirestoreService firestoreService;

    public LeaveApplicationController(FirestoreService firestoreService) {
        this.firestoreService = firestoreService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAll() throws ExecutionException, InterruptedException {
        List<Map<String, Object>> leaves = firestoreService.findAll("leaves");
        return ResponseEntity.ok(ApiResponse.success(leaves));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getById(@PathVariable String id) throws ExecutionException, InterruptedException {
        Map<String, Object> leave = firestoreService.findById("leaves", id);
        if (leave == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("LEAVE_NOT_FOUND", "Leave application not found with ID: " + id));
        }
        return ResponseEntity.ok(ApiResponse.success(leave));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> create(@Valid @RequestBody LeaveApplicationDTO leaveDTO) throws ExecutionException, InterruptedException {
        String id = UUID.randomUUID().toString();
        Map<String, Object> data = new HashMap<>();
        data.put("studentId", leaveDTO.getStudentId());
        data.put("studentName", leaveDTO.getStudentName());
        data.put("class", leaveDTO.getClass_());
        data.put("schoolId", leaveDTO.getSchoolId());
        data.put("startDate", leaveDTO.getStartDate());
        data.put("endDate", leaveDTO.getEndDate());
        data.put("reason", leaveDTO.getReason());
        data.put("category", leaveDTO.getCategory());
        data.put("status", "pending");
        data.put("appliedAt", LocalDateTime.now().toString());
        data.put("createdAt", LocalDateTime.now().toString());

        Map<String, Object> created = firestoreService.createOrUpdate("leaves", id, data);
        return new ResponseEntity<>(ApiResponse.success(created, "Leave application created successfully"), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> update(@PathVariable String id, @Valid @RequestBody LeaveApplicationDTO leaveDTO) throws ExecutionException, InterruptedException {
        Map<String, Object> updates = new HashMap<>();
        updates.put("studentId", leaveDTO.getStudentId());
        updates.put("studentName", leaveDTO.getStudentName());
        updates.put("class", leaveDTO.getClass_());
        updates.put("schoolId", leaveDTO.getSchoolId());
        updates.put("startDate", leaveDTO.getStartDate());
        updates.put("endDate", leaveDTO.getEndDate());
        updates.put("reason", leaveDTO.getReason());
        updates.put("category", leaveDTO.getCategory());
        updates.put("updatedAt", LocalDateTime.now().toString());

        firestoreService.update("leaves", id, updates);
        Map<String, Object> updated = firestoreService.findById("leaves", id);
        return ResponseEntity.ok(ApiResponse.success(updated, "Leave application updated successfully"));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<Map<String, Object>>> approve(@PathVariable String id) throws ExecutionException, InterruptedException {
        Map<String, Object> updates = new HashMap<>();
        updates.put("status", "approved");
        updates.put("approvedAt", LocalDateTime.now().toString());

        firestoreService.update("leaves", id, updates);
        Map<String, Object> updated = firestoreService.findById("leaves", id);
        return ResponseEntity.ok(ApiResponse.success(updated, "Leave application approved"));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<Map<String, Object>>> reject(@PathVariable String id) throws ExecutionException, InterruptedException {
        Map<String, Object> updates = new HashMap<>();
        updates.put("status", "rejected");
        updates.put("rejectedAt", LocalDateTime.now().toString());

        firestoreService.update("leaves", id, updates);
        Map<String, Object> updated = firestoreService.findById("leaves", id);
        return ResponseEntity.ok(ApiResponse.success(updated, "Leave application rejected"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) throws ExecutionException, InterruptedException {
        firestoreService.delete("leaves", id);
        return ResponseEntity.ok(ApiResponse.success(null, "Leave application deleted successfully"));
    }
}
