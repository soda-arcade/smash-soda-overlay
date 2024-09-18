<template lang="">
    <div v-if="users.length > 0" id="widget-guests" class="widget panel col" :class="`${config.position} ${config.active ? '' : 'hidden'}`">
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
    data: () => ({
        users: [] as User[],
        config: window.$config.guests
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

        window.$eventBus.on('config:updated', () => {
            this.config = window.$config.guests;
        });

        // If design mode create some test users
        if (window.$designMode) {         
            this.addUser(new User('1', 'JohnDoe'));
            this.addUser(new User('2', 'JaneDoe'));
            this.addUser(new User('3', 'Alice'));
            this.addUser(new User('4', 'Bob'));
        }

        // Update the users' latencies when the event is triggered
        window.$eventBus.on('guest:poll', (data: any) => {
            this.users = data.users.map((user: any) => {
                const _user = new User(user.id, user.name);
                _user.latency = Math.round(user.latency);
                return _user;
            });
        });

    }
}
</script>
<style lang="scss">
</style>