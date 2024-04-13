import User from '@/models/User';

export default class ChatMessage {
    id: string;
    type: string = 'chat';
    user: User;
    message: string;
    isNew: boolean = true;

    constructor(id: string, user: User, message: string) {
        this.id = id;
        this.user = user;
        this.message = message;
    }
}