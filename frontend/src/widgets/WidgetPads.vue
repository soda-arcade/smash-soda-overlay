<template lang="">
    <div v-if="pads.length > 0" id="widget-pads" class="widget panel" :class="config.position">
        <template v-for="(pad, index) in pads" :key="index">
            <div class="pad-container">
                <GamepadSVG :ref="`pad-${pad.index}`" :id="pad.index" />
                <div v-if="pad.owner && pad.owner.name" class="guest small">
                    {{ truncateName(pad.owner.name, 10) }}
                    <div v-if="showHotseat" class="muted">
                        {{ hotseatTime(pad.owner.hotseatTime) }}
                    </div>
                </div>
                <div v-else class="muted small">
                    Empty
                </div>
            </div>
        </template>
    </div>
</template>
<script lang="ts">
import $ from 'jquery';
import GamepadSVG from '@/common/GamepadSVG.vue';

import User from '@/models/User';
import GuestPad from '@/models/GuestPad';

export default {
    name: 'WidgetPads',
    components: {
        GamepadSVG
    },
    computed: {
        config() {
            return window.$config.gamepads;
        },
        showHotseat() {
            return this.config.showHotseat || window.$designMode;
        }
    },
    data() {
        return {
            pads: [] as GuestPad[],
            owners: [] as {
                index: number,
                guest: User,
                hotseatTime: number,
                hotseatTimer: any
            }[],
            gamepadInterval: null as any
        }
    },
    methods: {

        /**
         * Truncate a guest's name
         * @param name      The name to truncate
         * @param length    The maximum length
         */
        truncateName(name: string, length: number): string {
            if (name.length <= length) {
                return name;
            }

            return name.substr(0, length) + '...';
        },

        /**
         * Convert hotseat time to a string
         * @param time The time in seconds
         */
        hotseatTime(time: number): string {
            let minutes = Math.floor(time / 60);
            let seconds = time % 60;
            return `${minutes}m:${seconds}s`;
        },

        /**
         * Set button state
         * @param btn   Button name
         * @param state Pressed state
         */
         setButtonState(index: number, btn: string, state: boolean) {
            
            // Find button element
            let el = $(`.pad-${index} .gp-btn.${btn}`);

            // Add pressed class
            if (state) {
                el.addClass('gamepad-btn-pressed');
            } else {
                el.removeClass('gamepad-btn-pressed');
            }

        },

        /**
         * Set axis state
         * @param axis  Axis name
         * @param value Axis value
         */
        setAxisState(index: number, axis: string, horz: number, vert: number) {
            let el = $(`.pad-${index} .${axis}`);
            el.css(`transform`, `translate(${horz * 4}%, ${vert * 4}%)`);
            if (Math.abs(horz) > 0.1 || Math.abs(vert) > 0.1) {
                el.addClass('gamepad-btn-pressed');
            } else {
                el.removeClass('gamepad-btn-pressed');
            }
        },

        /**
         * Update gamepads
         */
        updateGamepads(gamepads: any[] = [] as any[]) {
            this.pads = gamepads.map((pad: any, index: number) => {
                let guestPad = new GuestPad();
                if (pad) {
                    guestPad.index = index;

                    // If owner
                    if (pad.owner) {
                        guestPad.owner = pad.owner as User;
                        guestPad.owner.hotseatTime = pad.hotseatTime;
                    }

                    // Update inputs
                    this.setButtonState(index, "ActionA", pad.buttons[0]);
                    this.setButtonState(index, "ActionB", pad.buttons[1]);
                    this.setButtonState(index, "ActionH", pad.buttons[2]);
                    this.setButtonState(index, "ActionV", pad.buttons[3]);
                    this.setButtonState(index, "MenuL", pad.buttons[8]);
                    this.setButtonState(index, "MenuR", pad.buttons[9]);
                    this.setButtonState(index, "BumperL", pad.buttons[4]);
                    this.setButtonState(index, "BumperR", pad.buttons[5]);
                    this.setButtonState(index, "TriggerL", pad.buttons[6]);
                    this.setButtonState(index, "TriggerR", pad.buttons[7]);
                    this.setButtonState(index, "Cam", pad.buttons[10]);
                    this.setButtonState(index, "Joy", pad.buttons[11]);
                    
                    this.setButtonState(index, "Dpad", pad.buttons[12] || pad.buttons[13] || pad.buttons[14] || pad.buttons[15]);

                    this.setAxisState(index, "lstick", pad.axes[0], -pad.axes[1]);
                    this.setAxisState(index, "rstick", pad.axes[2], -pad.axes[3]);

                }
                return guestPad;
            });
        }

    },
    mounted() {

        // Update gamepads realtime
        window.$eventBus.on('gamepad:poll', (data: any) => {
            this.updateGamepads(data.gamepads);
        });

        // If design mode create some test gamepads
        if (window.$designMode) {
            this.pads = [
                new GuestPad(0, new User("0", 'Player 1')),
                new GuestPad(1, new User("1", 'Player 2')),
                new GuestPad(2, null),
                new GuestPad(3, null),
            ];
            this.pads[0].owner.hotseatTime = 125;

            // Some fake inputs every 5 seconds on the first pad
            var pressed = false;
            for (let i = 0; i < 16; i++) {
                this.pads[0].buttons[i] = pressed;
                pressed = !pressed;
            }
            setInterval(() => {

                for (let i = 0; i < 16; i++) {
                    this.pads[0].buttons[i] = pressed;
                    pressed = !pressed;
                }

                this.setButtonState(1, "ActionA", !this.pads[0].buttons[0]);
                this.setButtonState(1, "ActionB", !this.pads[0].buttons[1]);
                this.setButtonState(1, "ActionH", !this.pads[0].buttons[2]);
                this.setButtonState(1, "ActionV", !this.pads[0].buttons[3]);
                this.setButtonState(1, "MenuL", !this.pads[0].buttons[8]);
                this.setButtonState(1, "MenuR", !this.pads[0].buttons[9]);
                this.setButtonState(1, "BumperL", !this.pads[0].buttons[4]);
                this.setButtonState(1, "BumperR", !this.pads[0].buttons[5]);
                this.setButtonState(1, "TriggerL", !this.pads[0].buttons[6]);
                this.setButtonState(1, "TriggerR", !this.pads[0].buttons[7]);
                this.setButtonState(1, "Dpad", !this.pads[0].buttons[12]);

                this.setAxisState(1, "lstick", Math.random(), Math.random());
                //this.setAxisState(1, "rstick", Math.random(), Math.random());
            }, 1000);

        }

    }
}
</script>
<style lang="scss">
</style>