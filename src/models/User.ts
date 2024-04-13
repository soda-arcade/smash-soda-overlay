export default class User {
    id: string;
    name: string;
    latency: number = 0;
    hotseatTime: number = 0;

    constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
    }

    /**
     * Helper method to truncate the user's name
     * @param length    The maximum length of the name
     * @returns 
     */
    truncateName(length: number): string {
        if (this.name.length <= length) {
            return this.name;
        }

        return this.name.substr(0, length) + '...';
    }
}