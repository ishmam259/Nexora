-- =============================================================================
-- Nexora PostgreSQL Database Initialization
-- Runs once on first container startup via docker-entrypoint-initdb.d
-- =============================================================================

-- Keycloak database
CREATE DATABASE keycloak_db;

-- Microservice databases
CREATE DATABASE marketplace_db;
CREATE DATABASE payment_db;
CREATE DATABASE notification_db;
CREATE DATABASE food_db;
CREATE DATABASE laundry_db;
CREATE DATABASE printing_db;
CREATE DATABASE medical_db;
CREATE DATABASE chat_db;
CREATE DATABASE lost_found_db;
CREATE DATABASE ai_db;

-- Grant all privileges to the nexora user
GRANT ALL PRIVILEGES ON DATABASE keycloak_db    TO nexora;
GRANT ALL PRIVILEGES ON DATABASE marketplace_db TO nexora;
GRANT ALL PRIVILEGES ON DATABASE payment_db     TO nexora;
GRANT ALL PRIVILEGES ON DATABASE notification_db TO nexora;
GRANT ALL PRIVILEGES ON DATABASE food_db        TO nexora;
GRANT ALL PRIVILEGES ON DATABASE laundry_db     TO nexora;
GRANT ALL PRIVILEGES ON DATABASE printing_db    TO nexora;
GRANT ALL PRIVILEGES ON DATABASE medical_db     TO nexora;
GRANT ALL PRIVILEGES ON DATABASE chat_db        TO nexora;
GRANT ALL PRIVILEGES ON DATABASE lost_found_db  TO nexora;
GRANT ALL PRIVILEGES ON DATABASE ai_db          TO nexora;
