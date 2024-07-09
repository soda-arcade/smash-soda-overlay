import User from "@/models/User";

export default class GuestPad {
    index: number = -1;
    owner: User | null = null;
    buttons: number[] = [];

    constructor(index?: number, owner?: User | null) {
        this.index = index || -1;
        this.owner = owner || null;

        // Populate buttons
        for (let i = 0; i < 16; i++) {
            this.buttons.push(0);
        }
    }
}