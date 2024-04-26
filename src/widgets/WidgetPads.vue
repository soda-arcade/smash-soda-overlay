<template lang="">
    <div v-if="pads.length > 0" id="widget-pads" class="widget panel">
        <template v-for="(pad, index) in pads" :key="index">
            <div class="pad-container">
                <GamepadSVG :ref="`pad-${pad.index}`" :id="pad.index" />
                <div v-if="pad.owner" class="guest small">
                    {{ truncateName(pad.owner.name, 10) }}
                    <div v-if="!config.showHotseat && pad.owner.hotseatTime != ''" class="muted">
                        {{ pad.owner.hotseatTime }}
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
                el.addClass('highlight-bg');
            } else {
                el.removeClass('highlight-bg');
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
                el.addClass('highlight-bg');
            } else {
                el.removeClass('highlight-bg');
            }
        },

        /**
         * Update gamepads
         */
        updateGamepads(gamepads: any[] = [] as any[]) {
            this.pads = gamepads.map((pad: any) => {
                let guestPad = new GuestPad();
                if (pad) {
                    guestPad.index = pad.index;

                    // If owner
                    if (pad.owner) {
                        guestPad.owner = pad.owner as User;
                        guestPad.owner.hotseatTime = pad.hotseatTime;
                    }

                    // Update inputs
                    this.setButtonState(pad.index, "ActionA", pad.buttons[0]);
                    this.setButtonState(pad.index, "ActionB", pad.buttons[1]);
                    this.setButtonState(pad.index, "ActionH", pad.buttons[2]);
                    this.setButtonState(pad.index, "ActionV", pad.buttons[3]);
                    this.setButtonState(pad.index, "MenuL", pad.buttons[8]);
                    this.setButtonState(pad.index, "MenuR", pad.buttons[9]);
                    this.setButtonState(pad.index, "BumperL", pad.buttons[4]);
                    this.setButtonState(pad.index, "BumperR", pad.buttons[5]);
                    this.setButtonState(pad.index, "TriggerL", pad.buttons[6]);
                    this.setButtonState(pad.index, "TriggerR", pad.buttons[7]);
                    this.setButtonState(pad.index, "Cam", pad.buttons[10]);
                    this.setButtonState(pad.index, "Joy", pad.buttons[11]);
                    
                    this.setButtonState(pad.index, "Dpad", pad.buttons[12] || pad.buttons[13] || pad.buttons[14] || pad.buttons[15]);

                    this.setAxisState(pad.index, "lstick", pad.axes[0], -pad.axes[1]);
                    this.setAxisState(pad.index, "rstick", pad.axes[2], -pad.axes[3]);

                }
                return guestPad;
            });
        },

        updateInterval() {
            this.gamepadInterval = setInterval(() => {
                this.updateGamepads();
            }, 1000 / 60);
        }

    },
    mounted() {

        // Update gamepads realtime
        window.$eventBus.on('gamepad:poll', (data: any) => {
            this.updateGamepads(data.gamepads);
        });

    }
}
</script>
<style lang="scss">
#widget-pads {
    padding: 12px 10px 5px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
    overflow: hidden;
}

.pad-container {
    text-align: center;
}
</style>