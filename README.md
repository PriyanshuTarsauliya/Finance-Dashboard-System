# 💰 Zorvyn Finance Suite

A full-stack finance dashboard featuring a **React** frontend and a production-grade **Spring Boot** REST API backend with JWT authentication, role-based access control, and comprehensive financial analytics.

[🌐 Live Demo](https://finance-dashboard-system.netlify.app/) • [📖 API Docs (Swagger)](#-api-documentation) • [🐛 Found a Bug?](#-contributing)

---

## 🎯 What This Is

Zorvyn Finance Suite is a modern financial dashboard that helps you:
- Track your income and expenses with full CRUD operations
- Visualize spending patterns with interactive charts
- Generate clean financial reports and analytics
- Manage users and roles with secure access control
- Persist all data in a relational database

---

## ✨ Features Implemented

### 👤 User and Role Management
- User registration and authentication with JWT tokens
- Three-tier role system: **ADMIN**, **ANALYST**, **VIEWER**
- Admin panel for creating, updating, and deactivating users
- Secure password hashing with BCrypt

### 💳 Financial Records CRUD
- Create, read, update, and soft-delete financial records
- Support for **INCOME** and **EXPENSE** transaction types
- Categorized entries with optional notes
- Paginated and sortable record listing

### 🔍 Record Filtering
- Filter by **date range** (start/end date)
- Filter by **category**
- Filter by **transaction type** (Income / Expense)
- Full-text **search** across category and notes
- Combine multiple filters simultaneously

### 📊 Dashboard Summary APIs
- **Total Income / Total Expenses / Net Balance** at a glance
- **Category Totals** — breakdown of spending & income by category
- **Monthly Trends** — income vs. expense over 12 months
- **Weekly Trends** — granular weekly breakdown
- **Recent Activity** — last 10 transactions

### 🔐 Role-Based Access Control

| Endpoint Group      | ADMIN | ANALYST | VIEWER |
|---------------------|:-----:|:-------:|:------:|
| Auth (Login/Register) | ✅    | ✅      | ✅     |
| Users CRUD          | ✅    | ❌      | ❌     |
| Records Read        | ✅    | ✅      | ❌     |
| Records Write       | ✅    | ❌      | ❌     |
| Dashboard Summary   | ✅    | ✅      | ✅     |
| Dashboard Analytics | ✅    | ✅      | ❌     |
| Dashboard Recent    | ✅    | ✅      | ✅     |

Enforced at the method level using Spring Security `@PreAuthorize` annotations. Inactive users are blocked from authenticating entirely.

### ✅ Input Validation and Error Handling
- Jakarta Bean Validation on all request DTOs
- Centralized error handling via `@RestControllerAdvice`
- Consistent JSON error responses with status, message, and timestamp
- Proper HTTP status codes (400, 401, 403, 404, 409, 500)

### 🗄️ Data Persistence
- **H2 In-Memory** database for development (zero-setup)
- **PostgreSQL** support for production
- JPA/Hibernate ORM with automatic schema generation
- Soft-delete pattern for financial records (audit trail preserved)
- Indexed columns for optimized query performance

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React + Vite | UI framework & build tool |
| CSS3 | Modern styling with animations |
| Chart.js | Interactive financial charts |

### Backend
| Technology | Purpose |
|------------|---------|
| Spring Boot 3.2 | Application framework |
| Java 17 | Language |
| Spring Security + JWT | Authentication & authorization |
| Spring Data JPA + Hibernate | ORM & data access |
| H2 / PostgreSQL | Database (dev / prod) |
| MapStruct | Entity ↔ DTO mapping |
| Lombok | Boilerplate reduction |
| Springdoc OpenAPI | Swagger API documentation |
| JUnit 5 + Mockito | Testing |
| Maven | Build & dependency management |

---

## 🚀 Getting Started

### Prerequisites
- **Java 17+** (for backend)
- **Maven 3.9+** (or use the included `mvnw` wrapper)
- **Node.js 18+** (for frontend)

### Quick Start
```bash
# Clone the repo
git clone https://github.com/PriyanshuTarsauliya/Finance-Dashboard-System.git
cd Finance-Dashboard-System

# Start the Spring Boot backend
cd backend
./mvnw spring-boot:run
# Backend runs on http://localhost:8080

# In a new terminal — start the frontend
cd ..
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

### 🔑 Test Users (Dev Profile)

| Email                  | Password    | Role    |
|------------------------|-------------|---------|
| admin@finance.com      | Admin@123   | ADMIN   |
| analyst@finance.com    | Analyst@123 | ANALYST |
| viewer@finance.com     | Viewer@123  | VIEWER  |

Data is seeded automatically with 3 users and 20 financial records.

---

## 📖 API Documentation

Once the backend is running, explore the full API via Swagger UI:

🔗 **[http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)**

### Key Endpoints

| Group | Path | Description |
|-------|------|-------------|
| Auth | `POST /api/auth/login` | Login, returns JWT |
| Auth | `POST /api/auth/register` | Register new user |
| Auth | `POST /api/auth/refresh` | Refresh access token |
| Users | `GET/POST/PUT/DELETE /api/users` | User management (Admin only) |
| Records | `GET/POST/PUT/DELETE /api/records` | Financial record CRUD |
| Dashboard | `GET /api/dashboard/summary` | Income, expenses, net balance |
| Dashboard | `GET /api/dashboard/category-totals` | Breakdown by category |
| Dashboard | `GET /api/dashboard/monthly-trends` | Monthly income vs. expense |
| Dashboard | `GET /api/dashboard/weekly-trends` | Weekly breakdown |
| Dashboard | `GET /api/dashboard/recent` | Last 10 transactions |
| System | `GET /api/health` | Health check |

> 📄 For detailed request/response examples, see [backend/README.md](./backend/README.md)

---

## 🏗️ Project Structure

```
Finance-Dashboard-System/
├── backend/                          # Spring Boot API
│   └── src/main/java/com/financeboard/
│       ├── config/                   # Security, Swagger, DataInitializer
│       ├── controller/               # REST controllers
│       ├── dto/                      # Request/Response DTOs
│       ├── entity/                   # JPA entities
│       ├── enums/                    # Role, Status, TransactionType
│       ├── exception/                # Custom exceptions + GlobalHandler
│       ├── mapper/                   # MapStruct mappers
│       ├── repository/               # Spring Data JPA repositories
│       ├── security/                 # JWT filter, util, UserDetailsService
│       └── service/                  # Business logic layer
├── src/                              # React frontend
│   ├── components/                   # Reusable UI components
│   └── pages/                        # Dashboard, Transactions, Reports, Settings
├── public/                           # Static assets
└── index.html                        # App entry point
```

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
./mvnw test
```

| Test Class             | Coverage |
|------------------------|----------|
| `AuthServiceTest`      | Register, login, duplicate email, role defaults |
| `RecordServiceTest`    | CRUD, pagination, filtering, soft delete |
| `DashboardServiceTest` | Summary, category totals, trends, recent |
| `UserServiceTest`      | CRUD, pagination, toggle status, 404 cases |
| `AuthIntegrationTest`  | End-to-end auth flow, role-based access, 401/403 |

---

## ⚖️ Technical Decisions and Trade-offs

### Decisions Made

| Decision | Rationale |
|----------|-----------|
| **JWT over session-based auth** | Stateless design fits SPA frontends; no server-side session storage needed; scales horizontally without sticky sessions |
| **H2 for dev, PostgreSQL for prod** | H2 provides zero-setup local development with auto-seeded data; PostgreSQL for production reliability and performance |
| **Soft-delete for financial records** | Financial data should never be physically destroyed — preserves audit trail and enables recovery; implemented via `@SQLRestriction("deleted_at IS NULL")` |
| **DTO pattern (never expose entities)** | Decouples API contract from database schema; allows independent evolution; prevents accidental data leakage (e.g., password hashes) |
| **MapStruct for mapping** | Compile-time type-safe mapping eliminates runtime reflection overhead and catches mapping errors at build time |
| **Constructor injection via Lombok** | `@RequiredArgsConstructor` ensures immutable dependencies, makes testing easier, and avoids field injection anti-pattern |
| **Method-level security (`@PreAuthorize`)** | Declarative, readable access control co-located with endpoint definitions; easier to audit than URL-based security rules |
| **Field-level encryption on notes** | Sensitive financial notes encrypted at rest via `EncryptedStringConverter`; transparent to application code |
| **Centralized exception handling** | `@RestControllerAdvice` ensures consistent error JSON format across all endpoints; no duplicated try-catch blocks |
| **Page size capped at 50** | Prevents clients from requesting excessively large result sets that could degrade performance |

### Trade-offs Accepted

| Trade-off | Impact | Mitigation Path |
|-----------|--------|-----------------|
| **No email verification** | Users can register with any email without confirmation | Add SMTP integration with verification tokens |
| **No rate limiting** | API endpoints are vulnerable to brute-force/abuse | Integrate Bucket4j or Spring Cloud Gateway rate limiting |
| **Stateless refresh tokens** | Cannot revoke individual refresh tokens server-side | Add database-backed token revocation list |
| **No file upload support** | Cannot attach receipts or documents to records | Integrate cloud storage (S3/GCS) with pre-signed URLs |
| **No audit logging** | Mutations aren't tracked beyond `created_at`/`updated_at` | Add an audit trail table with before/after snapshots |
| **Single-tenant architecture** | All users share the same data space | Add tenant isolation via schema-per-tenant or row-level security |
| **Hard-delete for users** | User deletion is permanent (unlike records) | Switch to soft-delete with cascading deactivation of related records |
| **CORS limited to localhost** | Only `localhost:5173` and `localhost:3000` are allowed origins | Configure via environment variables for deployment |

---

## 🎨 Design Philosophy
- **Clear** — No confusing jargon or clutter
- **Fast** — Optimized frontend with smooth 60fps animations
- **Secure** — JWT auth, RBAC, input validation, encrypted storage
- **Simple** — Intuitive interface that works without a manual

---

## 📱 Works Everywhere
- **Desktop** — Chrome, Firefox, Safari, Edge
- **Mobile** — iOS Safari, Android Chrome
- **Tablet** — iPad, Android tablets

---

## 🐛 Contributing
Found a bug? Have an idea? Contributions are welcome!
1. Fork the repo
2. Make your changes
3. Keep it clean and well-tested
4. Submit a pull request

---

## 📄 License
MIT License — feel free to use this for your own projects, personal or commercial.

---

[🌐 Try It Live](https://finance-dashboard-system.netlify.app/) • [⭐ Star on GitHub](https://github.com/PriyanshuTarsauliya/Finance-Dashboard-System) • [📬 Get in Touch](#)

*Built with ❤️ by Priyanshu Tarsauliya*
