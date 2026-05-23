# 🎓 CampusTrack — College Online Complaint & Issue Tracking System

A full-stack, production-ready web application for managing college complaints with role-based access, real-time status updates, and an analytics dashboard.

---

## 📸 Tech Stack

| Layer      | Technology |
|------------|------------|
| Frontend   | React 18, Tailwind CSS, Recharts, Axios, React Router v6 |
| Backend    | Spring Boot 3.2, Spring Security, JWT, WebSocket |
| Database   | MySQL 8.0 |
| Build      | Maven 3.9, Node 20 |
| DevOps     | Docker, Docker Compose, Nginx |

---

## 🏗️ Project Structure

```
college-complaint-system/
├── backend/                        # Spring Boot application
│   ├── src/main/java/com/college/complaints/
│   │   ├── ComplaintsApplication.java
│   │   ├── config/                 # Security, WebSocket, AppConfig
│   │   ├── controller/             # REST controllers
│   │   ├── dto/                    # Request / Response DTOs
│   │   ├── entity/                 # JPA entities
│   │   ├── enums/                  # Status, Priority, NotificationType
│   │   ├── exception/              # Global exception handling
│   │   ├── repository/             # Spring Data JPA repositories
│   │   ├── security/               # JWT utils, filter, UserDetailsService
│   │   ├── service/                # Service interfaces
│   │   └── serviceImpl/            # Service implementations
│   ├── src/main/resources/
│   │   └── application.properties
│   ├── Dockerfile
│   └── pom.xml
│
├── frontend/                       # React application
│   ├── public/index.html
│   ├── src/
│   │   ├── App.js                  # Routes & guards
│   │   ├── context/AuthContext.js  # Auth state
│   │   ├── services/api.js         # Axios + all API calls
│   │   ├── utils/helpers.js        # Formatters, badge configs
│   │   ├── components/shared/      # Reusable UI components
│   │   └── pages/
│   │       ├── auth/               # Login, Register, ForgotPassword
│   │       ├── student/            # Dashboard, Complaints, New, Detail, Notifications
│   │       ├── admin/              # Dashboard, Complaints, Analytics, Users, Categories
│   │       ├── staff/              # Dashboard, Complaints
│   │       ├── DashboardLayout.js  # Sidebar + Topbar shell
│   │       └── ProfilePage.js
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── tailwind.config.js
│   └── package.json
│
├── database/
│   └── schema.sql                  # Full schema + seed data
├── docker-compose.yml
└── README.md
```

---

## ⚡ Quick Start (Local)

### Prerequisites
- Java 17+
- Maven 3.9+
- Node.js 18+
- MySQL 8.0

### 1. Database Setup
```bash
mysql -u root -p < database/schema.sql
```

### 2. Backend
```bash
cd backend
cp .env.example .env          # edit DB credentials if needed
mvn clean install -DskipTests
mvn spring-boot:run
# Runs on http://localhost:8080
```

### 3. Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm start
# Runs on http://localhost:3000
```

---

## 🐳 Docker (One Command)

```bash
# Build & start all services
docker compose up --build

# Frontend → http://localhost
# Backend  → http://localhost:8080
# API docs → http://localhost:8080/api/swagger-ui.html
```

---

## 🔐 Default Credentials

| Role    | Email                          | Password    |
|---------|--------------------------------|-------------|
| Admin   | admin@college.edu              | Admin@123   |
| Staff   | rajesh@college.edu             | Staff@123   |
| Staff   | priya@college.edu              | Staff@123   |
| Student | aarav@student.college.edu      | Student@123 |
| Student | sneha@student.college.edu      | Student@123 |

---

## 📡 API Reference

Base URL: `http://localhost:8080/api`

### Auth
| Method | Endpoint               | Description          | Auth |
|--------|------------------------|----------------------|------|
| POST   | /auth/login            | Login                | No   |
| POST   | /auth/register         | Student registration | No   |
| POST   | /auth/forgot-password  | Request reset link   | No   |
| POST   | /auth/reset-password   | Reset password       | No   |
| GET    | /auth/me               | Current user profile | Yes  |

