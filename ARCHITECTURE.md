# OOP Refactoring Documentation

## Overview

This document outlines the refactored Express API architecture using strict Object-Oriented Programming (OOP) principles and SOLID design patterns.

## Architecture Layers

### 1. **Server Layer** (`src/server.ts`)
- **Purpose**: Manages application lifecycle, database initialization, and HTTP server setup
- **Pattern**: Singleton-like pattern
- **Responsibilities**:
  - Initialize database connection
  - Create HTTP server
  - Attach WebSocket integration
  - Handle graceful shutdown
  - Log startup information

```typescript
class Server {
    async start(): Promise<void>
    private async initializeDatabase(): Promise<void>
}
```

### 2. **App Layer** (`src/app.ts`)
- **Purpose**: Configure Express application, register middlewares, and mount routes
- **Pattern**: Singleton-like pattern (exported as singleton instance)
- **Responsibilities**:
  - Register security middleware (helmet)
  - Register CORS and body parsing
  - Mount all API routes
  - Setup error handling middleware
  - Setup health check and catch-all routes

```typescript
export class App {
    private setupMiddlewares(): void
    private setupRoutes(): void
    private setupErrorHandling(): void
    public getApp(): Application
}
```

### 3. **Routes Layer** (`src/routes/`)
- **Purpose**: Bind Express routers to controllers
- **Pattern**: Composition pattern with Dependency Injection
- **Responsibilities**:
  - Create instances of services and controllers
  - Bind HTTP endpoints to controller methods
  - Initialize route-specific configurations

**Files**:
- `DeliveryDriverRoute.ts`: Routes for `/api/v1/driver`
- `VehicleRoute.ts`: Routes for `/api/v1/vehicle`
- `index.ts`: Main router that aggregates all routes

```typescript
export class DeliveryDriverRoute implements IRoute {
    private controller: DeliveryDriverController
    private initializeRoutes(): void
    public getRouter(): Router
}
```

### 4. **Controllers Layer** (`src/controllers/`)
- **Purpose**: Handle HTTP request/response, validation, and error handling
- **Pattern**: Dependency Injection
- **Responsibilities**:
  - Parse request data
  - Call appropriate service methods
  - Handle HTTP status codes
  - Format and return responses
  - Delegate business logic to services

**Files**:
- `DeliveryDriverController.ts`: Handles driver HTTP operations
- `VehicleController.ts`: Handles vehicle HTTP operations

```typescript
export class DeliveryDriverController implements IController {
    private driverService: DeliveryDriverService
    
    constructor(driverService: DeliveryDriverService)
    
    private async getAllDrivers(req: Request, res: Response): Promise<void>
    private async createDriver(req: Request, res: Response): Promise<void>
    public getHandlers()
}
```

**Key Features**:
- Methods bound in constructor to preserve `this` context in Express
- `getHandlers()` returns wrapped handlers with `asyncHandler`
- Private handler methods to encapsulate implementation

### 5. **Services Layer** (`src/services/`)
- **Purpose**: Encapsulate business logic and database interactions
- **Pattern**: Dependency Injection
- **Responsibilities**:
  - Interact with Sequelize models
  - Implement validation logic
  - Handle business rules
  - Manage WebSocket notifications
  - Throw application-specific errors

**Files**:
- `DeliveryDriverService.ts`: Business logic for drivers
- `VehicleService.ts`: Business logic for vehicles

```typescript
export class DeliveryDriverService implements IService {
    async getAllDrivers(): Promise<any[]>
    async createDriver(firstName, lastName, companyId, ...): Promise<any>
    async getDriverById(driverId: string): Promise<any>
}
```

**Key Features**:
- Validates input parameters
- Handles database operations
- Broadcasts WebSocket notifications
- Throws structured errors with statusCode

### 6. **Shared Layer** (`src/shared/`)
- **Purpose**: Provide reusable utilities, interfaces, and middleware
- **Structure**:
  - `interfaces/`: Contracts for services, controllers, routes
  - `middleware/`: Express middleware (error handling, authentication)
  - `utils/`: Helper functions (async wrapper, response formatting)

#### Interfaces
```typescript
// Minimal contracts to ensure consistency
export interface IService { /* placeholder */ }
export interface IController { getRouter(): Router }
export interface IRoute { getRouter(): Router }
```

#### Utilities
- **AsyncHandler**: Wraps async route handlers to catch errors
- **errorResponse**: Formats error responses
- **successResponse**: Formats success responses

