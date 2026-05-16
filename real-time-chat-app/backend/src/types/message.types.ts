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
    type: string,
    userId: string,
    name: string
}
