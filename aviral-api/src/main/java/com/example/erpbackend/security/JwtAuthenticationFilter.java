package com.example.erpbackend.security;

import com.example.erpbackend.dto.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    private final JwtTokenProvider jwtTokenProvider;
    
    public JwtAuthenticationFilter(JwtTokenProvider jwtTokenProvider) {
        this.jwtTokenProvider = jwtTokenProvider;
    }
    
    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        
        try {
            // JWT authentication disabled for local development.
            // This filter is retained so it can be re-enabled later.
            filterChain.doFilter(request, response);
            return;
        } catch (Exception e) {
            log.error("JWT authentication filter error: {}", e.getMessage());
            sendUnauthorizedError(response, "Authentication error");
        }
    }
    
    /**
     * Check if endpoint is public (doesn't require authentication)
     */
    private boolean isPublicEndpoint(String requestPath) {
        // In development mode without credentials, allow all endpoints
        String devMode = System.getenv("DEVELOPMENT_MODE");
        log.debug("JWT FILTER CHECK - Path: {}, DEVELOPMENT_MODE: {}", requestPath, devMode);
        
        if ("true".equalsIgnoreCase(devMode)) {
            log.warn("*** DEVELOPMENT MODE ACTIVE - ALLOWING ALL ENDPOINTS ***");
            return true;
        }
        
        String[] publicPaths = {
            "/api/auth/login",
            "/api/auth/refresh",
            "/api/auth/validate",
            "/api/health",
            "/swagger-ui",
            "/v3/api-docs"
        };
        
        for (String path : publicPaths) {
            if (requestPath.startsWith(path)) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Extract JWT token from Authorization header
     */
    private String extractTokenFromRequest(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }
    
    /**
     * Send 401 Unauthorized response
     */
    private void sendUnauthorizedError(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        
        ApiResponse<?> errorResponse = ApiResponse.error("UNAUTHORIZED", message);
        ObjectMapper mapper = new ObjectMapper();
        response.getWriter().write(mapper.writeValueAsString(errorResponse));
    }
}
