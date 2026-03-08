# FESD-FN-002 (Frontend Service)

This is the frontend portion of the final exam (**Software Engineer** course). Built with modern **Angular 19** and stylized using **Bootstrap 5.x** to deliver a responsive, clean, and intuitive user interface.

## 🚀 Features

- **User Registration:** A fully reactive form ensuring robust client-side validation:
  - Required field constraints.
  - Strict Email formats.
  - Password length validation (8-15 characters).
  - Telephone number pattern masking (numbers only).
  - **Custom Date Validator:** Enforces the `YYYY-MM-DD` format while smartly validating the _actual existence_ of the date (e.g., catching impossible inputs like month 13 or February 30th).
  - Interactive success/error HTTP Alerts (Handling `201`, `400`, `409`, `422`, `500`).
- **User Directory:** A responsive Bootstrap 5 data table displaying registered users fetched from the backend. Instead of raw birthdays, it live-calculates their current **Age** using the frontend Data Model class.
- **Modern Premium UI:** Showcases Bootstrap 5.x floating labels, custom border radii, gradients, and soft shadows for a polished, production-ready aesthetic.

---

## 🛠️ Technology Stack

- **Framework:** Angular 19
- **Styling & UI Components:** Bootstrap 5.x, Bootstrap Icons
- **Testing Engine:** Jasmine & Karma
- **Deployment:** Docker with NGINX

---

## 📦 Local Development Setup

To run this frontend locally, make sure you have Node 18+ installed.

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Application

By default, the Angular CLI will serve the app on `http://localhost:4200/`.

```bash
npm start
```

_Note: Make sure your Backend (`BESD-FN-002`) is running on `localhost:3000` so that API calls succeed._

---

## 🧪 Unit Testing

This project includes deep unit testing covering edge cases for the `User` data model (specifically the `getAge()` logic). To ensure testing remains deterministic year after year, `jasmine.clock().mockDate()` is utilized to freeze the reference date.

### Run Headless Tests

```bash
npm run test -- --watch=false --browsers=ChromeHeadless
```

A record of passing tests is saved inside the `test-report/` directory in this workspace.

---

## 🐳 Docker Deployment

You can deploy the frontend as a standalone container or as part of the full stack `docker-compose.yml`.

### Standalone Build

```bash
# Build the NGINX angular image
docker build -t fesd-fn-002 .

# Run the container on port 4200
docker run -p 4200:80 fesd-fn-002
```

### Full-Stack Build (Recommended)

Navigate to the root `FINAL` directory and bring up the database, backend, and frontend simultaneously:

```bash
cd ..
docker compose up -d --build
```

The Frontend will be accessible at `http://localhost:4200/`.
