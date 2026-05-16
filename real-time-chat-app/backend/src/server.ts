import WebSocket, { WebSocketServer } from 'ws';
import { config } from '../config';
import { init, connectUser, disconnectUser } from './services/messageService';
import { IConnection, IClientMessage } from './types/message.types';
import { activeConnections } from './db/store';

const { PORT, HOST } = config;
const wss = new WebSocketServer({ port: PORT });

// Improve the logs for each session
wss.on('connection', (ws: WebSocket) => {
    console.log(`[${new Date().toISOString()}] New Connection`);
    init(wss);
    
    ws.on('error', console.error);

    // On message we have to control which client is sending message and for who is to send the message;
    ws.on('message', (data: Buffer, isBinary: boolean | undefined) => {
        try {
            const parsedData: IClientMessage = JSON.parse(data.toString());

            // This works as a connection validation
            if (parsedData.type === 'connect_user') {
                console.log('chegou connect')
                // update DB with new user (active users)
                connectUser(ws, parsedData, isBinary)
    
                return;
            }
    
            if (parsedData.type === 'disconnect_user') { 
                // remove user from DB (active users)
                disconnectUser(ws, parsedData, isBinary);

                return;
            }
    
            // Create system to receive, save, and send messages to users
            if (parsedData.type === 'new_message') {
                // This section will process every received message;
    
                // Use case 1 - User A send msg to User B
                // Find User A and save message sended to user B
                // Find User B and save message received from user A
                // Send message to user B
            }
        } catch (e) {
            // Since we have FE message control, this could be redundant
            // In other hand this is kind of defensive programming 
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ 
                    type: 'error',
                     message: 'Invalid message format' 
                }));
            } else {
                console.log(`[${new Date().toISOString()}][Error] Malformed message received on closed socket`);
            }
        }
    });

     ws.on('close', () => {
        // Remove user from DB (users)
        const userIdx = activeConnections.findIndex((connection: IConnection) => connection.ws === ws);

        if (userIdx !== -1) {
            console.log(`[${new Date().toISOString()}] User Name-${activeConnections[userIdx].user.id} has disconnected`);
            
            activeConnections.splice(userIdx, 1);
        }

        console.log(`[${new Date().toISOString()}] Socket Closed`);
        console.log(activeConnections.map(u => u.user))
    });
});

console.log(`Server running at: ws://${HOST}:${PORT}`);
