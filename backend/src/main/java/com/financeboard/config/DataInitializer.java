package com.financeboard.config;

import com.financeboard.entity.FinancialRecord;
import com.financeboard.entity.User;
import com.financeboard.enums.Role;
import com.financeboard.enums.TransactionType;
import com.financeboard.repository.FinancialRecordRepository;
import com.financeboard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Random;

@Component
@Profile("dev")
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final FinancialRecordRepository recordRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {
        if (userRepository.count() > 0) {
            log.info("Data already seeded, skipping initialization.");
            return;
        }

        log.info("=== Seeding development data ===");

        // Seed Users
        User admin = userRepository.save(User.builder()
                .name("Admin User")
                .email("admin@finance.com")
                .password(passwordEncoder.encode("Admin@123"))
                .role(Role.ADMIN)
                .build());

        User analyst = userRepository.save(User.builder()
                .name("Analyst User")
                .email("analyst@finance.com")
                .password(passwordEncoder.encode("Analyst@123"))
                .role(Role.ANALYST)
                .build());

        User viewer = userRepository.save(User.builder()
                .name("Viewer User")
                .email("viewer@finance.com")
                .password(passwordEncoder.encode("Viewer@123"))
                .role(Role.VIEWER)
                .build());

        log.info("Seeded 3 users: admin, analyst, viewer");

        // Seed Financial Records
        String[] categories = {"Software", "Hardware", "Marketing", "Consulting", "Payroll", "Office", "Cloud Infrastructure", "Sales"};
        Random rand = new Random(42);
        List<User> users = List.of(admin, analyst, viewer);

        for (int i = 0; i < 20; i++) {
            TransactionType type = i % 3 == 0 ? TransactionType.INCOME : TransactionType.EXPENSE;
            String category = categories[rand.nextInt(categories.length)];
            BigDecimal amount = BigDecimal.valueOf(100 + rand.nextInt(9900)).setScale(2);
            LocalDate date = LocalDate.now().minusDays(rand.nextInt(180));

            recordRepository.save(FinancialRecord.builder()
                    .amount(amount)
                    .type(type)
                    .category(category)
                    .date(date)
                    .notes("Sample " + type.name().toLowerCase() + " for " + category)
                    .createdBy(users.get(rand.nextInt(users.size())))
                    .build());
        }

        log.info("Seeded 20 financial records.");
        log.info("=== Data seeding complete ===");
    }
}
