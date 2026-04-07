# Ensto API Documentation and Implementation Plan

This document is the route contract for the current Express + TypeScript OOP backend.

## Base URL

- Local: `http://localhost:3000`
- API prefix: `/api/v1`

## Response Contract (Unified)

### Success

```json
{
  "success": true,
  "message": "optional",
  "data": {}
}
```

### Error

```json
{
  "success": false,
  "message": "Internal Server Error"
}
```

## Authentication and Permissions

- **Current state:** all `/api/v1/*` routes are public because `authMiddleware` is not mounted in `src/app.ts`.
- **Target state (recommended):** protect `/api/v1/*` with Bearer auth + role middleware.

Proposed role model:

```ts
export type EmployeeRole = 'Admin' | 'Magasinier' | 'Personnel';
```

## TypeScript Request Interfaces

```ts
export interface CreateDriverBody {
  firstName: string;
  lastName: string;
  companyId: string;
  ppeCharterValid?: boolean;
  ppeSignatureDate?: string; // ISO date
}

export interface StoreTempPlateBody {
  licensePlate: string;
}

export interface CreateEmployeeBody {
  username: string;
  badgeUuid: string; // /^[A-F0-9]{8}$/
  passwordHash: string;
  role: 'Admin' | 'Magasinier' | 'Personnel';
  firstName: string;
  lastName: string;
}

export interface CreateVisitorBody {
  fullName: string;
  company: string;
  arrivalTime: string; // ISO date
}

export type ActionType = 'Entry' | 'Exit' | 'Refusal';

export interface CreateHistoryLogBody {
  actionType: ActionType;
  details?: string;
  dateTime?: string; // ISO date
}

export interface VehicleByPlateParams {
  licensePlate: string;
}

export interface EmployeeByRfidParams {
  id: string;
}

export interface CompanyByNameParams {
  name: string;
}
```

## Endpoint Catalog

### System

| Method | Path | Auth | Params | Query | Body | Success | Errors | Controller Logic Summary |
|---|---|---|---|---|---|---|---|---|
| GET | `/api/v1/` | Public | - | - | - | `200 { message: "Welcome to the API" }` | `404`, `500` | Inline route in `src/routes/index.ts` |
| GET | `/health` | Public | - | - | - | `200 { status, message, timestamp }` | `500` | Inline route in `src/app.ts` |

### Delivery Driver

| Method | Path | Auth | Params | Query | Body | Success | Errors | Controller Logic Summary |
|---|---|---|---|---|---|---|---|---|
| GET | `/api/v1/driver/` | Public (target: Bearer) | - | - | - | `200 { success: true, data: DeliveryDriver[] }` | `500` | `DeliveryDriverController.getAllDrivers()` -> `DeliveryDriverService.getAllDrivers()` -> `DeliveryDriver.findAll()` |
| POST | `/api/v1/driver/` | Public (target: Bearer + `Personnel|Magasinier|Admin`) | - | - | `CreateDriverBody` | `201 { success: true, message: "Driver created successfully", data: DeliveryDriver }` | `400`, `401`, `500` | `DeliveryDriverController.createDriver()` -> `DeliveryDriverService.createDriver()` -> `DeliveryDriver.create()` |

#### Example

```bash
curl http://localhost:3000/api/v1/driver/

curl -X POST http://localhost:3000/api/v1/driver/ \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "companyId": "1",
    "ppeCharterValid": true,
    "ppeSignatureDate": "2026-04-07"
  }'
```

### Vehicle

| Method | Path | Auth | Params | Query | Body | Success | Errors | Controller Logic Summary |
|---|---|---|---|---|---|---|---|---|
| GET | `/api/v1/vehicle/` | Public (target: Bearer) | - | - | - | `200 { success: true, data: Vehicle[] }` | `500` | `VehicleController.getAllVehicles()` -> `VehicleService.getAllVehicles()` -> `Vehicle.findAll({ include: DeliveryDriver })` |
| GET | `/api/v1/vehicle/plate/:licensePlate` | Public (target: Bearer) | `VehicleByPlateParams` | - | - | `200 { success: true, data: Vehicle }` | `404`, `500` | `VehicleController.getVehicleByPlate()` -> `VehicleService.getVehicleByPlate()` -> `Vehicle.findOne({ where, include })` |
| POST | `/api/v1/vehicle/temp-plate` | Public (target: Bearer) | - | - | `StoreTempPlateBody` | `200 { success: true, message: "Temporary plate stored successfully", data: { licensePlate } }` | `400`, `401`, `500` | `VehicleController.storeTempPlate()` -> `VehicleService.storeTempPlate()` -> `TempPlate.upsert()` |
| GET | `/api/v1/vehicle/temp-plate` | Public (target: Bearer) | - | - | - | `200 { success: true, data: { licensePlate } \| null }` | `401`, `500` | `VehicleController.getTempPlate()` -> `VehicleService.getTempPlate()` -> `TempPlate.findByPk(1)` |

