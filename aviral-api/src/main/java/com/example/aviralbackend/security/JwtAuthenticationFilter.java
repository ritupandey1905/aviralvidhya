package com.example.aviralbackend.security;

import com.example.aviralbackend.dto.ApiResponse;
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
            if (isPublicEndpoint(request.getRequestURI())) {
                filterChain.doFilter(request, response);
                return;
            }

            String token = extractTokenFromRequest(request);
            if (token != null && jwtTokenProvider.validateToken(token)) {
                UserPrincipal principal = jwtTokenProvider.getUserPrincipalFromToken(token);
                org.springframework.security.authentication.UsernamePasswordAuthenticationToken authentication = 
                        new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                                principal, null, java.util.Collections.singletonList(
                                        new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + principal.getRole().getValue())
                                ));
                authentication.setDetails(new org.springframework.security.web.authentication.WebAuthenticationDetailsSource().buildDetails(request));
                org.springframework.security.core.context.SecurityContextHolder.getContext().setAuthentication(authentication);
            }
            
            filterChain.doFilter(request, response);
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
