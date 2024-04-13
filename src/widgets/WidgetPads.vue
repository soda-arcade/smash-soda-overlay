<template lang="">
    <div v-if="pads.length > 0" id="widget-pads" class="widget panel">
        <div class="pad-container" v-for="(pad, index) in pads" :key="index">
            <GamepadSVG :ref="`pad-${index}`" :id="index" />
            <div v-if="pad.owner" class="guest small">
                {{ pad.owner.truncateName(10) }}
                <div v-if="!config.showHotseat" class="muted">
                    {{ Math.min(999, pad.owner.hotseatTime) }}
                    minutes
                </div>
            </div>
            <div v-else class="muted small">
                Empty
            </div>
        </div>
    </div>
</template>
<script lang="ts">
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
        }

    },
    mounted() {

        window.$eventBus.on('pads:add', (data: any) => {
            const pad = new GuestPad();
            this.pads.push(pad);
        });

        window.$eventBus.on('pads:remove', (data: any) => {
            this.pads.splice(data.index, 1);
        });

        window.$eventBus.on('pads:owner', (data: any) => {

            // Create a new user instance
            const user = new User(data.id, data.name);
            user.hotseatTime = data.hotseatTime;

            this.setOwner(data.index, user);
            
        });

        window.$eventBus.on('pads:poll', () => {
            this.pads.forEach((pad: any, index: number) => {
                // Find each pad SVG as instance of GamepadSVG
                const svg = this.$refs[`pad-${pad["index"]}`] as InstanceType<typeof GamepadSVG>;
                if (svg) {

                    svg.setButtonState("ActionA", pad["A"]);
                    svg.setButtonState("ActionB", pad["B"]);
                    svg.setButtonState("ActionH", pad["X"]);
                    svg.setButtonState("ActionV", pad["Y"]);
                    svg.setButtonState("MenuL", pad["SELECT"]);
                    svg.setButtonState("MenuR", pad["START"]);
                    svg.setButtonState("BumperL", pad["LB"]);
                    svg.setButtonState("BumperR", pad["RB"]);
                    svg.setButtonState("TriggerL", pad["LT"]);
                    svg.setButtonState("TriggerR", pad["RT"]);
                    svg.setButtonState("Cam", pad["LS"]);
                    svg.setButtonState("Joy", pad["RS"]);

                    svg.setButtonState("Up", pad["UP"]);
                    svg.setButtonState("Down", pad["DOWN"]);
                    svg.setButtonState("Left", pad["LEFT"]);
                    svg.setButtonState("Right", pad["RIGHT"]);

                    svg.setAxisState("lstick", pad["LX"], pad["LY"]);
                    svg.setAxisState("rstick", pad["RX"], pad["RY"]);

                }
            });
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