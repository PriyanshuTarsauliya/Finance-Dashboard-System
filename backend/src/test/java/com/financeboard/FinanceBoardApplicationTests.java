package com.financeboard;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("dev")
class FinanceBoardApplicationTests {

    @Test
    void contextLoads() {
        // Verifies the entire Spring context (security, JPA, services) wires up correctly
    }
}
