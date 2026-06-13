package com.example.aviralbackend.security;

import com.example.aviralbackend.dto.auth.LoginRequest;
import com.example.aviralbackend.dto.auth.LoginResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class AuthenticationService {
    
    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    public AuthenticationService(JwtTokenProvider jwtTokenProvider, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }
    
    /**
     * Authenticate user against Firestore and generate JWT token
     */
    public LoginResponse authenticate(LoginRequest loginRequest) {
        String username = loginRequest.getUsername();
        String password = loginRequest.getPassword();
        String schoolId = loginRequest.getSchoolId();
        boolean isSchoolContext = schoolId != null && !schoolId.isBlank();
        
        log.info("User {} attempting to login{}",
                username,
                isSchoolContext ? " for school " + schoolId : " as global super admin");
        
        UserEntity user;
        if (isSchoolContext) {
            user = userRepository.findByUsernameOrEmailAndSchoolId(username, schoolId)
                    .orElseThrow(() -> new IllegalArgumentException("Invalid credentials or school"));
        } else {
            user = userRepository.findByUsernameOrEmail(username)
                    .filter(u -> u.getRole() == Role.SUPER_ADMIN)
                    .orElseThrow(() -> new IllegalArgumentException("Invalid credentials or school"));
        }
                
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid credentials or school");
        }
        
        if (!user.isActive()) {
            throw new IllegalArgumentException("User account is disabled");
        }
        
        // Create user principal
        UserPrincipal userPrincipal = UserPrincipal.builder()
                .username(user.getUsername())
                .schoolId(user.getSchoolId())
                .role(user.getRole())
                .email(user.getEmail())
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
                .username(user.getUsername())
                .schoolId(user.getSchoolId())
                .role(user.getRole())
                .email(user.getEmail())
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
