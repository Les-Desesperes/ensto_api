import { WsHandler } from '@/types';
import { WebSocket } from 'ws';

export const handleChat: WsHandler = (ws, payload, clients) => {
    console.log('Chat message received:', payload);

    // Broadcast the chat message to all OTHER connected clients
    clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                type: 'NEW_CHAT_MESSAGE',
                payload: {
                    user: payload?.user || 'Anonymous',
                    text: payload?.text || '',
                    timestamp: new Date().toISOString()
                }
            }));
        }
    });
};