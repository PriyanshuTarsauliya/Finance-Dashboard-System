# FinanceBoard API

A production-grade REST API backend for a Finance Dashboard built with **Spring Boot 3.2**, featuring JWT authentication, role-based access control, and comprehensive financial analytics.

## Tech Stack

| Layer           | Technology                          |
|-----------------|-------------------------------------|
| Framework       | Spring Boot 3.2.5                   |
| Language        | Java 17                             |
| Build           | Maven                               |
| Security        | Spring Security + JWT (jjwt 0.12)   |
| ORM             | Spring Data JPA + Hibernate         |
| Database (Dev)  | H2 In-Memory                        |
| Database (Prod) | PostgreSQL                          |
| Validation      | Jakarta Bean Validation             |
| Docs            | Springdoc OpenAPI (Swagger UI)      |
| Mapping         | MapStruct 1.5                       |
| Utilities       | Lombok                              |
| Testing         | JUnit 5 + Mockito + MockMvc         |

---

## Setup Instructions

### Prerequisites
- Java 17+
- Maven 3.9+ (or use the included `mvnw` wrapper)

### Run Locally (Dev Profile — H2)
```bash
cd backend
./mvnw spring-boot:run
```
The application starts on `http://localhost:8080` with an H2 in-memory database.
Data is seeded automatically with 3 users and 20 financial records.

### Run Tests
```bash
cd backend
./mvnw test
```
This runs all unit tests (AuthService, RecordService, DashboardService, UserService) and integration tests (AuthIntegrationTest).

### Swagger UI
Open: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

### H2 Console (Dev Only)
Open: [http://localhost:8080/h2-console](http://localhost:8080/h2-console)
- JDBC URL: `jdbc:h2:mem:financeboard`
- Username: `sa`, Password: *(empty)*

### Run with PostgreSQL (Prod Profile)
```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=prod
```

### Environment Variables

| Variable                       | Default                         | Description                      |
|--------------------------------|---------------------------------|----------------------------------|
| `spring.profiles.active`       | `dev`                           | Active profile (dev/prod)        |
| `app.jwt.secret`               | *(base64 key in props)*         | HMAC-SHA256 key for JWT signing  |
| `app.jwt.expiration-ms`        | `86400000` (24h)                | Access token TTL in milliseconds |
| `app.jwt.refresh-expiration-ms`| `604800000` (7d)                | Refresh token TTL                |
| `DB_HOST`                      | `localhost`                     | PostgreSQL host (prod only)      |
| `DB_PORT`                      | `5432`                          | PostgreSQL port (prod only)      |
| `DB_NAME`                      | `financeboard`                  | PostgreSQL database (prod only)  |
| `DB_USERNAME`                  | `postgres`                      | PostgreSQL user (prod only)      |
| `DB_PASSWORD`                  | `postgres`                      | PostgreSQL password (prod only)  |

---

## Seeded Test Users (Dev Profile)

| Email                  | Password    | Role    |
|------------------------|-------------|---------|
| admin@finance.com      | Admin@123   | ADMIN   |
| analyst@finance.com    | Analyst@123 | ANALYST |
| viewer@finance.com     | Viewer@123  | VIEWER  |

---

## API Endpoints

### Auth (`/api/auth`) — Public

| Method | Path                 | Description               |
|--------|----------------------|---------------------------|
| POST   | `/api/auth/register` | Register new user         |
| POST   | `/api/auth/login`    | Login, returns JWT        |
| POST   | `/api/auth/refresh`  | Refresh JWT access token  |

**Sample Login Request:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@finance.com",
  "password": "Admin@123"
}
```

**Response (200 OK):**
```json
{
  "accessToken": "eyJhbGci...",
  "refreshToken": "eyJhbGci...",
  "tokenType": "Bearer",
  "expiresIn": 86400000,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Admin User",
    "email": "admin@finance.com",
    "role": "ADMIN",
    "status": "ACTIVE",
    "createdAt": "2026-04-04T10:30:00",
    "updatedAt": "2026-04-04T10:30:00"
  }
}
```

**Sample Register Request:**
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "New User",
  "email": "newuser@finance.com",
  "password": "Password@123",
  "role": "VIEWER"
}
```

