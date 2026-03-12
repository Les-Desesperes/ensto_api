# ensto_api

A RESTful API built with **Express** and **TypeScript** for managing warehouse logistics — delivery drivers, vehicles, employees, visitors, and history logs.  
Data encryption (AES-256-CBC) is applied transparently on sensitive fields via Sequelize model hooks from the `@les-desesperes/ensto-db` shared library.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [1. Clone the repository](#1-clone-the-repository)
  - [2. Install dependencies](#2-install-dependencies)
  - [3. Configure environment variables](#3-configure-environment-variables)
  - [4. Start the database](#4-start-the-database)
  - [5. Seed mock data](#5-seed-mock-data)
  - [6. Start the API](#6-start-the-api)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [Database](#database)
  - [Schema overview](#schema-overview)
  - [Encryption](#encryption)
  - [Seeding](#seeding)
- [API Reference](#api-reference)
  - [Health Check](#health-check)
  - [Drivers](#drivers)
  - [Vehicles](#vehicles)
- [Security](#security)
- [Development Notes](#development-notes)

---

## Tech Stack

| Layer       | Technology                          |
|-------------|--------------------------------------|
| Runtime     | Node.js (ES2022)                     |
| Language    | TypeScript 5                         |
| Framework   | Express 5                            |
| ORM         | Sequelize 6                          |
| Database    | MySQL 8.0 (Docker)                   |
| DB Models   | `@les-desesperes/ensto-db`           |
| Encryption  | AES-256-CBC (Node.js `crypto`)       |
| Security    | Helmet, CORS                         |
| Dev tooling | ts-node-dev, tsconfig-paths          |
| Package mgr | pnpm                                 |

---

## Project Structure

```
ensto_api/
├── src/
│   ├── app.ts                  # Express app setup (middlewares, routes)
│   ├── server.ts               # DB connection bootstrap + HTTP server start
│   ├── controllers/
│   │   ├── driverController.ts # Driver CRUD logic
│   │   └── vehicleController.ts# Vehicle lookup logic
│   ├── routes/
│   │   ├── index.ts            # Root router — mounts all sub-routers
│   │   ├── driverRoutes.ts     # /api/v1/driver routes
│   │   └── vehicleRoutes.ts    # /api/v1/vehicle routes
│   ├── middlewares/            # (reserved for auth, validation, etc.)
│   └── utils/
│       └── crypto.ts           # AES-256-CBC encrypt/decrypt + SHA-256 hash
├── mock_data.sql               # Dev seed data (valid pre-encrypted values)
├── docker-compose.yml          # MySQL 8 + phpMyAdmin services
├── .env                        # Local environment variables (not committed)
├── tsconfig.json
└── package.json
```

---

## Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [pnpm](https://pnpm.io/) >= 10
- [Docker](https://www.docker.com/) + Docker Compose

---

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd ensto_api
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

Copy the example below into a `.env` file at the project root:

```env
# Server
PORT=3000
NODE_ENV=development

# MySQL
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_DATABASE=ensto_db
MYSQL_USER=ensto_user
MYSQL_PASSWORD=ensto_pass
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306

# Encryption — MUST be exactly 32 characters
ENCRYPTION_KEY=default-32-character-secret-key!

# phpMyAdmin
PMA_USER=ensto_user
PMA_PASSWORD=ensto_pass
```

> ⚠️ **Important:** `ENCRYPTION_KEY` must be exactly **32 characters** (AES-256 requirement).  
> All environments (dev/staging/prod) sharing the same database **must use the same key**.  
> Changing this key after data has been written will make all encrypted fields unreadable.

### 4. Start the database

```bash
docker compose up -d
```

This starts:
- **MySQL 8** on port `3306`
- **phpMyAdmin** on [http://localhost:8080](http://localhost:8080)

### 5. Seed mock data

After the database is running and the API has synced the schema at least once (step 6), load the seed data:

```bash
docker exec -i ensto_mysql mysql -uroot -prootpassword ensto_db < mock_data.sql
```

> The seed file contains pre-encrypted driver names generated with `ENCRYPTION_KEY=default-32-character-secret-key!`. If you change the key, regenerate seeds via POST `/api/v1/driver`.

### 6. Start the API

```bash
pnpm dev
```

The server will be available at [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

| Variable              | Required | Default                            | Description                                      |
|-----------------------|----------|------------------------------------|--------------------------------------------------|
| `PORT`                | No       | `3000`                             | HTTP port the API listens on                     |
| `NODE_ENV`            | No       | `development`                      | Runtime environment                              |
| `MYSQL_DATABASE`      | Yes      | —                                  | MySQL database name                              |
| `MYSQL_USER`          | Yes      | —                                  | MySQL user                                       |
| `MYSQL_PASSWORD`      | Yes      | —                                  | MySQL user password                              |
| `MYSQL_ROOT_PASSWORD` | Yes      | —                                  | MySQL root password (used by Docker)             |
| `MYSQL_HOST`          | Yes      | —                                  | MySQL host (`127.0.0.1` for local Docker)        |
| `MYSQL_PORT`          | No       | `3306`                             | MySQL port                                       |
| `ENCRYPTION_KEY`      | Yes      | `default-32-character-secret-key!` | AES-256 key — **must be 32 chars**, change in prod |
| `PMA_USER`            | No       | —                                  | phpMyAdmin login user                            |
| `PMA_PASSWORD`        | No       | —                                  | phpMyAdmin login password                        |

---

## Scripts

| Command        | Description                                              |
|----------------|----------------------------------------------------------|
| `pnpm dev`     | Start in development mode with hot-reload (ts-node-dev)  |
| `pnpm build`   | Compile TypeScript to `dist/`                            |
| `pnpm start`   | Run compiled production build from `dist/`               |

---

## Database

### Schema overview

The database is managed by the `@les-desesperes/ensto-db` package and synced automatically on startup via `db.sync({ alter: true })`.

| Table               | Description                                                      |
|---------------------|------------------------------------------------------------------|
| `employees`         | Warehouse staff — username, SHA-256 hashed password, role        |
| `delivery_drivers`  | External drivers — AES-256 encrypted first/last name, company    |
| `vehicles`          | Fleet — license plate, type, linked driver (FK)                  |
| `visitors`          | Site visitors — full name, company, arrival time                 |
| `history_logs`      | Audit log — entry/exit/refusal events linked to entities         |

### Encryption

Driver names (`encrypted_first_name`, `encrypted_last_name`) are encrypted using **AES-256-CBC** before being written to the database.

- **Algorithm:** `aes-256-cbc`
- **Key:** `ENCRYPTION_KEY` env variable (must be 32 bytes)
- **IV:** randomly generated per record, stored as a prefix: `<iv_hex>:<ciphertext_hex>`
- **Hooks:** encryption runs in the Sequelize `beforeSave` hook; decryption runs in `afterFind` — fully transparent to controllers.

Employee passwords are hashed with **SHA-256** (one-way, no decryption).

### Seeding

The `mock_data.sql` file contains:
- 3 employees (1 Admin, 2 WarehouseWorkers)
- 3 delivery drivers (with valid pre-encrypted names)
- 4 vehicles
- 3 visitors
- 5 history log entries

```bash
docker exec -i ensto_mysql mysql -uroot -prootpassword ensto_db < mock_data.sql
```

---

## API Reference

Base URL: `http://localhost:3000`

All endpoints return JSON. Successful responses include `"success": true`. Error responses include `"success": false` and a `"message"` field.

---

### Health Check

#### `GET /health`

Returns the server status.

**Response `200`**
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

---

### Drivers

#### `GET /api/v1/driver/`

Returns a list of all delivery drivers. Names are automatically decrypted before being returned.

**Response `200`**
```json
{
  "success": true,
  "data": [
    {
      "driverId": 1,
      "encryptedFirstName": "John",
      "encryptedLastName": "Doe",
      "company": "Fast Logistics",
      "ppeCharterValid": true,
      "ppeSignatureDate": "2023-10-01T08:30:00.000Z"
    }
  ]
}
```

**Response `500`**
```json
{
  "success": false,
  "message": "Internal Server Error"
}
```

---

#### `POST /api/v1/driver/`

Creates a new delivery driver. Names are automatically encrypted before being stored.

**Request body**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "company": "Fast Logistics",
  "ppeCharterValid": true,
  "ppeSignatureDate": "2023-10-01T08:30:00.000Z"
}
```

| Field              | Type      | Required | Description                             |
|--------------------|-----------|----------|-----------------------------------------|
| `firstName`        | `string`  | ✅        | Driver's first name (will be encrypted) |
| `lastName`         | `string`  | ✅        | Driver's last name (will be encrypted)  |
| `company`          | `string`  | ✅        | Company name                            |
| `ppeCharterValid`  | `boolean` | No       | PPE charter signed? Default: `false`    |
| `ppeSignatureDate` | `string`  | No       | ISO 8601 date string. Default: `null`   |

**Response `201`**
```json
{
  "success": true,
  "message": "Driver created successfully",
  "data": {
    "driverId": 1,
    "encryptedFirstName": "a1b2c3...:d4e5f6...",
    "encryptedLastName": "f1e2d3...:c4b5a6...",
    "company": "Fast Logistics",
    "ppeCharterValid": true,
    "ppeSignatureDate": "2023-10-01T08:30:00.000Z"
  }
}
```

**Response `400`** — missing required fields
```json
{
  "success": false,
  "message": "firstName, lastName, and company are required fields."
}
```

**Response `500`**
```json
{
  "success": false,
  "message": "Internal Server Error"
}
```

---

### Vehicles

#### `GET /api/v1/vehicle/plate/:licensePlate`

Returns a vehicle by its license plate, including the associated driver (with decrypted names).

**URL params**

| Param          | Type     | Description                       |
|----------------|----------|-----------------------------------|
| `licensePlate` | `string` | e.g. `AA-123-BB`                  |

**Example request**
```bash
curl http://localhost:3000/api/v1/vehicle/plate/AA-123-BB
```

**Response `200`**
```json
{
  "success": true,
  "data": {
    "vehicleId": 1,
    "licensePlate": "AA-123-BB",
    "vehicleType": "LCV",
    "driverId": 1,
    "DeliveryDriver": {
      "driverId": 1,
      "encryptedFirstName": "John",
      "encryptedLastName": "Doe",
      "company": "Fast Logistics"
    }
  }
}
```

**Response `404`** — vehicle not found
```json
{
  "success": false,
  "message": "Vehicle with license plate XX-000-XX not found."
}
```

**Response `500`**
```json
{
  "success": false,
  "message": "Internal Server Error"
}
```

---

## Security

| Concern              | Approach                                                                     |
|----------------------|------------------------------------------------------------------------------|
| HTTP headers         | [`helmet`](https://helmetjs.github.io/) sets secure default headers          |
| CORS                 | [`cors`](https://github.com/expressjs/cors) enabled globally                 |
| Sensitive data at rest | AES-256-CBC encryption on driver names via Sequelize hooks                 |
| Passwords            | SHA-256 one-way hash for employee passwords                                  |
| Secrets              | All credentials in `.env`, never committed to source control                 |
| Key management       | `ENCRYPTION_KEY` must be exactly 32 chars; rotate carefully in production    |

---

## Development Notes

- **Path alias** `@/*` maps to `src/*` (configured in `tsconfig.json`). At runtime, `tsconfig-paths` resolves these aliases.
- **Schema sync** runs on every startup with `alter: true`, which safely migrates existing tables without dropping data.
- **Encryption key drift:** if you reseed the database or switch environments, ensure `ENCRYPTION_KEY` matches the key used during encryption. Mismatches cause `ERR_OSSL_WRONG_FINAL_BLOCK_LENGTH` at runtime.
- **phpMyAdmin** is available at [http://localhost:8080](http://localhost:8080) when Docker is running — useful for inspecting raw encrypted values.
