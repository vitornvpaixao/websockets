import WebSocket from 'ws';
import { User } from '../models/User';

export interface IConnection {
    ws: WebSocket,
    user: User
}

export interface IConversation {
    userId: string | number;
    messages: IMessage[];
}

export interface IMessage {
    type: string; 
    date: Date;
    text: string;
}

export interface IClientMessage {
    type: string,
    userId: string,
    name: string
}
