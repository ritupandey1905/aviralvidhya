package com.example.aviralbackend.security;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Slf4j
@Component
public class DatabaseSeeder implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DatabaseSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        try {
            if (!userRepository.hasAnyUsers()) {
                log.info("No users found in Firestore. Creating an initial super admin...");

                String tempPassword = UUID.randomUUID().toString().substring(0, 12);
                String hashed = passwordEncoder.encode(tempPassword);

                UserEntity admin = UserEntity.builder()
                        .username("admin")
                        .passwordHash(hashed)
                        .schoolId("system")
                        .role(Role.SUPER_ADMIN)
                        .email("admin@system.local")
                        .active(true)
                        .build();

                userRepository.save(admin);

                log.info("======================================================");
                log.info("INITIAL ADMIN USER CREATED");
                log.info("Username: admin");
                log.info("School ID: system");
                log.info("Password: {}", tempPassword);
                log.info("PLEASE SAVE THIS PASSWORD AND CHANGE IT IMMEDIATELY.");
                log.info("======================================================");
            } else {
                log.info("Users exist in Firestore. Skipping initial admin seed.");
            }
        } catch (Exception e) {
            log.warn("Database seeder skipped or failed (likely running without Firestore access during build): {}", e.getMessage());
        }
    }
}
