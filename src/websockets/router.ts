import { WebSocket, WebSocketServer } from 'ws';
import { WsMessage } from '@/types';
import { handlePing } from './handlers/system';
import { handleChat } from './handlers/chat';
import logger from '@/shared/logger';

export const routeMessage = (ws: WebSocket, messageStr: string, wss: WebSocketServer) => {
    try {
        const parsedData: WsMessage = JSON.parse(messageStr);

        switch (parsedData.type) {
            case 'PING':
                handlePing(ws, parsedData.payload, wss.clients);
                break;

            case 'CHAT_MESSAGE':
                handleChat(ws, parsedData.payload, wss.clients);
                break;

            // Add more cases here as your app grows
            // case 'DRIVER_UPDATE':
            //   handleDriverUpdate(ws, parsedData.payload, wss.clients);
            //   break;

            default:
                logger.warn({ eventType: parsedData.type }, 'Unhandled WebSocket event type');
                ws.send(JSON.stringify({ type: 'ERROR', message: `Unknown event type: ${parsedData.type}` }));
                break;
        }
    } catch (error) {
        logger.error({ err: error, messageStr }, 'Failed to parse WebSocket message');
        ws.send(JSON.stringify({ type: 'ERROR', message: 'Invalid JSON format. Expected { "type": "...", "payload": {...} }' }));
    }
};