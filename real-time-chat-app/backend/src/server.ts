import WebSocket, { WebSocketServer } from 'ws';
import { config } from '../config';

const { PORT, HOST } = config;
const wss = new WebSocketServer({ port: PORT });

const activeConnections: Connection[] = [];
const users: User[] = [];

interface Connection {
    ws: WebSocket,
    user: User
}

interface User {
    id: string | number;
    name: string;
    connectAt: Date;
    isConnected: boolean;
    conversations: Conversation[];
}

interface Conversation {
    userId: string | number;
    messages: Message[];
}

interface Message {
    type: string; 
    date: Date;
    text: string;
}

class User {
    constructor(userId: string, name: string) {
        this.id = userId;
        this.name = name;
        this.connectAt = new Date();
        this.isConnected = false;
        this.conversations = [];
    }

    connectUser(isConnected: boolean) {
        this.isConnected = isConnected;
    }

    addNewConversation(toUserId: string,) {
        const conversation: Conversation = {
            userId: toUserId,
            messages: []
        }

        this.conversations.push(conversation);
    }

    addMessage(userId: string, type: string, text: string) {
        const msg: Message = {
            type,
            date: new Date(),
            text
        }

        this.conversations.find(c => c.userId === userId)?.messages.push(msg);
    }
}

// improve the logs for each needed section. We must have a way to control users logged, when and who!
wss.on('connection', (ws: WebSocket) => {
    console.log(`[${new Date().toISOString()}] New Connection`);
    
    ws.on('error', console.error);

    // On message we have to control wich client is sending message and for who is to send the message;
    // we will need as well an obj with good structure to know who is sending messages an to who!
    // we will need a king of DB (we can use initialy and array) and then save and get from Local Storage
    // we will need different methods to control adding users and create the conversation
    // incremet conversation messagens, etc
    ws.on('message', (data: any, isBinary: any) => {
        const { userId, name, type } = JSON.parse(data.toString());
        let user: User | undefined = users.find((user) => user.id === userId)
        //let connected: Boolean | undefined = activeConnections.some((connection: Connection) => connection.ws === ws)
        
        
        //console.log(processedData.type)
        
        // Here we must update DB with new user
        // This works as a connection validation
        if (type === 'connect_user') {
            // If no user create one | if exists but keep going
            if (!user) {
                user = new User(userId, name);
                
                // Historic in future | Users with open socket
                users.push(user);
            }
            

            if (!user.isConnected) {
                const client: Connection = {
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
            wss.clients.forEach(cli => {
                // Send active users to clients - except himself
                const wsCli = activeConnections.find((connection: Connection) => connection.ws === cli)
                const activeUsers = activeConnections.filter(connection => connection.user.id !== wsCli?.user.id).map(us => us.user.name );  
                
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
                    
                    console.log(`[${new Date().toISOString()}] Sended to ${wsCli?.user.name} users list: ${activeUsers}`);
                }
            })

            // ws.send(JSON.stringify({
            //     type: 'available_users',
            //     users: activeUsers
            // }))

            
            
            console.log('Active Connections: ', activeConnections.map(user => user.user));

            return;
        }

        if (type === 'disconnect_user') { 
            // Send connection confirmation to client ws
            ws.send(JSON.stringify({
                type: 'disconnect_user',
            }))

            user?.connectUser(false);

            // TODO: Think better about this. Is not working as is needed ->
            // Here we have to send new active users to all clients incluse the user
            // This is needed because the socket is still open and the can came back.
            // For disconected user we will send an empty list
            // For other we will send the updated list
            // Case only exists two users connected and one disconnect both should have user list updated with nothing!
             
            // Send for each connected user the other user lists
            wss.clients.forEach(cli => {
                // Send active users to clients - except himself
                const wsCli = activeConnections.find((connection: Connection) => connection.ws === cli)
                const activeUsers = activeConnections.filter(connection => connection.user.id !== wsCli?.user.id && connection.user.isConnected).map(us => us.user.name );  
                
                // Send active users for all websockect connections
                if (activeUsers.length > 0 && cli.readyState === WebSocket.OPEN) {
                    cli.send(JSON.stringify({
                        type: 'available_users',
                        users: activeUsers
                    }), 
                    {binary: isBinary}, 
                    (err) => {
                        if (err) console.error('WS send error: ', err);
                    });
                    
                    console.log(`[${new Date().toISOString()}] Sended to ${wsCli?.user.name} users list: ${activeUsers}`);
                }
            })

            const userIdx = activeConnections.findIndex((connection: Connection) => connection.ws === ws);
            activeConnections.splice(userIdx, 1);
            console.log(`[${new Date().toISOString()}] User ${user?.name} is disconnected/offline`);
        }

        if (type === 'new_message') {

            // wss.clients.forEach(cli => {
            //     if (cli !== ws && cli.readyState === WebSocket.OPEN) {
            //         cli.send(data, {binary: isBinary}, (err) => {
            //             if (err) console.error('WS send error: ', err);
            //             }
            //         );
            //     }
            // })
        }
    });

     ws.on('close', () => {
        const userIdx = activeConnections.findIndex((connection: Connection) => connection.ws === ws);

        if (userIdx !== -1) {
            console.log(`[${new Date().toISOString()}] User Name-${activeConnections[userIdx].user.id} has disconnected`);
            
            activeConnections.splice(userIdx, 1);
        }

        console.log(`[${new Date().toISOString()}] Socket Closed`);
        console.log(activeConnections)
    });
});

console.log(`Server running at: ws://${HOST}:${PORT}`);
