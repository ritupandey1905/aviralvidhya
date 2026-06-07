package com.example.erpbackend.controller;

import com.example.erpbackend.dto.TimetableSlotDTO;
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
@RequestMapping("/api/timetable")
public class TimetableSlotController {

    private final FirestoreService firestoreService;

    public TimetableSlotController(FirestoreService firestoreService) {
        this.firestoreService = firestoreService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAll() throws ExecutionException, InterruptedException {
        List<Map<String, Object>> slots = firestoreService.findAll("timetable");
        return ResponseEntity.ok(ApiResponse.success(slots));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getById(@PathVariable String id) throws ExecutionException, InterruptedException {
        Map<String, Object> slot = firestoreService.findById("timetable", id);
        if (slot == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("TIMETABLE_NOT_FOUND", "Timetable slot not found with ID: " + id));
        }
        return ResponseEntity.ok(ApiResponse.success(slot));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> create(@Valid @RequestBody TimetableSlotDTO timetableDTO) throws ExecutionException, InterruptedException {
        String id = UUID.randomUUID().toString();
        Map<String, Object> data = new HashMap<>();
        data.put("schoolId", timetableDTO.getSchoolId());
        data.put("class", timetableDTO.getClass_());
        data.put("day", timetableDTO.getDay());
        data.put("period", timetableDTO.getPeriod());
        data.put("subject", timetableDTO.getSubject());
        data.put("teacherName", timetableDTO.getTeacherName());
        data.put("time", timetableDTO.getTime());
        data.put("createdAt", LocalDateTime.now().toString());

        Map<String, Object> created = firestoreService.createOrUpdate("timetable", id, data);
        return new ResponseEntity<>(ApiResponse.success(created, "Timetable slot created successfully"), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> update(@PathVariable String id, @Valid @RequestBody TimetableSlotDTO timetableDTO) throws ExecutionException, InterruptedException {
        Map<String, Object> updates = new HashMap<>();
        updates.put("schoolId", timetableDTO.getSchoolId());
        updates.put("class", timetableDTO.getClass_());
        updates.put("day", timetableDTO.getDay());
        updates.put("period", timetableDTO.getPeriod());
        updates.put("subject", timetableDTO.getSubject());
        updates.put("teacherName", timetableDTO.getTeacherName());
        updates.put("time", timetableDTO.getTime());
        updates.put("updatedAt", LocalDateTime.now().toString());

        firestoreService.update("timetable", id, updates);
        Map<String, Object> updated = firestoreService.findById("timetable", id);
        return ResponseEntity.ok(ApiResponse.success(updated, "Timetable slot updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) throws ExecutionException, InterruptedException {
        firestoreService.delete("timetable", id);
        return ResponseEntity.ok(ApiResponse.success(null, "Timetable slot deleted successfully"));
    }
}
