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
@RequestMapping("/api/notices")
public class NoticeController {

    private final FirestoreService firestoreService;

    public NoticeController(FirestoreService firestoreService) {
        this.firestoreService = firestoreService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAll() throws ExecutionException, InterruptedException {
        List<Map<String, Object>> notices = firestoreService.findAll("notices");
        return ResponseEntity.ok(ApiResponse.success(notices));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getById(@PathVariable String id) throws ExecutionException, InterruptedException {
        Map<String, Object> notice = firestoreService.findById("notices", id);
        if (notice == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("NOTICE_NOT_FOUND", "Notice not found with ID: " + id));
        }
        return ResponseEntity.ok(ApiResponse.success(notice));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> create(@RequestBody Map<String, Object> notice) throws ExecutionException, InterruptedException {
        String id = String.valueOf(notice.get("id"));
        Map<String, Object> created = firestoreService.createOrUpdate("notices", id, notice);
        return new ResponseEntity<>(ApiResponse.success(created, "Notice created successfully"), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> update(@PathVariable String id, @RequestBody Map<String, Object> updates) throws ExecutionException, InterruptedException {
        firestoreService.update("notices", id, updates);
        Map<String, Object> updated = firestoreService.findById("notices", id);
        return ResponseEntity.ok(ApiResponse.success(updated, "Notice updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) throws ExecutionException, InterruptedException {
        firestoreService.delete("notices", id);
        return ResponseEntity.ok(ApiResponse.success(null, "Notice deleted successfully"));
    }
}
