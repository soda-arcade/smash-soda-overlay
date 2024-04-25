import User from "@/models/User";

export default class GuestPad {
    index: number = 0;
    owner?: User | null;
}