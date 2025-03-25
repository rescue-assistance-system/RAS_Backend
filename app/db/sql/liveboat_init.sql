

/* ======================================= xxxx =======================================*/
/* ======================================= user =======================================*/

-- CREATE TYPE user_status AS ENUM ('ACTIVE', 'SUSPENDED', 'BANNED');
DROP TABLE IF EXISTS "user" CASCADE;

CREATE TABLE "user" (
    id BIGSERIAL PRIMARY KEY,
    phone VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(100) UNIQUE,
    password TEXT NOT NULL,
    status SMALLINT DEFAULT 1,
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    avatar_url VARCHAR(512)
);
-- Optimized Indexes
CREATE UNIQUE INDEX idx_user_email ON "user" (LOWER(email)); -- Case-insensitive email uniqueness
CREATE UNIQUE INDEX idx_user_phone ON "user" (phone);

/* ======================================= user_profile =======================================*/

DROP TABLE IF EXISTS "user_profile" CASCADE;

CREATE TABLE "user_profile" (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES "user"("id") ON DELETE CASCADE,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    address VARCHAR(255),
    gender VARCHAR(6) CHECK (gender IN ('Male', 'Female', 'Other')),
    birthday DATE,
    blood_type VARCHAR(3) CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-')),
    height SMALLINT,
    weight SMALLINT,
    other_condition JSONB
);

-- Create index on user_id
CREATE UNIQUE INDEX idx_user_profile_user_id ON "user_profile"("user_id");

/* ======================================= user_role =======================================*/

-- Drop table if it already exists
DROP TABLE IF EXISTS "user_role" CASCADE;

-- Create user_role table
CREATE TABLE "user_role" (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    duty SMALLINT NOT NULL CHECK (duty BETWEEN 1 AND 10),
    permissions JSONB DEFAULT '{}'::JSONB
);

-- Create index on user_id for faster lookups
CREATE UNIQUE INDEX idx_user_role_user_id ON "user_role"("user_id");

/* ======================================= user_setting =======================================*/

-- Drop the table if it exists (with CASCADE to remove dependencies)
DROP TABLE IF EXISTS "user_setting" CASCADE;

-- Create the user_setting table
CREATE TABLE "user_setting" (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES "user"("id") ON DELETE CASCADE,
    hide_user_profile BOOLEAN DEFAULT TRUE,
    extra_setting JSONB
);

-- Create an index on user_id for faster lookups
CREATE UNIQUE INDEX idx_user_setting_user_id ON "user_setting"("user_id");

/* ======================================= xxxx =======================================*/