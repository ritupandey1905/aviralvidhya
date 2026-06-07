package com.example.aviralbackend.security;

public enum Role {
    SUPER_ADMIN("SUPER_ADMIN"),
    SCHOOL_ADMIN("SCHOOL_ADMIN"),
    TEACHER("TEACHER"),
    PARENT("PARENT");
    
    private final String value;
    
    Role(String value) {
        this.value = value;
    }
    
    public String getValue() {
        return value;
    }
    
    public static Role fromString(String value) {
        for (Role role : Role.values()) {
            if (role.value.equalsIgnoreCase(value)) {
                return role;
            }
        }
        throw new IllegalArgumentException("Invalid role: " + value);
    }
}
