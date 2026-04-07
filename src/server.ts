import http from 'http';
import app from '@/app';
import { EnstoDatabase } from '@les-desesperes/ensto-db';
import { initializeWebSocket } from '@/websockets';
import logger from '@/shared/logger';

/**
 * Server Class
 * Orchestrates the application startup, including database initialization,
 * HTTP server creation, and WebSocket integration.
 * 
 * SOLID Principles:
 * - Single Responsibility: Only manages server lifecycle
 * - Dependency Inversion: Depends on injected components (App, Database, WebSocket)
 */
class Server {
    private port: number = Number(process.env.PORT) || 3000;

    private parseBoolean(value: string | undefined): boolean {
        if (!value) {
            return false;
        }

        return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
    }

    /**
     * Start the server
     * Initializes the database, creates the HTTP server, and starts listening
     */
    async start(): Promise<void> {
        try {
            // 1. Initialize database
            await this.initializeDatabase();

            // 2. Create HTTP server with Express app
            const server = http.createServer(app);

            // 3. Initialize WebSocket
            initializeWebSocket(server);

            // 4. Start listening
            server.listen(this.port, () => {
                logger.info({ env: process.env.NODE_ENV || 'development', port: this.port }, '🚀 Server is running');
                logger.info({ url: `http://localhost:${this.port}` }, '📍 Server URL');
                logger.info('💬 WebSocket is ready for connections');
            });

            // Graceful shutdown
            process.on('SIGINT', async () => {
                logger.info('\n⏹️  Shutting down gracefully...');
                server.close(() => {
                    logger.info('✅ Server shut down');
                    process.exit(0);
                });
            });
        } catch (error) {
            logger.error({ err: error }, '❌ Failed to start the server:');
            process.exit(1);
        }
    }

    /**
     * Initialize the database connection and sync models
     */
    private async initializeDatabase(): Promise<void> {
        const db = new EnstoDatabase({
            connection: {
                database: process.env.MYSQL_DATABASE,
                username: process.env.MYSQL_USER,
                password: process.env.MYSQL_PASSWORD,
                host: process.env.MYSQL_HOST,
                port: Number(process.env.MYSQL_PORT) || 3306,
                logging: false,
                dialect: 'mysql',
            },
        });

        try {
            // Authenticate database connection
            await db.authenticate();
            logger.info('✅ Connected to MySQL database.');

            // Initialize models
            db.initDefaultModels();
            const enableAlterSync = this.parseBoolean(process.env.DB_SYNC_ALTER);

            if (enableAlterSync && process.env.NODE_ENV === 'production') {
                logger.warn('DB_SYNC_ALTER=true ignored in production for safety.');
            }

            const useAlterSync = enableAlterSync && process.env.NODE_ENV !== 'production';
            await db.sync(useAlterSync ? { alter: true } : undefined);

            logger.info({ alter: useAlterSync }, 'Database sync completed');

            logger.info('✅ All database tables synchronized.');
        } catch (error) {
            await db.close();
            logger.error({ err: error }, '❌ Failed to connect to database:');
            throw error;
        }
    }
}

// Start the server
const server = new Server();
server.start();
