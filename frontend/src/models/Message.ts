import User from '@/models/User';

export default class Message {
    id: string;
    type: string;
    user: User | null = null;
    message: string;
    enter: boolean = true;
    leave: boolean = false;

    constructor(id: string, message: string, type: string, user: User | null = null) {
        this.id = id;
        this.type = type;
        this.user = user;
        this.message = message;
    }
}