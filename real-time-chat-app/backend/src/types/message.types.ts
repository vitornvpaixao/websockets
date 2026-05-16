import WebSocket from 'ws';
import { User } from '../models/User';

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
    type: 'connect_user' | 'disconnect_user' | 'new_message',
    userId: string,
    name: string
}