**Response (201 Created):** Same format as login response.

---

### Users (`/api/users`) — Admin Only

| Method | Path                     | Description                |
|--------|--------------------------|----------------------------|
| GET    | `/api/users`             | List users (paginated)     |
| GET    | `/api/users/{id}`        | Get user by ID             |
| POST   | `/api/users`             | Create user                |
| PUT    | `/api/users/{id}`        | Update user name/email/role|
| PATCH  | `/api/users/{id}/status` | Toggle active/inactive     |
| DELETE | `/api/users/{id}`        | Delete user                |

**Sample Create User Request:**
```http
POST /api/users
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@finance.com",
  "password": "Secure@123",
  "role": "ANALYST",
  "status": "ACTIVE"
}
```

**Response (201 Created):**
```json
{
  "id": "uuid",
  "name": "Jane Doe",
  "email": "jane@finance.com",
  "role": "ANALYST",
  "status": "ACTIVE",
  "createdAt": "2026-04-04T11:00:00",
  "updatedAt": "2026-04-04T11:00:00"
}
```

**Paginated List Response:**
```json
{
  "content": [ ... ],
  "page": 0,
  "size": 10,
  "totalElements": 3,
  "totalPages": 1,
  "last": true
}
```

---

### Financial Records (`/api/records`)

| Method | Path               | Role Required | Description              |
|--------|--------------------|---------------|--------------------------|
| GET    | `/api/records`     | ADMIN, ANALYST| List records (filtered)  |
| GET    | `/api/records/{id}`| ADMIN, ANALYST| Get single record        |
| POST   | `/api/records`     | ADMIN         | Create record            |
| PUT    | `/api/records/{id}`| ADMIN         | Update record            |
| DELETE | `/api/records/{id}`| ADMIN         | Soft-delete record       |

**Query Parameters for `GET /api/records`:**
| Parameter   | Type   | Description                     |
|-------------|--------|---------------------------------|
| `type`      | enum   | `INCOME` or `EXPENSE`           |
| `category`  | string | Filter by category name         |
| `startDate` | date   | `yyyy-MM-dd` — from date        |
| `endDate`   | date   | `yyyy-MM-dd` — to date          |
| `search`    | string | Search in category and notes    |
| `page`      | int    | Page number (default: 0)        |
| `size`      | int    | Page size (default: 10, max: 50)|
| `sortBy`    | string | Sort field (default: `date`)    |
| `sortDir`   | string | `asc` or `desc` (default: `desc`)|

**Sample Create Record Request:**
```http
POST /api/records
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json

{
  "amount": 5000.00,
  "type": "INCOME",
  "category": "Sales",
  "date": "2026-04-01",
  "notes": "Q2 sales revenue"
}
```

**Response (201 Created):**
```json
{
  "id": "uuid",
  "amount": 5000.00,
  "type": "INCOME",
  "category": "Sales",
  "date": "2026-04-01",
  "notes": "Q2 sales revenue",
  "createdById": "user-uuid",
  "createdByName": "Admin User",
  "createdAt": "2026-04-04T11:30:00",
  "updatedAt": "2026-04-04T11:30:00"
}
```

---

### Dashboard (`/api/dashboard`)

| Method | Path                             | Role Required     | Description                    |
|--------|----------------------------------|-------------------|--------------------------------|
| GET    | `/api/dashboard/summary`         | ALL               | Income, expenses, net balance  |
| GET    | `/api/dashboard/category-totals` | ADMIN, ANALYST    | Breakdown by category          |
| GET    | `/api/dashboard/monthly-trends`  | ADMIN, ANALYST    | Monthly income vs expense      |
| GET    | `/api/dashboard/weekly-trends`   | ADMIN, ANALYST    | Weekly breakdown               |
| GET    | `/api/dashboard/recent`          | ALL               | Last 10 transactions           |

**Sample `/api/dashboard/summary` Response:**
```json
{
  "totalIncome": 75000.00,
  "totalExpenses": 42000.00,
  "netBalance": 33000.00,
  "totalRecords": 20
}
```

