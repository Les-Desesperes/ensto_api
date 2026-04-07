# Ensto API - Refactored to OOP Architecture

A professional-grade **RESTful API** built with **Express**, **TypeScript**, and **SOLID principles**.  
Manages warehouse logistics including delivery drivers, vehicles, and real-time notifications via WebSocket.  
Data encryption (AES-256) handled transparently via Sequelize hooks from the `@les-desesperes/ensto-db` shared library.

## 🎯 Architecture Style

✨ **Complete Object-Oriented Programming (OOP) Refactoring** with:
- ✅ Class-based controllers, services, and routes
- ✅ Dependency Injection pattern
- ✅ SOLID principles throughout
- ✅ Global error handling
- ✅ Async error catching
- ✅ Type-safe interfaces

---

## 📚 Quick Links

- 📖 [QUICK_START.md](./QUICK_START.md) - Getting started & Docker setup
- 🏗️ [ARCHITECTURE.md](./ARCHITECTURE.md) - Deep dive into architecture & design patterns
- 🔄 [REFACTORING_SUMMARY.md](./REFACTORING_SUMMARY.md) - Before/after comparison & migration guide
- 🧭 [docs/API.md](./docs/API.md) - Complete route contracts and implementation plan

---

## Tech Stack

| Layer         | Technology                          |
|---------------|--------------------------------------|
| **Runtime**   | Node.js 18+ (ES2022)                |
| **Language**  | TypeScript 5.9                      |
| **Framework** | Express 5.2                         |
| **ORM**       | Sequelize 6.37                      |
| **Database**  | MySQL 8.0 (Docker)                  |
| **DB Models** | `@les-desesperes/ensto-db` v1.1.0   |
| **Encryption** | AES-256-CBC + SHA-256 (crypto)      |
| **Security**  | Helmet 8.1, CORS 2.8                |
| **WebSocket** | ws 8.19                             |
| **Dev Tools** | ts-node-dev 2.0, tsconfig-paths 4.2 |
| **Package**   | pnpm 10.30                          |

---

## 📁 Project Structure

```
src/
├── app.ts                          # App class — Express configuration
├── server.ts                       # Server class — lifecycle management
├── controllers/                    # HTTP request handlers (classes)
│   ├── DeliveryDriverController.ts # Handles /driver endpoints
│   ├── VehicleController.ts        # Handles /vehicle endpoints
│   └── index.ts
├── services/                       # Business logic (classes)
│   ├── DeliveryDriverService.ts    # Driver operations
│   ├── VehicleService.ts           # Vehicle operations
│   └── index.ts
├── routes/                         # Route binding (classes)
│   ├── DeliveryDriverRoute.ts      # Routes for /driver
│   ├── VehicleRoute.ts             # Routes for /vehicle
│   └── index.ts
├── shared/                         # Shared layer
│   ├── interfaces/                 # Contracts (IService, IController, IRoute)
│   ├── middleware/                 # Express middleware
│   ├── utils/                      # Helper functions
│   └── index.ts
├── types/                          # TypeScript definitions
├── utils/                          # Application utilities
└── websockets/                     # WebSocket integration
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm or npm
- MySQL 8.0 (or Docker)

### Installation

```bash
# Clone and install
cd ensto_api
pnpm install

# Create .env file
cat > .env << EOF
PORT=3000
NODE_ENV=development
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=ensto_db
MYSQL_USER=ensto_user
MYSQL_PASSWORD=ensto_pass
EOF

# Start MySQL with Docker
docker-compose up mysql phpmyadmin -d

# Run development server
pnpm dev
```

Access API at **http://localhost:3000**

For detailed setup → See [QUICK_START.md](./QUICK_START.md)

---

## 🏗️ Architecture Overview

### Layered Architecture

```
HTTP Request
    ↓
Express Middleware (helmet, cors, logging, errors)
    ↓
Routes Layer (DeliveryDriverRoute, VehicleRoute)
    ↓
Controllers (DeliveryDriverController, VehicleController)
    ↓
Services (DeliveryDriverService, VehicleService)
    ↓
Database (Sequelize Models with encryption hooks)
    ↓
MySQL (ensto_db)
```

### Class Diagram

```typescript
// Service - Contains business logic
class DeliveryDriverService {
    async getAllDrivers(): Promise<any[]>
    async createDriver(...): Promise<any>
}

// Controller - Depends on Service (Dependency Injection)
class DeliveryDriverController {
    constructor(private service: DeliveryDriverService)
    private async getAllDrivers(req, res): Promise<void>
    public getHandlers()
}

