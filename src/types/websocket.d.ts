import { WebSocket } from 'ws';

// Define the standard structure of all incoming/outgoing messages
export interface WsMessage {
    type: string;
    payload?: any;
}

// Define the signature for handler functions
export type WsHandler = (
    ws: WebSocket,
    payload: any,
    clients: Set<WebSocket> // Pass the active clients for broadcasting
) => void;