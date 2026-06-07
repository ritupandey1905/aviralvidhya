package com.example.aviralbackend.security;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserPrincipal {
    
    private String username;
    private String schoolId;
    private Role role;
    private String email;
    private long issuedAt;
    private long expiresAt;
    
    public boolean isExpired() {
        return System.currentTimeMillis() > expiresAt;
    }
}
