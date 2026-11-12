# Sweety – Blood Glucose Tracker (MERN + PostgreSQL)

Sweety is a full-stack healthcare web application designed for diabetes patients to track their daily blood glucose levels across 4 standard daily time slots, view interactive monthly trend charts, and generate automated summary reports.

---
## Demo Video
🎬 **[Click Here to Watch the 3-Minute App Demo](https://drive.google.com/file/d/1oX-ACm8O7T7B9gu0WuiFGzlhSmomWShO/view?usp=sharing)**

---


## Table of Contents
1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Quick Start with Docker](#quick-start-with-docker-recommended)
4. [Manual Local Setup (Without Docker)](#manual-local-setup-without-docker)
5. [Demo User Credentials](#demo-user-credentials)
6. [Running Automated Tests](#running-automated-tests)
7. [API Endpoints Reference](#api-endpoints-reference)
8. [Notes & Assumptions](#notes--assumptions)

---

## Features

### Core Requirements
- **Authentication & Authorization:** Secure registration and login using hashed passwords (`bcrypt`, 12 salt rounds) and HTTP-only cookie-based JWT sessions. Strict data isolation ensures users only see their own readings.
- **Reading Management (CRUD):**
  - Record blood glucose readings with Date, Time Slot, and Glucose Value (mg/dl).
  - 4 Standard Daily Slots:
    - `Morning (fasting)`
    - `After breakfast`
    - `After lunch`
    - `After dinner`
  - Strict Validations (with clear UI alerts):
    - Glucose value is required.
    - Value must be a whole number between 40 and 600 mg/dl.
    - Only one reading per slot per day.
    - Maximum 4 readings per calendar day.
    - Date cannot be in the future.
- **Summary Reports:**
  - **Daily Report:** Highest, lowest, and average (rounded to 1 decimal place) for the selected date, plus an itemized list of all readings with their slots.
  - **Month-to-Date Report:** Dynamic statistics from the 1st of the month through the selected date.
  - **Monthly Report:** Aggregated statistics for the whole previous calendar month.
  - Friendly empty states when no readings exist for the selected period.

### Bonus Tasks Implemented
- **Pagination on `GET /readings`:** Full backend pagination (`?page=1&limit=20`) with responsive UI pagination controls (`Showing X to Y of Z readings`, Previous/Next, and page numbers).
- **Interactive Monthly Trend Charts:** Line chart visualizing glucose trends over the month with slot toggle buttons (`Morning`, `After breakfast`, `After lunch`, `After dinner`) powered by Recharts.
- **Redis Report Caching & Invalidation:** Fast in-memory caching for daily and monthly reports via Redis; automatically cleared/invalidated whenever a reading is added, edited, or deleted to guarantee 100% data consistency.
- **Docker & Docker Compose:** Multi-container setup running PostgreSQL 16, Redis 7, Express API, and React frontend with a single command.

---

## Tech Stack

- **Backend:** Node.js (v20), Express 5, Prisma ORM, PostgreSQL, Redis (ioredis), bcrypt, jsonwebtoken, zod
- **Frontend:** React 18, Vite, Tailwind CSS, Lucide React, Recharts, Axios
- **Database & Cache:** PostgreSQL 16, Redis 7
- **Testing:** Node.js native test runner, Supertest (45 passing tests)
- **Containerization:** Docker & Docker Compose

---

## Quick Start with Docker (Recommended)

Run the entire full-stack application (PostgreSQL + Redis + Server + Client) in isolated containers with zero manual database installation:

### 1. Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running on your computer.

### 2. Build and Start All Containers
Open a terminal in the project root directory (`sweety-blood-glucose-tracker`) and run:

```bash
docker-compose up --build
```

This automatically:
- Starts **PostgreSQL 16** on port `5432`.
- Starts **Redis 7** on port `6379`.
- Builds and starts the **Express Backend** on port `5000` (automatically applies database schema via Prisma).
- Builds and starts the **React Frontend** on port `5173`.

### 3. Seed Demo Data (Inside Docker)
Once the containers are running, open a second terminal tab and run:

```bash
docker-compose exec server npm run seed
```

This creates the default demo user and loads sample readings spanning multiple days and months.

### 4. Access the App
- **Frontend Web App:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5000](http://localhost:5000)

### 5. Running Tests in Docker
```bash
docker-compose exec server npm test
```

### 6. Stop Containers
To shut down the containers cleanly:
```bash
docker-compose down
```

---

## Manual Local Setup (Without Docker)

If you prefer to run the app directly on your local machine:

### 1. Prerequisites
- **Node.js** (v20+ recommended)
- **PostgreSQL** (running locally on port `5432`)
- **Redis** (optional; the app has graceful offline fallback if Redis is not running)

### 2. Configure Environment Files
Create environment files from `.env.example`:
```bash
# In project root
cp .env.example server/.env
cp .env.example client/.env
```

Ensure `server/.env` contains your PostgreSQL credentials:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/sweety_db?schema=public"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your_secret_jwt_key"
JWT_EXPIRES_IN=1d
```

### 3. Setup Database & Seed Data
Navigate to the `server` folder:
```bash
cd server
npm install
npx prisma db push
npm run seed
```

### 4. Start the Backend API
```bash
# Inside server/
npm run dev
# Server starts on http://localhost:5000
```

### 5. Start the Frontend Client
In a new terminal window:
```bash
cd client
npm install
npm run dev
# Client starts on http://localhost:5173
```

---

## Demo User Credentials

Use the pre-seeded account to test all features immediately:

| Field | Value |
|---|---|
| **Email** | `demo@sweety.com` |
| **Password** | `password123` |

*(You can also use the **Register** tab to create a brand new patient account with a unique email).*

---

## Running Automated Tests

The backend test suite includes **45 automated unit and integration tests** verifying authentication, input validation, slot uniqueness, daily limit constraints, calculations, pagination, and Redis caching.

Run all tests from the `server` directory:
```bash
cd server
npm test
```



## API Endpoints Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user with name, email, password | No |
| `POST` | `/api/auth/login` | Login and set HTTP-only JWT cookie | No |
| `POST` | `/api/auth/logout` | Logout and clear cookie | Yes |
| `GET` | `/api/auth/me` | Get current logged-in user session | Yes |

### Blood Glucose Readings (`/api/readings`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/readings` | Get paginated readings (`?page=1&limit=20`) | Yes |
| `POST` | `/api/readings` | Add a new reading (date, slot, value) | Yes |
| `GET` | `/api/readings/:id` | Get reading by ID | Yes |
| `PUT` | `/api/readings/:id` | Edit reading | Yes |
| `DELETE` | `/api/readings/:id` | Delete reading | Yes |

### Summary Reports (`/api/reports`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/reports/daily?date=YYYY-MM-DD` | Stats & slot list for selected date | Yes |
| `GET` | `/api/reports/month-to-date?date=YYYY-MM-DD` | Stats from 1st of month to date | Yes |
| `GET` | `/api/reports/monthly?date=YYYY-MM-DD` | Stats for whole previous calendar month | Yes |

---

## Notes & Assumptions

### Engineering Decisions & Assumptions

1. **Database Strategy: Moving from Raw `pg` to Prisma ORM**
   - I initially started building with a raw `pg` (node-postgres) connection pool. However, writing manual SQL queries, handling table migrations, and managing relational joins manually became tedious and error-prone as the models grew.
   - I chose to switch to **Prisma ORM**. Prisma gave me declarative schema definitions (`schema.prisma`), automatic migration tracking (`prisma db push`), and type-safe database queries, making the codebase much easier to read and maintain.

2. **Authentication Security: HTTP-Only Cookies over LocalStorage**
   - Initially, storing JWT tokens in browser `localStorage` seemed like a quick option. However, storing auth tokens in `localStorage` makes the application vulnerable to Cross-Site Scripting (XSS) attacks because any malicious client-side script can read it.
   - To keep patient healthcare data secure, I chose to store the JWT inside a secure, **HTTP-only cookie** (`SameSite: lax`). This guarantees that client-side JavaScript cannot read or steal the session token.

3. **Schema Validation: Choosing Zod for Clean, Reusable Rules**
   - Instead of writing repetitive manual `if/else` checks inside my route handlers, I chose **Zod** for schema validation.
   - Zod allows defining clean validation schemas (for register, login, reading creation, and query params) in dedicated validator files. When invalid data is submitted (e.g., glucose value not between 40 and 600, or invalid time slots), Zod automatically generates clear, user-friendly error messages that match the assignment requirements.

4. **Modular Architecture & Global Error Handling**
   - I wanted the backend to be clean, modular, and easy to scale. I separated the code into a **Layered Architecture**:
     - `routes/` $\rightarrow$ Endpoint definitions
     - `controllers/` $\rightarrow$ HTTP request/response parsing
     - `services/` $\rightarrow$ Core business logic and database queries
     - `validators/` $\rightarrow$ Zod request validation
   - Because business rules and database errors happen deep in the service layer, I implemented a centralized **Global Error Handler** middleware and a custom `AppError` class. Whenever an error occurs in a service (e.g., duplicate slot or 4 readings limit), throwing an `AppError` is automatically caught by Express and formatted into a consistent JSON response for the client.

---

### AI Assistance & Modern Development Workflow

Given that this position is for **Junior Full Stack Developer – JavaScript & AI**, I embraced AI tools as a pair-programming partner and productivity multiplier throughout this assignment:
- **Frontend Development & UI Polish:** Used AI as a pair-programmer to accelerate building modern React components, responsive Tailwind CSS layouts, interactive Recharts data visualization with slot toggles, and clean client-side error handling for form validations.
- **Test Case Scaffolding & Edge Cases:** Used AI to brainstorm edge cases and accelerate writing our 45 automated backend test suites (such as January year-rollover edge cases for monthly reports, physiological boundary checks 40–600 mg/dl, and slot duplicate conflicts).
- **Documentation & Setup Guides:** Leveraged AI assistance to structure clear, detailed setup instructions in `README.md`, ensure `.env.example` is fully documented with zero exposed secrets, and verify Docker Compose environment configurations.
- **Code Review & Security Auditing:** Used AI to review code patterns, audit session security (confirming HTTP-only cookie flags over localStorage to prevent XSS), and verify clean separation of concerns across our layered architecture.

---

### What I'd Improve with More Time

1. **Frontend Component Tests:** Add tests using React Testing Library for the reading modal form to test form validations and submission callbacks.
2. **Doctor Role:** Implement a `DOCTOR` role in the database allowing doctors to have an oversight dashboard to view assigned patients' glucose reports.
3. **Daily Reminder Notifications:** Add a background worker (via BullMQ/cron) that sends an automated evening email or push notification to patients who have logged fewer than 4 readings for the day.
4. **Export to PDF / CSV:** Add a one-click button on the Reports page to download a printable PDF summary for patients to bring to their doctor appointments.
5. **Forgot Password & Self-Service Account Recovery:** Implement a secure, token-based password reset workflow (generating cryptographically random, time-limited reset tokens hashed in the database, with email delivery via Nodemailer / SendGrid) allowing patients to securely reset forgotten passwords without administrator intervention.
