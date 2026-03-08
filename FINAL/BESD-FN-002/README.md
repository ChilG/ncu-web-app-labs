# Backend Service (BESD-FN-002)

This is the backend service for the Final Exam project. It provides RESTful APIs for user management, built with Node.js, Express, TypeScript, and MySQL.

## Prerequisites

- Node.js (v20+ recommended)
- npm (or yarn)
- MySQL Server

## Project Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Database Configuration:**
   Ensure you have a MySQL server running. The connection settings are configured via environment variables.

   The default `.env` configuration expects:

   ```env
   PORT=3000
   DB_HOST=127.0.0.1
   DB_USER=root
   DB_PASSWORD=rootpassword
   DB_NAME=se_course_db
   ```

3. **Initialize Database Sandbox (Optional):**
   If you want to manually set up the database structure and populate it with sample users (`se_course_db`), run:
   ```bash
   npx ts-node src/scripts/setupDb.ts
   ```

## Running the Application

### Development Mode

Run the application in development mode with hot-reloading using `nodemon`:

```bash
npm run dev
```

### Production Build

1. Build the TypeScript code into JavaScript:

   ```bash
   npm run build
   ```

2. Start the built application:
   ```bash
   npm start
   ```

## Testing

The project is configured with Integration Tests using Mocha, Chai, and Supertest.

> **Note:** The test script automatically sets up a separate isolated database (`se_course_db_test`) to prevent modifying production or development data.

Run the test suite:

```bash
npm run test
```

## API Endpoints

### 1. Retrieve all users

- **URL:** `/users`
- **Method:** `GET`
- **Response:** Returns an array of user objects. The response includes calculated `age` and excludes security-sensitive fields like `userPassword`.

### 2. Create a new user

- **URL:** `/users`
- **Method:** `POST`
- **Body (JSON):**
  ```json
  {
    "userEmail": "student@gmail.com",
    "userPassword": "mypassword123",
    "userFirstName": "สมชาย",
    "userLastName": "ใจดี",
    "userTel": "0812345678",
    "dateOfBirth": "2000-01-01"
  }
  ```
- **Responses:**
  - `201 Created`: Successfully created a new user. Password is automatically hashed using bcrypt before insertion.
  - `400 Bad Request`: Missing required fields.
  - `409 Conflict`: The provided `userEmail` already exists in the system.
