package com.example.aviralbackend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimetableSlotDTO {
    
    @NotBlank(message = "School ID is required")
    private String schoolId;
    
    @NotBlank(message = "Class is required")
    private String class_;
    
    @NotBlank(message = "Day is required")
    private String day; // e.g. Monday, Tuesday
    
    @NotBlank(message = "Period is required")
    private String period; // e.g. Period 1, Period 2
    
    @NotBlank(message = "Subject is required")
    private String subject;
    
    @NotBlank(message = "Teacher name is required")
    private String teacherName;
    
    @NotBlank(message = "Time is required")
    private String time; // e.g. 09:00-10:00
}
