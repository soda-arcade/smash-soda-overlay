<template lang="">
    <div :id="message.id" class="message panel" :class="message.type">
        <span v-if="!isLog" class="message-guest guest">
            {{ message.user.truncateName(15) }}
        </span>
        <span class="message-body">
            {{ message.message }}
        </span>
    </div>
</template>
<script lang="ts">
import User from '@/models/User';
import Message from '@/models/Message';

export default {
    name: 'ChatMessage',
    props: {
        message: {
            type: Object as () => Message,
            required: true
        }
    },
    data: () => ({
    }),
    computed: {
        isLog() {
            return this.message.type === 'log';
        }
    },
    methods: {
        
    },
    mounted() {

    }
}
</script>
<style lang="scss">
</style>