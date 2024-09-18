<template>
  <div id="app">
    <WidgetChat />
    <WidgetGuests />
    <WidgetPads />
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
      zoomLevel: 1,
      opacity: 1,
      config: window.$config
    }
  },
  methods: {
  },
  computed: {
  },
  mounted() {

  }
}
</script>
<style lang="scss">
body {
  overflow: hidden;
}
</style>