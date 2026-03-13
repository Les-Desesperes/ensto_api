import { WsHandler } from '@/types';

export const handlePing: WsHandler = (ws, payload, clients) => {
    console.log('Received PING, sending PONG');

    ws.send(JSON.stringify({
        type: 'PONG',
        message: 'Server is alive!',
        timestamp: new Date().toISOString()
    }));
};