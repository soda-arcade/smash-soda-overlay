import User from "@/models/User";

export default class GuestPad {
    index: number = -1;
    owner: User | null = null;
}