package com.example.aviralbackend.security;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserEntity {
    private String id;
    private String username;
    private String passwordHash;
    private String schoolId;
    private Role role;
    private String email;
    private boolean active;
}