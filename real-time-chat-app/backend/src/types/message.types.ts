import WebSocket from 'ws';
import { User } from '../models/User';

type ConnectionType = 'connect_user' | 'disconnect_user';

export interface IConnection {
    ws: WebSocket,
    user: User
}

export interface IConversation {
    userId: string;
    messages: IMessage[];
}

export interface IMessage {
    isReceived: boolean;
    date: Date;
    text: string;
}

export interface IClientMessage {
    type: ConnectionType | 'new_message';
    userId: string;
    name: string;
    toUserId?: string,
    text?: string
}

export interface IServerMessage {
    type: ConnectionType;
    message?: string;
}

export interface IActiveUsersMessage {
    type: 'available_users';
    users: string[];
}
