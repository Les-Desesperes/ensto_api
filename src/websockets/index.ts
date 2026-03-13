import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { routeMessage } from './router';

let wss: WebSocketServer;

export const initializeWebSocket = (server: HttpServer) => {
    wss = new WebSocketServer({ server });

    wss.on('connection', (ws: WebSocket) => {
        console.log('✅ New WebSocket client connected');

        // Welcome message
        ws.send(JSON.stringify({
            type: 'SYSTEM_READY',
            message: 'Connected to Ensto Notification System'
        }));

        // Pass incoming messages directly to the router
        ws.on('message', (message: Buffer | string) => {
            // Convert Buffer to string if necessary
            const messageStr = message.toString();
            routeMessage(ws, messageStr, wss);
        });

        ws.on('close', () => {
            console.log('❌ WebSocket client disconnected');
        });

        ws.on('error', (error) => {
            console.error('⚠️ WebSocket Error:', error);
        });
    });

    console.log('🔌 WebSocket server initialized');
};

// Exported for use inside standard Express controllers (e.g., driverController.ts)
export const broadcastNotification = (data: any) => {
    if (!wss) {
        console.warn('WebSocket server is not initialized yet.');
        return;
    }

    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
};