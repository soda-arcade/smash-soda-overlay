export default class LogMessage {
    id: string;
    type: string = 'log';
    message: string;
    isNew: boolean = true;

    constructor(id: string, message: string) {
        this.id = id;
        this.message = message;

        setTimeout(() => {
            this.isNew = false;
        }, 5000);
    }
}