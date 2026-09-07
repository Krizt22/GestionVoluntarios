-- ESQUEMA DE BASE DE DATOS (MySQL)

CREATE DATABASE IF NOT EXISTS volunteer_management;

-- 1. roles
CREATE TABLE volunteer_management.roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- 2. users
CREATE TABLE volunteer_management.users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_users_roles FOREIGN KEY (role_id) REFERENCES volunteer_management.roles(id)
);

-- 3. volunteer_profiles
CREATE TABLE volunteer_management.volunteer_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    phone VARCHAR(20),
    skills TEXT,
    interest_areas TEXT,
    availability VARCHAR(100),
    CONSTRAINT FK_volunteer_profiles_users FOREIGN KEY (user_id) REFERENCES volunteer_management.users(id)
);

-- 4. campaigns
CREATE TABLE volunteer_management.campaigns (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    objective TEXT,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_by INT NOT NULL,
    CONSTRAINT FK_campaigns_users FOREIGN KEY (created_by) REFERENCES volunteer_management.users(id),
    CONSTRAINT CHK_campaigns_dates CHECK (end_date >= start_date)
);

-- 5. activities
CREATE TABLE volunteer_management.activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    campaign_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    location VARCHAR(200),
    date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    max_slots INT NOT NULL,
    CONSTRAINT FK_activities_campaigns FOREIGN KEY (campaign_id) REFERENCES volunteer_management.campaigns(id),
    CONSTRAINT CHK_activities_max_slots CHECK (max_slots > 0)
);

-- 6. registrations
CREATE TABLE volunteer_management.registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    activity_id INT NOT NULL,
    volunteer_id INT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    requested_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_registrations_activities FOREIGN KEY (activity_id) REFERENCES volunteer_management.activities(id),
    CONSTRAINT FK_registrations_users FOREIGN KEY (volunteer_id) REFERENCES volunteer_management.users(id),
    CONSTRAINT UQ_registrations_activity_volunteer UNIQUE (activity_id, volunteer_id)
);

-- 7. activity_supervisors
CREATE TABLE volunteer_management.activity_supervisors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    activity_id INT NOT NULL,
    supervisor_id INT NOT NULL,
    CONSTRAINT FK_activity_supervisors_activities FOREIGN KEY (activity_id) REFERENCES volunteer_management.activities(id),
    CONSTRAINT FK_activity_supervisors_users FOREIGN KEY (supervisor_id) REFERENCES volunteer_management.users(id),
    CONSTRAINT UQ_activity_supervisors UNIQUE (activity_id, supervisor_id)
);

-- 8. attendance
CREATE TABLE volunteer_management.attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    registration_id INT NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL,
    check_in DATETIME,
    check_out DATETIME,
    hours_calculated DECIMAL(5,2),
    CONSTRAINT FK_attendance_registrations FOREIGN KEY (registration_id) REFERENCES volunteer_management.registrations(id)
);

-- Datos iniciales: roles base
INSERT INTO volunteer_management.roles (name) VALUES
('admin'), ('coordinator'), ('supervisor'), ('volunteer');


-- VISUALIZAR TABLAS Y SUS DEPENDENCIAS (Foreign Keys)


-- 1) Listado simple de todas las tablas creadas
SELECT TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'volunteer_management'
ORDER BY TABLE_NAME;

-- 2) Relaciones (FK) entre tablas: tabla hija -> tabla padre
SELECT
    CONSTRAINT_NAME AS foreign_key_name,
    TABLE_NAME AS tabla_hija,
    COLUMN_NAME AS columna_fk,
    REFERENCED_TABLE_NAME AS tabla_padre,
    REFERENCED_COLUMN_NAME AS columna_referenciada
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'volunteer_management'
  AND REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY tabla_hija;

-- 3) Diagrama de dependencias en formato jerárquico (texto)
SELECT
    REFERENCED_TABLE_NAME AS tabla_padre,
    TABLE_NAME AS tabla_hija,
    COLUMN_NAME AS columna_fk
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'volunteer_management'
  AND REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY tabla_padre, tabla_hija;
