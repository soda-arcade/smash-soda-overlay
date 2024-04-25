<template lang="">
    <div v-if="pads.length > 0" id="widget-pads" class="widget panel">
        <div class="pad-container" v-for="(pad, index) in pads" :key="index">
            <GamepadSVG :ref="`pad-${index}`" :id="index" />
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
            pads: [] as GuestPad[]
        }
    },
    methods: {

        /**
         * Set the owner of a pad
         * @param index The index of the pad
         * @param guest The guest to set as owner
         */
        setOwner(index: number, guest: User) {
            this.pads[index].owner = guest;
        },

        /**
         * Find a pad by its owner
         * @param guest The owner of the pad
         */
        findPadByOwner(userId: string) {
            return this.pads.find(pad => pad.owner?.id === userId);
        },

        truncateName(name: string, length: number): string {
            if (name.length <= length) {
                return name;
            }

            return name.substr(0, length) + '...';
        },

        /**
         * Set button state
         * @param btn   Button name
         * @param state Pressed state
         */
         setButtonState(index: number, btn: string, state: boolean) {
            
            // Find button element
            let el = $(`.pad-${index} .gp-btn.${btn}`);
            window.$eventBus.emit('log:message', { id: "23", message: "blah" });

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
        }

    },
    mounted() {

        window.$eventBus.on('pads:poll', (data: any) => {
            this.pads = data.pads;
            setTimeout(() => {
                this.pads.forEach((pad: any, index: number) => {
                    // Find each pad SVG as instance of GamepadSVG
                    const svg = this.$refs[`pad-${index}`] as InstanceType<typeof GamepadSVG>;
                    if (svg) {

                        // Abs value pad["A"]
                        this.setButtonState(index, "ActionA", pad["A"]);
                        this.setButtonState(index, "ActionB", pad["B"]);
                        this.setButtonState(index, "ActionH", pad["X"]);
                        this.setButtonState(index, "ActionV", pad["Y"]);
                        this.setButtonState(index, "MenuL", pad["SELECT"]);
                        this.setButtonState(index, "MenuR", pad["START"]);
                        this.setButtonState(index, "BumperL", pad["LB"]);
                        this.setButtonState(index, "BumperR", pad["RB"]);
                        this.setButtonState(index, "TriggerL", pad["LT"]);
                        this.setButtonState(index, "TriggerR", pad["RT"]);
                        this.setButtonState(index, "Cam", pad["LS"]);
                        this.setButtonState(index, "Joy", pad["RS"]);

                        this.setButtonState(index, "Up", pad["UP"]);
                        this.setButtonState(index, "Down", pad["DOWN"]);
                        this.setButtonState(index, "Left", pad["LEFT"]);
                        this.setButtonState(index, "Right", pad["RIGHT"]);

                        this.setAxisState(index, "lstick", pad["LX"], pad["LY"]);
                        this.setAxisState(index, "rstick", pad["RX"], pad["RY"]);

                    }
                });
            }, 100);
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