#### Middleware
- **errorHandler**: Global error handling middleware
- **authMiddleware**: Bearer token validation (optional)

## Flow Diagram

```
Request
  ↓
Express App (app.ts)
  ↓
Middleware (helmet, cors, body-parser, auth, logging)
  ↓
Routes (src/routes/index.ts)
  ↓
Route Class (e.g., DeliveryDriverRoute)
  ↓
Controller (e.g., DeliveryDriverController)
  ├─ Validates request
  ├─ Calls service method
  └─ Returns formatted response
  ↓
Service (e.g., DeliveryDriverService)
  ├─ Business logic
  ├─ Database queries (Sequelize)
  └─ WebSocket notifications
  ↓
Database Models (from @les-desesperes/ensto-db)
  ├─ Sequelize hooks (encryption/decryption)
  └─ Database operations
  ↓
Response (JSON)
  ↓
Error Handling Middleware (if error occurs)
  ↓
Client
```

## SOLID Principles Implementation

### 1. Single Responsibility Principle (SRP)
Each class has one reason to change:
- **App**: Only changes when Express configuration changes
- **Controllers**: Only handle HTTP req/res
- **Services**: Only handle business logic
- **Routes**: Only bind endpoints

### 2. Open/Closed Principle (OCP)
Classes are open for extension, closed for modification:
- Add new service methods without modifying existing ones
- Add new controller methods without modifying existing ones
- Add new routes without modifying the router aggregator

### 3. Liskov Substitution Principle (LSP)
Derived classes can substitute base classes:
- Any class implementing `IService` can be injected into controllers
- Any class implementing `IController` can be used by routes

### 4. Interface Segregation Principle (ISP)
Clients depend on specific interfaces, not general ones:
- Controllers implement only `IController` (not a bloated interface)
- Services implement only `IService`
- Routes implement only `IRoute`

### 5. Dependency Inversion Principle (DIP)
High-level modules depend on abstractions, not low-level modules:
- Controllers depend on injected services (abstraction)
- Routes depend on controller constructors (abstraction)
- App depends on Express Router (abstraction)

## Dependency Injection Flow

```
Server
  ↓
App
  ↓
Routes/index.ts
  ├─ DeliveryDriverRoute
  │   ├─ Creates DeliveryDriverService
  │   └─ Injects into DeliveryDriverController
  │
  └─ VehicleRoute
      ├─ Creates VehicleService
      └─ Injects into VehicleController
```

## Error Handling

### Service Level
- Throws structured errors with `statusCode` and `message`
- Logs errors for debugging

### Controller Level
- Uses `asyncHandler` wrapper to catch errors
- `asyncHandler` passes errors to Express error middleware

### Middleware Level
- `errorHandler` middleware catches all errors
- Formats response as `{ success: false, message: string }`
- Logs errors to console

### Response Format
```typescript
// Success
{ success: true, data: {...}, message?: "..." }

// Error
{ success: false, message: "..." }
```

## Adding New Features

### Example: Add a new endpoint

**1. Create Service Method**
```typescript
// src/services/DeliveryDriverService.ts
async updateDriver(driverId: string, updates: any): Promise<any> {
    // Business logic
}
```

**2. Create Controller Method**
```typescript
// src/controllers/DeliveryDriverController.ts
private async updateDriver(req: Request, res: Response): Promise<void> {
    const { driverId } = req.params;
    const updated = await this.driverService.updateDriver(driverId, req.body);
    successResponse(res, 200, updated, 'Driver updated successfully');
}

public getHandlers() {
    return {
        // ...existing
        updateDriver: asyncHandler(this.updateDriver),
    };
}
```

**3. Bind Route**
```typescript
// src/routes/DeliveryDriverRoute.ts
private initializeRoutes(): void {
    const handlers = this.controller.getHandlers();
    this.router.put('/:driverId', handlers.updateDriver); // Add here
}
```

## Testing Strategy

### Unit Testing
- Mock `DeliveryDriverService` in controller tests
- Mock database in service tests
- Test error scenarios

### Integration Testing
- Start server with test database
- Make HTTP requests
- Verify responses

