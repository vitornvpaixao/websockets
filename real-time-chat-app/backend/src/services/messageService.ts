import WebSocket, { Server, WebSocketServer } from "ws";
import { User } from "../models/User";
import { IConnection, IClientMessage } from "../types/message.types";
import { registeredUsers, activeConnections } from "../db/store";

// TODO: Improve logs and some code (DRY)
export const connectUser = (wss: WebSocketServer, ws: WebSocket, data: IClientMessage, isBinary: boolean | undefined) => {
    const { userId, name } = data;
    let user: User | undefined = registeredUsers.find((user) => user.id === userId)
    
    // If no user create one | if exists but keep going
    if (!user) {
        user = new User(userId!, name!);
        
        // Historic in future | Users with open socket
        registeredUsers.push(user);
    }
    
    if (!user.isConnected) {
        const client: IConnection = {
            ws,
            user
        }

        user.setConnectionStatus(true);
        activeConnections.push(client)
    }
    
    console.log(`[${new Date().toISOString()}] New user connected:`);
    console.log(`[${new Date().toISOString()}]  - User Id: ${user.id}`);
    console.log(`[${new Date().toISOString()}]  - User Name: ${user.name}`);

    broadcastConnectionStatus(ws, true);

    // Send for each connected user the other user lists
    broadcastActiveUsers(wss, isBinary, true);

    console.log('[Connect] Active Connections: ', activeConnections.map(user => user.user));
    console.log('[Connect] Registered users: ', registeredUsers);
}

export const disconnectUser = (wss: WebSocketServer, ws: WebSocket, data: IClientMessage, isBinary: boolean | undefined) => {
    const { userId } = data;
    let user: User | undefined = registeredUsers.find((user) => user.id === userId)

    user?.setConnectionStatus(false);
    broadcastConnectionStatus(ws, false);

    // Send for each connected user the other users list
    broadcastActiveUsers(wss, isBinary, false);

    const userIdx = activeConnections.findIndex((connection: IConnection) => connection.ws === ws);
    if (userIdx !== -1) {
        activeConnections.splice(userIdx, 1);
        console.log(`[${new Date().toISOString()}][Disconnect] User ${user?.name} is disconnected/offline`);
    }

    console.log('[Disconnect] Active Connections: ', activeConnections.map(user => user.user));
    console.log('[Disconnect] Registered users: ', registeredUsers);
}

export const broadcastActiveUsers = (wss: WebSocketServer, isBinary: boolean | undefined, isToConnect: boolean) => {
    wss.clients.forEach(cli => {
        // Send active users to clients - except himself
        // Existing users and their online and offline status
        const wsCli = activeConnections.find((connection: IConnection) => connection.ws === cli)
        const activeUsers = activeConnections
            .filter(connection => connection.user.id !== wsCli?.user.id)
            .map(us => `${us.user.name} - ${us.user.isConnected ? 'Online' : 'Offline'}`);
        
        // Send active users for all websockect connections
        if (cli.readyState === WebSocket.OPEN) {
            cli.send(JSON.stringify({
                type: 'available_users',
                users: activeUsers
            }), 
            {binary: isBinary}, 
            (err) => {
                if (err) console.error('WS send error: ', err);
            });
            
            console.log(`[${new Date().toISOString()}][${isToConnect ? 'Connect' : 'Disconnect'}] Sent to ${wsCli?.user.name} users list: ${activeUsers}`);
        }
    })
}

const broadcastConnectionStatus = (ws: WebSocket, isToConnect: boolean) => {
    const type = isToConnect ? 'Connect' : 'Disconnect';
    
    if (ws.readyState === WebSocket.OPEN) {
        console.log(`[${new Date().toISOString()}][${type}] Sent confirmation to client`);
        const msgType: IClientMessage = {
            type: `${type.toLowerCase()}_user` as 'connect_user' | 'disconnect_user',
        };

        // Send connection confirmation to client
        ws.send(JSON.stringify(msgType));
    } else {
        console.log(`[${new Date().toISOString()}][${type}] Could not send confirmation - socket is closed`);
    }
}