**Sample `/api/dashboard/category-totals` Response:**
```json
[
  { "category": "Payroll", "type": "EXPENSE", "total": 18000.00 },
  { "category": "Sales", "type": "INCOME", "total": 15000.00 }
]
```

**Sample `/api/dashboard/monthly-trends` Response:**
Returns all 12 months, filling missing months with zeros:
```json
[
  { "period": 1, "income": 8000.00, "expense": 5000.00 },
  { "period": 2, "income": 0, "expense": 0 },
  ...
  { "period": 12, "income": 0, "expense": 0 }
]
```

**Sample `/api/dashboard/recent` Response:**
```json
[
  {
    "id": "uuid",
    "amount": 1500.00,
    "type": "EXPENSE",
    "category": "Office",
    "date": "2026-04-03",
    "notes": "Office supplies",
    "createdById": "user-uuid",
    "createdByName": "Admin User",
    "createdAt": "2026-04-03T14:30:00",
    "updatedAt": "2026-04-03T14:30:00"
  }
]
```

---

### System

| Method | Path          | Auth     | Description      |
|--------|---------------|----------|------------------|
| GET    | `/api/health` | Public   | Health check     |

---

## Access Control Matrix

| Endpoint Group      | ADMIN | ANALYST | VIEWER |
|---------------------|-------|---------|--------|
| Auth                | ✅    | ✅      | ✅     |
| Users CRUD          | ✅    | ❌      | ❌     |
| Records Read        | ✅    | ✅      | ❌     |
| Records Write       | ✅    | ❌      | ❌     |
| Dashboard Summary   | ✅    | ✅      | ✅     |
| Dashboard Analytics | ✅    | ✅      | ❌     |
| Dashboard Recent    | ✅    | ✅      | ✅     |

> **Role definitions:**
> - **VIEWER** — Can only view the dashboard summary and recent activity
> - **ANALYST** — Can view financial records and all dashboard analytics
> - **ADMIN** — Full management access: create, update, delete records and manage users

Access control is enforced at the method level using Spring Security's `@PreAuthorize` annotations.
Inactive users (status = `INACTIVE`) are blocked from authenticating entirely.

---

## Error Response Format

All errors follow a consistent JSON structure:
```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "amount: Amount must be positive; category: Category is required",
  "timestamp": "2026-04-04T10:00:00"
}
```

### HTTP Status Codes Used

| Code | Meaning              | When                              |
|------|----------------------|-----------------------------------|
| 200  | OK                   | Successful GET/PUT/PATCH          |
| 201  | Created              | Successful POST                   |
| 204  | No Content           | Successful DELETE                 |
| 400  | Bad Request          | Validation errors / invalid input |
| 401  | Unauthorized         | Missing, expired, or invalid JWT  |
| 403  | Forbidden            | Insufficient role permissions     |
| 404  | Not Found            | Resource does not exist           |
| 409  | Conflict             | Duplicate email                   |
| 500  | Internal Server Error| Unhandled exceptions              |

---

## Database Schema

### `users` Table
| Column       | Type         | Constraints                    |
|--------------|--------------|--------------------------------|
| `id`         | UUID         | PK, auto-generated             |
| `name`       | VARCHAR(50)  | NOT NULL                       |
| `email`      | VARCHAR(255) | NOT NULL, UNIQUE, INDEXED      |
| `password`   | VARCHAR(255) | NOT NULL (BCrypt hashed)       |
| `role`       | VARCHAR      | NOT NULL (ADMIN/ANALYST/VIEWER)|
| `status`     | VARCHAR      | NOT NULL, default ACTIVE       |
| `created_at` | TIMESTAMP    | Auto-set on creation           |
| `updated_at` | TIMESTAMP    | Auto-set on update             |

**Indexes:** `email` (unique), `role`, `status`