// Route - Creates Service & Controller, binds endpoints
class DeliveryDriverRoute {
    constructor() {
        const service = new DeliveryDriverService();
        const controller = new DeliveryDriverController(service);
        this.router.get('/', controller.getHandlers().getAllDrivers);
    }
    public getRouter(): Router
}
```

### SOLID Principles

| Principle | Implementation |
|-----------|---|
| **S**ingle Responsibility | Each class has one reason to change |
| **O**pen/Closed | Open for extension, closed for modification |
| **L**iskov Substitution | Services/Controllers are interchangeable |
| **I**nterface Segregation | Minimal interfaces (IService, IController, IRoute) |
| **D**ependency Inversion | Depends on abstractions, not concrete implementations |

---

## 🔌 API Endpoints

### Drivers

| Method | Endpoint | Handler | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/driver/` | getAllDrivers | `{ success: true, data: [...] }` |
| POST | `/api/v1/driver/` | createDriver | `{ success: true, data: {...}, message: "..." }` |

**Example - Get Drivers**:
```bash
curl http://localhost:3000/api/v1/driver/
```

**Example - Create Driver**:
```bash
curl -X POST http://localhost:3000/api/v1/driver/ \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "companyId": "comp123",
    "ppeCharterValid": true,
    "ppeSignatureDate": "2024-03-17"
  }'
```

### Vehicles

| Method | Endpoint | Handler | Response |
|--------|----------|---------|----------|
| GET | `/api/v1/vehicle/` | getAllVehicles | `{ success: true, data: [...] }` |
| GET | `/api/v1/vehicle/plate/:licensePlate` | getVehicleByPlate | `{ success: true, data: {...} }` |

**Example - Get Vehicle**:
```bash
curl http://localhost:3000/api/v1/vehicle/plate/ABC123
```

### Health Check
```bash
curl http://localhost:3000/health
```

---

## 📦 Available Scripts

```bash
# Development mode (with hot reload)
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

---

## 🗄️ Database

### Models (from `@les-desesperes/ensto-db`)
- **DeliveryDriver** - Delivery driver records with encryption
- **Vehicle** - Vehicle records with driver associations
- **HistoryLog** - Audit trail

### Encryption
All sensitive fields are automatically encrypted/decrypted via Sequelize hooks:
- **AES-256**: Data encryption
- **SHA-256**: Hash fields

No manual encryption needed!

### Docker Compose

```bash
# Start all services
docker-compose up -d

# MySQL + phpMyAdmin
# API at http://localhost:3000
# phpMyAdmin at http://localhost:8080

# View logs
docker-compose logs -f

# Stop all
docker-compose down
```

For custom credentials → See [QUICK_START.md](./QUICK_START.md)

---

## 🔐 Security Features

- ✅ **Helmet.js** - Secure HTTP headers
- ✅ **CORS** - Cross-Origin Resource Sharing
- ✅ **AES-256 Encryption** - Sensitive data protection
- ✅ **SHA-256 Hashing** - Field hashing via Sequelize
- ✅ **Error Handling** - Graceful error responses
- ✅ **Environment Variables** - Sensitive config from `.env`

---

## 🧪 Testing

All layers support testing via dependency injection:

```typescript
// Mock service for testing controller
const mockService = {
    getAllDrivers: jest.fn().mockResolvedValue([])
};

// Inject mock into controller
const controller = new DeliveryDriverController(mockService);

// Test handler
const handlers = controller.getHandlers();
await handlers.getAllDrivers(req, res);

expect(mockService.getAllDrivers).toHaveBeenCalled();
```

---

## 📚 Detailed Documentation

- **[QUICK_START.md](./QUICK_START.md)** - Setup, Docker, endpoints, troubleshooting
- **[docs/API.md](./docs/API.md)** - Full endpoint contract (params, body, auth, responses)

---

## ❓ Common Issues

### MySQL Connection Error
```
Access denied for user 'ensto_user'@'192.168.65.1'
```
**Solution**: Verify `.env` credentials match MySQL user/password

### Encryption Error
```
error:1C80006B:Provider routines::wrong final block length
```
**Solution**: Check database credentials are correct; clear & reseed data

### TypeScript Build Error
```
Cannot find module '@/...'
```
**Solution**: Ensure `tsconfig-paths/register` in dev script (already configured)

See [QUICK_START.md](./QUICK_START.md) for more troubleshooting

---

## 🎯 Next Steps

1. **Setup**: Follow [QUICK_START.md](./QUICK_START.md)
2**Develop**: Add validation (Zod), authentication (JWT), testing
3**Deploy**: Setup CI/CD, monitoring, logging

---

## 📄 License

ISC

---
