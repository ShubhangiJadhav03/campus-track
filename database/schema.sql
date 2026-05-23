-- ============================================================
-- College Online Complaint & Issue Tracking System
-- Database Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS college_complaints;
USE college_complaints;

-- ============================================================
-- ROLES TABLE
-- ============================================================
CREATE TABLE roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- USERS TABLE
-- ============================================================
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role_id BIGINT NOT NULL,
    department VARCHAR(100),
    student_id VARCHAR(50),
    employee_id VARCHAR(50),
    profile_picture VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    reset_token VARCHAR(255),
    reset_token_expiry TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_roles FOREIGN KEY (role_id) REFERENCES roles(id),
    INDEX idx_users_email (email),
    INDEX idx_users_role (role_id)
);

-- ============================================================
-- CATEGORIES TABLE
-- ============================================================
CREATE TABLE categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(500),
    icon VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- COMPLAINTS TABLE
-- ============================================================
CREATE TABLE complaints (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ticket_number VARCHAR(20) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    assigned_to BIGINT,
    status ENUM('SUBMITTED','UNDER_REVIEW','ASSIGNED','IN_PROGRESS','RESOLVED','CLOSED') DEFAULT 'SUBMITTED',
    priority ENUM('LOW','MEDIUM','HIGH','CRITICAL') DEFAULT 'MEDIUM',
    location VARCHAR(255),
    attachment_urls TEXT,
    resolution_notes TEXT,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_complaints_category FOREIGN KEY (category_id) REFERENCES categories(id),
    CONSTRAINT fk_complaints_student FOREIGN KEY (student_id) REFERENCES users(id),
    CONSTRAINT fk_complaints_staff FOREIGN KEY (assigned_to) REFERENCES users(id),
    INDEX idx_complaints_status (status),
    INDEX idx_complaints_student (student_id),
    INDEX idx_complaints_category (category_id),
    INDEX idx_complaints_assigned (assigned_to),
    INDEX idx_complaints_ticket (ticket_number),
    INDEX idx_complaints_created (created_at)
);

-- ============================================================
-- COMPLAINT UPDATES TABLE
-- ============================================================
CREATE TABLE complaint_updates (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    complaint_id BIGINT NOT NULL,
    updated_by BIGINT NOT NULL,
    old_status ENUM('SUBMITTED','UNDER_REVIEW','ASSIGNED','IN_PROGRESS','RESOLVED','CLOSED'),
    new_status ENUM('SUBMITTED','UNDER_REVIEW','ASSIGNED','IN_PROGRESS','RESOLVED','CLOSED'),
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_updates_complaint FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
    CONSTRAINT fk_updates_user FOREIGN KEY (updated_by) REFERENCES users(id),
    INDEX idx_updates_complaint (complaint_id)
);

-- ============================================================
-- NOTIFICATIONS TABLE
-- ============================================================
CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    complaint_id BIGINT,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('INFO','SUCCESS','WARNING','ERROR') DEFAULT 'INFO',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_notifications_complaint FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE SET NULL,
    INDEX idx_notifications_user (user_id),
    INDEX idx_notifications_read (is_read)
);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Roles
INSERT INTO roles (name, description) VALUES
('STUDENT', 'College student who can submit complaints'),
('STAFF', 'Staff member who handles complaints'),
('ADMIN', 'Administrator with full system access');

-- Categories
INSERT INTO categories (name, description, icon) VALUES
('WiFi & Internet', 'Issues related to internet connectivity and WiFi access', 'wifi'),
('Classroom Issues', 'Problems in classrooms including furniture, boards, AC, etc.', 'school'),
('Lab Equipment', 'Complaints about computer labs, science labs, equipment', 'computer'),
('Infrastructure', 'Building damage, leaks, structural issues', 'construction'),
('Hostel Issues', 'Accommodation and hostel related problems', 'hotel'),
('Faculty Concerns', 'Academic and faculty related complaints', 'person'),
('Cleanliness', 'Hygiene and cleanliness related issues', 'cleaning_services'),
('Electrical Issues', 'Power outages, electrical faults, lighting problems', 'bolt'),
('Water & Plumbing', 'Water supply and plumbing related issues', 'water'),
('Sports & Recreation', 'Sports facilities and recreational area issues', 'sports');

