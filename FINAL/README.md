# Software Engineer - Final Exam Application

This repository contains the complete full-stack application for the final exam, consisting of a Node.js backend (`BESD-FN-002`) and an Angular frontend (`FESD-FN-002`).

The entire application is containerized using Docker and deeply integrated with `docker-compose` to ensure a seamless "one-click" setup experience.

## 🏗️ Project Structure

The root directory is divided into three core environments:

- **`BESD-FN-002` (Backend)**
  - RESTful API built with **Node.js, Express, and TypeScript**.
  - Connects to a MySQL database using the `mysql2` driver.
  - Exposes endpoints for user authentication, registration, and data fetching on Port **3000**.
- **`FESD-FN-002` (Frontend)**
  - Single Page Application built with **Angular 19**.
  - Styled with **Bootstrap 5.x** and `bootstrap-icons` for a modern, responsive, premium UI.
  - Hosted behind an **NGINX** web server inside the Docker container on Port **4200**.
- **`db` (Database)**
  - **MySQL 8.0** database spun up entirely via Docker Compose.
  - Data is persistently mounted via Docker volumes.
  - Exposed natively on Port **3306**.

## 🚀 Getting Started (Docker Compose)

The easiest and recommended way to start the entire stack is with Docker Compose. This ensures all services (Database, Backend, and Frontend) boot up in the correct sequence on the same internal network.

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

### 1. Build and Run the Stack

Navigate to this root `FINAL` directory and execute:

```bash
docker compose up -d --build
```

Wait 10-20 seconds for the database to fully initialize and for the backend server to establish a connection pool.

### 2. Accessing the Application

Once the containers are successfully running, you can access the services locally at the following URLs:

- 🌐 **Frontend UI (Angular):** [http://localhost:4200](http://localhost:4200)
- ⚙️ **Backend API (Express):** [http://localhost:3000](http://localhost:3000)
- 🗄️ **MySQL Database:** `localhost:3306` (Credentials: `root` / `rootpassword`)

## 🛑 Stopping the Application

To shut down all services and their networks gracefully, run:

```bash
docker compose down
```

_Note: The MySQL data will persist in the `db_data` volume even after shutting down. To wipe the database clean, you can append the `-v` flag (`docker compose down -v`)._
