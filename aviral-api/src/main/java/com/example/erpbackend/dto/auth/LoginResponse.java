package com.example.erpbackend.dto.auth;

import com.example.erpbackend.security.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponse {
    
    private String token;
    private String refreshToken;
    private String username;
    private String schoolId;
    private Role role;
    private String email;
    private long expiresIn; // Token expiration time in milliseconds
    
    public LoginResponse(String token, String username, String schoolId, Role role, long expiresIn) {
        this.token = token;
        this.username = username;
        this.schoolId = schoolId;
        this.role = role;
        this.expiresIn = expiresIn;
    }
}
