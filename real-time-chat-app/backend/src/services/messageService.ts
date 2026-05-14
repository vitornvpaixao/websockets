import WebSocket, { Server, WebSocketServer } from "ws";
import { User } from "../models/User";
import { IConnection, IClientMessage } from "../types/message.types";
import { users, activeConnections } from "../db/strore";

let _wss: WebSocketServer;

export const init = (wss: WebSocketServer) => {
    _wss = wss;
}
// TODO: Improve logs and some code (DRY)
export const connectUser = (ws: WebSocket, data: IClientMessage, isBinary: boolean | undefined) => {
    const { userId, name } = data;
    let user: User | undefined = users.find((user) => user.id === userId)
    // If no user create one | if exists but keep going
    if (!user) {
        user = new User(userId, name);
        
        // Historic in future | Users with open socket
        users.push(user);
    }
    

    if (!user.isConnected) {
        const client: IConnection = {
            ws,
            user
        }

        user.connectUser(true);
        activeConnections.push(client)
    }
    
    console.log(`[${new Date().toISOString()}] New user connected:`);
    console.log(`[${new Date().toISOString()}]  - User Id: ${user.id}`);
    console.log(`[${new Date().toISOString()}]  - User Name: ${user.name}`);

    // Send connection confirmation to client ws
    ws.send(JSON.stringify({
        type: 'connect_user',
    }))

    // Send for each connected user the other user lists
    // TODO - Abstract this to one function, like: sendGeneralMessages
    _wss.clients.forEach(cli => {
        // Send active users to clients - except himself
        const wsCli = activeConnections.find((connection: IConnection) => connection.ws === cli)
        const activeUsers = activeConnections
            .filter(connection => connection.user.id !== wsCli?.user.id)
            .map(us => `${us.user.name} - ${us.user.isConnected ? 'Online' : 'Offline'}`);
        
        // Send active users for all websockect connections
        if (wsCli && activeUsers.length > 0 && cli.readyState === WebSocket.OPEN) {
            cli.send(JSON.stringify({
                type: 'available_users',
                users: activeUsers
            }), 
            {binary: isBinary}, 
            (err) => {
                if (err) console.error('WS send error: ', err);
            });
            
            console.log(`[${new Date().toISOString()}][Connect] Sended to ${wsCli?.user.name} users list: ${activeUsers}`);
        }
    })

    console.log('[Connect] Active Connections: ', activeConnections.map(user => user.user));
    console.log('[Connect] Registered users: ', users);
}

export const disconnectUser = (ws: WebSocket, data: IClientMessage, isBinary: boolean | undefined) => {
    const { userId } = data;
    let user: User | undefined = users.find((user) => user.id === userId)

    // Send connection confirmation to client ws
    ws.send(JSON.stringify({
        type: 'disconnect_user',
    }))

    user?.connectUser(false);
        
    // Send for each connected user the other user lists
    // TODO - Abstract this to one function, like: sendGeneralMessages
    // TODO - Analyse if send and empty array when is disconnected. 
    _wss.clients.forEach(cli => {
        // Send active users to clients - except himself
        const wsCli = activeConnections.find((connection: IConnection) => connection.ws === cli)
        // existing users and their online and offline status
        const activeUsers = activeConnections
            .filter(connection => connection.user.id !== wsCli?.user.id)
            .map(us => `${us.user.name} - ${us.user.isConnected ? 'Online' : 'Offline'}`);
        
        // Send active users for all websockect connections
        if (activeUsers.length >= 0 && cli.readyState === WebSocket.OPEN) {
            cli.send(JSON.stringify({
                type: 'available_users',
                users: activeUsers
            }), 
            {binary: isBinary}, 
            (err) => {
                if (err) console.error('WS send error: ', err);
            });
            
            console.log(`[${new Date().toISOString()}][Disconnect] Sended to ${wsCli?.user.name} users list: ${activeUsers}`);
        }
    })

    const userIdx = activeConnections.findIndex((connection: IConnection) => connection.ws === ws);
    activeConnections.splice(userIdx, 1);
    console.log(`[${new Date().toISOString()}][Disconnect] User ${user?.name} is disconnected/offline`);
    console.log('[Disconnect] Active Connections: ', activeConnections.map(user => user.user));
    console.log('[Disconnect] Registered users: ', users);
}
