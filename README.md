# Nexora Architecture & Topological Sorting

## 1. System Structure

### React Native Frontend
```text
src
├── assets
├── components
├── screens
│   ├── Marketplace
│   ├── Food
│   ├── Laundry
│   ├── Printing
│   ├── Medical
│   ├── Chat
│   ├── LostFound
│   ├── Profile
├── navigation
├── hooks
├── services
│   └── keycloak
│       ├── auth.ts
│       ├── token.ts
│       └── config.ts
├── api
│   └── axiosInstance.ts
├── redux
├── context
├── constants
├── utils
├── theme
└── App.tsx
```

### Spring Boot Backend Microservices
```text
nexora-backend (backend)
├── api-gateway          # JWT Validation, Routing, Rate Limiting, Request Filtering
├── keycloak             # User Authentication, OIDC Provider, Role Management, Token Issuing
│   └── Roles
│       ├── STUDENT
│       ├── ADMIN
│       ├── MERCHANT
│       ├── RESTAURANT_OWNER
│       └── DELIVERY_AGENT
├── marketplace-service  # Product, Category, Review, Order (DB: marketplace_db)
├── food-service         # Restaurant, Menu, FoodOrder (DB: food_db)
├── laundry-service      # LaundryOrder, Slot (DB: laundry_db)
├── print-service        # PrintOrder (DB: printing_db)
├── medical-service      # Medicine, Appointment (DB: medical_db)
├── chat-service         # Conversation, Message (DB: chat_db)
├── lost-found-service   # LostItem, FoundItem (DB: lost_found_db)
├── notification-service # Dispatches push, SMS, email notifications (DB: notification_db)
├── payment-service      # Handles checkouts and payment processing (DB: payment_db)
├── ai-service           # AI History, Recommendations, User Preferences (DB: ai_db)
├── common-library       # Security Utilities, DTOs, Exception Handling, Constants
└── docker-compose.yml
```

---

## 2. Microservice Dependency Analysis

*   **`common-library`**: Core compile-time dependency. Contains cross-cutting security utilities, exception mappers, shared constants, and data transfer objects. All microservices inherit this package.
*   **`keycloak`**: Core identity service. Required by all business microservices and the `api-gateway` to perform user token issuance and role-based validations.
*   **`payment-service`**: Standalone transaction utility. Queried or triggered by services requiring checkout flows (`marketplace`, `food`, `laundry`, `print`).
*   **`notification-service`**: Standalone event dispatcher. Relied upon by business and chat services to push alerts to client devices.
*   **`ai-service`**: Aggregator recommendation service. Serves recommendations to customer interfaces, building profile profiles off data streams.
*   **Business Microservices**: Contain domain boundaries (`marketplace`, `food`, `laundry`, etc.) consuming foundational and utility services.
*   **`api-gateway`**: Entry facade routing external client traffic to target microservices.

---

## 3. Topological Sorting (Build & Deployment Order)

The topological sort sequence represents the order from least dependent (core services) to most dependent (gateway and aggregators):

$$\text{common-library} \rightarrow \text{keycloak} \rightarrow \text{payment-service} \rightarrow \text{notification-service} \rightarrow \text{ai-service} \rightarrow \text{[Business Services]} \rightarrow \text{api-gateway}$$

### Linear Deployment Checklist
1.  **`common-library`** (Must be built first for others to resolve symbols)
2.  **`keycloak`** (Auth server must be up for resource validation)
3.  **`payment-service`** / **`notification-service`** / **`ai-service`** (Utility layer)
4.  **`marketplace-service`** / **`food-service`** / **`laundry-service`** / **`print-service`** / **`medical-service`** / **`chat-service`** / **`lost-found-service`** (Business layer)
5.  **`api-gateway`** (Edge router)

---

## 4. Running with Docker

### Infrastructure only (local dev)

Starts Postgres, Keycloak, and RabbitMQ. Run microservices and the frontend on the host with Maven and npm.

```bash
docker compose up -d
```

### Full stack (everything containerized)

Builds and runs all 11 microservices, the API gateway, and the frontend web app.

```bash
docker compose -f docker-compose.full.yml up --build -d
```

| Service | URL |
|---|---|
| Frontend (web) | http://localhost:3000 |
| API Gateway | http://localhost:8080 |
| Keycloak | http://localhost:8081 |
| RabbitMQ UI | http://localhost:15672 (guest/guest) |

Optional: copy `.env.example` to `.env` and set `GROQ_API_KEY` for AI features.

Stop the full stack:

```bash
docker compose -f docker-compose.full.yml down
```

### Environment variables

Backend services read these (defaults preserve local-dev behaviour):

| Variable | Purpose |
|---|---|
| `SPRING_DATASOURCE_URL` | PostgreSQL JDBC URL |
| `KEYCLOAK_ISSUER_URI` | JWT issuer (browser-facing, e.g. `http://localhost:8081/realms/nexora`) |
| `KEYCLOAK_JWK_SET_URI` | JWKS endpoint (Docker-internal: `http://keycloak:8080/...`) |
| `NEXORA_SERVICE_*_URI` | Gateway downstream service URLs |
| `RABBITMQ_HOST` | RabbitMQ hostname |

Frontend build args (baked in at image build time):

| Variable | Default |
|---|---|
| `EXPO_PUBLIC_GATEWAY_URL` | `http://localhost:8080` |
| `EXPO_PUBLIC_KEYCLOAK_URL` | `http://localhost:8081` |
