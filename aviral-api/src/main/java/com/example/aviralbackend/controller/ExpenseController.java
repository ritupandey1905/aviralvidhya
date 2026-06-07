package com.example.aviralbackend.controller;

import com.example.aviralbackend.dto.ExpenseDTO;
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
@RequestMapping("/api/expenses")
public class ExpenseController {

    private final FirestoreService firestoreService;

    public ExpenseController(FirestoreService firestoreService) {
        this.firestoreService = firestoreService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAll() throws ExecutionException, InterruptedException {
        List<Map<String, Object>> expenses = firestoreService.findAll("expenses");
        return ResponseEntity.ok(ApiResponse.success(expenses));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getById(@PathVariable String id) throws ExecutionException, InterruptedException {
        Map<String, Object> expense = firestoreService.findById("expenses", id);
        if (expense == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("EXPENSE_NOT_FOUND", "Expense not found with ID: " + id));
        }
        return ResponseEntity.ok(ApiResponse.success(expense));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> create(@Valid @RequestBody ExpenseDTO expenseDTO) throws ExecutionException, InterruptedException {
        String id = UUID.randomUUID().toString();
        Map<String, Object> data = new HashMap<>();
        data.put("title", expenseDTO.getTitle());
        data.put("amount", expenseDTO.getAmount());
        data.put("category", expenseDTO.getCategory());
        data.put("schoolId", expenseDTO.getSchoolId());
        data.put("date", LocalDateTime.now().toString());
        data.put("createdAt", LocalDateTime.now().toString());

        Map<String, Object> created = firestoreService.createOrUpdate("expenses", id, data);
        return new ResponseEntity<>(ApiResponse.success(created, "Expense created successfully"), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> update(@PathVariable String id, @Valid @RequestBody ExpenseDTO expenseDTO) throws ExecutionException, InterruptedException {
        Map<String, Object> updates = new HashMap<>();
        updates.put("title", expenseDTO.getTitle());
        updates.put("amount", expenseDTO.getAmount());
        updates.put("category", expenseDTO.getCategory());
        updates.put("schoolId", expenseDTO.getSchoolId());
        updates.put("updatedAt", LocalDateTime.now().toString());

        firestoreService.update("expenses", id, updates);
        Map<String, Object> updated = firestoreService.findById("expenses", id);
        return ResponseEntity.ok(ApiResponse.success(updated, "Expense updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) throws ExecutionException, InterruptedException {
        firestoreService.delete("expenses", id);
        return ResponseEntity.ok(ApiResponse.success(null, "Expense deleted successfully"));
    }
}