#### Example

```bash
curl http://localhost:3000/api/v1/vehicle/

curl http://localhost:3000/api/v1/vehicle/plate/AA-123-BB

curl -X POST http://localhost:3000/api/v1/vehicle/temp-plate \
  -H "Content-Type: application/json" \
  -d '{"licensePlate": "AA-123-BB"}'

curl http://localhost:3000/api/v1/vehicle/temp-plate
```

### Employee

`EmployeeRoute` is mounted under both `/employee` and `/employees`.

| Method | Path | Auth | Params | Query | Body | Success | Errors | Controller Logic Summary |
|---|---|---|---|---|---|---|---|---|
| GET | `/api/v1/employee/` | Public (target: Bearer) | - | - | - | `200 { success: true, data: Employee[] }` | `500` | `EmployeeController.getAllEmployees()` -> `EmployeeService.getAllEmployees()` -> `Employee.findAll()` |
| GET | `/api/v1/employee/rfid/:id` | Public (target: Bearer) | `EmployeeByRfidParams` | - | - | `200 { success: true, data: { id, badgeUuid } }` | `400`, `404`, `500` | `EmployeeController.getByRFID()` -> `EmployeeService.getEmployeeByBadgeUuid()` -> `Employee.findOne({ where: { badgeUuid } })` |
| POST | `/api/v1/employee/` | Public (target: Bearer + `Admin`) | - | - | `CreateEmployeeBody` | `201 { success: true, message: "Employee created successfully", data: Employee }` | `400`, `401`, `500` | `EmployeeController.createEmployee()` -> `EmployeeService.createEmployee()` -> `Employee.create()` |
| GET | `/api/v1/employees/` | Public (target: Bearer) | - | - | - | Same payload as `/employee/` | `500` | Alias mount to the same `EmployeeRoute` |
| GET | `/api/v1/employees/rfid/:id` | Public (target: Bearer) | `EmployeeByRfidParams` | - | - | Same payload as `/employee/rfid/:id` | `400`, `404`, `500` | Alias mount to the same `EmployeeRoute` |
| POST | `/api/v1/employees/` | Public (target: Bearer + `Admin`) | - | - | `CreateEmployeeBody` | Same payload as `/employee/` | `400`, `401`, `500` | Alias mount to the same `EmployeeRoute` |

#### Example

```bash
curl http://localhost:3000/api/v1/employee/

curl http://localhost:3000/api/v1/employee/rfid/A1B2C3D4

curl -X POST http://localhost:3000/api/v1/employee/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin01",
    "badgeUuid": "A1B2C3D4",
    "passwordHash": "my-secret",
    "role": "Admin",
    "firstName": "Alice",
    "lastName": "Martin"
  }'
```

### Visitor

| Method | Path | Auth | Params | Query | Body | Success | Errors | Controller Logic Summary |
|---|---|---|---|---|---|---|---|---|
| GET | `/api/v1/visitor/` | Public (target: Bearer) | - | - | - | `200 { success: true, data: Visitor[] }` | `500` | `VisitorController.getAllVisitors()` -> `VisitorService.getAllVisitors()` -> `Visitor.findAll()` |
| POST | `/api/v1/visitor/` | Public (target: Bearer + `Personnel|Magasinier|Admin`) | - | - | `CreateVisitorBody` | `201 { success: true, message: "Visitor created successfully", data: Visitor }` | `400`, `401`, `500` | `VisitorController.createVisitor()` -> `VisitorService.createVisitor()` -> `Visitor.create()` |

#### Example

```bash
curl http://localhost:3000/api/v1/visitor/

curl -X POST http://localhost:3000/api/v1/visitor/ \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Bob Henry",
    "company": "ACME",
    "arrivalTime": "2026-04-07T08:30:00.000Z"
  }'
```

