import { IConversation, IMessage } from "../types/message.types";

export class User {
    id: string | number;
    name: string;
    connectAt: Date;
    isConnected: boolean;
    conversations: IConversation[];

    constructor(userId: string, name: string) {
        this.id = userId;
        this.name = name;
        this.connectAt = new Date();
        this.isConnected = false;
        this.conversations = [];
    }

    setConnectionStatus(isConnected: boolean) {
        this.isConnected = isConnected;
    }

    // TODO: handle adding message to existing conversation
    addMessageToConversation(toUserId: string) {
        const conversation = this.conversations.find(conversation => conversation.userId === toUserId);

        if (!conversation) {
            this.addNewConversation(toUserId);
        } else {
            // add message in existing conversation
        }
    }

    // TODO: implement messages with proper message structure
    addNewConversation(toUserId: string) {
        const conversation: IConversation = {
            userId: toUserId,
            messages: []
        }
    
        this.conversations.push(conversation);
    }

    addMessage(userId: string, isReceived: boolean, text: string) {
        const msg: IMessage = {
            isReceived,
            date: new Date(),
            text
        }

        this.conversations.find(c => c.userId === userId)?.messages.push(msg);
    }
}
