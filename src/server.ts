import http from 'http';
import app from '@/app';
import { EnstoDatabase } from '@les-desesperes/ensto-db';
import { initializeWebSocket } from '@/websockets';

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
                console.log(
                    `🚀 Server is running in ${process.env.NODE_ENV || 'development'} mode`
                );
                console.log(`📍 http://localhost:${this.port}`);
                console.log(`💬 WebSocket is ready for connections`);
            });

            // Graceful shutdown
            process.on('SIGINT', async () => {
                console.log('\n⏹️  Shutting down gracefully...');
                server.close(() => {
                    console.log('✅ Server shut down');
                    process.exit(0);
                });
            });
        } catch (error) {
            console.error('❌ Failed to start the server:', error);
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
            console.log('✅ Connected to MySQL database.');

            // Initialize models
            db.initDefaultModels();
            await db.sync({ alter: true });

            console.log('✅ All database tables synchronized.');
        } catch (error) {
            await db.close();
            console.error('❌ Failed to connect to database:', error);
            throw error;
        }
    }
}

// Start the server
const server = new Server();
server.start();
