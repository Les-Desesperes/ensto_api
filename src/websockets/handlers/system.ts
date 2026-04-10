import { WsHandler } from '@/types';
import logger from '@/shared/logger';

export const handlePing: WsHandler = (ws, payload, clients) => {
    logger.debug('Received PING event, sending PONG response');

    ws.send(JSON.stringify({
        type: 'PONG',
        message: 'Server is alive!',
        timestamp: new Date().toISOString()
    }));
};