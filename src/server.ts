import http from 'http';
import app from './app';
import { EnstoDatabase } from "@les-desesperes/ensto-db";
import {initializeWebSocket} from "@/websockets";

const PORT = process.env.PORT || 3000;

// 1. Create a standard HTTP server wrapping your Express app
const server = http.createServer(app);

// 2. Attach the WebSocket server to that HTTP server
initializeWebSocket(server);

const startServer = async () => {
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
        await db.authenticate();
        console.log('✅ Connected to MySQL database.');

        // Initialize models BEFORE syncing so Sequelize knows what tables to create/alter
        db.initDefaultModels();
        await db.sync({ alter: true });

        console.log('✅ All database tables synchronized.');

        // 3. Start the HTTP server (which runs both Express and WebSockets)
        server.listen(PORT, () => {
            console.log(`🚀 Server is running in ${process.env.NODE_ENV} mode on http://localhost:${PORT}`);
        });
    } catch (error) {
        await db.close();
        console.error('❌ Failed to start the server or sync database:', error);
        process.exit(1);
    }
};

startServer();