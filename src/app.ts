import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import apiRoutes from '@/routes';
import { authMiddleware, errorHandler } from '@/shared/middleware';
import { requestLogger } from '@/shared/logger';
import { SwaggerConfig } from '@/config/SwaggerConfig';

/**
 * App Class
 * Encapsulates the Express application setup, middleware registration, and route mounting.
 * This class represents the entire Express application lifecycle.
 * 
 * SOLID Principles:
 * - Single Responsibility: Only manages Express app configuration
 * - Open/Closed: Open for extension (can add new middleware/routes), closed for modification
 */
export class App {
    private app: Application;
    private swaggerConfig: SwaggerConfig;

    /**
     * Constructor
     * Initializes the Express application and registers all middlewares
     */
    constructor() {
        dotenv.config();
        this.app = express();
        this.swaggerConfig = new SwaggerConfig();
        this.setupMiddlewares();
        this.setupRoutes();
        this.setupErrorHandling();
    }

    /**
     * Setup all middlewares
     * This includes security (helmet), CORS, body parsing, etc.
     */
    private setupMiddlewares(): void {

        // Security middleware. Keep HSTS/CSP for production only to avoid breaking local/demo hosts without TLS.
        const isProduction = process.env.NODE_ENV === 'production';
        this.app.use(
            helmet({
                contentSecurityPolicy: isProduction,
                hsts: isProduction,
            })
        );

        // CORS middleware
        this.app.use(cors());

        // Body parsing middleware
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(cookieParser());

        // Request logging middleware (pino)
        this.app.use(requestLogger);

        // Protect API routes with JWT auth (public routes are bypassed inside middleware)
        this.app.use('/api/v1', authMiddleware);
    }

    /**
     * Setup all routes
     */
    private setupRoutes(): void {
        this.swaggerConfig.initialize(this.app);

        // Mount API routes
        this.app.use('/api/v1', apiRoutes);

        // Health check route
        this.app.get('/health', (req: Request, res: Response) => {
            res.status(200).json({
                status: 'OK',
                message: 'Server is running',
                timestamp: new Date().toISOString(),
            });
        });

        // Catch-all route for undefined endpoints
        this.app.use((req: Request, res: Response) => {
            res.status(404).json({
                success: false,
                message: 'Endpoint not found',
            });
        });
    }

    /**
     * Setup error handling middleware
     * Must be registered after all other middleware and routes
     */
    private setupErrorHandling(): void {
        this.app.use(errorHandler);
    }

    /**
     * Get the Express application instance
     * @returns The configured Express application
     */
    public getApp(): Application {
        return this.app;
    }
}

export default new App().getApp();