### `financial_records` Table
| Column       | Type           | Constraints                         |
|--------------|----------------|-------------------------------------|
| `id`         | UUID           | PK, auto-generated                  |
| `amount`     | DECIMAL(15,2)  | NOT NULL                            |
| `type`       | VARCHAR        | NOT NULL (INCOME/EXPENSE)           |
| `category`   | VARCHAR(50)    | NOT NULL                            |
| `date`       | DATE           | NOT NULL                            |
| `notes`      | VARCHAR(255)   | Optional                            |
| `created_by` | UUID           | FK → users.id, NOT NULL             |
| `created_at` | TIMESTAMP      | Auto-set on creation                |
| `updated_at` | TIMESTAMP      | Auto-set on update                  |
| `deleted_at` | TIMESTAMP      | NULL = active, NOT NULL = soft-deleted |

**Indexes:** `type`, `category`, `date`, `created_by`, `deleted_at`

**Soft Delete:** Records are never physically deleted. A `DELETE` request sets `deleted_at` to the current timestamp. A Hibernate `@SQLRestriction("deleted_at IS NULL")` filter transparently hides soft-deleted records from all queries.

---

## Architecture & Design Decisions

```
src/main/java/com/financeboard/
├── config/          ← Security, Swagger, DataInitializer
├── controller/      ← REST controllers (thin — delegate to services)
├── dto/             ← Request/Response DTOs (no entity exposure)
├── entity/          ← JPA entities
├── enums/           ← Role, Status, TransactionType
├── exception/       ← Custom exceptions + GlobalExceptionHandler
├── mapper/          ← MapStruct entity↔DTO mappers
├── repository/      ← Spring Data JPA repositories
├── security/        ← JWT filter, util, UserDetailsService, EntryPoint
└── service/         ← Business logic layer
```

### Key Design Patterns
- **Layered architecture:** Controller → Service → Repository, with strict separation of concerns
- **DTO pattern:** Entities are never exposed to the API; input validation is on DTOs
- **MapStruct:** Type-safe compile-time mapping between entities and DTOs
- **Constructor injection:** Via Lombok `@RequiredArgsConstructor` (no field injection)
- **Centralized error handling:** `@RestControllerAdvice` with `GlobalExceptionHandler`
- **Method-level security:** `@PreAuthorize` annotations for declarative role checks

---

## Testing

### Unit Tests (Mockito)
| Test Class            | Coverage                                  |
|-----------------------|-------------------------------------------|
| `AuthServiceTest`     | Register, login, duplicate email, defaults |
| `RecordServiceTest`   | CRUD, pagination, filtering, soft delete   |
| `DashboardServiceTest`| Summary, category totals, trends, recent   |
| `UserServiceTest`     | CRUD, pagination, toggle status, 404 cases |

### Integration Tests (MockMvc + H2)
| Test Class             | Coverage                                      |
|------------------------|-----------------------------------------------|
| `AuthIntegrationTest`  | Login, register, role-based access, 401/403,   |
|                        | dashboard endpoints, health check              |

---

## Assumptions & Tradeoffs

### Assumptions
1. **JWT-based auth:** Chosen over session-based auth for stateless API design, suitable for SPA frontends.
2. **Self-registration:** Any user can register (defaults to VIEWER role). Admins can then promote roles.
3. **Single-tenant:** All users share the same data space. No multi-tenancy isolation.
4. **H2 for dev:** Simplifies local development with zero setup. PostgreSQL for production.
5. **Page size capped at 50:** Prevents clients from requesting excessively large result sets.

### Tradeoffs
1. **No email verification:** Registration is immediate without email confirmation. Could be added with an SMTP integration.
2. **No rate limiting:** API endpoints are not rate-limited. Could be added with Bucket4j or Spring Cloud Gateway.
3. **No file upload:** Receipt/attachment upload is not implemented. Could be added with cloud storage (S3, GCS).
4. **No audit logging:** Changes are not tracked in an audit trail. `created_at`/`updated_at` timestamps provide basic tracking.
5. **In-memory refresh tokens:** Refresh tokens are stateless JWTs. A production system might use a database-backed revocation list.
6. **Soft delete only for records:** Users are hard-deleted. Financial records use soft delete to preserve audit history.

---

## Future Improvements
- Add email verification and password reset flow
- Implement audit logging for all mutations
- Add export to CSV/PDF
- Integrate real OAuth2 (Google, GitHub)
- Add rate limiting (Bucket4j)
- Dockerize with docker-compose
- Add receipt file upload to cloud storage
