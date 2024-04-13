<template lang="">
    <div v-if="users.length > 0" id="widget-guests" class="widget panel col">
        <div v-for="user in users" class="row space-between">
            <div class="guest">
                {{ user.truncateName(15) }}
            </div>
            <div v-if="config.showLatency" class="ping">
                {{ user.latency }}ms
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import User from '@/models/User';

export default {
    name: 'WidgetGuests',
    props: {
        position: {
            type: String,
            default: 'bottom left'
        }
    },
    computed: {
        config() {
            return window.$config.guests;
        }
    },
    data: () => ({
        users: [] as User[]
    }),
    methods: {
        /**
         * Add a user to the list
         * @param user The user to add
         */
        addUser(user: User) {
            this.users.push(user);
        },
        /**
         * Remove a user from the list
         * @param user The user to remove
         */
        removeUser(user: User) {
            this.users = this.users.filter(u => u.id !== user.id);
        },

        /**
         * Find a user by their ID
         * @param id The ID of the user
         */
        findGuestById(id: string) {
            return this.users.find(u => u.id === id);
        }
    },
    mounted() {

        // Add a user when the event is triggered
        window.$eventBus.on('guest:add', (data: any) => {
            this.addUser(new User(data.id, data.name));
        });

        // Remove a user when the event is triggered
        window.$eventBus.on('guest:remove', (data: any) => {
            this.removeUser(new User(data.id, data.name));
        });

        // Update the users' latencies when the event is triggered
        window.$eventBus.on('guest:ping', (data: any) => {
            // For each user, update their latency
            data.users.forEach((user: any) => {
                var guest = this.findGuestById(user.id);
                if (guest) {
                    guest.latency = user.latency;
                }
            });
        });

    }
}
</script>
<style lang="scss">
#widget-guests {
    width: 250px;
    padding: 5px 10px;
}
</style>