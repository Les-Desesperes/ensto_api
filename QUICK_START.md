# Quick Start Guide

## Project Setup

### Installation
```bash
cd ensto_api
pnpm install
```

### Environment Variables
Create a `.env` file in the root directory with your MySQL credentials:

```env
PORT=3000
NODE_ENV=development

# MySQL Configuration
MYSQL_HOST=mysql
MYSQL_PORT=3306
MYSQL_DATABASE=ensto_db
MYSQL_USER=ensto_user
MYSQL_PASSWORD=ensto_pass
```

### Running the Application

**Development Mode** (with hot reload):
```bash
pnpm dev
```

**Production Build**:
```bash
pnpm build
pnpm start
```

## API Endpoints

### Driver Routes
- `GET /api/v1/driver/` - Get all drivers
- `POST /api/v1/driver/` - Create a new driver

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

### Vehicle Routes
- `GET /api/v1/vehicle/` - Get all vehicles
- `GET /api/v1/vehicle/plate/:licensePlate` - Get vehicle by license plate

**Example - Get Vehicle**:
```bash
curl http://localhost:3000/api/v1/vehicle/plate/ABC123
```

### Health Check
- `GET /health` - Server health status

```bash
curl http://localhost:3000/health
```

## Exporting Router as Named Export

### Current Pattern (in routes/index.ts)
```typescript
// src/routes/index.ts
const router = Router();
export default router;
```

### To Export Router as Named Export (vehicleRouter):

**Option 1: Named export in the Route class**
```typescript
// src/routes/VehicleRoute.ts
export class VehicleRoute implements IRoute {
    private router: Router;
    
    constructor() {
        this.router = Router();
        this.initializeRoutes();
    }
    
    getRouter(): Router {
        return this.router;
    }
}

// Export router as named export
export const vehicleRouter = new VehicleRoute().getRouter();
```

**Then use in routes/index.ts**:
```typescript
import { vehicleRouter } from './VehicleRoute';
import { driverRouter } from './DeliveryDriverRoute';

const router = Router();

router.get('/', (req, res) => {
    res.json({ message: 'Welcome to the API' });
});

router.use('/driver', driverRouter);
router.use('/vehicle', vehicleRouter);

export default router;
```

**Option 2: Export from Route class method**
```typescript
// src/routes/index.ts
import { DeliveryDriverRoute } from './DeliveryDriverRoute';
import { VehicleRoute } from './VehicleRoute';

const router = Router();

const driverRoute = new DeliveryDriverRoute();
const vehicleRoute = new VehicleRoute();

// Get routers as named exports
export const driverRouter = driverRoute.getRouter();
export const vehicleRouter = vehicleRoute.getRouter();

router.get('/', (req, res) => {
    res.json({ message: 'Welcome to the API' });
});

// Mount the routers
router.use('/driver', driverRouter);
router.use('/vehicle', vehicleRouter);

export default router;
```

**Option 3: Create separate router files**
```typescript
// src/routes/vehicleRouter.ts
import { VehicleRoute } from './VehicleRoute';

export const vehicleRouter = new VehicleRoute().getRouter();

// src/routes/driverRouter.ts
import { DeliveryDriverRoute } from './DeliveryDriverRoute';

export const driverRouter = new DeliveryDriverRoute().getRouter();

// src/routes/index.ts
import { vehicleRouter } from './vehicleRouter';
import { driverRouter } from './driverRouter';

const router = Router();

router.get('/', (req, res) => {
    res.json({ message: 'Welcome to the API' });
});

router.use('/driver', driverRouter);
router.use('/vehicle', vehicleRouter);

export default router;
```

## Docker Compose Setup

### MySQL + phpMyAdmin with Environment Variables

Create a `docker-compose.yml`:

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: ensto_mysql
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD:-root_pass}
      MYSQL_DATABASE: ${MYSQL_DATABASE:-ensto_db}
      MYSQL_USER: ${MYSQL_USER:-ensto_user}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD:-ensto_pass}
    ports:
      - "${MYSQL_PORT:-3306}:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./mock_data.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - ensto_network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  phpmyadmin:
    image: phpmyadmin:latest
    container_name: ensto_phpmyadmin
    restart: always
    environment:
      PMA_HOST: ${MYSQL_HOST:-mysql}
      PMA_USER: ${MYSQL_USER:-ensto_user}
      PMA_PASSWORD: ${MYSQL_PASSWORD:-ensto_pass}
      PMA_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD:-root_pass}
    ports:
      - "8080:80"
    depends_on:
      mysql:
        condition: service_healthy
    networks:
      - ensto_network

  api:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: ensto_api
    restart: always
    environment:
      NODE_ENV: ${NODE_ENV:-development}
      PORT: ${PORT:-3000}
      MYSQL_HOST: ${MYSQL_HOST:-mysql}
      MYSQL_PORT: ${MYSQL_PORT:-3306}
      MYSQL_DATABASE: ${MYSQL_DATABASE:-ensto_db}
      MYSQL_USER: ${MYSQL_USER:-ensto_user}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD:-ensto_pass}
    ports:
      - "${PORT:-3000}:3000"
    depends_on:
      mysql:
        condition: service_healthy
    volumes:
      - .:/app
      - /app/node_modules
    networks:
      - ensto_network
    command: npm run dev