### Student
| Method | Endpoint                 | Description             |
|--------|--------------------------|-------------------------|
| GET    | /student/dashboard       | Dashboard stats         |
| GET    | /student/complaints      | My complaints (paged)   |
| POST   | /student/complaints      | Submit new complaint    |

### Admin
| Method | Endpoint                           | Description             |
|--------|------------------------------------|-------------------------|
| GET    | /admin/dashboard                   | Admin stats             |
| GET    | /admin/complaints                  | All complaints (filter) |
| PATCH  | /admin/complaints/{id}/status      | Update status           |
| POST   | /admin/complaints/{id}/assign      | Assign to staff         |
| GET    | /admin/users                       | All users               |
| GET    | /admin/users/staff                 | All staff               |
| PATCH  | /admin/users/{id}/toggle-status    | Activate/deactivate     |

### Staff
| Method | Endpoint                      | Description             |
|--------|-------------------------------|-------------------------|
| GET    | /staff/dashboard              | Staff stats             |
| GET    | /staff/complaints             | Assigned complaints     |
| PATCH  | /staff/complaints/{id}/status | Update status           |

### Shared
| Method | Endpoint                          | Description            |
|--------|-----------------------------------|------------------------|
| GET    | /complaints/{id}                  | Complaint by ID        |
| GET    | /complaints/ticket/{ticketNumber} | Complaint by ticket #  |
| GET    | /categories/active                | Active categories      |
| GET    | /notifications                    | My notifications       |
| POST   | /notifications/mark-all-read      | Mark all as read       |
| PUT    | /profile                          | Update profile         |

Full Swagger docs: `http://localhost:8080/api/swagger-ui.html`

---

## 🔄 Complaint Status Flow

```
SUBMITTED → UNDER_REVIEW → ASSIGNED → IN_PROGRESS → RESOLVED → CLOSED
```

---

## 🌐 Environment Variables

### Backend
| Variable         | Default         | Description             |
|------------------|-----------------|-------------------------|
| DB_USERNAME      | root            | MySQL username          |
| DB_PASSWORD      | root            | MySQL password          |
| JWT_SECRET       | (long string)   | JWT signing secret      |
| JWT_EXPIRATION   | 86400000        | Token TTL (ms) = 24h    |
| CORS_ORIGINS     | localhost:3000  | Allowed origins         |
| MAIL_ENABLED     | false           | Enable email sending    |

### Frontend
| Variable              | Default                    |
|-----------------------|----------------------------|
| REACT_APP_API_URL     | http://localhost:8080/api  |

---

## 🏆 Features Summary

### 🎓 Student
- Register & login with JWT authentication
- Submit complaints with category, priority, location, attachments
- Real-time status tracking with visual progress bar
- View full complaint history with timeline
- Push notifications on status changes
- Edit profile

### 🛡️ Admin
- Full complaint management with filters & search
- Assign complaints to staff members
- Update complaint status with remarks
- Analytics dashboard with charts (status, category, monthly, staff)
- User management (activate/deactivate)
- Category management (CRUD)

### 👷 Staff
- View assigned complaints
- Update complaint progress and status
- Add resolution notes
- Mobile-friendly task cards

---

## 🔒 Security
- BCrypt password hashing (strength 12)
- JWT Bearer token authentication
- Role-based route protection
- CORS configured for known origins
- SQL injection protection via JPA/Hibernate
- Input validation on all endpoints

---

## 📱 Responsive Design
- Mobile-first Tailwind CSS design
- Collapsible sidebar for small screens
- Mobile card layout for staff tasks
- Touch-friendly buttons and inputs

---

## 🚀 Deployment Notes
- Backend: Deploy the JAR to any Java 17 server or container
- Frontend: Build with `npm run build`, serve via Nginx
- Database: MySQL 8.0+, run `schema.sql` once
- Use Docker Compose for easiest production setup
