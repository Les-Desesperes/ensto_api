import { WebSocket, WebSocketServer } from 'ws';
import { WsMessage } from '@/types';
import { handlePing } from './handlers/system';
import { handleChat } from './handlers/chat';

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
                console.warn(`⚠️ Unhandled WebSocket event type: ${parsedData.type}`);
                ws.send(JSON.stringify({ type: 'ERROR', message: `Unknown event type: ${parsedData.type}` }));
                break;
        }
    } catch (error) {
        console.error('Failed to parse WebSocket message:', messageStr);
        ws.send(JSON.stringify({ type: 'ERROR', message: 'Invalid JSON format. Expected { "type": "...", "payload": {...} }' }));
    }
};