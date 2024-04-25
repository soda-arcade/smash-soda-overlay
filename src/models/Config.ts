export default class Config {
    chat: {
        active: boolean;
        position?: string;
        showHistory?: boolean;
    };
    enabled: boolean;
    gamepads: {
        active?: boolean;
        position?: string;
        showHotseat?: boolean;
    };
    guests: {
        active?: boolean;
        position?: string;
        showLatency?: boolean;
    };
    opacity: number;
    update: boolean;

    constructor() {
        this.chat = {
            active: false,
            position: 'bottom',
            showHistory: true
        };
        this.enabled = false;
        this.gamepads = {
            active: false,
            position: 'top',
            showHotseat: false
        };
        this.guests = {
            active: false,
            position: 'top',
            showLatency: true
        };
        this.opacity = 1;
        this.update = true;
    }

    /**
     * Update the overlay configuration
     * @param data  The new configuration
     */
    set(data: any) {
        this.chat = data.chat || this.chat;
        this.enabled = data.enabled || this.enabled;
        this.gamepads = data.gamepads || this.gamepads;
        this.guests = data.guests || this.guests;
        this.opacity = data.opacity || this.opacity;
        this.update = data.update || this.update;
    }
}
    