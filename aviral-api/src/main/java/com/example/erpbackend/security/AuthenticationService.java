package com.example.erpbackend.security;

import com.example.erpbackend.dto.auth.LoginRequest;
import com.example.erpbackend.dto.auth.LoginResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class AuthenticationService {
    
    private final JwtTokenProvider jwtTokenProvider;
    
    public AuthenticationService(JwtTokenProvider jwtTokenProvider) {
        this.jwtTokenProvider = jwtTokenProvider;
    }
    
    /**
     * Authenticate user and generate JWT token
     * 
     * NOTE: In a production system, you would:
     * 1. Query the database for the user
     * 2. Verify password using BCrypt
     * 3. Check if user is active
     * 
     * For now, this demonstrates the authentication flow
     */
    public LoginResponse authenticate(LoginRequest loginRequest) {
        String username = loginRequest.getUsername();
        String password = loginRequest.getPassword();
        String schoolId = loginRequest.getSchoolId();
        
        // TODO: Replace with actual database lookup and password verification
        // For demo purposes, accept any username/password combination
        // In production:
        // UserEntity user = userRepository.findByUsernameAndSchoolId(username, schoolId);
        // if (user == null || !passwordEncoder.matches(password, user.getPassword())) {
        //     throw new AuthenticationException("Invalid credentials");
        // }
        
        log.info("User {} attempting to login for school {}", username, schoolId);
        
        // Determine role based on username pattern (for demo)
        Role role = determineRole(username);
        
        // Create user principal
        UserPrincipal userPrincipal = UserPrincipal.builder()
                .username(username)
                .schoolId(schoolId)
                .role(role)
                .email(username + "@" + schoolId + ".edu")
                .issuedAt(System.currentTimeMillis())
                .expiresAt(System.currentTimeMillis() + 3600000) // 1 hour
                .build();
        
        // Generate tokens
        String token = jwtTokenProvider.generateToken(userPrincipal);
        String refreshToken = jwtTokenProvider.generateRefreshToken(userPrincipal);
        
        log.info("User {} successfully authenticated for school {}", username, schoolId);
        
        return LoginResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .username(username)
                .schoolId(schoolId)
                .role(role)
                .email(userPrincipal.getEmail())
                .expiresIn(3600000) // 1 hour in ms
                .build();
    }
    
    /**
     * Validate JWT token and extract user principal
     */
    public UserPrincipal validateAndGetPrincipal(String token) {
        if (!jwtTokenProvider.validateToken(token)) {
            throw new IllegalArgumentException("Invalid or expired token");
        }
        return jwtTokenProvider.getUserPrincipalFromToken(token);
    }
    
    /**
     * Demo: Determine role based on username pattern
     * In production, this comes from database
     */
    private Role determineRole(String username) {
        if (username.contains("admin")) {
            return username.contains("school") ? Role.SCHOOL_ADMIN : Role.SUPER_ADMIN;
        } else if (username.contains("teacher")) {
            return Role.TEACHER;
        } else if (username.contains("parent")) {
            return Role.PARENT;
        }
        return Role.PARENT; // Default role
    }
    
    /**
     * Refresh access token using refresh token
     */
    public LoginResponse refreshAccessToken(String refreshToken) {
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new IllegalArgumentException("Invalid or expired refresh token");
        }
        
        UserPrincipal userPrincipal = jwtTokenProvider.getUserPrincipalFromToken(refreshToken);
        String newAccessToken = jwtTokenProvider.generateToken(userPrincipal);
        
        return LoginResponse.builder()
                .token(newAccessToken)
                .username(userPrincipal.getUsername())
                .schoolId(userPrincipal.getSchoolId())
                .role(userPrincipal.getRole())
                .email(userPrincipal.getEmail())
                .expiresIn(3600000)
                .build();
    }
}