### Example Unit Test
```typescript
describe('DeliveryDriverController', () => {
    let controller: DeliveryDriverController;
    let mockService: jest.Mocked<DeliveryDriverService>;

    beforeEach(() => {
        mockService = {
            getAllDrivers: jest.fn().mockResolvedValue([...]),
        } as any;
        controller = new DeliveryDriverController(mockService);
    });

    test('getAllDrivers should return drivers', async () => {
        const handlers = controller.getHandlers();
        await handlers.getAllDrivers(req, res);
        expect(mockService.getAllDrivers).toHaveBeenCalled();
    });
});
```

## Extensibility

### Adding Authentication
Uncomment in `src/app.ts`:
```typescript
import { authMiddleware } from '@/shared/middleware';

this.app.use('/api/v1', authMiddleware);
```

### Adding Validation with Zod
```typescript
// In controller
import { z } from 'zod';

const createDriverSchema = z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    companyId: z.string().min(1),
});

private async createDriver(req: Request, res: Response): Promise<void> {
    const validated = createDriverSchema.parse(req.body);
    // ... proceed with validated data
}
```

### Adding Database Transactions
```typescript
// In service
import { sequelize } from '@les-desesperes/ensto-db';

const transaction = await sequelize.transaction();
try {
    // Multiple operations
    await transaction.commit();
} catch (error) {
    await transaction.rollback();
    throw error;
}
```

## Migration Guide

### Old Functional Style
```typescript
// Before
export const getDrivers = async (req, res) => { ... }
router.get('/', getDrivers);
```

### New OOP Style
```typescript
// After
class DeliveryDriverService { async getAllDrivers() { ... } }
class DeliveryDriverController { 
    constructor(service) { this.service = service; }
    private getAllDrivers() { ... }
}
class DeliveryDriverRoute {
    constructor() {
        const service = new DeliveryDriverService();
        const controller = new DeliveryDriverController(service);
        this.router.get('/', controller.getHandlers().getAllDrivers);
    }
}
```

## Performance Considerations

1. **No N+1 Queries**: Use Sequelize `include` for associations
2. **Connection Pooling**: Handled by Sequelize/MySQL2
3. **Error Handling**: Prevents server crashes
4. **Logging**: Use structured logging for debugging
5. **Middleware Order**: Important for performance and security

## Folder Structure

```
src/
├── app.ts                 # Express app configuration
├── server.ts              # Server lifecycle
├── controllers/           # HTTP request handlers
│   ├── DeliveryDriverController.ts
│   ├── VehicleController.ts
│   └── index.ts
├── services/              # Business logic
│   ├── DeliveryDriverService.ts
│   ├── VehicleService.ts
│   └── index.ts
├── routes/                # Route bindings
│   ├── DeliveryDriverRoute.ts
│   ├── VehicleRoute.ts
│   └── index.ts
├── shared/                # Shared utilities
│   ├── interfaces/        # Contracts
│   ├── middleware/        # Express middleware
│   ├── utils/             # Helper functions
│   └── index.ts
├── types/                 # TypeScript types
├── utils/                 # Application utilities
├── websockets/            # WebSocket integration
└── middlewares/           # (Legacy folder, deprecated)
```

## Best Practices

1. **Always use Dependency Injection**: Makes code testable
2. **Bind methods in constructors**: Preserves `this` context
3. **Use asyncHandler wrapper**: Catches all async errors
4. **Validate in services**: Business logic owns validation
5. **Format responses consistently**: Use `successResponse` and `errorResponse`
6. **Log errors**: Always log errors for debugging
7. **Handle errors gracefully**: Never let errors propagate uncaught
8. **Use interfaces**: Define contracts between layers
9. **Keep services focused**: One service = one domain entity
10. **Use environment variables**: Never hardcode config

## Troubleshooting

### Error: "Cannot find module"
- Check path aliases in `tsconfig.json`
- Ensure `ts-node-dev` uses `-r tsconfig-paths/register`

### Error: "this is undefined"
- Ensure methods are bound in constructor
- `this.method = this.method.bind(this)`

### Error: "Async handler not catching errors"
- Verify all route handlers are wrapped with `asyncHandler`
- Check error middleware is registered last

### Error: "Database connection fails"
- Check `.env` file has correct MySQL credentials
- Verify MySQL server is running
- Check `MYSQL_HOST` is correct (use `mysql` for Docker, `localhost` for local)

## Next Steps

1. Add input validation with Zod
2. Add authentication/authorization
3. Add logging system (Winston/Pino)
4. Add rate limiting
5. Add request/response caching
6. Add API versioning
7. Add comprehensive testing suite
8. Add API documentation (Swagger)

