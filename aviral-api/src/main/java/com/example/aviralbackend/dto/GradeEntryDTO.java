package com.example.aviralbackend.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GradeEntryDTO {
    
    @NotBlank(message = "School ID is required")
    private String schoolId;
    
    @NotBlank(message = "Student ID is required")
    private String studentId;
    
    @NotBlank(message = "Student name is required")
    private String studentName;
    
    @NotBlank(message = "Class is required")
    private String class_;
    
    @NotBlank(message = "Subject is required")
    private String subject;
    
    @NotNull(message = "Marks obtained is required")
    @Min(value = 0, message = "Marks cannot be negative")
    private Integer marksObtained;
    
    @NotNull(message = "Max marks is required")
    @Min(value = 1, message = "Max marks must be at least 1")
    private Integer maxMarks;
    
    @NotBlank(message = "Grade is required")
    private String grade; // A, B, C, D, F
    
    @NotBlank(message = "Exam name is required")
    private String examName;
}
