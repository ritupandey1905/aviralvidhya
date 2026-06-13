package com.example.aviralbackend.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Component
public class JwtTokenProvider {
    
    @Value("${jwt.secret}")
    private String jwtSecret;
    
    @Value("${jwt.expiration:3600000}") // 1 hour default
    private long jwtExpirationMs;
    
    @Value("${jwt.refresh.expiration:86400000}") // 24 hours default
    private long refreshTokenExpirationMs;
    
    /**
     * Generate a JWT token from UserPrincipal
     */
    public String generateToken(UserPrincipal userPrincipal) {
        long issuedAt = System.currentTimeMillis();
        long expiresAt = issuedAt + jwtExpirationMs;
        
        Map<String, Object> claims = new HashMap<>();
        claims.put("schoolId", userPrincipal.getSchoolId());
        claims.put("role", userPrincipal.getRole().getValue());
        claims.put("email", userPrincipal.getEmail());
        
        return createToken(claims, userPrincipal.getUsername(), issuedAt, expiresAt);
    }
    
    /**
     * Generate a refresh token
     */
    public String generateRefreshToken(UserPrincipal userPrincipal) {
        long issuedAt = System.currentTimeMillis();
        long expiresAt = issuedAt + refreshTokenExpirationMs;
        
        Map<String, Object> claims = new HashMap<>();
        claims.put("type", "refresh");
        claims.put("schoolId", userPrincipal.getSchoolId());
        
        return createToken(claims, userPrincipal.getUsername(), issuedAt, expiresAt);
    }
    
    private SecretKey getSecretKey() {
        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 64) {
            try {
                java.security.MessageDigest md = java.security.MessageDigest.getInstance("SHA-512");
                keyBytes = md.digest(keyBytes);
            } catch (java.security.NoSuchAlgorithmException e) {
                log.error("SHA-512 algorithm not found, using padded key.");
                byte[] padded = new byte[64];
                System.arraycopy(keyBytes, 0, padded, 0, keyBytes.length);
                keyBytes = padded;
            }
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }
    
    /**
     * Create JWT token with claims
     */
    private String createToken(Map<String, Object> claims, String subject, long issuedAt, long expiresAt) {
        SecretKey key = getSecretKey();
        
        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuedAt(new Date(issuedAt))
                .expiration(new Date(expiresAt))
                .signWith(key, SignatureAlgorithm.HS512)
                .compact();
    }
    
    /**
     * Validate JWT token
     */
    public boolean validateToken(String token) {
        try {
            SecretKey key = getSecretKey();
            Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (SecurityException e) {
            log.error("Invalid JWT signature: {}", e.getMessage());
            return false;
        } catch (MalformedJwtException e) {
            log.error("Invalid JWT token: {}", e.getMessage());
            return false;
        } catch (ExpiredJwtException e) {
            log.error("Expired JWT token: {}", e.getMessage());
            return false;
        } catch (UnsupportedJwtException e) {
            log.error("Unsupported JWT token: {}", e.getMessage());
            return false;
        } catch (IllegalArgumentException e) {
            log.error("JWT claims string is empty: {}", e.getMessage());
            return false;
        }
    }
    
    /**
     * Extract username from token
     */
    public String getUsernameFromToken(String token) {
        return getClaimsFromToken(token).getSubject();
    }
    
    /**
     * Extract schoolId from token
     */
    public String getSchoolIdFromToken(String token) {
        return (String) getClaimsFromToken(token).get("schoolId");
    }
    
    /**
     * Extract role from token
     */
    public Role getRoleFromToken(String token) {
        String roleValue = (String) getClaimsFromToken(token).get("role");
        return Role.fromString(roleValue);
    }
    
    /**
     * Extract email from token
     */
    public String getEmailFromToken(String token) {
        return (String) getClaimsFromToken(token).get("email");
    }
    
    /**
     * Extract expiration time from token
     */
    public long getExpirationFromToken(String token) {
        return getClaimsFromToken(token).getExpiration().getTime();
    }
    
    /**
     * Extract all claims from token
     */
    public Claims getClaimsFromToken(String token) {
        SecretKey key = getSecretKey();
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
    
    /**
     * Build UserPrincipal from token
     */
    public UserPrincipal getUserPrincipalFromToken(String token) {
        Claims claims = getClaimsFromToken(token);
        
        return UserPrincipal.builder()
                .username(claims.getSubject())
                .schoolId((String) claims.get("schoolId"))
                .role(Role.fromString((String) claims.get("role")))
                .email((String) claims.get("email"))
                .issuedAt(claims.getIssuedAt().getTime())
                .expiresAt(claims.getExpiration().getTime())
                .build();
    }
}
