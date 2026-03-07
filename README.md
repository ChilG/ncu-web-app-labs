# NCU Web Application (fe-be)

A full-stack web application designed for managing Teacher and Student records. This project features a robust **Node.js (Express)** backend API paired with a responsive **Angular** frontend, all fully encapsulated inside **Docker** for seamless deployment, development, and testing.

## 🚀 Tech Stack

- **Frontend:** Angular 18, Bootstrap 5, RxJS, TypeScript
- **Backend:** Node.js, Express, TypeScript, MySQL 2, JWT Authentication, Multer (File uploads)
- **Database:** MySQL 8.0
- **Testing:**
  - Backend: Mocha, Chai, Chai-HTTP
  - Frontend: Karma, Jasmine
- **Infrastructure:** Docker, Docker Compose, NGINX (Alpine)

## ✨ Core Features

- **Authentication System**: Secure JWT-based login system with router guards protecting sensitive pages.
- **Teacher Management**: Complete CRUD operations, including local profile picture uploads via `Multer`.
- **Student Management**: Complete CRUD operations with fully responsive grid table UIs.
- **Testing Isolation**: Dedicated `ncu_test` database for safe backend integration testing without polluting development data.
- **Initial User Seeding**: Automatically generates a default Administrator account upon pristine database initialization to prevent lock-outs.
- **Dockerized Environments**: Multi-stage Docker builds natively serving Angular via an optimized NGINX container and Node via Alpine.

## 🛠️ Prerequisites

- [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)
- Node.js 18+ (If choosing to run locally and not via Docker)

---

## 🐳 Getting Started (Docker - Recommended)

The easiest way to get the application running is by using Docker Compose. It automatically provisions the MySQL Database, PHPMyAdmin, Backend API, and the Frontend NGINX server simultaneously.

1. **Navigate to the root directory**:

   ```bash
   cd fe-be
   ```

2. **Spin up the containers in detached mode**:

   ```bash
   docker compose up -d --build
   ```

3. **Access the Application**:
   - Web Frontend: [http://localhost:4200](http://localhost:4200)
   - Backend API: [http://localhost:3000](http://localhost:3000)
   - Database Management (PHPMyAdmin): [http://localhost:8080](http://localhost:8080) _(Login using user: `root`, password: `rootpassword`)_

### 🔑 Initial Administrator Credentials

Upon the very first boot, the system detects an empty database and automatically seeds an Administrator account. Use these credentials to log in:

- **Username:** `admin`
- **Password:** `admin123`

_(Note: It is highly advised to navigate to the **Change Password** menu and update this credential upon first login)._

---

## 💻 Running Locally (Without Docker)

If you wish to develop and run the servers directly on your host machine to utilize hot-reloading:

### 1. Database & Backend Configuration

1. Ensure your local MySQL server is running.
2. Navigate to the backend folder:
   ```bash
   cd backend
   npm install
   ```
3. Initialize the database schemas (`ncu` and `ncu_test`):
   ```bash
   npx ts-node src/scripts/setupDb.ts
   ```
4. Start the development server (runs on port 3000):
   ```bash
   npm run dev
   ```

### 2. Frontend Configuration

1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   npm install
   ```
2. Start the Angular CLI development server (runs on port 4200):
   ```bash
   npm start
   ```

---

## 🧪 Testing Suites

The project integrates testing suites across both layers to ensure system reliability.

**Backend Integration Tests**:
Uses a safe `ncu_test` database dynamically injected via `cross-env`. It wipes and reseeds the mock data automatically without touching your main `ncu` active database.

```bash
cd backend
npm run test
```

**Frontend Unit Tests**:
Uses Karma and Jasmine to validate component logic and mock API HTTP interactions.

```bash
cd frontend
npm run test
```
