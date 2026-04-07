import { Application } from 'express';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc, { Options } from 'swagger-jsdoc';

export class SwaggerConfig {
    private getServers() {
        const configuredServers = process.env.SWAGGER_SERVERS
            ?.split(',')
            .map((server) => server.trim())
            .filter(Boolean)
            .map((url) => ({
                url,
                description: url.includes('localhost') ? 'Local server' : 'Configured server',
            }));

        if (configuredServers && configuredServers.length > 0) {
            return configuredServers;
        }

        const fallbackUrl = process.env.API_BASE_URL || 'http://localhost:3000';

        return [
            {
                url: fallbackUrl,
                description: fallbackUrl.includes('localhost') ? 'Local server' : 'Configured server',
            },
        ];
    }

    private readonly options: Options = {
        definition: {
            openapi: '3.0.3',
            info: {
                title: 'Ensto API',
                version: '1.0.0',
                description: 'Express + TypeScript OOP API documentation',
            },
            servers: this.getServers(),
            components: {
                securitySchemes: {
                    BearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT',
                        description: 'Paste your JWT token',
                    },
                },
                schemas: {
                    SuccessResponse: {
                        type: 'object',
                        properties: {
                            success: { type: 'boolean', example: true },
                            message: { type: 'string', example: 'Optional success message' },
                            data: {
                                description: 'Endpoint-specific payload',
                                oneOf: [{ type: 'object' }, { type: 'array', items: { type: 'object' } }, { type: 'string' }, { type: 'number' }, { type: 'boolean' }, { type: 'null' }],
                            },
                        },
                        required: ['success'],
                    },
                    ErrorResponse: {
                        type: 'object',
                        properties: {
                            success: { type: 'boolean', example: false },
                            message: { type: 'string', example: 'Internal Server Error' },
                        },
                        required: ['success', 'message'],
                    },
                    StoreTempPlateBody: {
                        type: 'object',
                        properties: {
                            licensePlate: { type: 'string', example: 'AA-123-BB' },
                        },
                        required: ['licensePlate'],
                    },
                },
            },
            tags: [
                { name: 'System', description: 'System endpoints' },
                { name: 'Driver', description: 'Delivery driver endpoints' },
                { name: 'Vehicle', description: 'Vehicle endpoints' },
                { name: 'Employee', description: 'Employee endpoints' },
                { name: 'Visitor', description: 'Visitor endpoints' },
                { name: 'HistoryLog', description: 'History log endpoints' },
                { name: 'Company', description: 'Company endpoints' },
            ],
        },
        apis: ['src/routes/*.ts', 'src/controllers/*.ts'],
    };

    private readonly spec = swaggerJSDoc(this.options);

    public initialize(app: Application): void {
        app.use(
            '/docs',
            helmet({ contentSecurityPolicy: false }),
            swaggerUi.serve,
            swaggerUi.setup(this.spec, {
                explorer: true,
                swaggerOptions: {
                    persistAuthorization: true,
                },
            })
        );

        app.get('/docs.json', (_req, res) => {
            res.status(200).json(this.spec);
        });
    }
}