### History Log

| Method | Path | Auth | Params | Query | Body | Success | Errors | Controller Logic Summary |
|---|---|---|---|---|---|---|---|---|
| GET | `/api/v1/history-log/` | Public (target: Bearer) | - | - | - | `200 { success: true, data: HistoryLog[] }` | `500` | `HistoryLogController.getAllHistoryLogs()` -> `HistoryLogService.getAllHistoryLogs()` -> `HistoryLog.findAll()` |
| POST | `/api/v1/history-log/` | Public (target: Bearer) | - | - | `CreateHistoryLogBody` | `201 { success: true, message: "History log created successfully", data: HistoryLog }` | `400`, `401`, `500` | `HistoryLogController.createHistoryLog()` -> `HistoryLogService.createHistoryLog()` -> `HistoryLog.create()` |

#### Example

```bash
curl http://localhost:3000/api/v1/history-log/

curl -X POST http://localhost:3000/api/v1/history-log/ \
  -H "Content-Type: application/json" \
  -d '{
    "actionType": "Entry",
    "details": "Manual gate open",
    "dateTime": "2026-04-07T09:00:00.000Z"
  }'
```

### Company (Implemented but Not Mounted)

`CompanyRoute` exists but is not connected in `src/routes/index.ts`.

| Method | Path | Auth | Params | Query | Body | Success | Errors | Controller Logic Summary |
|---|---|---|---|---|---|---|---|---|
| GET | `/api/v1/company/` | Public (target: Bearer) | - | - | - | `200 { success: true, data: Company[] }` | `500` | `CompanyController.getAllCompanies()` -> `CompanyService.getAllCompanies()` -> `Company.findAll()` |
| GET | `/api/v1/company/:name` | Public (target: Bearer) | `CompanyByNameParams` | - | - | `200 { success: true, data: Company }` | `400`, `404`, `500` | `CompanyController.getCompanyByName()` -> `CompanyService.getCompanyByName()` -> `Company.findOne({ where: { name } })` |

## Error Code Matrix

| Code | Meaning | Typical Causes |
|---|---|---|
| 400 | Bad Request | Missing required body/param, invalid enum/date format |
| 401 | Unauthorized | Missing/invalid Bearer token (after auth is enabled) |
| 404 | Not Found | Unknown endpoint, missing entity (vehicle/company/employee) |
| 500 | Internal Server Error | Unhandled service/database/encryption failure |

## Repository Mapping Reference

- `DeliveryDriverService` -> `DeliveryDriver` model (`findAll`, `findOne`, `create`)
- `VehicleService` -> `Vehicle`, `TempPlate`, `DeliveryDriver` models (`findAll`, `findOne`, `findByPk`, `upsert`)
- `EmployeeService` -> `Employee` model (`findAll`, `findOne`, `create`)
- `VisitorService` -> `Visitor` model (`findAll`, `create`)
- `HistoryLogService` -> `HistoryLog` model (`findAll`, `create`)
- `CompanyService` -> `Company` model (`findAll`, `findOne`, `findByPk`, `create`)

## Implementation Plan (REST + OOP)

### Phase 1 - Stabilize Routing

1. Mount `CompanyRoute` in `src/routes/index.ts`.
2. Keep one canonical employee prefix (`/employees`) and keep `/employee` as temporary alias.
3. Standardize plural route naming for new resources.

### Phase 2 - Validation Contracts

1. Add Zod schemas for all body/params/query in controllers.
2. Return consistent `400` payloads from validation failures.
3. Ensure `404` is thrown (not returned as data object) for missing entities.

### Phase 3 - Authentication and RBAC

1. Enable `authMiddleware` for `/api/v1` in `src/app.ts`.
2. Add role middleware for write endpoints.
3. Encode roles in token and enforce route-level access.

### Phase 4 - OpenAPI and Developer Experience

1. Generate OpenAPI from route contracts/schemas.
2. Serve Swagger UI under `/docs`.
3. Add integration tests per endpoint and role matrix.

### Phase 5 - Observability and Reliability

1. Replace remaining `console.*` with structured `pino` logs.
2. Add request-id correlation in logs and errors.
3. Add DB startup health checks and graceful retry policy.

## pnpm Dependencies (Recommended)

```bash
pnpm add zod
pnpm add -D @asteasolutions/zod-to-openapi swagger-ui-express
```

