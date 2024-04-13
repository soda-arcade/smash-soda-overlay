<template>
  <div id="app" :style="{ opacity: opacity }">
    <WidgetChat v-if="config.chat.active" :class="`${config.chat.position}`" />
    <WidgetGuests v-if="config.guests.active" :class="`${config.guests.position}`" />
    <WidgetPads v-if="config.gamepads.active" :class="`${config.gamepads.position}`" />
  </div>
</template>
<script lang="ts">
import WidgetChat from '@/widgets/WidgetChat.vue';
import WidgetGuests from '@/widgets/WidgetGuests.vue';
import WidgetPads from '@/widgets/WidgetPads.vue';

export default {
  name: 'App',
  components: {
    WidgetChat,
    WidgetGuests,
    WidgetPads
  },
  data() {
    return {
      opacity: 1
    }
  },
  computed: {
    config() {
      return window.$config;
    }
  },
  methods: {
  },
  mounted() {

    // Set default opacity (to fix 0.0 value, window.$config.opacity may be 0.999999999999)
    this.opacity = parseFloat(window.$config.opacity.toFixed(1));

    // Remove the loading screen on connection
    window.$eventBus.on('socket:ready', () => {
      document.getElementById('loading')?.remove();
    });

    // Config file updated?
    window.$eventBus.on('config:updated', (data) => {
      window.$config = data;
    });

    window.$eventBus.on('opacity:increase', () => {
      if (this.opacity < 1) {
        this.opacity += 0.05;
      }
    });

    window.$eventBus.on('opacity:decrease', () => {
      if (this.opacity > 0.1) {
        this.opacity -= 0.05;
      }
    });

  }
}
</script>
<style lang="scss">

</style>