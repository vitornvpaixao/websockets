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
    
    ws.on('error', console.error);

    // On message we have to control wich client is sending message and for who is to send the message;
    // we will need as well an obj with good structure to know who is sending messages an to who!
    // we will need a king of DB (we can use initialy and array) and then save and get from Local Storage
    // we will need different methods to control adding users and create the conversation
    // incremet conversation messagens, etc
    ws.on('message', (data: any, isBinary: any) => {
        const processedData = JSON.parse(data.toString());
        console.log(`[${new Date().toISOString()}] received: ${processedData}`);
        console.log(processedData.type)
        
        // Here we must update DB with new user
        // This works as a connection validation
        if (processedData.type === 'identify') {
            let user = users.find((user) => user.id === processedData.userId)

            if (!user) {
                user = {
                    id: processedData.userId,
                    connectAt: new Date(),
                    conversations: []
                }

                // Historic in future
                users.push(user);
            }

            const client: Connection = {
                ws,
                user: user,
            }
            
            activeConnections.push(client)

            console.log('Active Connections: ', activeConnections);

            return;
        }

        if (processedData.type === 'message') { 
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
        console.log('Socket Closed')
        const userIdx = activeConnections.findIndex((connection: Connection) => connection.ws === ws);

        if (userIdx !== -1) {
            activeConnections.splice(userIdx, 1);
        }

        console.log(activeConnections)
    });
});

console.log(`Server running at: ws://${HOST}:${PORT}`);
