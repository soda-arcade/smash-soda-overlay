<template lang="">
    <div v-if="connectedPads.length > 0" id="widget-pads" class="widget panel">
        <template class="pad-container" v-for="(pad, index) in pads" :key="index">
            <div v-if="pad.index > -1" class="pad-container">
                <GamepadSVG :ref="`pad-${pad.index}`" :id="pad.index" />
                <div v-if="findOwnerByIndex(pad.index)" class="guest small">
                    {{ truncateName(findOwnerByIndex(pad.index).guest.name, 10) }}
                    <div v-if="!config.showHotseat && findOwnerByIndex(pad.index).hotseatTime > 0" class="muted">
                        {{ hotseatTime(findOwnerByIndex(pad.index).hotseatTime) }}
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
        connectedPads() {
            return this.pads.filter(pad => pad.index > -1);
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
            }[]
        }
    },
    methods: {

        /**
         * Set the owner of a pad
         * @param index The index of the pad
         * @param guest The guest to set as owner
         */
        setOwner(index: number, guest: User, hotseatTime: number = 0) {
            // Find the pad
            let pad = this.findPadByIndex(index);
            if (pad) {
                // Create owner object
                let owner = {
                    index: index,
                    guest: guest,
                    hotseatTime: hotseatTime,
                    hotseatTimer: null
                };

                if (hotseatTime > 0) {
                    owner.hotseatTimer = setInterval(() => {
                        owner.hotseatTime--;
                        if (owner.hotseatTime <= 0) {
                            clearInterval(owner.hotseatTimer as any);
                            this.clearOwner(guest.id);
                        }
                    }, 1000) as any;
                }

                this.owners.push(owner);
            }
        },

        /**
         * Clear the owner of a pad
         * @param index The index of the pad
         */
        clearOwner(userID: string) {
            // Find the owner
            let owner = this.owners.find(owner => owner.guest.id === userID);
            
            if (owner) {

                // Clear hotseat timer
                if (owner.hotseatTimer) {
                    clearInterval(owner.hotseatTimer);
                }

                this.owners.splice(this.owners.indexOf(owner), 1);
            }
        },

        /**
         * Find a pad's owner by its index
         * @param index     The index of the pad
         */
        findOwnerByIndex(index: number) {
            return this.owners.find(owner => owner.index === index);
        },

        /**
         * Find a pad by its index
         * @param index The index of the pad
         */
        findPadByIndex(index: number) {
            return this.pads.find(pad => pad.index === index);
        },

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
        updateGamepads() {
            let gamepads = navigator.getGamepads();
            this.pads = gamepads.map((pad: any) => {
                let guestPad = new GuestPad();
                if (pad) {
                    guestPad.index = pad.index;

                    // Update inputs
                    this.setButtonState(pad.index, "ActionA", pad.buttons[0].pressed);
                    this.setButtonState(pad.index, "ActionB", pad.buttons[1].pressed);
                    this.setButtonState(pad.index, "ActionH", pad.buttons[2].pressed);
                    this.setButtonState(pad.index, "ActionV", pad.buttons[3].pressed);
                    this.setButtonState(pad.index, "MenuL", pad.buttons[8].pressed);
                    this.setButtonState(pad.index, "MenuR", pad.buttons[9].pressed);
                    this.setButtonState(pad.index, "BumperL", pad.buttons[4].pressed);
                    this.setButtonState(pad.index, "BumperR", pad.buttons[5].pressed);
                    this.setButtonState(pad.index, "TriggerL", pad.buttons[6].pressed);
                    this.setButtonState(pad.index, "TriggerR", pad.buttons[7].pressed);
                    this.setButtonState(pad.index, "Cam", pad.buttons[10].pressed);
                    this.setButtonState(pad.index, "Joy", pad.buttons[11].pressed);
                    
                    this.setButtonState(pad.index, "Dpad", pad.buttons[12].pressed || pad.buttons[13].pressed || pad.buttons[14].pressed || pad.buttons[15].pressed);

                    this.setAxisState(pad.index, "lstick", pad.axes[0], pad.axes[1]);
                    this.setAxisState(pad.index, "rstick", pad.axes[2], pad.axes[3]);

                }
                return guestPad;
            });
            requestAnimationFrame(this.updateGamepads);
        }

    },
    mounted() {

        // Update gamepads
        this.updateGamepads();

        // Listen for owner changes
        window.$eventBus.on('gamepad:assign', (data: any) => {
            if (data.owner) {
                this.setOwner(data.index, new User(data.owner.id, data.owner.name));
            }
        });
        window.$eventBus.on('gamepad:unassign', (data: any) => {
            this.clearOwner(data.index);
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