-- Admin User (password: Admin@123)
INSERT INTO users (name, email, password, phone, role_id, department, employee_id, is_active) VALUES
('System Admin', 'admin@college.edu', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewGbkIkd1RLfXqOy', '9999999999', 3, 'Administration', 'EMP001', TRUE);

-- Staff Users (password: Staff@123)
INSERT INTO users (name, email, password, phone, role_id, department, employee_id, is_active) VALUES
('Rajesh Kumar', 'rajesh@college.edu', '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWEHFPW', '9876543210', 2, 'IT Department', 'EMP002', TRUE),
('Priya Sharma', 'priya@college.edu', '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWEHFPW', '9876543211', 2, 'Infrastructure', 'EMP003', TRUE),
('Amit Singh', 'amit@college.edu', '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWEHFPW', '9876543212', 2, 'Housekeeping', 'EMP004', TRUE);

-- Student Users (password: Student@123)
INSERT INTO users (name, email, password, phone, role_id, department, student_id, is_active) VALUES
('Aarav Patel', 'aarav@student.college.edu', '$2a$12$TCalv4LBgMBpYGcSQgRetuMvQCZiukfzg3TMMsRVKVRYOUC1nSTPe', '9123456789', 1, 'Computer Science', 'STU2024001', TRUE),
('Sneha Reddy', 'sneha@student.college.edu', '$2a$12$TCalv4LBgMBpYGcSQgRetuMvQCZiukfzg3TMMsRVKVRYOUC1nSTPe', '9123456790', 1, 'Electronics', 'STU2024002', TRUE),
('Vikram Joshi', 'vikram@student.college.edu', '$2a$12$TCalv4LBgMBpYGcSQgRetuMvQCZiukfzg3TMMsRVKVRYOUC1nSTPe', '9123456791', 1, 'Mechanical', 'STU2024003', TRUE);

-- Sample Complaints
INSERT INTO complaints (ticket_number, title, description, category_id, student_id, assigned_to, status, priority, location) VALUES
('TKT-2024-0001', 'WiFi not working in Block A', 'The WiFi in Block A hostel has been down for 3 days. Students are unable to access online resources for studies.', 1, 5, 2, 'IN_PROGRESS', 'HIGH', 'Hostel Block A, Floor 2'),
('TKT-2024-0002', 'Projector broken in Room 301', 'The projector in classroom 301 is not displaying anything. The lamp seems to be burnt out.', 2, 6, NULL, 'SUBMITTED', 'MEDIUM', 'Academic Block, Room 301'),
('TKT-2024-0003', 'Computer Lab PC #15 not starting', 'Computer number 15 in Lab 2 does not start. Students are facing issues during practical sessions.', 3, 7, 3, 'RESOLVED', 'MEDIUM', 'Computer Lab 2'),
('TKT-2024-0004', 'Water leakage in corridor', 'There is a significant water leakage in the main corridor near the library. The floor is slippery and dangerous.', 4, 5, NULL, 'UNDER_REVIEW', 'CRITICAL', 'Main Block, Ground Floor Corridor'),
('TKT-2024-0005', 'Hostel bathroom not clean', 'The bathrooms in Hostel Block B are extremely dirty and have not been cleaned properly for a week.', 7, 6, 4, 'ASSIGNED', 'HIGH', 'Hostel Block B'),
('TKT-2024-0006', 'Electricity fluctuation in Lab 3', 'There are frequent power fluctuations in Lab 3 which is causing computers to restart unexpectedly.', 8, 7, 2, 'CLOSED', 'HIGH', 'Science Block, Lab 3');

-- Complaint Updates
INSERT INTO complaint_updates (complaint_id, updated_by, old_status, new_status, remarks) VALUES
(1, 2, 'SUBMITTED', 'UNDER_REVIEW', 'Complaint received and under investigation'),
(1, 2, 'UNDER_REVIEW', 'ASSIGNED', 'Assigned to IT team for resolution'),
(1, 2, 'ASSIGNED', 'IN_PROGRESS', 'Network equipment check in progress'),
(3, 3, 'SUBMITTED', 'ASSIGNED', 'Assigned to hardware team'),
(3, 3, 'ASSIGNED', 'IN_PROGRESS', 'Checking PC hardware'),
(3, 3, 'IN_PROGRESS', 'RESOLVED', 'Power supply was replaced. PC is now working.'),
(6, 2, 'SUBMITTED', 'IN_PROGRESS', 'Electrical team dispatched'),
(6, 2, 'IN_PROGRESS', 'RESOLVED', 'Voltage stabilizer installed'),
(6, 2, 'RESOLVED', 'CLOSED', 'Issue confirmed resolved by student');

-- Notifications
INSERT INTO notifications (user_id, complaint_id, title, message, type, is_read) VALUES
(5, 1, 'Complaint Status Updated', 'Your complaint TKT-2024-0001 is now In Progress.', 'INFO', FALSE),
(5, 4, 'Complaint Received', 'Your complaint TKT-2024-0004 has been received and is Under Review.', 'INFO', TRUE),
(6, 5, 'Complaint Assigned', 'Your complaint TKT-2024-0005 has been assigned to staff.', 'INFO', FALSE),
(7, 3, 'Complaint Resolved', 'Your complaint TKT-2024-0003 has been resolved!', 'SUCCESS', FALSE);