volumes:
  mysql_data:

networks:
  ensto_network:
    driver: bridge
```

### Environment File for Docker (`.env.docker`)

```env
# Server
NODE_ENV=development
PORT=3000

# MySQL
MYSQL_HOST=mysql
MYSQL_PORT=3306
MYSQL_ROOT_PASSWORD=root_pass
MYSQL_DATABASE=ensto_db
MYSQL_USER=ensto_user
MYSQL_PASSWORD=ensto_pass
```

### Running with Docker Compose

```bash
# Using custom env file
docker-compose --env-file .env.docker up -d

# Or simply
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down

# Remove volumes
docker-compose down -v
```

### Access Services

- **API**: http://localhost:3000
- **phpMyAdmin**: http://localhost:8080
  - Username: `ensto_user`
  - Password: `ensto_pass`
  - Server: `mysql`

## Logging Database Credentials

To log database credentials when the app starts, add this to `src/server.ts`:

```typescript
private async initializeDatabase(): Promise<void> {
    const config = {
        database: process.env.MYSQL_DATABASE,
        username: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        host: process.env.MYSQL_HOST,
        port: Number(process.env.MYSQL_PORT) || 3306,
    };

    // Log credentials (only in development)
    if (process.env.NODE_ENV === 'development') {
        console.log('📊 Database Configuration:');
        console.log(`   Host: ${config.host}`);
        console.log(`   Port: ${config.port}`);
        console.log(`   Database: ${config.database}`);
        console.log(`   User: ${config.username}`);
        console.log(`   Password: ${config.password ? '***' : 'not set'}`);
    }

    const db = new EnstoDatabase({ connection: config });
    // ... rest of initialization
}
```

## Common Issues

### MySQL Grant Syntax Error

**Error**: `You have an error in your SQL syntax; ... IDENTIFIED BY ...`

This occurs on MySQL 8.0+. Use the correct syntax:

```sql
CREATE USER 'ensto_user'@'%' IDENTIFIED BY 'ensto_pass';
GRANT ALL PRIVILEGES ON ensto_db.* TO 'ensto_user'@'%';
FLUSH PRIVILEGES;
```

Or in Docker, set environment variables:
```yaml
environment:
  MYSQL_USER: ensto_user
  MYSQL_PASSWORD: ensto_pass
```

### Encryption Error: "wrong final block length"

**Error**: `error:1C80006B:Provider routines::wrong final block length`

This occurs when the encryption key doesn't match the encrypted data. Ensure:
1. The encryption key in the `@les-desesperes/ensto-db` package is consistent
2. The database credentials are correct
3. Clear and regenerate encrypted data if necessary

### Access Denied for User

**Error**: `Access denied for user 'ensto_user'@'192.168.65.1'`

Solutions:
1. Verify MySQL credentials in `.env`
2. Ensure MySQL is running: `docker-compose logs mysql`
3. Check user permissions: `GRANT ALL PRIVILEGES ON ensto_db.* TO 'ensto_user'@'%';`
4. For Docker, use hostname `mysql` not `localhost`

## Project Files Overview

| File | Purpose |
|------|---------|
| `src/server.ts` | Server lifecycle management |
| `src/app.ts` | Express app configuration |
| `src/controllers/` | HTTP request handlers |
| `src/services/` | Business logic |
| `src/routes/` | Route bindings |
| `src/shared/` | Shared utilities & middleware |
| `docker-compose.yml` | Docker services configuration |
| `.env` | Environment variables |
| `ARCHITECTURE.md` | Detailed architecture documentation |
| `REFACTORING_SUMMARY.md` | Migration guide from functional to OOP |

## Next Steps

1. Read `ARCHITECTURE.md` for detailed information
2. Read `REFACTORING_SUMMARY.md` for migration details
3. Add input validation with Zod
4. Implement JWT authentication
5. Add comprehensive test suite
6. Setup API documentation with Swagger

## Support

For detailed information about:
- Architecture and design patterns → See `ARCHITECTURE.md`
- What changed during refactoring → See `REFACTORING_SUMMARY.md`
- Adding new features → See `ARCHITECTURE.md` section "Adding New Features"
- Testing strategy → See `ARCHITECTURE.md` section "Testing Strategy"

