<template lang="">
    <div id="widget-chat" class="widget col" :class="config.position">
        <input 
        ref="input-chat" 
        class="chat-input"
        type="text"
        @focus="onFocus" 
        @blur="onBlur"
        @keyup.enter="sendMessage"
        :style="{display: isFocused ? 'block' : 'none'}"
        >

        <div v-if="historyEnabled && messagesLimited.length > 0" class="panel message-history">
            <template v-for="message in messagesLimited" :key="message.id">
                <ChatMessage :message="message" />
            </template>
        </div>

        <div v-if="bubbles.length > 0" ref="bubbles" class="bubbles">
            <template v-for="bubble in bubbles" :key="bubble.id">
                <ChatMessage :message="bubble" class="message-bubble" 
                :class="{enter: bubble.enter, leave: bubble.leave}"
                />
            </template>
        </div>
    </div>
</template>
<script lang="ts">
import { EventsEmit } from '../../wailsjs/runtime/runtime';
import User from '@/models/User';
import Message from '@/models/Message';

import ChatMessage from '@/common/ChatMessage.vue';

export default {
    name: 'WidgetChat',
    components: {
        ChatMessage
    },
    data: () => ({
        messages: [] as (Message)[],
        bubbles: [] as (Message)[],
        isFocused: false
    }),
    computed: {
        messagesLimited() {
            return this.messages.slice(0, 100);
        },
        config() {
            return window.$config.chat;
        },
        historyEnabled() {
            return (this.config.showHistory && this.isFocused) || window.$designMode;
        }
    },
    methods: {
        /**
         * Send a message to Smash Soda
         */
        sendMessage() {

            // If the input is empty, do nothing
            if (!this.$refs['input-chat'].value || this.$refs['input-chat'].value === '') {
                return;
            }

            // Emit the message
            EventsEmit('app:message', JSON.stringify({
                event: 'chat:message',
                data: this.$refs['input-chat'].value
            }));

            if (window.$designMode) {
                this.addMessage(new Message(
                    Math.random().toString(36).substring(7),
                    this.$refs['input-chat'].value,
                    "chat",
                    new User('guest1', 'Guest'),
                ));
                return;
            }

            // Clear the input
            this.$refs['input-chat'].value = '';

        },
        /**
         * Fired when the input is focused
         */
        onFocus() {
            this.isFocused = true;
            EventsEmit('app:focus');
            setTimeout(() => {
                this.$refs['input-chat'].focus();
            }, 100);
        },

        /**
         * Fired when the input is blurred
         */
        onBlur() {
            this.isFocused = false;
            EventsEmit('app:blur');
        },
        
        /**
         * Add a message to the chat
         * @param message The message to add
         */
        addMessage(message: Message) {

            // Add the message
            const id = message.id;
            this.messages.unshift(new Message(
                id,
                message.message,
                message.type,
                message.user
            ));

            // Create a bubble
            this.bubbles.unshift(new Message(
                id,
                message.message,
                message.type,
                message.user
            ));

            // Give the bubble a timeout
            setTimeout(() => {
                const bubble = this.bubbles.find(b => b.id === id);
                if (bubble) {
                    bubble.leave = true;
                    bubble.enter = false;
                    setTimeout(() => {
                        this.bubbles = this.bubbles.filter(b => b.id !== id);
                    }, 5000);
                }
            }, 5000);

            // Clear the input
            this.$refs['input-chat'].value = '';

        }
    },
    mounted() {

        // Add some initial messages if in design mode
        if (window.$designMode) {
            this.addMessage(new Message(
                Math.random().toString(36).substring(7), 
                "Welcome to Smash Soda!",
                "log"
            ));
            this.addMessage(new Message(
                Math.random().toString(36).substring(7), 
                "This is a test message",
                "chat",
                new User('guest1', 'Guest'),
            ));
            this.addMessage(new Message(
                Math.random().toString(36).substring(7), 
                "This is another test message",
                "chat",
                new User('guest12', 'JoeBloggs'),
            ));
            this.addMessage(new Message(
                Math.random().toString(36).substring(7), 
                "Tank fly boss walk jam nitty-gritty you're listening to the boss from the big bad city this is jam hot this is jam hot.",
                "chat",
                new User('guest15', 'SomeRandomReallyLongNameThatShouldTruncate'),
            ));
            this.addMessage(new Message(
                Math.random().toString(36).substring(7), 
                "[ChatBot] A person did a thing!",
                "log"
            ));
        } else {
            this.addMessage(new Message(
                Math.random().toString(36).substring(7), 
                "Connected to Smash Soda!",
                "log"
            ));
        }
    
        // Listen for input toggle
        window.$eventBus.on('chat:input', () => {
            if (this.isFocused) {
                this.onBlur();
            } else {
                this.onFocus();
            }
        });

        // Listen for chat messages
        window.$eventBus.on('chat:message', (data: any) => {
            this.addMessage(new Message(
                Math.random().toString(36).substring(7), 
                data.message,
                "chat",
                new User(data.user.id, data.user.name),
            ));
        });

        // Listen for log messages
        window.$eventBus.on('chat:log', (data: any) => {
            this.addMessage(new Message(
                Math.random().toString(36).substring(7), 
                data.message,
                "log"
            ));
        });

    }
}
</script>
<style lang="scss">
</style>