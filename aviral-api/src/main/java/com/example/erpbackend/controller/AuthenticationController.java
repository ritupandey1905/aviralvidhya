package com.example.erpbackend.controller;

import com.example.erpbackend.dto.auth.LoginRequest;
import com.example.erpbackend.dto.auth.LoginResponse;
import com.example.erpbackend.dto.ApiResponse;
import com.example.erpbackend.security.AuthenticationService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"}, allowCredentials = "true")
public class AuthenticationController {
    
    private final AuthenticationService authenticationService;
    
    public AuthenticationController(AuthenticationService authenticationService) {
        this.authenticationService = authenticationService;
    }
    
    /**
     * Login endpoint - returns JWT token
     * 
     * Request:
     * {
     *   "username": "admin_user",
     *   "password": "password",
     *   "schoolId": "school_delhi_public"
     * }
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            LoginResponse response = authenticationService.authenticate(loginRequest);
            log.info("Login successful for user: {} in school: {}", loginRequest.getUsername(), loginRequest.getSchoolId());
            return ResponseEntity.ok(ApiResponse.success(response, "Login successful"));
        } catch (Exception e) {
            log.error("Login failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("AUTH_ERROR", "Invalid credentials or school"));
        }
    }
    
    /**
     * Refresh token endpoint - returns new access token
     * 
     * Request:
     * Authorization: Bearer <refreshToken>
     */
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<LoginResponse>> refreshToken(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("AUTH_ERROR", "Missing or invalid refresh token"));
            }
            
            String refreshToken = authHeader.substring(7);
            LoginResponse response = authenticationService.refreshAccessToken(refreshToken);
            return ResponseEntity.ok(ApiResponse.success(response, "Token refreshed successfully"));
        } catch (Exception e) {
            log.error("Token refresh failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("AUTH_ERROR", "Invalid or expired refresh token"));
        }
    }
    
    /**
     * Validate token endpoint - check if token is valid
     * 
     * Request:
     * Authorization: Bearer <token>
     */
    @GetMapping("/validate")
    public ResponseEntity<ApiResponse<Boolean>> validateToken(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.ok(ApiResponse.success(false, "No token provided"));
            }
            
            String token = authHeader.substring(7);
            authenticationService.validateAndGetPrincipal(token);
            return ResponseEntity.ok(ApiResponse.success(true, "Token is valid"));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.success(false, "Token is invalid or expired"));
        }
    }
}
