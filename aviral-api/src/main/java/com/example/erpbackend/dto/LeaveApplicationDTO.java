package com.example.erpbackend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveApplicationDTO {
    
    @NotBlank(message = "Student ID is required")
    private String studentId;
    
    @NotBlank(message = "Student name is required")
    private String studentName;
    
    @NotBlank(message = "Class is required")
    private String class_;
    
    @NotBlank(message = "School ID is required")
    private String schoolId;
    
    @NotBlank(message = "Start date is required")
    private String startDate;
    
    @NotBlank(message = "End date is required")
    private String endDate;
    
    @NotBlank(message = "Reason is required")
    private String reason;
    
    @NotNull(message = "Category is required")
    private String category; // 'sick', 'casual', 'other'
}
