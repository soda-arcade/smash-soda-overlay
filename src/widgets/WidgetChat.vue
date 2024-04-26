<template lang="">
    <div id="widget-chat" class="widget col">
        <input 
        v-if="isFocused" 
        ref="input-chat" 
        type="text" 
        @focus="onFocus" 
        @blur="onBlur"
        @keyup.enter="sendMessage"
        >
        <div ref="panel-chat" id="panel-chat">
            <template v-for="message in messagesLimited" :key="message.id">
                <div v-if="message.type == 'chat'" :id="message.id" class="message panel">
                    <span class="guest">{{ message.user.truncateName(15) }}</span>
                    <span class="body">{{ message.message }}</span>
                </div>
                <div v-else :id="message.id" class="message panel">
                    <span class="body muted">{{ message.message }}</span>
                </div>
            </template>
        </div>
    </div>
</template>
<script lang="ts">
import User from '@/models/User';
import ChatMessage from '@/models/ChatMessage';
import LogMessage from '@/models/LogMessage';

export default {
    name: 'WidgetChat',
    props: {
        position: {
            type: String,
            default: 'top left'
        }
    },
    data: () => ({
        messages: [] as (ChatMessage | LogMessage)[],
        isFocused: false
    }),
    computed: {
        messagesLimited() {
            return !this.isFocused ? this.messages.slice(0, 5) : this.messages.slice(0, 100);
        },
        config() {
            return window.$config.chat;
        }
    },
    methods: {
        /**
         * Send a message to Smash Soda
         */
        sendMessage() {
            const message = (this.$refs['input-chat'] as HTMLInputElement).value;
            if (message.length === 0) return;

            window.electron.chat(message);
            (this.$refs['input-chat'] as HTMLInputElement).value = '';
            
        },
        /**
         * Fired when the input is focused
         */
        onFocus() {
            window.electron.focus();
            this.isFocused = true;
            setTimeout(() => {
                (this.$refs['input-chat'] as HTMLElement).focus();
                (this.$refs['panel-chat'] as HTMLElement).focus();
                (this.$refs['panel-chat'] as HTMLElement).classList.add('panel');
            }, 100);
        },

        /**
         * Fired when the input is blurred
         */
        onBlur() {
            window.electron.blur();
            this.isFocused = false;
            (this.$refs['panel-chat'] as HTMLElement).classList.remove('panel');
        },
        
        /**
         * Add a message to the chat
         * @param message The message to add
         */
        addMessage(message: ChatMessage | LogMessage) {
            this.messages.unshift(message);
            setTimeout(() => {
                const element = document.getElementById(message.id);
                if (element) {
                    element.classList.add('fadeOut');
                }
            }, 5000);
        }
    },
    mounted() {
    
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
            this.addMessage(new ChatMessage(
                data.id, 
                new User(data.user.id, data.user.name),
                data.message,
            ));
        });

        // Listen for log messages
        window.$eventBus.on('log:message', (data: any) => {
            this.addMessage(new LogMessage(
                data.id, 
                data.message,
            ));
        });

    }
}
</script>
<style lang="scss">
.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}

#widget-chat {
    width: 400px;
}

#panel-chat {

    .message {
        padding: 5px 10px;

        &.fadeOut {
            opacity: 0;
            transition: opacity 0.3s;
        }

        .guest {
            margin-right: 5px;
        }

        .body {
            display: inline-block;
        }
    }

    &.panel {
        height: 150px;
        overflow-y: auto;

        .message {
            background: transparent;
            opacity: 1 !important;
        }
    }
}
</style>